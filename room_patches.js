/* =============================================================
   room_patches.js  —  room.js のバグ修正パッチ
   ロード順: room.js の直後、creatures.js より前

   修正内容:
   1. buildGLBProp: box.min.y が Infinity になる場合の isFinite ガード
      （空 GLB でオブジェクトが y=-Infinity に飛んで不可視になるバグ）
   2. buildGLBProp: _applyModel 内の Math.random() → R2() でシード決定論化
   3. buildRoom:    返り値に seed を追加
      （weapons.js の spawnWeaponsInRoom が room.seed を参照するため必要）
   4. buildCrystal: room.js 版を buildCrystalProp に改名
      （creatures3D.js 版と名前が衝突するため）
============================================================= */

/* -----------------------------------------------------------------
   Fix 1 & 2: buildGLBProp を完全再定義
   （_applyModel クロージャ内の修正を適用するため全体再定義が必要）
----------------------------------------------------------------- */
window.buildGLBProp = function buildGLBProp(R2, name) {
  var g = new THREE.Group();

  /* サイズ & カラーをシード RNG で確定 */
  var baseSize   = GLB_PROP_SIZES[name] || 1.5;
  var targetSize = baseSize * (0.6 + R2() * 1.2);
  var fCol       = GLB_FANCY_COLORS[Math.floor(R2() * GLB_FANCY_COLORS.length)];
  var doGlow     = R2() < 0.35;

  /* ----- 即時表示プレースホルダー (GLBロード完了まで表示) ----- */
  var _phMat = new THREE.MeshStandardMaterial({
    color: fCol,
    roughness: 0.55, metalness: 0.15,
    transparent: true, opacity: 0.55,
    emissive: new THREE.Color(fCol), emissiveIntensity: 0.18
  });
  var _phH    = targetSize * 0.55;
  var _phMesh = new THREE.Mesh(
    new THREE.BoxGeometry(targetSize * 0.55, _phH, targetSize * 0.42),
    _phMat
  );
  _phMesh.castShadow = true;
  _phMesh.position.y = _phH * 0.5;
  _phMesh.name = '__glbPropPH';
  g.add(_phMesh);
  g.add(makeDropShadow(targetSize * 0.45, targetSize * 0.45, 0.38));

  function _applyModel(gltf) {
    var model;
    try {
      /* gltf.scene が存在しない場合に備えたガード */
      if (!gltf || !gltf.scene) {
        console.warn('[GLBProp] invalid gltf:', name);
        return;
      }
      model = gltf.scene.clone(true);
    } catch (e) {
      console.warn('[GLBProp] clone failed:', name, e);
      return;
    }

    /* 自動スケール */
    try {
      var box = new THREE.Box3();
      box.setFromObject(model);
      var sv  = new THREE.Vector3();
      box.getSize(sv);
      var maxDim = Math.max(sv.x, sv.y, sv.z);
      if (maxDim > 0.001) {
        model.scale.setScalar(targetSize / maxDim);
        /* 底面 Y=0 合わせ: スケール後に再計算 */
        box.setFromObject(model);
        var _minY = isFinite(box.min.y) ? box.min.y : 0;
        model.position.y = -_minY;
      }
    } catch (e2) {
      console.warn('[GLBProp] scale/align failed:', name, e2);
    }

    /* マテリアル処理 */
    try {
      model.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow    = true;
        child.receiveShadow = true;
        try { child.geometry.computeVertexNormals(); } catch (e3) {}

        var hasVC  = !!(child.geometry && child.geometry.attributes && child.geometry.attributes.color);
        var origM  = Array.isArray(child.material) ? child.material[0] : child.material;
        var hasTex = !!(origM && origM.map);

        if (hasTex) {
          var mats = Array.isArray(child.material) ? child.material : [child.material];
          for (var mi = 0; mi < mats.length; mi++) {
            if (!mats[mi]) continue;
            var cm = mats[mi].clone();
            cm.needsUpdate = true;
            if (doGlow) { cm.emissive = new THREE.Color(fCol); cm.emissiveIntensity = 0.15 + R2() * 0.3; }
            if (Array.isArray(child.material)) child.material[mi] = cm; else child.material = cm;
          }
        } else if (hasVC) {
          var vc = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.3 + R2() * 0.4,
            metalness: 0.1 + R2() * 0.2
          });
          if (doGlow) { vc.emissive = new THREE.Color(fCol); vc.emissiveIntensity = 0.2 + R2() * 0.5; }
          child.material = vc;
        } else {
          var fancy = GLB_FANCY_COLORS[Math.floor(R2() * GLB_FANCY_COLORS.length)];
          var nm = new THREE.MeshStandardMaterial({
            color: fancy,
            roughness: 0.2 + R2() * 0.5,
            metalness: 0.1 + R2() * 0.4
          });
          if (doGlow) { nm.emissive = new THREE.Color(fancy); nm.emissiveIntensity = 0.4 + R2() * 1.0; }
          child.material = nm;
        }
      });
    } catch (e4) {
      console.warn('[GLBProp] material failed:', name, e4);
      /* マテリアルが適用できなくてもモデルは追加する */
    }

    /* 成功: プレースホルダーを非表示にしてモデルを追加 */
    var ph = g.getObjectByName('__glbPropPH');
    if (ph) ph.visible = false;

    if (doGlow) {
      var pl = new THREE.PointLight(fCol, 1.2 + R2() * 1.5, targetSize * 5.5, 2.0);
      pl.position.y = targetSize * 0.55;
      g.add(pl);
    }
    g.add(model);
  }

  /* GLB失敗時の永続フォールバックボックス（プレースホルダーより目立つ不透明版） */
  function _addFallbackBox() {
    var fbMat = new THREE.MeshStandardMaterial({
      color: fCol, roughness: 0.5, metalness: 0.2,
      emissive: new THREE.Color(fCol), emissiveIntensity: 0.3
    });
    var fbH  = targetSize * 0.55;
    var fbMesh = new THREE.Mesh(
      new THREE.BoxGeometry(targetSize * 0.55, fbH, targetSize * 0.42),
      fbMat
    );
    fbMesh.castShadow = true;
    fbMesh.position.y = fbH * 0.5;
    g.add(fbMesh);
    g.add(makeDropShadow(targetSize * 0.45, targetSize * 0.45, 0.42));
  }

  /* キャッシュ参照 → 同期適用 */
  var cached = window._glbCache && window._glbCache[name];
  if (cached) {
    _applyModel(cached);
  } else {
    /* フォールバック非同期ロード（プレースホルダーは残る） */
    if (typeof THREE.GLTFLoader !== 'undefined') {
      var fb = (typeof _makeGLTFLoader === 'function') ? _makeGLTFLoader() : new THREE.GLTFLoader();
      fb.load(
        'glb/' + name + '.glb',
        function (gltf) {
          if (!window._glbCache) window._glbCache = {};
          window._glbCache[name] = gltf;
          _applyModel(gltf);
        },
        null,
        function (err) {
          console.warn('[GLBProp] load failed:', name, err);
          /* プレースホルダーをそのまま残す（不透明に変更） */
          var ph = g.getObjectByName('__glbPropPH');
          if (ph && ph.material) { ph.material.transparent = false; ph.material.opacity = 1.0; ph.material.needsUpdate = true; }
        }
      );
    }
  }

  return g;
};

/* -----------------------------------------------------------------
   Fix 3: buildRoom の返り値に seed を注入
   （room.js 本体の buildRoom をラップして seed プロパティを保証する）
----------------------------------------------------------------- */
(function () {
  var _origBuildRoom = window.buildRoom;
  window.buildRoom = function buildRoom(seed) {
    var result = _origBuildRoom(seed);
    if (result && result.seed === undefined) {
      result.seed = seed;
    }
    return result;
  };
})();

/* -----------------------------------------------------------------
   Fix 4: room.js の buildCrystal をエイリアス保存
   ロード順: room.js (dead code 版) → room_patches.js → creatures3D.js (正規版)
   このパッチ実行時点では room.js 版が window.buildCrystal。
   その後 creatures3D.js が正規版で上書きするので特別な対処は不要。
   room.js 版を念のため buildCrystalProp として保存しておくだけでよい。
----------------------------------------------------------------- */
if (typeof buildCrystal === 'function') {
  window.buildCrystalProp = window.buildCrystal;
  /* creatures3D.js が後でロードされ buildCrystal を正しく上書きする。
     Object.defineProperty などの細工は不要。 */
}

/* -----------------------------------------------------------------
   Fix A + Fix E: enterDoor を再定義
   ・BUG-A: spawnWeaponsInRoom(currentRoom) 呼び出し追加（2室目以降アイテムが
     スポーンしない問題を修正）
   ・BUG-E: Math.random() をシード RNG に置換（シード再現性の維持）
----------------------------------------------------------------- */
(function () {
  window.enterDoor = function enterDoor(door) {
    if (window.transitioning) return;
    window.transitioning = true;

    var doorHintEl = window.doorHintEl || document.getElementById('door-hint');
    if (doorHintEl) doorHintEl.classList.remove('visible');
    var fadeEl = document.getElementById('fade');
    if (fadeEl) fadeEl.style.opacity = '1';

    setTimeout(function () {
      try {
        disposeRoom(currentRoom);
        scene.remove(currentRoom.group);
        currentRoom = spawnRoom(door.seed);

        /* ▼ BUG-A FIX: 新しい部屋に武器/アイテムをスポーン */
        if (typeof spawnWeaponsInRoom === 'function') {
          spawnWeaponsInRoom(currentRoom);
        }

        scene.fog.near = currentRoom.fogNear;
        scene.fog.far  = currentRoom.fogFar;
        scene.background.copy(currentRoom.palColor);
        scene.fog.color.copy(currentRoom.palColor);

        /* ▼ BUG-E FIX: Math.random() → シード RNG */
        var _rng = makeRng((door.seed ^ 0xFEDC9876) >>> 0);
        camera.position.set(0, 1.72 + (_rng() - 0.5) * 0.14, currentRoom.hd - 2.5);
        window.walkPhase = _rng() * Math.PI * 2;
        window.yaw       = 0;
        window._floorY   = 0;

        window.roomNum = (window.roomNum || 0) + 1;
        var roomNumEl = window.roomNumEl || document.getElementById('room-info');
        if (roomNumEl) roomNumEl.textContent = 'ROOM ' + String(window.roomNum).padStart(3, '0');

        if (typeof initEffects === 'function') initEffects();
      } catch (e) {
        console.error('[enterDoor patch] failed:', e);
      }
      setTimeout(function () {
        window.transitioning = false;
        if (fadeEl) fadeEl.style.opacity = '0';
      }, 200);
    }, 370);
  };
})();

/* -----------------------------------------------------------------
   Fix B: clearInteractables を wrap して HP スプライトを事前除去
   combat.js は _createHPSprite() で scene.add() するが、
   clearInteractables() は roomInteractables しかリセットせず
   スプライトが scene に残留し続けるのを防ぐ。
----------------------------------------------------------------- */
(function () {
  var _origClear = window.clearInteractables;
  window.clearInteractables = function clearInteractables() {
    /* ▼ BUG-B FIX: HP スプライトを scene から除去してからリセット */
    if (typeof roomInteractables !== 'undefined' && typeof scene !== 'undefined') {
      for (var _bi = 0; _bi < roomInteractables.length; _bi++) {
        var _cr = roomInteractables[_bi];
        if (_cr && _cr._hpSprite) {
          scene.remove(_cr._hpSprite);
          _cr._hpSprite = null;
        }
      }
    }
    if (typeof _origClear === 'function') _origClear();
  };
})();

console.log('[room_patches] 全6件のバグ修正を適用しました');
