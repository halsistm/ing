/* =============================================================
   room_props_patch.js  —  GLBプロップ拡張パッチ
   ロード順: room_memory_patches.js の直後（creatures.js より前）

   修正内容:
   ROOT-1: GLB_PROP_SIZES に未登録の GLB サイズを追加。
           （buildGLBProp がサイズ不明の場合 1.5m にフォールバックするが
             大型オブジェクトが極端に縮小されてしまう問題を防ぐ）

   ROOT-2: _GLB_PROP_NAMES（プリロードリスト）に未登録 GLB を追加。
           preloadGLBProps() はこの配列を参照するため、
           init.js のロード前に追加しておく必要がある。

   ROOT-3: buildRoom 内部の propPool はローカル変数のため外部から
           変更できない。buildRoom をラップして「拡張プール」から
           追加の GLB プロップを部屋に配置する。
============================================================= */

/* ============================================================
   ROOT-1: GLB_PROP_SIZES に不足エントリを追加
============================================================ */
(function () {
  if (typeof GLB_PROP_SIZES === 'undefined') {
    console.warn('[room_props_patch] GLB_PROP_SIZES 未定義 — room.js より前にロードされました');
    return;
  }

  /* サイズ（メートル）: 最大辺がこの値になるよう自動スケールされる */
  var _extra = {
    /* room.js の GLB_PROP_SIZES に既にあるが念のため上書きしない */
    bird:    0.5,
    kaidan:  3.0,
    house:   6.0,
    bus:     8.0,

    /* 新規追加 */
    Escalera:                    3.5,
    Kids_Slide:                  2.5,
    StageBackground:             5.0,
    Tree01_Art:                  4.0,
    Tree_01_Art:                 4.0,   /* 同名違いが両方存在するため両方登録 */
    Roof:                        4.5,
    VIPBridge01_Art:             5.0,
    Aero_Ground_Hexagons_02_Art: 3.0,
    Studio_Lamp:                 1.5,
    SpeakerPost:                 1.2,
    UpperPipe:                   2.0,
    LowerPipe:                   2.0,
    TempleWindow_Art:            3.0,
    StandAlone02:                2.0,
    Screen:                      1.5,
    Button01:                    0.4,
    Structure01:                 3.0,
    WarningSign01_Art:           1.5,
    Wall_02:                     2.5
  };

  Object.keys(_extra).forEach(function (k) {
    /* 既に登録済みの場合は上書きしない */
    if (GLB_PROP_SIZES[k] === undefined) {
      GLB_PROP_SIZES[k] = _extra[k];
    }
  });
})();

/* ============================================================
   ROOT-2: _GLB_PROP_NAMES にプリロード対象を追加
   ※ preloadGLBProps() は init.js 内の非同期処理で呼ばれるため、
      このスクリプト（同期ロード）で追加すれば間に合う。
============================================================ */
(function () {
  if (typeof _GLB_PROP_NAMES === 'undefined') {
    console.warn('[room_props_patch] _GLB_PROP_NAMES 未定義 — room.js より前にロードされました');
    return;
  }

  /* 武器系（rifle, AK47, handgun, ammo_box, shotgun, Silencer_Fat）は除外 */
  var _addToPreload = [
    /* room.js の propPool に入っているが _GLB_PROP_NAMES から欠けているもの
       ＊ 現在の room.js では bird と kaidan は _GLB_PROP_NAMES にあるが
          念のためここでも保証する */
    'bird', 'kaidan',

    /* 完全に未登録の新規 GLB */
    'house', 'bus',
    'Escalera', 'Kids_Slide',
    'StageBackground',
    'Tree01_Art', 'Tree_01_Art',
    'Roof',
    'VIPBridge01_Art', 'Aero_Ground_Hexagons_02_Art',
    'Studio_Lamp', 'SpeakerPost',
    'UpperPipe', 'LowerPipe',
    'TempleWindow_Art', 'StandAlone02', 'Screen',
    'Button01', 'Structure01', 'WarningSign01_Art', 'Wall_02'
  ];

  _addToPreload.forEach(function (name) {
    if (_GLB_PROP_NAMES.indexOf(name) === -1) {
      _GLB_PROP_NAMES.push(name);
    }
  });
})();

/* ============================================================
   ROOT-3: buildRoom ラップ — 拡張プロッププールから追加配置

   ・room.js の propPool（16種）は変更不可のローカル変数なので、
     buildRoom の返り値の group に追加プロップを足す方式にする。
   ・既存の propPool 分（1〜8個）に加えて、ここでは 1〜3 個を追加。
   ・bird / kaidan / house など「存在するが propPool に未登録」の GLB を
     ここで初めて部屋に配置する。
============================================================ */
(function () {
  /* room.js の propPool に未登録の全 GLB をまとめたプール */
  var _EXT_POOL = [
    /* propPool 未登録（プリロード済み）*/
    'bird', 'kaidan',

    /* propPool・プリロード両方未登録（新規） */
    'house', 'bus',
    'Escalera', 'Kids_Slide',
    'Tree01_Art', 'Tree_01_Art',
    'Roof', 'StageBackground',
    'VIPBridge01_Art', 'Aero_Ground_Hexagons_02_Art',
    'Studio_Lamp', 'SpeakerPost',
    'UpperPipe', 'LowerPipe',
    'TempleWindow_Art', 'StandAlone02', 'Screen',
    'Button01', 'Structure01', 'WarningSign01_Art', 'Wall_02'
  ];

  var _origBuildRoom = window.buildRoom;

  window.buildRoom = function buildRoom(seed) {
    /* 元の buildRoom を実行（room_patches.js のラップ込み） */
    var result = _origBuildRoom(seed);
    if (!result || !result.group) return result;

    /* buildGLBProp が使えるか確認（room_patches.js がロード済みか） */
    if (typeof buildGLBProp !== 'function') return result;

    /* このラップ専用のシード RNG（元の部屋 RNG とは独立） */
    var R2 = makeRng(((seed ^ 0x77665544) >>> 0) || 12345);

    var hw = result.hw || 10;
    var hd = result.hd || 10;
    var W  = hw * 2;
    var D  = hd * 2;

    /* ドア付近（正面入口）を避けるための簡易チェック用リスト */
    /* ※ 詳細なドア座標は result に入っていないため、正面壁近くを広めに除外 */
    var DOOR_CLEAR_SQ = 3.0 * 3.0; /* 3m 以内はスキップ */

    /* 追加するプロップ数: 1〜3 個（部屋の広さに応じて増やしても良い） */
    var addCount = 1 + Math.floor(R2() * 3);

    for (var i = 0; i < addCount; i++) {
      var pName = _EXT_POOL[Math.floor(R2() * _EXT_POOL.length)];
      var pGrp  = buildGLBProp(R2, pName);

      /* ドアゾーンを避けてランダム配置（最大 5 回再抽選） */
      var pX = 0, pZ = 0, _ok = false;
      for (var ri = 0; ri < 5; ri++) {
        pX = (R2() - 0.5) * Math.max(2, W - 4);
        pZ = (R2() - 0.5) * Math.max(2, D - 6);
        /* 正面ドア付近（z ≈ -hd）を除外 */
        var _ddz = pZ + hd;
        if (pX * pX + _ddz * _ddz > DOOR_CLEAR_SQ) { _ok = true; break; }
      }
      if (!_ok) continue; /* 5 回外れた場合はこのプロップをスキップ */

      pGrp.position.set(pX, 0, pZ);
      pGrp.rotation.y = R2() * Math.PI * 2;
      result.group.add(pGrp);

      /* コリジョンリストが存在すれば追加 */
      if (result.collidables) {
        result.collidables.push({ x: pX, z: pZ, r: 1.0 });
      }
    }

    /* seed プロパティ保証（room_patches.js の Fix 3 と互換） */
    if (result.seed === undefined) result.seed = seed;

    return result;
  };
})();

console.log('[room_props_patch] ROOT-1/2/3: GLBプロップ拡張パッチ適用完了 ('
  + (typeof _GLB_PROP_NAMES !== 'undefined' ? _GLB_PROP_NAMES.length : '?')
  + ' 種プリロード登録済み)');
