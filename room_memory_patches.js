/* =============================================================
   room_memory_patches.js  —  部屋移動時メモリリーク修正パッチ
   ロード順: room.js → room_patches.js → room_memory_patches.js

   修正内容:
   LEAK-A: texture.dispose() 後に texture.image を null に設定
           （Three.js r128 は dispose でキャンバスを解放しないため
             HTMLCanvasElement がCPUメモリに残り続ける問題を修正）
           部屋ごとに 1024×1024 キャンバス×7枚以上≈30MB が蓄積する。

   LEAK-B: _shadowTexCache が disposeRoom 後も disposed テクスチャを
           参照し続ける問題を修正（影の表示崩壊も合わせて修正）

   LEAK-C: fadingCreatures（collection.js）が部屋移動時にクリアされず
           dispose 済みメッシュをフレームごとに処理し続ける問題を修正

   実装方法:
   disposeRoom と clearInteractables をラップし、
   それぞれの処理後に上記クリーンアップを追加する。
============================================================= */

/* ================================================================
   LEAK-A + LEAK-B: disposeRoom ラップ
   geometry / material の dispose に加え、
   テクスチャの image プロパティを null に設定して
   CPU 側キャンバスメモリを即時解放する。
================================================================ */
(function () {
  var _origDispose = window.disposeRoom;

  window.disposeRoom = function disposeRoom(room) {
    if (!room || !room.group) return;

    /* オリジナル処理（GPU VRAMの解放）*/
    if (typeof _origDispose === 'function') {
      _origDispose(room);
    }

    /* ▼ LEAK-A FIX: texture.image = null で CPU キャンバスメモリを解放 */
    room.group.traverse(function (obj) {
      if (!obj.material) return;
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (var mi = 0; mi < mats.length; mi++) {
        var mat = mats[mi];
        if (!mat) continue;
        var texSlots = [
          'map', 'roughnessMap', 'metalnessMap',
          'normalMap', 'bumpMap', 'emissiveMap',
          'aoMap', 'lightMap', 'alphaMap',
          'envMap', 'displacementMap'
        ];
        for (var ti = 0; ti < texSlots.length; ti++) {
          var tex = mat[texSlots[ti]];
          if (tex && tex.image) {
            /* CanvasTexture かどうか確認（isCanvasTexture フラグ or imageのタイプ確認）*/
            if (typeof HTMLCanvasElement !== 'undefined'
                && tex.image instanceof HTMLCanvasElement) {
              /* キャンバスのピクセルデータを即時解放 */
              try {
                tex.image.width  = 1;
                tex.image.height = 1;
              } catch (e2) {}
            }
            tex.image = null;
          }
        }
      }
    });

    /* ▼ LEAK-B FIX: _shadowTexCache をリセット
       disposeRoom が共有シャドウテクスチャを dispose してしまうため、
       次の部屋で getShadowTex() が正常に再生成できるようにリセットする */
    if (typeof window._shadowTexCache !== 'undefined') {
      window._shadowTexCache = null;
    }
  };
})();

/* ================================================================
   LEAK-C: clearInteractables ラップ
   fadingCreatures（collection.js で管理）が部屋移動時に
   クリアされないため、dispose 済みメッシュを毎フレーム
   アニメーションし続ける問題を修正する。
================================================================ */
(function () {
  /* room_patches.js がすでに clearInteractables をラップしている場合も
     チェーンが維持されるよう、さらに外側でラップする */
  var _origClear = window.clearInteractables;

  window.clearInteractables = function clearInteractables() {
    /* ▼ LEAK-C FIX: fadingCreatures を先にクリア
       dispose 済みメッシュへの参照を全て解除し、
       無用なアニメーション処理を停止する */
    if (typeof fadingCreatures !== 'undefined' && fadingCreatures.length > 0) {
      for (var _fci = fadingCreatures.length - 1; _fci >= 0; _fci--) {
        var _fc = fadingCreatures[_fci];
        if (_fc && _fc.mesh) {
          /* 親がまだある場合は除去（disposeRoom 前に呼ばれた場合の保険）*/
          if (_fc.mesh.parent) {
            try { _fc.mesh.parent.remove(_fc.mesh); } catch (e) {}
          }
          _fc.mesh = null;
        }
      }
      fadingCreatures.length = 0;
    }

    /* オリジナル処理（HP スプライト除去・roomInteractables リセット等）*/
    if (typeof _origClear === 'function') {
      _origClear();
    }
  };
})();

/* ================================================================
   LEAK-D: makeWallTex 等の大型キャンバス生成に対する
   GC ヒント（2D コンテキストの明示的な開放）

   room.js の texture 生成関数を直接ラップできないため、
   disposeRoom 実行後の GC 促進として
   使われていない 2D コンテキストを解放するユーティリティを追加。

   ※ 直接的なリークではないが、ブラウザへの早期 GC ヒントになる。
================================================================ */
(function () {
  /* グローバル GC ヒント: 部屋移動直後に一度だけ呼ぶ */
  window._hintGCAfterRoomChange = function () {
    /* HTMLCanvasElement を 1px にリサイズすると
       ブラウザが内部ピクセルバッファを即時解放することが多い。
       disposeRoom 内の LEAK-A FIX で個別に処理済みだが、
       念のためここで孤立キャンバスも探してリサイズする。 */
    try {
      var canvases = document.querySelectorAll('canvas:not(#canvas)');
      for (var _ci = 0; _ci < canvases.length; _ci++) {
        var _cv = canvases[_ci];
        /* 表示されておらず、DOM から切り離されているキャンバスのみ対象 */
        if (!_cv.isConnected && _cv.width > 2 && _cv.height > 2) {
          _cv.width  = 1;
          _cv.height = 1;
        }
      }
    } catch (e) {}
  };
})();

/* ================================================================
   enterDoor への GC ヒント挿入
   room_patches.js の enterDoor ラップをさらに外側でラップし、
   部屋移動後に _hintGCAfterRoomChange() を呼ぶ。
================================================================ */
(function () {
  var _origEnterDoor = window.enterDoor;

  window.enterDoor = function enterDoor(door) {
    if (typeof _origEnterDoor === 'function') {
      _origEnterDoor(door);
    }

    /* フェードアウト完了後（約600ms）に GC ヒントを送る */
    setTimeout(function () {
      if (typeof window._hintGCAfterRoomChange === 'function') {
        window._hintGCAfterRoomChange();
      }
    }, 650);
  };
})();

console.log('[room_memory_patches] LEAK-A/B/C/D: メモリリーク修正を適用しました');
