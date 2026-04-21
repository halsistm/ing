/* ----------------------------------------------------------
   Async init: GLB プリロード → spawnRoom
---------------------------------------------------------- */
function _startGame() {
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      try {
        /* window._nextRoomSeed は engine.js 先頭で Three.js UUID 生成より前に確定 */
        var _seed = window._nextRoomSeed || (Math.floor(Math.random() * 99991) + 1);
        window._nextRoomSeed = Math.floor(Math.random() * 99991) + 1; /* 次の部屋用 */
        currentRoom = spawnRoom(_seed);
        initEffects();
        spawnWeaponsInRoom(currentRoom);
        scene.fog.near = currentRoom.fogNear;
        scene.fog.far  = currentRoom.fogFar;
        scene.background.copy(currentRoom.palColor);
        scene.fog.color.copy(currentRoom.palColor);
        camera.position.set(0, 1.72, currentRoom.hd - 2.5);
      } catch(e) {
        console.error('[init] spawnRoom failed:', e);
      }
      setProgress(80);
      requestAnimationFrame(function() {
        setProgress(100);
        animate();
        clearTimeout(window._loadWatchdog);
        setTimeout(function () {
          loadingEl.classList.add('fade');
          setTimeout(function () {
            loadingEl.style.display = 'none';
            showTitleScreen();
          }, 1500);
        }, 600);
      });
    });
  });
}

// ghost_3d.glb 〜 ghost_3d9.glb を順次プリロードしてからゲーム開始
// unicon.glb を含む全GLBプロップは preloadGLBProps で一括ロード
setProgress(30);
(function() {
  var loader = new THREE.GLTFLoader();

  /* GLBジオメトリを抽出してキャッシュする共通ヘルパー */
  function _extractGeo(gltf, geoKey) {
    gltf.scene.traverse(function(child) {
      var existing = window[geoKey];
      if (!child.isMesh) return;
      var hasColor = !!child.geometry.attributes.color;
      if (existing && (existing.attributes.aZoneColor || !hasColor)) return;

      var geo = child.geometry.clone();
      child.updateWorldMatrix(true, false);
      geo.applyMatrix4(child.matrixWorld);
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      var minY = geo.boundingBox.min.y;
      if (minY !== 0) geo.translate(0, -minY, 0);

      if (geo.attributes.color) {
        geo.setAttribute('aZoneColor', geo.attributes.color);
      }

      window[geoKey] = geo;

      /* オリジナルマテリアルを保存（GLBのBlenderマテリアルをそのまま使うため） */
      var _matKey = geoKey.replace('Geometry', 'Material');
      if (!window[_matKey] && child.material) {
        window[_matKey] = child.material;
      }
    });
  }

  /* Step 10.5: room/ GLBプロップを並列プリロード (65→75%)
     unicon.glb もここで処理されるので別途ロード不要 */
  function loadRoomProps() {
    if (typeof preloadGLBProps === 'function') {
      preloadGLBProps(
        function(loaded, total) {
          setProgress(65 + Math.floor((loaded / total) * 10));
        },
        function() { setProgress(75); _loadWeaponsAndStart(); }
      );
    } else {
      setProgress(75); _loadWeaponsAndStart();
    }
  }
  /* Step 11: weapon GLBs → _startGame */
  function _loadWeaponsAndStart() {
    if (typeof preloadWeaponModels === 'function') {
      preloadWeaponModels(function() { _startGame(); });
    } else {
      _startGame();
    }
  }
  /* Step 9: ghost_3d9.glb → loadRoomProps（unicorn は preloadGLBProps 内で処理）*/
  function loadGhost9() {
    loader.load('glb/ghost_3d9.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry9'); setProgress(60); loadRoomProps(); },
      function(xhr)  { if (xhr.total > 0) setProgress(58 + (xhr.loaded/xhr.total)*2); },
      function(err)  { console.warn('[ghost9] load failed:', err); window._ghostGLBGeometry9 = null; setProgress(60); loadRoomProps(); }
    );
  }
  /* Step 8: ghost_3d8.glb */
  function loadGhost8() {
    loader.load('glb/ghost_3d8.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry8'); setProgress(58); loadGhost9(); },
      function(xhr)  { if (xhr.total > 0) setProgress(56 + (xhr.loaded/xhr.total)*2); },
      function(err)  { console.warn('[ghost8] load failed:', err); window._ghostGLBGeometry8 = null; setProgress(58); loadGhost9(); }
    );
  }
  /* Step 7: ghost_3d7.glb */
  function loadGhost7() {
    loader.load('glb/ghost_3d7.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry7'); setProgress(56); loadGhost8(); },
      function(xhr)  { if (xhr.total > 0) setProgress(55 + (xhr.loaded/xhr.total)*1); },
      function(err)  { console.warn('[ghost7] load failed:', err); window._ghostGLBGeometry7 = null; setProgress(56); loadGhost8(); }
    );
  }
  /* Step 6: ghost_3d6.glb */
  function loadGhost6() {
    loader.load('glb/ghost_3d6.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry6'); setProgress(55); loadGhost7(); },
      function(xhr)  { if (xhr.total > 0) setProgress(50 + (xhr.loaded/xhr.total)*5); },
      function(err)  { console.warn('[ghost6] load failed:', err); window._ghostGLBGeometry6 = null; setProgress(55); loadGhost7(); }
    );
  }
  /* Step 5: ghost_3d5.glb */
  function loadGhost5() {
    loader.load('glb/ghost_3d5.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry5'); setProgress(50); loadGhost6(); },
      function(xhr)  { if (xhr.total > 0) setProgress(45 + (xhr.loaded/xhr.total)*5); },
      function(err)  { console.warn('[ghost5] load failed:', err); window._ghostGLBGeometry5 = null; setProgress(50); loadGhost6(); }
    );
  }
  /* Step 4: ghost_3d4.glb */
  function loadGhost4() {
    loader.load('glb/ghost_3d4.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry4'); setProgress(45); loadGhost5(); },
      function(xhr)  { if (xhr.total > 0) setProgress(40 + (xhr.loaded/xhr.total)*5); },
      function(err)  { console.warn('[ghost4] load failed:', err); window._ghostGLBGeometry4 = null; setProgress(45); loadGhost5(); }
    );
  }
  /* Step 3: ghost_3d3.glb */
  function loadGhost3() {
    loader.load('glb/ghost_3d3.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry3'); setProgress(40); loadGhost4(); },
      function(xhr)  { if (xhr.total > 0) setProgress(35 + (xhr.loaded/xhr.total)*5); },
      function(err)  { console.warn('[ghost3] load failed:', err); window._ghostGLBGeometry3 = null; setProgress(40); loadGhost4(); }
    );
  }
  /* Step 2: ghost_3d2.glb */
  function loadGhost2() {
    loader.load('glb/ghost_3d2.glb',
      function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry2'); setProgress(35); loadGhost3(); },
      function(xhr)  { if (xhr.total > 0) setProgress(32 + (xhr.loaded/xhr.total)*3); },
      function(err)  { console.warn('[ghost2] load failed:', err); window._ghostGLBGeometry2 = null; setProgress(35); loadGhost3(); }
    );
  }
  /* Step 1: ghost_3d.glb */
  loader.load('glb/ghost_3d.glb',
    function(gltf) { _extractGeo(gltf, '_ghostGLBGeometry'); setProgress(32); loadGhost2(); },
    function(xhr)  { if (xhr.total > 0) setProgress(30 + (xhr.loaded/xhr.total)*2); },
    function(err)  { console.warn('[ghost] load failed:', err); window._ghostGLBGeometry = null; setProgress(32); loadGhost2(); }
  );
})();

/* ----------------------------------------------------------
   Title screen
---------------------------------------------------------- */
var titleScreenEl     = document.getElementById('title-screen');
var titleBtnNew       = document.getElementById('title-btn-new');
var titleBtnContinue  = document.getElementById('title-btn-continue');
var continueCountLabel = document.getElementById('continue-count-label');

function showTitleScreen() {
  // 継続データがあれば捕獲数を表示
  var total = getTotalCaptured();
  if (total > 0) {
    continueCountLabel.textContent = total + ' 種捕獲済み';
    titleBtnContinue.style.color = 'rgba(255,255,255,0.55)';
  } else {
    continueCountLabel.textContent = 'データなし';
    titleBtnContinue.style.color = 'rgba(255,255,255,0.22)';
    titleBtnContinue.style.cursor = 'default';
  }
  titleScreenEl.classList.add('visible');
}

function startGame() {
  if (!titleScreenEl || titleScreenEl.parentNode === null) return; /* 二重呼び出し防止 */
  titleScreenEl.classList.add('fade-out');
  setTimeout(function() {
    if (titleScreenEl && titleScreenEl.parentNode) {
      titleScreenEl.parentNode.removeChild(titleScreenEl); /* DOMから完全除去 */
    }
  }, 1300);
}

function _handleNewGame() {
  capturedCollection = {};
  saveCollection();
  collectionCount.textContent = '0 / ' + CREATURE_DATA.length + ' 発見済み';
  startGame();
}
titleBtnNew.addEventListener('click', _handleNewGame);
titleBtnNew.addEventListener('touchend', function(e) {
  e.preventDefault();
  _handleNewGame();
}, { passive: false });

titleBtnContinue.addEventListener('click', function() {
  if (getTotalCaptured() > 0) startGame();
});
titleBtnContinue.addEventListener('touchend', function(e) {
  e.preventDefault();
  if (getTotalCaptured() > 0) startGame();
}, { passive: false });
