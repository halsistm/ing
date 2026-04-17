'use strict';
/* ================================================================
   creature_attacks.js  — クリーチャー遠距離攻撃 + 戦闘AIシステム
   ロード順: combat.js の後、weapons.js の前
================================================================ */

var AI_COMBAT = 2;

/* ================================================================
   共有グロー円形テクスチャ
   SpriteMaterial は map がないと白い四角になるため canvas で生成
================================================================ */
var _caGlowTex = (function() {
  var cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  var ctx = cv.getContext('2d');
  var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.0,  'rgba(255,255,255,1.0)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  grad.addColorStop(0.70, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1.0,  'rgba(255,255,255,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
})();

/* ================================================================
   エナジーボールプール
   構成: コア球 + オーラ球 + 2本のプラズマリング + グロースプライト + PointLight
================================================================ */
var _caEBallPool = [];
var _CA_EBALL_N  = 6;

(function _initEBallPool() {
  for (var i = 0; i < _CA_EBALL_N; i++) {
    /* コア: 白黄色の高輝度球 */
    var cGeo = new THREE.SphereGeometry(0.18, 8, 6);
    var cMat = new THREE.MeshBasicMaterial({ color: 0xfffef0, depthWrite: false });
    var core = new THREE.Mesh(cGeo, cMat);
    core.visible = false; core.frustumCulled = false;
    scene.add(core);

    /* オーラ: 加算合成で輝くオレンジ球 */
    var aGeo = new THREE.SphereGeometry(0.38, 8, 6);
    var aMat = new THREE.MeshBasicMaterial({
      color: 0xff7700, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var aura = new THREE.Mesh(aGeo, aMat);
    aura.visible = false; aura.frustumCulled = false;
    scene.add(aura);

    /* リング1: 赤橙プラズマリング */
    var r1Geo = new THREE.TorusGeometry(0.46, 0.065, 5, 14);
    var r1Mat = new THREE.MeshBasicMaterial({
      color: 0xff5500, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var ring1 = new THREE.Mesh(r1Geo, r1Mat);
    ring1.visible = false; ring1.frustumCulled = false;
    scene.add(ring1);

    /* リング2: 黄橙プラズマリング（ring1と直交）*/
    var r2Geo = new THREE.TorusGeometry(0.46, 0.065, 5, 14);
    var r2Mat = new THREE.MeshBasicMaterial({
      color: 0xffcc00, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var ring2 = new THREE.Mesh(r2Geo, r2Mat);
    ring2.visible = false; ring2.frustumCulled = false;
    scene.add(ring2);

    /* グロースプライト: カメラ向きビルボード光球（円形テクスチャ必須）*/
    var sprMat = new THREE.SpriteMaterial({
      map: _caGlowTex,
      color: 0xff9944, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthTest: false
    });
    var spr = new THREE.Sprite(sprMat);
    spr.visible = false; spr.frustumCulled = false;
    spr.scale.set(3.0, 3.0, 1.0);
    scene.add(spr);

    /* PointLight: 広範囲を照らす強いオレンジ光 */
    var pl = new THREE.PointLight(0xff8822, 0, 20);
    pl.visible = false;
    scene.add(pl);

    _caEBallPool.push({
      core: core, aura: aura, aMat: aMat,
      ring1: ring1, r1Mat: r1Mat,
      ring2: ring2, r2Mat: r2Mat,
      spr: spr, sprMat: sprMat,
      pl: pl, inUse: false
    });
  }
})();

/* ================================================================
   毒霧（煙）プール
   構成: 5つのパフ球（それぞれ独自の色・オフセット・速度）
================================================================ */
var _caMistPool = [];
var _CA_MIST_N  = 5;   /* 最大5組同時展開 */

var _CA_PUFF_N = 5;

/* ── 煙シェーダー ── */
var _CA_MIST_VERT = [
  'varying vec2 vUv;',
  'void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'
].join('\n');

var _CA_MIST_FRAG = [
  'uniform float uTime;',
  'uniform float uOpacity;',
  'uniform vec3  uColor;',
  'uniform vec2  uOff;',
  'varying vec2 vUv;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float nz(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);',
  '  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
  'float fbm(vec2 p){return nz(p)*0.50+nz(p*2.1+vec2(1.3,0.7))*0.30+nz(p*4.3+vec2(0.5,1.9))*0.20;}',
  'void main(){',
  '  vec2 uv=vUv-0.5; float d=length(uv); if(d>0.5)discard;',
  '  float mask=1.0-smoothstep(0.18,0.5,d);',
  '  vec2 nuv=uv*2.8+uOff+uTime*vec2(0.07,0.11);',
  '  float a=fbm(nuv)*1.5; vec2 sw=uv*2.5+vec2(cos(a),sin(a))*0.25+uOff*1.3+uTime*0.06;',
  '  float smoke=fbm(nuv)*0.55+fbm(sw)*0.45;',
  '  smoke=smoothstep(0.08,0.65,smoke);',
  '  gl_FragColor=vec4(uColor,smoke*mask*uOpacity);',
  '}'
].join('\n');

var _CA_PUFF_COLS = [
  new THREE.Vector3(0.22, 0.72, 0.08),
  new THREE.Vector3(0.18, 0.58, 0.05),
  new THREE.Vector3(0.28, 0.68, 0.12),
  new THREE.Vector3(0.14, 0.52, 0.04),
  new THREE.Vector3(0.32, 0.62, 0.10)
];

(function _initMistPool() {
  for (var gi = 0; gi < _CA_MIST_N; gi++) {
    var puffs = [];
    for (var pi = 0; pi < _CA_PUFF_N; pi++) {
      var pgeo = new THREE.PlaneGeometry(1, 1);
      var pmat = new THREE.ShaderMaterial({
        vertexShader: _CA_MIST_VERT,
        fragmentShader: _CA_MIST_FRAG,
        uniforms: {
          uTime:    { value: 0.0 },
          uOpacity: { value: 0.0 },
          uColor:   { value: _CA_PUFF_COLS[pi] },
          uOff:     { value: new THREE.Vector2(0, 0) }
        },
        transparent: true, depthWrite: false, side: THREE.DoubleSide
      });
      var pm = new THREE.Mesh(pgeo, pmat);
      pm.visible = false; pm.frustumCulled = false;
      scene.add(pm);
      puffs.push({ mesh: pm, mat: pmat });
    }
    _caMistPool.push({ puffs: puffs, inUse: false });
  }
})();

/* ================================================================
   シャボン玉プール
   構成: 虹色シェル球 + カメラスペースハイライトスプライト + PointLight
================================================================ */
var _caBubblePool = [];
var _CA_BUBBLE_N  = 20;

(function _initBubblePool() {
  for (var i = 0; i < _CA_BUBBLE_N; i++) {
    /* シェル: 半透明球（色は毎フレーム虹色に更新）*/
    var sGeo = new THREE.SphereGeometry(0.13, 8, 6);
    var sMat = new THREE.MeshBasicMaterial({
      color: 0x88eeff, transparent: true, opacity: 0, depthWrite: false
    });
    var shell = new THREE.Mesh(sGeo, sMat);
    shell.visible = false; shell.frustumCulled = false;
    scene.add(shell);

    /* ハイライト: カメラ向き白いスプライト（石鹸膜の光反射・円形テクスチャ必須）*/
    var hiMat = new THREE.SpriteMaterial({
      map: _caGlowTex,
      color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthTest: false
    });
    var hi = new THREE.Sprite(hiMat);
    hi.visible = false; hi.frustumCulled = false;
    hi.scale.set(0.18, 0.18, 1.0);
    scene.add(hi);

    /* PointLight: 虹色のほのかな光 */
    var pl = new THREE.PointLight(0x88ddff, 0, 5);
    pl.visible = false;
    scene.add(pl);

    _caBubblePool.push({ shell: shell, sMat: sMat, hi: hi, hiMat: hiMat, pl: pl, inUse: false });
  }
})();

/* ================================================================
   チャージパーティクルプール（変更なし）
================================================================ */
var _caChargePtPool = [];
var _CA_CP_N        = 56;
var _caChargePlPool = [];
var _CA_CPL_N       = 8;

(function _initChargePools() {
  for (var ci = 0; ci < _CA_CP_N; ci++) {
    var cgeo = new THREE.SphereGeometry(0.055, 4, 3);
    var cmat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0 });
    var cm   = new THREE.Mesh(cgeo, cmat);
    cm.visible = false; cm.frustumCulled = false;
    scene.add(cm);
    _caChargePtPool.push({ mesh: cm, mat: cmat, inUse: false, ox: 0, oy: 0, oz: 0 });
  }
  for (var li = 0; li < _CA_CPL_N; li++) {
    var cpl = new THREE.PointLight(0xff8800, 0, 12);
    cpl.visible = false;
    scene.add(cpl);
    _caChargePlPool.push({ light: cpl, inUse: false });
  }
})();

/* ================================================================
   アクティブリスト
================================================================ */
var _caActiveEBalls  = [];
var _caActiveBubbles = [];
var _caActiveMists   = [];

/* 作業用 */
var _caV3a = new THREE.Vector3();
var _caV3b = new THREE.Vector3();
var _caV3c = new THREE.Vector3();

/* ================================================================
   プール取得 / 解放
================================================================ */
function _caAcqEB() {
  for (var i = 0; i < _caEBallPool.length; i++) {
    if (!_caEBallPool[i].inUse) { _caEBallPool[i].inUse = true; return _caEBallPool[i]; }
  }
  return null;
}
function _caRelEB(s) {
  if (!s) return;
  s.core.visible = false;
  s.aura.visible = false; s.aMat.opacity = 0;
  s.ring1.visible = false; s.r1Mat.opacity = 0;
  s.ring2.visible = false; s.r2Mat.opacity = 0;
  s.spr.visible   = false; s.sprMat.opacity = 0;
  s.pl.visible    = false; s.pl.intensity  = 0;
  s.inUse = false;
}

function _caAcqMist() {
  for (var i = 0; i < _caMistPool.length; i++) {
    if (!_caMistPool[i].inUse) { _caMistPool[i].inUse = true; return _caMistPool[i]; }
  }
  return null;
}
function _caRelMist(s) {
  if (!s) return;
  for (var i = 0; i < s.puffs.length; i++) {
    s.puffs[i].mesh.visible = false;
    s.puffs[i].mat.uniforms.uOpacity.value = 0;
  }
  s.inUse = false;
}

function _caAcqBubble() {
  for (var i = 0; i < _caBubblePool.length; i++) {
    if (!_caBubblePool[i].inUse) { _caBubblePool[i].inUse = true; return _caBubblePool[i]; }
  }
  return null;
}
function _caRelBubble(s) {
  if (!s) return;
  s.shell.visible = false; s.sMat.opacity = 0;
  s.hi.visible    = false; s.hiMat.opacity = 0;
  s.pl.visible    = false; s.pl.intensity  = 0;
  s.inUse = false;
}

function _caAcqChargePts(n) {
  var out = [];
  for (var i = 0; i < _caChargePtPool.length && out.length < n; i++) {
    if (!_caChargePtPool[i].inUse) { _caChargePtPool[i].inUse = true; out.push(_caChargePtPool[i]); }
  }
  return out;
}
function _caRelChargePts(pts) {
  if (!pts) return;
  for (var i = 0; i < pts.length; i++) {
    pts[i].mesh.visible = false; pts[i].mat.opacity = 0; pts[i].inUse = false;
  }
}
function _caAcqChargePl() {
  for (var i = 0; i < _caChargePlPool.length; i++) {
    if (!_caChargePlPool[i].inUse) { _caChargePlPool[i].inUse = true; return _caChargePlPool[i]; }
  }
  return null;
}
function _caRelChargePl(p) {
  if (!p) return;
  p.light.intensity = 0; p.light.visible = false; p.inUse = false;
}

/* ================================================================
   クリーチャー戦闘プロパティ初期化
================================================================ */
var _CA_TYPES    = ['energyBall', 'poisonMist', 'bubble'];
var _CA_CHARGE_T = { energyBall: 1.5, poisonMist: 0.42, bubble: 0.72 };
var _CA_COOLDOWN = {
  energyBall: function() { return 4.5 + Math.random() * 3.0; },
  poisonMist: function() { return 7.0 + Math.random() * 4.0; },
  bubble:     function() { return 3.2 + Math.random() * 2.5; }
};

function _caInitCombat(cr) {
  if (cr._caInited) return;
  cr._caInited = true;
  var idx = (cr.data && cr.data.creatureId !== undefined)
    ? (cr.data.creatureId % 3) : Math.floor(Math.random() * 3);
  cr._caType       = _CA_TYPES[idx];
  cr._caCooldown   = 2.0 + Math.random() * 2.0;
  cr._caPhase      = 'idle';
  cr._caChargeT    = 0.0;
  cr._caChargePts  = null;
  cr._caChargePl   = null;
  cr._caStrafeDir  = Math.random() < 0.5 ? 1 : -1;
  cr._caStrafeFlip = 1.5 + Math.random() * 2.0;
}

/* ================================================================
   チャージエフェクト
================================================================ */
function _caStartCharge(cr) {
  cr._caPhase  = 'charging';
  cr._caChargeT = 0.0;
  var n   = cr._caType === 'energyBall' ? 8 : (cr._caType === 'bubble' ? 6 : 4);
  var bh  = cr.bodyH || 1.0;
  var col = cr._caType === 'energyBall' ? 0xff8800 :
            cr._caType === 'poisonMist' ? 0x44ee22 : 0x88eeff;
  cr._caChargePts = _caAcqChargePts(n);
  cr._caChargePl  = _caAcqChargePl();
  for (var i = 0; i < cr._caChargePts.length; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi   = (Math.random() - 0.5) * Math.PI;
    var r     = 1.4 + Math.random() * 1.2;
    cr._caChargePts[i].ox  = Math.cos(theta) * Math.cos(phi) * r;
    cr._caChargePts[i].oy  = Math.sin(phi) * r + bh * 0.55;
    cr._caChargePts[i].oz  = Math.sin(theta) * Math.cos(phi) * r;
    cr._caChargePts[i].mat.color.setHex(col);
    cr._caChargePts[i].mesh.visible = true;
  }
  if (cr._caChargePl) { cr._caChargePl.light.color.setHex(col); cr._caChargePl.light.visible = true; }
}

function _caUpdateCharge(cr, dt) {
  var bh      = cr.bodyH || 1.0;
  var dur     = _CA_CHARGE_T[cr._caType] || 1.0;
  cr._caChargeT += dt;
  var t       = Math.min(1.0, cr._caChargeT / dur);
  var ease    = t * t;
  var inv     = 1.0 - ease;
  var cy      = cr.pos.y + bh * 0.55;
  var flicker = 0.7 + Math.sin(cr._caChargeT * 22.0) * 0.3;
  if (cr._caChargePl) {
    var maxInt = cr._caType === 'energyBall' ? 5.5 : 2.8;
    cr._caChargePl.light.position.set(cr.pos.x, cy, cr.pos.z);
    cr._caChargePl.light.intensity = ease * maxInt * flicker;
    cr._caChargePl.light.distance  = 3.0 + ease * 7.0;
  }
  if (!cr._caChargePts) return;
  for (var i = 0; i < cr._caChargePts.length; i++) {
    var cp = cr._caChargePts[i];
    cp.mesh.position.set(
      cr.pos.x + cp.ox * inv,
      cr.pos.y + cp.oy * inv + bh * 0.55 * ease,
      cr.pos.z + cp.oz * inv
    );
    cp.mesh.scale.setScalar(0.4 + inv * 1.2);
    cp.mat.opacity = (0.5 + ease * 0.5) * (0.65 + Math.sin(cr._caChargeT * 15.0 + i * 1.1) * 0.35);
  }
}

function _caStopCharge(cr) {
  if (!cr) return;
  _caRelChargePts(cr._caChargePts); _caRelChargePl(cr._caChargePl);
  cr._caChargePts = null; cr._caChargePl = null; cr._caPhase = 'idle';
}

/* ================================================================
   発射
================================================================ */
function _caFireAttack(cr) {
  var bh = cr.bodyH || 1.0;
  var cx = cr.pos.x, cy = cr.pos.y + bh * 0.55, cz = cr.pos.z;
  switch (cr._caType) {
    case 'energyBall': _caFireEB(cr, cx, cy, cz); break;
    case 'poisonMist': _caFireMist(cr, cx, cy, cz); break;
    case 'bubble':     _caFireBubbles(cr, cx, cy, cz); break;
  }
}

/* ── エナジーボール ── */
function _caFireEB(cr, cx, cy, cz) {
  var s = _caAcqEB();
  if (!s) return;
  var cam = camera.position;
  _caV3a.set(cam.x - cx, cam.y - cy, cam.z - cz).normalize();
  var spd = 4.0 + Math.random() * 1.8;

  /* ランダムにオレンジ/紫 */
  var isOrange = Math.random() < 0.5;
  var coreCol  = isOrange ? 0xfffde8 : 0xeeddff;
  var auraCol  = isOrange ? 0xff6600 : 0xbb22ff;
  var r1Col    = isOrange ? 0xff4400 : 0xcc33ff;
  var r2Col    = isOrange ? 0xffcc00 : 0xff88ff;
  var sprCol   = isOrange ? 0xff9944 : 0xcc66ff;
  var plCol    = isOrange ? 0xff8822 : 0xcc44ff;

  s.core.material.color.setHex(coreCol);
  s.core.visible  = true;
  s.aMat.color.setHex(auraCol);  s.aMat.opacity  = 0.6;  s.aura.visible  = true;
  s.r1Mat.color.setHex(r1Col);   s.r1Mat.opacity  = 0.9;  s.ring1.visible = true;
  s.r2Mat.color.setHex(r2Col);   s.r2Mat.opacity  = 0.9;  s.ring2.visible = true;
  s.sprMat.color.setHex(sprCol); s.sprMat.opacity = 0.8;  s.spr.visible   = true;
  s.pl.color.setHex(plCol);      s.pl.intensity   = 6.0;  s.pl.visible    = true;

  _caActiveEBalls.push({
    s: s, pos: new THREE.Vector3(cx, cy, cz),
    vel: _caV3a.clone().multiplyScalar(spd),
    age: 0, maxAge: 10.0, damage: 14, source: cr, hitR: 0.55,
    r1p: Math.random() * Math.PI * 2,   /* リング位相（初期値ランダム）*/
    r2p: Math.random() * Math.PI * 2
  });
}

/* ── 毒霧（煙）── */
function _caFireMist(cr, cx, cy, cz) {
  var s = _caAcqMist();
  if (!s) return;
  var maxR = 4.8 + Math.random() * 1.8;

  var puffData = [];
  for (var i = 0; i < _CA_PUFF_N; i++) {
    /* 各パフの初期オフセット（中心から小さくランダム）*/
    var theta = Math.random() * Math.PI * 2;
    var phi   = (Math.random() - 0.5) * Math.PI;
    var ir    = Math.random() * 0.35;
    /* 拡散方向（外向き + 少し上方向）*/
    var dLen  = 0.6 + Math.random() * 0.6;
    var dTheta= Math.random() * Math.PI * 2;
    s.puffs[i].mesh.visible = true;
    s.puffs[i].mat.uniforms.uOff.value.set(
      (Math.random() - 0.5) * 9.0,
      (Math.random() - 0.5) * 9.0
    );
    s.puffs[i].mat.uniforms.uTime.value = 0.0;
    s.puffs[i].mat.uniforms.uOpacity.value = 0.0;
    puffData.push({
      ox: Math.cos(theta) * Math.cos(phi) * ir,
      oy: Math.sin(phi) * ir,
      oz: Math.sin(theta) * Math.cos(phi) * ir,
      driftX: Math.cos(dTheta) * dLen * 0.4,
      driftY: 0.5 + Math.random() * 0.5,   /* 上方向 */
      driftZ: Math.sin(dTheta) * dLen * 0.4,
      rateMult: 0.75 + Math.random() * 0.55,
      opMult:   0.8  + Math.random() * 0.5,
      sizeMult: 0.7  + Math.random() * 0.7   /* パフのサイズ差 */
    });
  }

  _caActiveMists.push({
    s: s, pos: new THREE.Vector3(cx, cy + 0.1, cz),
    age: 0, maxAge: 3.8,
    maxRadius: maxR, damage: 4, dmgTimer: 0.0,
    source: cr, puffData: puffData
  });
}

/* ── シャボン玉 ── */
function _caFireBubbles(cr, cx, cy, cz) {
  var count = 4 + Math.floor(Math.random() * 4);
  for (var i = 0; i < count; i++) {
    var s = _caAcqBubble();
    if (!s) break;
    var theta = Math.random() * Math.PI * 2;
    var phi   = (Math.random() - 0.5) * Math.PI * 0.55;
    var spd   = 1.2 + Math.random() * 0.8;
    var dx    = Math.cos(theta) * Math.cos(phi);
    var dy    = Math.abs(Math.sin(phi)) + 0.1;
    var dz    = Math.sin(theta) * Math.cos(phi);

    s.sMat.opacity = 0.48; s.shell.visible = true;
    s.hiMat.opacity = 0.9; s.hi.visible    = true;
    s.pl.intensity  = 1.2; s.pl.visible    = true;

    var startPos = new THREE.Vector3(cx + dx * 0.35, cy + dy * 0.35, cz + dz * 0.35);
    s.shell.position.copy(startPos);
    s.hi.position.copy(startPos);
    s.pl.position.copy(startPos);

    _caActiveBubbles.push({
      s: s, pos: startPos.clone(),
      vel: new THREE.Vector3(dx * spd, dy * spd, dz * spd),
      age: 0, maxAge: 12.0, damage: 5, source: cr, hitR: 0.40,
      wPhase: Math.random() * Math.PI * 2
    });
  }
}

/* ================================================================
   毎フレーム更新
================================================================ */

/* ── エナジーボール ── */
function _caUpdateEBalls(dt) {
  var cam    = camera.position;
  var camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  var camRight = new THREE.Vector3().crossVectors(camDir, camera.up).normalize();

  for (var pi = _caActiveEBalls.length - 1; pi >= 0; pi--) {
    var proj = _caActiveEBalls[pi];
    proj.age += dt;

    if (proj.age >= proj.maxAge) {
      _caRelEB(proj.s); _caActiveEBalls.splice(pi, 1); continue;
    }

    /* 直線移動 */
    proj.pos.addScaledVector(proj.vel, dt);

    /* コア: 高速回転でエネルギー感 */
    proj.s.core.position.copy(proj.pos);
    proj.s.core.rotation.x += dt * 5.0;
    proj.s.core.rotation.z += dt * 3.5;

    /* オーラ: パルスしながらゆっくり回転 */
    proj.s.aura.position.copy(proj.pos);
    proj.s.aura.rotation.y += dt * 1.8;
    var pulse = 0.85 + Math.sin(proj.age * 18.0) * 0.18;
    proj.s.aura.scale.setScalar(pulse);
    proj.s.aMat.opacity = 0.55 + Math.sin(proj.age * 12.0) * 0.15;

    /* リング1: X軸中心に回転 */
    proj.r1p += dt * 4.5;
    proj.s.ring1.position.copy(proj.pos);
    proj.s.ring1.rotation.set(proj.r1p, proj.r1p * 0.4, proj.r1p * 0.25);
    proj.s.r1Mat.opacity = 0.8 + Math.sin(proj.age * 20.0) * 0.2;

    /* リング2: Y軸中心に回転（r1とずらす）*/
    proj.r2p += dt * 5.8;
    proj.s.ring2.position.copy(proj.pos);
    proj.s.ring2.rotation.set(proj.r2p * 0.3, proj.r2p, proj.r2p * 0.6);
    proj.s.r2Mat.opacity = 0.8 + Math.sin(proj.age * 16.0 + 1.5) * 0.2;

    /* グロースプライト: 明滅 */
    var glowPulse = 0.75 + Math.sin(proj.age * 14.0) * 0.25;
    proj.s.spr.position.copy(proj.pos);
    proj.s.sprMat.opacity = 0.85 * glowPulse;
    proj.s.spr.scale.setScalar(2.8 * (0.9 + Math.sin(proj.age * 10.0) * 0.12));

    /* PointLight */
    proj.s.pl.position.copy(proj.pos);
    proj.s.pl.intensity = 5.0 + Math.sin(proj.age * 22.0) * 2.5;

    /* 当たり判定 */
    var ddx = cam.x - proj.pos.x, ddy = cam.y - proj.pos.y, ddz = cam.z - proj.pos.z;
    if (ddx*ddx + ddy*ddy + ddz*ddz < proj.hitR * proj.hitR) {
      if (typeof damagePlayer === 'function') damagePlayer(proj.damage, proj.source);
      _caRelEB(proj.s); _caActiveEBalls.splice(pi, 1);
    }
  }
}

/* ── 毒霧（煙）── */
function _caUpdateMists(dt) {
  var cam = camera.position;
  for (var mi = _caActiveMists.length - 1; mi >= 0; mi--) {
    var mist = _caActiveMists[mi];
    mist.age += dt;

    if (mist.age >= mist.maxAge) {
      _caRelMist(mist.s); _caActiveMists.splice(mi, 1); continue;
    }

    var mt  = mist.age / mist.maxAge;
    var cx  = mist.pos.x, cy = mist.pos.y, cz = mist.pos.z;

    /* 各パフを個別に動かす */
    for (var pi = 0; pi < _CA_PUFF_N; pi++) {
      var pd = mist.puffData[pi];
      var pf = mist.s.puffs[pi];

      /* 個別のタイミング（少しずれてブワッと感）*/
      var pmt = Math.max(0, mt - pi * 0.04);

      /* パフが広がる半径 */
      var r = mist.maxRadius * pd.rateMult * (pmt * pmt * (3.0 - 2.0 * pmt));

      /* 位置: 初期オフセット + 拡散方向ドリフト */
      pf.mesh.position.set(
        cx + pd.ox + pd.driftX * pmt * mist.maxRadius * 0.5,
        cy + pd.oy + pd.driftY * pmt * mist.maxRadius * 0.4,
        cz + pd.oz + pd.driftZ * pmt * mist.maxRadius * 0.5
      );
      pf.mesh.scale.setScalar(r * pd.sizeMult);

      /* ビルボード（常にカメラを向く）*/
      pf.mesh.quaternion.copy(camera.quaternion);

      /* シェーダー更新 */
      var opPeak = pmt < 0.30 ? pmt / 0.30 : (1.0 - pmt) / 0.70;
      pf.mat.uniforms.uOpacity.value = 0.88 * Math.max(0, opPeak) * pd.opMult;
      pf.mat.uniforms.uTime.value    = mist.age + pi * 0.8;
    }

    /* ダメージ判定（煙の中心からmaxRadius範囲）*/
    mist.dmgTimer -= dt;
    if (mist.dmgTimer <= 0.0) {
      mist.dmgTimer = 0.5;
      var mdx = cam.x - cx, mdy = cam.y - cy, mdz = cam.z - cz;
      var rr  = mist.maxRadius * mt;  /* 展開中の現在の半径 */
      if (mdx*mdx + mdy*mdy + mdz*mdz < rr * rr) {
        if (typeof damagePlayer === 'function') damagePlayer(mist.damage, mist.source);
      }
    }
  }
}

/* ── シャボン玉 ── */
function _caUpdateBubbles(dt) {
  var cam    = camera.position;
  var camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  var camRight = new THREE.Vector3().crossVectors(camDir, camera.up).normalize();
  var camUp    = camera.up;

  for (var bi = _caActiveBubbles.length - 1; bi >= 0; bi--) {
    var bub = _caActiveBubbles[bi];
    bub.age += dt;

    if (bub.age >= bub.maxAge) {
      _caRelBubble(bub.s); _caActiveBubbles.splice(bi, 1); continue;
    }

    /* ホーミング */
    var toX = cam.x - bub.pos.x, toY = cam.y - bub.pos.y, toZ = cam.z - bub.pos.z;
    var toL = Math.sqrt(toX*toX + toY*toY + toZ*toZ);
    if (toL > 0.1) {
      var h = 2.0 * dt;
      bub.vel.x += (toX / toL) * h;
      bub.vel.y += (toY / toL) * h;
      bub.vel.z += (toZ / toL) * h;
    }
    var vL = bub.vel.length();
    if (vL > 3.2) bub.vel.multiplyScalar(3.2 / vL);

    /* フワフワ揺れ */
    bub.wPhase += dt * 3.0;
    bub.vel.x += Math.sin(bub.wPhase * 1.1)       * 0.5 * dt;
    bub.vel.y += Math.cos(bub.wPhase * 0.85)      * 0.35 * dt;
    bub.vel.z += Math.sin(bub.wPhase * 1.3 + 1.0) * 0.5 * dt;
    bub.pos.addScaledVector(bub.vel, dt);

    /* 虹色シェル: 石鹸膜の干渉色（HSL回転）*/
    var hue = (bub.age * 55.0 + bub.wPhase * 20.0) % 360.0;
    /* 簡易 sin ベースの RGB */
    var rr = 0.5 + Math.sin(bub.age * 2.1)        * 0.5;
    var gg = 0.5 + Math.sin(bub.age * 2.1 + 2.09) * 0.5;
    var bb = 0.5 + Math.sin(bub.age * 2.1 + 4.19) * 0.5;
    bub.s.sMat.color.setRGB(0.4 + rr * 0.6, 0.4 + gg * 0.6, 0.6 + bb * 0.4);
    /* 端が明るい（Fresnel風）: 端を見るほど opaque に見せるため少し高め */
    bub.s.sMat.opacity = 0.45 + Math.sin(bub.wPhase * 0.7) * 0.08;
    bub.s.shell.position.copy(bub.pos);

    /* ハイライト: カメラの上右方向にオフセット（反射光のシミュレーション）*/
    var hiX = bub.pos.x + camRight.x * 0.055 + camUp.x * 0.065;
    var hiY = bub.pos.y + camRight.y * 0.055 + camUp.y * 0.065;
    var hiZ = bub.pos.z + camRight.z * 0.055 + camUp.z * 0.065;
    bub.s.hi.position.set(hiX, hiY, hiZ);
    bub.s.hiMat.opacity = 0.75 + Math.sin(bub.wPhase * 2.0) * 0.15;

    /* PointLight: 虹色でじんわり光る */
    bub.s.pl.position.copy(bub.pos);
    bub.s.pl.color.setRGB(0.4 + rr * 0.6, 0.5 + gg * 0.5, 0.6 + bb * 0.4);
    bub.s.pl.intensity = 0.6 + Math.sin(bub.wPhase * 1.5) * 0.35;

    /* 当たり判定 */
    var bdx = cam.x - bub.pos.x, bdy = cam.y - bub.pos.y, bdz = cam.z - bub.pos.z;
    if (bdx*bdx + bdy*bdy + bdz*bdz < bub.hitR * bub.hitR) {
      if (typeof damagePlayer === 'function') damagePlayer(bub.damage, bub.source);
      _caRelBubble(bub.s); _caActiveBubbles.splice(bi, 1);
    }
  }
}

/* ================================================================
   クリーチャー戦闘AI
================================================================ */
function _caUpdateCreatureCombat(cr, dt) {
  if (!cr.alive || cr.locked || !cr._hpInitialized) return;

  var bh    = cr.bodyH || 1.0;
  var cam   = camera.position;
  var dx    = cam.x - cr.pos.x, dz = cam.z - cr.pos.z;
  var dist  = Math.sqrt(dx*dx + dz*dz);

  var alertR = bh * 8.0;
  var meleeR = bh * 0.42 + 1.0;
  var atkMin = meleeR + 1.0;
  var atkMax = alertR * 0.88;

  /* ALERT → COMBAT 遷移 */
  if (cr.aiState === AI_ALERT && dist > atkMin && dist < atkMax) {
    cr.aiState = AI_COMBAT; cr.aiAlertTimer = 14.0;
    if (!cr._caInited) _caInitCombat(cr);
  }
  if (cr.aiState !== AI_COMBAT) return;

  /* ストレイフ */
  var toL  = dist || 0.001;
  var perpX = -(dz / toL), perpZ = dx / toL;
  var idealD = (atkMin + atkMax) * 0.5;
  var appF   = Math.max(-1.0, Math.min(1.0, (dist - idealD) / Math.max(1, atkMax - atkMin)));

  cr._caStrafeFlip -= dt;
  if (cr._caStrafeFlip <= 0) {
    cr._caStrafeDir = -cr._caStrafeDir;
    cr._caStrafeFlip = 1.5 + Math.random() * 2.2;
  }
  if (cr.mesh && cr.mesh.userData && cr.mesh.userData.wanderTarget) {
    cr.mesh.userData.wanderTarget.set(
      cr.pos.x + perpX * cr._caStrafeDir * 4.0 + (dx / toL) * appF * 2.5,
      0,
      cr.pos.z + perpZ * cr._caStrafeDir * 4.0 + (dz / toL) * appF * 2.5
    );
    cr.mesh.userData.wanderTimer = 0.25;
  }

  /* 攻撃ロジック */
  if (cr._caPhase === 'idle') {
    cr._caCooldown -= dt;
    if (cr._caCooldown <= 0 && dist < atkMax) _caStartCharge(cr);
  }
  if (cr._caPhase === 'charging') {
    _caUpdateCharge(cr, dt);
    if (cr._caChargeT >= (_CA_CHARGE_T[cr._caType] || 1.0)) {
      _caStopCharge(cr);
      if (cr.alive && dist < atkMax * 1.3) _caFireAttack(cr);
      cr._caCooldown = _CA_COOLDOWN[cr._caType] ? _CA_COOLDOWN[cr._caType]() : 4.0;
    }
  }

  /* ステート遷移 */
  cr.aiAlertTimer -= dt;
  if (cr.aiAlertTimer <= 0 || dist > alertR * 1.6) {
    cr.aiState = AI_WANDER; _caStopCharge(cr);
  } else if (dist <= atkMin) {
    cr.aiState = AI_ALERT; cr.aiAlertTimer = 10.0; _caStopCharge(cr);
  }
}

/* ================================================================
   部屋移動時クリーンアップ
================================================================ */
function clearCreatureAttacks() {
  for (var i = 0; i < _caActiveEBalls.length; i++)  _caRelEB(_caActiveEBalls[i].s);
  _caActiveEBalls.length = 0;
  for (var j = 0; j < _caActiveBubbles.length; j++) _caRelBubble(_caActiveBubbles[j].s);
  _caActiveBubbles.length = 0;
  for (var k = 0; k < _caActiveMists.length; k++)   _caRelMist(_caActiveMists[k].s);
  _caActiveMists.length = 0;
  /* チャージプール強制解放 */
  for (var ci = 0; ci < _caChargePtPool.length; ci++) {
    if (_caChargePtPool[ci].inUse) {
      _caChargePtPool[ci].mesh.visible = false; _caChargePtPool[ci].mat.opacity = 0;
      _caChargePtPool[ci].inUse = false;
    }
  }
  for (var li = 0; li < _caChargePlPool.length; li++) {
    if (_caChargePlPool[li].inUse) {
      _caChargePlPool[li].light.intensity = 0; _caChargePlPool[li].light.visible = false;
      _caChargePlPool[li].inUse = false;
    }
  }
}

/* ================================================================
   updateCreatureAttacks(dt) — loop.js から毎フレーム呼ぶ
================================================================ */
function updateCreatureAttacks(dt) {
  if (typeof _gameOver !== 'undefined' && _gameOver) return;
  if (typeof roomInteractables === 'undefined') return;

  for (var ri = 0; ri < roomInteractables.length; ri++) {
    var cr = roomInteractables[ri];
    if (cr.type !== 'creature') continue;
    _caUpdateCreatureCombat(cr, dt);
  }

  _caUpdateEBalls(dt);
  _caUpdateMists(dt);
  _caUpdateBubbles(dt);
}
