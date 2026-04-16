'use strict';
/* ================================================================
   weapons.js  —  武器・弾薬・アイテムシステム
   ロード順: engine.js → effects.js → combat.js → weapons.js
   ================================================================

   【統合手順】
   1. index.html の <script> にこのファイルを combat.js の後に追加
   2. loop.js の animate() 末尾に updateWeapons(dt) を追加
   3. spawnRoom() 呼び出し直後に
        spawnWeaponsInRoom(currentRoom);
      を追加（init.js の _startGame 内）
   4. player.js の canvas click 内の既存 fireBeam() 呼び出しは
      このファイルが上書きするのでそのままでOK
   5. モバイル: 右半分タップの touchend ハンドラにも
        fireBeam();
      を追加すること（任意）

   【キーバインド（PC）】
     クリック : 射撃 / 捕獲（武器なし時は既存ビーム）
     Q        : スロット切り替え
     R        : リロード
     1 / 2    : スロット直接選択

   【公開API】
     spawnWeaponsInRoom(room)  — ルーム入室時に呼ぶ
     fireBeam()                — player.js から呼ばれる（上書き）
     updateWeapons(dt)         — 毎フレーム呼ぶ
     playerWeapons[0/1]        — 装備スロット
     activeWeaponSlot          — アクティブスロット番号
================================================================ */

/* ================================================================
   武器定義
================================================================ */
var WEAPON_DEFS = {
  handgun: {
    name: '拳銃',       nameEn: 'Handgun',
    damage: 8,  accuracy: 0.90, fireRate: 0.50,
    ammo: 12, maxAmmo: 12, reserveMax: 60,
    pellets: 1, spread: 0.015,
    color: 0xFFCC44, emissive: 0x885500
  }
};

/* ================================================================
   プレイヤー武器スロット
================================================================ */
/* ハンドガン常時装備（スロット廃止） */
var playerWeapons    = [{ type: 'handgun', ammo: 12, reserveAmmo: 60 }];
var activeWeaponSlot = 0;
var _wpnCooldown     = 0.0;            /* 発射インターバル秒 */

/* ================================================================
   フロアアイテム管理
================================================================ */
var floorItems = [];
/*  {
      type:      'ammo'|'medkit'
      mesh:      THREE.Group
      pos:       THREE.Vector3
      bobPhase:  float
      glow:      THREE.PointLight
      picked:    bool
    }
*/

/* ── マズルフラッシュ ── */
var _muzzleLight = (function() {
  var pl = new THREE.PointLight(0xFFAA44, 0.0, 7.0);
  scene.add(pl);
  return pl;
})();
var _muzzleTimer = 0.0;

/* ── 弾道トレイル ── */
var _trails = [];   /* { line, timer, maxTimer } */

/* ================================================================
   GLB ファイルマッピング＆キャッシュ
================================================================ */
var _WPN_GLB = {
  ammo: 'glb/Silencer_Fat.glb'
  /* medkit はプロシージャルのまま（GLBなし）*/
};

/* ロード済みGLTFを保持。null = 未ロード / false = ロード失敗 */
var _wpnCache = {
  ammo: null
};

/* ================================================================
   preloadWeaponModels(onDone)
   init.js の GLBチェーン末尾か _startGame() 前に呼ぶ。
   全件ロード（失敗含む）後に onDone() を呼ぶ。
================================================================ */
function preloadWeaponModels(onDone) {
  var loader = new THREE.GLTFLoader();
  var keys   = Object.keys(_WPN_GLB);
  var remain = keys.length;

  function _done() {
    remain--;
    if (remain <= 0 && typeof onDone === 'function') onDone();
  }

  keys.forEach(function(key) {
    loader.load(
      _WPN_GLB[key],
      function(gltf) { _wpnCache[key] = gltf; _done(); },
      null,
      function(err) {
        console.warn('[weapons] ' + _WPN_GLB[key] + ' load failed — using fallback:', err);
        _wpnCache[key] = false;   /* false = 失敗フラグ */
        _done();
      }
    );
  });
}

/* ── GLB シーンをフロアアイテム用にクローン ── */
function _cloneGLB(gltf, emissiveHex, targetSize) {
  var root = gltf.scene.clone(true);

  /* エミッシブ上書き（テクスチャ/カラーは維持しつつグロー付与）*/
  root.traverse(function(child) {
    if (!child.isMesh) return;
    child.castShadow = true;
    var applyEmi = function(m) {
      var nm = m.clone();
      nm.emissive        = new THREE.Color(emissiveHex);
      nm.emissiveIntensity = 0.85;
      return nm;
    };
    child.material = Array.isArray(child.material)
      ? child.material.map(applyEmi)
      : applyEmi(child.material);
  });

  /* バウンディングボックスで正規化スケール */
  var box  = new THREE.Box3().setFromObject(root);
  var size = new THREE.Vector3();
  box.getSize(size);
  var maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0.001) {
    var s = (targetSize || 0.55) / maxDim;
    root.scale.setScalar(s);
  }

  /* 底面を y=0 に揃える */
  box.setFromObject(root);
  root.position.y = -box.min.y;

  return root;
}

/* ================================================================
   武器メッシュ生成
   GLBキャッシュがあれば使用、なければプロシージャルフォールバック
================================================================ */
function _makeMesh(type) {
  /* GLBキャッシュ確認 */
  if (_WPN_GLB[type] && _wpnCache[type]) {
    var def     = WEAPON_DEFS[type];
    var emiCol  = def ? def.emissive : (type === 'ammo' ? 0x886600 : 0x880022);
    return _cloneGLB(_wpnCache[type], emiCol, 0.55);
  }

  /* ── フォールバック: プロシージャル ── */
  var g = new THREE.Group();
  var col, emi;
  if (WEAPON_DEFS[type]) {
    col = WEAPON_DEFS[type].color;
    emi = WEAPON_DEFS[type].emissive;
  } else {
    col = type === 'ammo' ? 0xFFFF44 : 0xFF4466;
    emi = type === 'ammo' ? 0x888800 : 0x880022;
  }

  function mat(c, e, r, m) {
    return new THREE.MeshStandardMaterial({
      color: c, emissive: e, emissiveIntensity: 1.1,
      roughness: r !== undefined ? r : 0.35,
      metalness: m !== undefined ? m : 0.75
    });
  }

  switch (type) {
    case 'ammo': {
      var box = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.11, 0.24),
        mat(0xFFFF44, 0x888800, 0.5, 0.4));
      var belt = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.013, 6, 10),
        mat(0xAA8822, 0x443300, 0.6, 0.7));
      belt.rotation.x = Math.PI / 2; belt.position.y = 0.09;
      g.add(box, belt);
      break;
    }

    case 'medkit': {
      var base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.24),
        mat(0xFF3355, 0x880015, 0.4, 0.2));
      var crossH = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04),
        mat(0xFFFFFF, 0xCCCCCC, 0.3, 0.1));
      crossH.position.y = 0.08;
      var crossV = crossH.clone(); crossV.rotation.z = Math.PI / 2; crossV.position.y = 0.08;
      g.add(base, crossH, crossV);
      break;
    }
  }
  return g;
}

/* ================================================================
   spawnWeaponsInRoom(room)
   既存アイテムをクリアしてから新しいルームにアイテムを配置する。
================================================================ */
function spawnWeaponsInRoom(room) {
  /* 前ルームの生物HPバーを全消去 */
  if (typeof cleanupAllHPSprites === 'function') cleanupAllHPSprites();

  /* 前ルームのアイテムを削除 */
  for (var fi = 0; fi < floorItems.length; fi++) {
    if (floorItems[fi].mesh)  scene.remove(floorItems[fi].mesh);
    if (floorItems[fi].glow)  scene.remove(floorItems[fi].glow);
    if (floorItems[fi].beam)  scene.remove(floorItems[fi].beam);
    if (floorItems[fi].ring)  scene.remove(floorItems[fi].ring);
  }
  floorItems = [];

  if (!room) return;

  /* ★修正: 時刻も混合してシード多様化（同じroom.seedでも偏らない）*/
  var _timeSalt = (Date.now() & 0xFFFF);
  var rng    = makeRng((room.seed ^ 0xC0FFEE ^ (_timeSalt * 0x9E37)) >>> 0);
  var count  = 2 + Math.floor(rng() * 3);   /* 2〜4個 */
  var types  = ['ammo', 'ammo', 'medkit'];
  var hw     = room.hw - 1.8;
  var hd     = room.hd - 1.8;

  for (var i = 0; i < count; i++) {
    var type = types[Math.floor(rng() * types.length)];
    var px   = (rng() * 2.0 - 1.0) * hw;
    var pz   = (rng() * 2.0 - 1.0) * hd;
    var pos  = new THREE.Vector3(px, 0.20, pz);

    var mesh = _makeMesh(type);
    mesh.position.copy(pos);
    scene.add(mesh);

    var glowCol = WEAPON_DEFS[type] ? WEAPON_DEFS[type].color :
                  type === 'ammo' ? 0xFFFF44 : 0xFF4466;
    var glow = new THREE.PointLight(glowCol, 2.5, 7.0);
    glow.position.copy(pos);
    glow.position.y += 0.5;
    scene.add(glow);
    /* 上方向の細い光柱（視認性向上）*/
    var beamGeo = new THREE.CylinderGeometry(0.04, 0.12, 2.2, 6, 1, true);
    var beamMat = new THREE.MeshBasicMaterial({
      color: glowCol, transparent: true, opacity: 0.18,
      side: THREE.DoubleSide, depthWrite: false
    });
    var beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.copy(pos);
    beam.position.y += 1.3;
    scene.add(beam);

    /* 床面に光るリングを追加 */
    var ringGeo = new THREE.RingGeometry(0.38, 0.55, 20);
    ringGeo.rotateX(-Math.PI / 2);
    var ringMat = new THREE.MeshBasicMaterial({
      color: glowCol, transparent: true, opacity: 0.65,
      side: THREE.DoubleSide, depthWrite: false
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.position.y = 0.02;
    scene.add(ring);

    floorItems.push({
      type: type, mesh: mesh, pos: pos.clone(),
      bobPhase: rng() * Math.PI * 2.0,
      glow: glow, beam: beam, ring: ring, picked: false
    });
  }
}

/* ================================================================
   アイテム取得（近接自動）
================================================================ */
var _pickRadius = 1.35;

function _checkPickup() {
  var cx = camera.position.x, cz = camera.position.z;
  for (var fi = 0; fi < floorItems.length; fi++) {
    var it = floorItems[fi];
    if (it.picked) continue;
    var dx = cx - it.pos.x, dz = cz - it.pos.z;
    if (dx * dx + dz * dz < _pickRadius * _pickRadius) {
      _doPickup(it);
    }
  }
}

function _doPickup(item) {
  item.picked = true;
  scene.remove(item.mesh);
  if (item.glow) scene.remove(item.glow);
  if (item.beam) scene.remove(item.beam);
  if (item.ring) scene.remove(item.ring);

  /* ── 回復キット ── */
  if (item.type === 'medkit') {
    var heal = 35;
    if (typeof playerHp !== 'undefined') {
      playerHp = Math.min(playerMaxHp, playerHp + heal);
      if (typeof updatePlayerHPBar === 'function') updatePlayerHPBar();
    }
    _pickup_msg('＋ 回復 +' + heal + 'HP');
    return;
  }

  /* ── 弾薬 ── */
  if (item.type === 'ammo') {
    var pw = playerWeapons[0];
    var def = WEAPON_DEFS[pw.type];
    pw.reserveAmmo = Math.min(def.reserveMax, pw.reserveAmmo + def.maxAmmo * 2);
    _pickup_msg('★ 弾薬補充');
    _updateHUD();
    return;
  }
}

/* ================================================================
   武器 HUD（DOM）
================================================================ */
var _hudNameEl  = null;
var _hudAmmoEl  = null;
var _hudSlotEls = [null, null];
var _hudMsgEl   = null;
var _hudMsgTimer = 0.0;

(function _initHUD() {
  /* スロット + 武器名 + 弾薬パネル（右下）*/
  var panel = document.createElement('div');
  panel.id  = 'wpn-hud';
  panel.style.cssText = [
    'display:none;',   /* ui.js の情報オーバーレイが代替するため非表示 */
    'position:fixed;bottom:80px;right:16px;',
    'flex-direction:column;align-items:flex-end;gap:5px;',
    'pointer-events:none;z-index:150;',
    'font-family:monospace;text-shadow:0 0 6px rgba(0,0,0,0.95);'
  ].join('');

  /* スロット行 */
  var slotRow = document.createElement('div');
  slotRow.style.cssText = 'display:flex;gap:6px;';
  for (var si = 0; si < 2; si++) {
    var sd = document.createElement('div');
    sd.style.cssText = [
      'width:44px;height:28px;',
      'border:1px solid rgba(255,255,255,0.22);border-radius:3px;',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:8px;color:rgba(255,255,255,0.35);',
      'background:rgba(0,0,0,0.50);'
    ].join('');
    sd.textContent = 'EMPTY';
    _hudSlotEls[si] = sd;
    slotRow.appendChild(sd);
  }
  panel.appendChild(slotRow);

  /* 武器名 */
  var nm = document.createElement('div');
  nm.style.cssText = 'font-size:11px;color:rgba(255,255,190,0.78);letter-spacing:0.06em;';
  nm.textContent   = '─ 素手 ─';
  _hudNameEl = nm;
  panel.appendChild(nm);

  /* 弾薬 */
  var am = document.createElement('div');
  am.style.cssText = 'font-size:15px;font-weight:bold;letter-spacing:0.12em;color:rgba(255,255,200,0.9);';
  _hudAmmoEl = am;
  panel.appendChild(am);

  document.body.appendChild(panel);

  /* ピックアップメッセージ（右中）*/
  var msg = document.createElement('div');
  msg.id  = 'wpn-pickup-msg';
  msg.style.cssText = [
    'position:fixed;bottom:165px;right:16px;',
    'font-family:monospace;font-size:12px;',
    'color:rgba(255,255,170,0.92);',
    'text-shadow:0 0 8px rgba(0,0,0,1);',
    'pointer-events:none;z-index:160;',
    'opacity:0;transition:opacity 0.25s;'
  ].join('');
  document.body.appendChild(msg);
  _hudMsgEl = msg;

  /* クロスヘア（中央）*/
  var ch = document.createElement('div');
  ch.id  = 'wpn-crosshair';
  ch.style.cssText = [
    'position:fixed;top:50%;left:50%;',
    'transform:translate(-50%,-50%);',
    'width:22px;height:22px;',
    'pointer-events:none;z-index:200;'
  ].join('');
  ch.innerHTML = [
    '<svg width="22" height="22" viewBox="0 0 22 22" fill="none">',
    '<line x1="11" y1="1" x2="11" y2="8" stroke="rgba(255,255,255,0.72)" stroke-width="1.5"/>',
    '<line x1="11" y1="14" x2="11" y2="21" stroke="rgba(255,255,255,0.72)" stroke-width="1.5"/>',
    '<line x1="1" y1="11" x2="8" y2="11" stroke="rgba(255,255,255,0.72)" stroke-width="1.5"/>',
    '<line x1="14" y1="11" x2="21" y2="11" stroke="rgba(255,255,255,0.72)" stroke-width="1.5"/>',
    '<circle cx="11" cy="11" r="1.5" fill="rgba(255,255,255,0.72)"/>',
    '</svg>'
  ].join('');
  document.body.appendChild(ch);
})();

function _updateHUD() {
  var pw = playerWeapons[0];
  if (pw) {
    var def = WEAPON_DEFS[pw.type];
    _hudNameEl.textContent = def.name;
    _hudAmmoEl.textContent = pw.ammo + ' / ' + pw.reserveAmmo;
    _hudAmmoEl.style.color =
      pw.ammo === 0  ? 'rgba(255,50,50,0.95)' :
      pw.ammo <= 2   ? 'rgba(255,180,50,0.95)' :
                       'rgba(255,255,200,0.92)';
    if (_hudSlotEls[0]) {
      _hudSlotEls[0].textContent = def.name;
      _hudSlotEls[0].style.color  = 'rgba(255,255,160,1.0)';
      _hudSlotEls[0].style.border = '1px solid rgba(255,255,160,0.65)';
      _hudSlotEls[0].style.fontSize = '8px';
    }
  }
}

function _pickup_msg(txt) {
  if (!_hudMsgEl) return;
  _hudMsgEl.textContent  = txt;
  _hudMsgEl.style.opacity = '1';
  _hudMsgTimer = 2.8;
}

/* ================================================================
   武器切り替え
================================================================ */
function switchWeaponSlot(slot) {
  /* スロット廃止済み（互換用のみ残す）*/
  _updateHUD();
}

/* ================================================================
   発射（weapons.js が提供する武器専用関数）
   ui.js の FIRE ボタンから呼ぶ。
   player.js の canvas click → room.js の fireBeam（捕獲）はそのまま動く。
================================================================ */
function fireWeapon() {
  var pw = playerWeapons[0];

  /* 武器なし → 既存捕獲ビームを呼ぼうとするが、ここではスキップ */
  /* 捕獲処理は player.js 側の canvas click で行われるため干渉しない */
  if (!pw) return;

  if (_wpnCooldown > 0.0) return;

  /* 弾切れ → リロード */
  if (pw.ammo <= 0) {
    _reload(pw);
    return;
  }

  var def  = WEAPON_DEFS[pw.type];
  pw.ammo--;
  _wpnCooldown = def.fireRate;

  /* ペレット分レイキャスト */
  for (var p = 0; p < def.pellets; p++) {
    var sx = (Math.random() - 0.5) * def.spread * 2.0;
    var sy = (Math.random() - 0.5) * def.spread * 2.0;
    if (Math.random() > def.accuracy) {
      sx += (Math.random() - 0.5) * 0.14;
      sy += (Math.random() - 0.5) * 0.14;
    }
    _castRay(sx, sy, def.damage);
  }

  /* マズルフラッシュ */
  var fwd = new THREE.Vector3(0, 0, -0.55).applyEuler(camera.rotation);
  _muzzleLight.position.copy(camera.position).add(fwd);
  _muzzleLight.intensity = 2.8;
  _muzzleTimer = 0.07;

  /* エフェクト */
  if (typeof triggerEffect === 'function') {
    triggerEffect('chromaBurst', 0.06);
  }

  /* 自動リロード */
  if (pw.ammo === 0 && pw.reserveAmmo > 0) {
    setTimeout(function() { _reload(playerWeapons[0]); }, 200);
  }
  _updateHUD();
}

function _reload(pw) {
  if (!pw || pw.reserveAmmo <= 0) return;
  var def  = WEAPON_DEFS[pw.type];
  var need = def.maxAmmo - pw.ammo;
  var take = Math.min(need, pw.reserveAmmo);
  pw.ammo       += take;
  pw.reserveAmmo -= take;
  _pickup_msg('リロード完了');
  _updateHUD();
}

/* ── 球判定レイキャスト ── */
/* ── 火花ライトプール ── */
var _sparkPool = [];
(function() {
  for (var _si = 0; _si < 6; _si++) {
    var _sl = new THREE.PointLight(0xFFCC66, 0, 4.0);
    _sl.visible = false;
    scene.add(_sl);
    _sparkPool.push({ light: _sl, timer: 0, active: false });
  }
})();

function _acquireSpark() {
  for (var i = 0; i < _sparkPool.length; i++) {
    if (!_sparkPool[i].active) return _sparkPool[i];
  }
  return null;
}

function _spawnWallSpark(origin, dir) {
  /* 壁・床方向に10〜20m先に火花を出す（正確なレイキャストより軽量） */
  var dist = 10 + Math.random() * 10;
  var pos  = origin.clone().add(dir.clone().multiplyScalar(dist));
  /* 床より下には出さない */
  if (pos.y < 0.1) pos.y = 0.1 + Math.random() * 0.3;

  var sp = _acquireSpark();
  if (sp) {
    sp.light.position.copy(pos);
    sp.light.intensity = 2.2 + Math.random() * 1.0;
    sp.light.color.setHex(Math.random() > 0.4 ? 0xFFCC44 : 0xFF8822);
    sp.light.visible = true;
    sp.timer  = 0.06 + Math.random() * 0.04;
    sp.active = true;
  }

  /* 弾道トレイルも壁まで伸ばす */
  _spawnTrail(origin.clone(), pos);
}

function _castRay(spreadX, spreadY, damage) {
  var dir = new THREE.Vector3(spreadX, spreadY, -1.0).normalize();
  dir.applyEuler(camera.rotation);

  if (typeof roomInteractables === 'undefined') return false;
  var camPos = camera.position;
  var hit    = false;

  for (var ri = 0; ri < roomInteractables.length; ri++) {
    var it = roomInteractables[ri];
    if (it.type !== 'creature' || !it.alive) continue;

    /* 球判定（計算コストが低く遠距離でも安定） */
    var toT  = it.pos.clone().sub(camPos);
    var dist = toT.length();
    if (dist > 38.0) continue;
    var proj    = toT.dot(dir);
    if (proj < 0.0) continue;
    var closest = camPos.clone().add(dir.clone().multiplyScalar(proj));
    var perp    = closest.distanceTo(it.pos);
    var hitR    = (it.bodyH || 1.0) * 0.58;

    if (perp < hitR) {
      if (typeof damageCreature === 'function') damageCreature(it, damage);
      _spawnTrail(camPos.clone(), it.pos.clone());
      /* ヒット時にも小さな閃光 */
      _spawnWallSpark(it.pos.clone(), new THREE.Vector3(
        (Math.random()-0.5)*0.5, 0.2, (Math.random()-0.5)*0.5
      ));
      hit = true;
    }
  }

  /* ミス時：壁・オブジェクトに火花 */
  if (!hit) _spawnWallSpark(camPos, dir);

  return hit;
}

/* ── 弾道トレイル ── */
function _spawnTrail(from, to) {
  var pts = [from, to];
  var geo = new THREE.BufferGeometry().setFromPoints(pts);
  var mat = new THREE.LineBasicMaterial({
    color: 0xFFEE88, transparent: true, opacity: 0.70, depthWrite: false
  });
  var line = new THREE.Line(geo, mat);
  scene.add(line);
  _trails.push({ line: line, timer: 0.10, maxTimer: 0.10 });
}

/* ================================================================
   キーバインド（PC）
================================================================ */
document.addEventListener('keydown', function(e) {
  if (e.key === 'r' || e.key === 'R') {
    var pw = playerWeapons[0];
    if (pw && pw.ammo < WEAPON_DEFS[pw.type].maxAmmo) _reload(pw);
  }
});

/* ================================================================
   updateWeapons(dt)
   loop.js の animate() 末尾で呼ぶ。
================================================================ */
function updateWeapons(dt) {
  /* 発射クールダウン */
  if (_wpnCooldown > 0.0) {
    _wpnCooldown -= dt;
    if (_wpnCooldown < 0.0) _wpnCooldown = 0.0;
  }

  /* マズルフラッシュ減衰 */
  if (_muzzleTimer > 0.0) {
    _muzzleTimer -= dt;
    _muzzleLight.intensity = Math.max(0.0, (_muzzleTimer / 0.07) * 2.8);
    if (_muzzleTimer <= 0.0) _muzzleLight.intensity = 0.0;
  }

  /* 弾道トレイル消去 */
  for (var ti = _trails.length - 1; ti >= 0; ti--) {
    var tr = _trails[ti];
    tr.timer -= dt;
    tr.line.material.opacity = Math.max(0.0, tr.timer / tr.maxTimer) * 0.85;
    if (tr.timer <= 0.0) {
      scene.remove(tr.line);
      _trails.splice(ti, 1);
    }
  }

  /* 火花プール減衰 */
  for (var _spi = 0; _spi < _sparkPool.length; _spi++) {
    var _sp = _sparkPool[_spi];
    if (!_sp.active) continue;
    _sp.timer -= dt;
    _sp.light.intensity = Math.max(0, (_sp.timer / 0.08) * 2.5);
    if (_sp.timer <= 0) {
      _sp.light.intensity = 0;
      _sp.light.visible   = false;
      _sp.active = false;
    }
  }

  /* フロアアイテムのボブ + グローパルス + 近接取得 */
  var t = typeof vhsTime !== 'undefined' ? vhsTime : (Date.now() * 0.001);
  _checkPickup();

  for (var fi = 0; fi < floorItems.length; fi++) {
    var item = floorItems[fi];
    if (item.picked) continue;
    var bobY = 0.28 + Math.sin(t * 2.2 + item.bobPhase) * 0.08;
    item.mesh.position.y = bobY;
    item.mesh.rotation.y = t * 1.0 + item.bobPhase;
    if (item.glow) {
      /* より強いパルス + 距離に応じた強度アップ */
      var dx = camera.position.x - item.pos.x;
      var dz = camera.position.z - item.pos.z;
      var proximity = Math.max(0, 1.0 - Math.sqrt(dx*dx+dz*dz) / 8.0);
      item.glow.intensity  = 0.9 + Math.sin(t * 3.5 + item.bobPhase) * 0.4 + proximity * 0.8;
      item.glow.distance   = 3.0 + proximity * 2.0;
    }
    /* リング（あれば）の回転 */
    if (item.ring) {
      item.ring.position.y = 0.04;
      item.ring.rotation.y = t * 1.5 + item.bobPhase;
      item.ring.material.opacity = 0.50 + Math.sin(t * 3.0 + item.bobPhase) * 0.20;
      if (item.beam) {
        item.beam.material.opacity = 0.10 + Math.abs(Math.sin(t * 2.5 + item.bobPhase)) * 0.14;
      }
    }
  }

  /* ピックアップメッセージフェード */
  if (_hudMsgTimer > 0.0) {
    _hudMsgTimer -= dt;
    if (_hudMsgTimer <= 0.0 && _hudMsgEl) _hudMsgEl.style.opacity = '0';
  }
}
