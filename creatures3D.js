'use strict';
/* ============================================================
   CREATURES 3D — Three.js ビルド関数
   依存: THREE.js (グローバル)
   index.html の matStd / mkMesh / makeDropShadow が
   先に定義されていればそれを流用、なければここで定義する。
============================================================ */

/* ----------------------------------------------------------
   ローカルヘルパー (index.html のグローバル版があればそちら優先)
---------------------------------------------------------- */
var _c3d_matStd = (typeof matStd !== 'undefined') ? matStd : function(col, rough, metal, opts) {
  var o = Object.assign({ color: col, roughness: rough, metalness: metal }, opts || {});
  return new THREE.MeshStandardMaterial(o);
};
var _c3d_mkMesh = (typeof mkMesh !== 'undefined') ? mkMesh : function(geo, mat) {
  var m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

var _c3d_shadowTexCache = null;
function _c3d_getShadowTex() {
  if (_c3d_shadowTexCache) return _c3d_shadowTexCache;
  var S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx2 = cv.getContext('2d');
  var gr = cx2.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  gr.addColorStop(0,    'rgba(0,0,0,0.92)');
  gr.addColorStop(0.18, 'rgba(0,0,0,0.80)');
  gr.addColorStop(0.40, 'rgba(0,0,0,0.52)');
  gr.addColorStop(0.65, 'rgba(0,0,0,0.22)');
  gr.addColorStop(0.85, 'rgba(0,0,0,0.07)');
  gr.addColorStop(1.0,  'rgba(0,0,0,0)');
  cx2.fillStyle = gr;
  cx2.fillRect(0, 0, S, S);
  _c3d_shadowTexCache = new THREE.CanvasTexture(cv);
  return _c3d_shadowTexCache;
}
var _c3d_makeDropShadow = (typeof makeDropShadow !== 'undefined') ? makeDropShadow : function(rx, rz, opacity) {
  opacity = (opacity !== undefined) ? opacity : 0.58;
  var mat = new THREE.MeshBasicMaterial({
    map: _c3d_getShadowTex(), transparent: true,
    opacity: opacity, depthWrite: false
  });
  var shd = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2.4, rz * 2.4), mat);
  shd.rotation.x = -Math.PI / 2;
  shd.position.y = 0.004;
  return shd;
};

/* ----------------------------------------------------------
   共通: ワンダーAI メタデータを設定
---------------------------------------------------------- */
function _c3d_setWanderMeta(g, R2, speed, alertSpeed) {
  g.userData.isCreature   = true;
  g.userData.phase        = R2() * Math.PI * 2;
  g.userData.baseY        = 0;
  g.userData.wanderTarget = new THREE.Vector3(0, 0, 0);
  g.userData.wanderSpeed  = speed || (0.008 + R2() * 0.005);
  g.userData.alertSpeed   = alertSpeed || (0.030 + R2() * 0.015);
  g.userData.wanderTimer  = 2.0 + R2() * 4.0;
  g.userData.wanderFacing = 0;
  g.userData.isAlert      = false;
}


/* ============================================================
   GLB GHOST CREATURE — 7モデル × 5サイズクラス 対応
   visualType フォーマット: 'glb-normal' / 'glb4-giant' / 'glb7-tiny' …
   ─────────────────────────────────────────────────────────
   モデル      ファイル          カラー
   glb         ghost_3d.glb    シアン
   glb2        ghost_3d2.glb   マゼンタ
   glb3        ghost_3d3.glb   ライムグリーン
   glb4        ghost_3d4.glb   オレンジ
   glb5        ghost_3d5.glb   バイオレット
   glb6        ghost_3d6.glb   レッド
   glb7        ghost_3d7.glb   ゴールド
   ─────────────────────────────────────────────────────────
   サイズ     targetH 範囲
   tiny        0.35 ~ 0.43 m   （子供・超小型）
   small       0.65 ~ 0.77 m   （小型）
   normal      1.20 ~ 1.45 m   （標準）
   large       1.85 ~ 2.30 m   （大型）
   giant       2.80 ~ 3.50 m   （巨大）
============================================================ */

/* ============================================================
   GLB ゾーン色パレット定義 (不透明・100%)
   COLOR_0 で識別される5ゾーン順:
     z[0] = Red zone   (255,100,100)
     z[1] = Green zone (100,200,100)
     z[2] = Blue zone  (100,150,255)
     z[3] = Purple zone(200,100,255)
     z[4] = Yellow zone(255,200, 80)
   各パレット: { z:[c0,c1,c2,c3,c4], rough, metal, name }
============================================================ */
var _GLB_PALETTES = [
  /* ── glb (ghost_3d.glb) 10パレット ─────────────────── */
  /* 00 */ { z:[0x0d2d4a,0x0a4a3a,0x0d3d6a,0x1a1a4a,0x1a3a5a], rough:0.45,metal:0.15,name:'deep-ocean' },
  /* 01 */ { z:[0xc8d4e0,0xb0c8c0,0xa8b8d8,0xb8b0d0,0xd0c8b0], rough:0.65,metal:0.05,name:'moon-dust' },
  /* 02 */ { z:[0x8b1a00,0x2a3a10,0x1a1a2a,0x3a1a2a,0xcc4400], rough:0.35,metal:0.25,name:'volcano' },
  /* 03 */ { z:[0xa0c8e0,0x80c0b0,0x80a8d8,0x9080c8,0xd0e0f0], rough:0.55,metal:0.08,name:'frost' },
  /* 04 */ { z:[0x0a2a1a,0x0a3a1a,0x0a2a3a,0x1a0a3a,0x1a3a1a], rough:0.40,metal:0.30,name:'abyss-green' },
  /* 05 */ { z:[0xe06040,0x40c080,0x4080e0,0xa040c0,0xf0a840], rough:0.50,metal:0.10,name:'coral-reef' },
  /* 06 */ { z:[0x1a2a6c,0x1a5a3c,0x1a4a8c,0x3a1a6c,0x4a5a9c], rough:0.42,metal:0.18,name:'lapis-azure' },
  /* 07 */ { z:[0xc08070,0x708070,0x7080b0,0x907090,0xd0a870], rough:0.38,metal:0.45,name:'rose-gold' },
  /* 08 */ { z:[0x2a2a2a,0x1a2a1a,0x1a1a2a,0x2a1a2a,0x2a2a1a], rough:0.60,metal:0.40,name:'urban-shadow' },
  /* 09 */ { z:[0xd4808c,0x8cc4a0,0x80a8d4,0xb080c8,0xecc88c], rough:0.58,metal:0.06,name:'sakura-dust' },
  /* ── glb2 (ghost_3d2.glb) 9パレット ─────────────────── */
  /* 10 */ { z:[0xb83010,0x303828,0x182848,0x381828,0xd06018], rough:0.45,metal:0.20,name:'ember-ash' },
  /* 11 */ { z:[0x8090a8,0x708890,0x7090b8,0x9080a8,0xa0a890], rough:0.50,metal:0.35,name:'cold-frame' },
  /* 12 */ { z:[0x200838,0x081828,0x081038,0x180838,0x180828], rough:0.38,metal:0.15,name:'night-bloom' },
  /* 13 */ { z:[0xc06020,0x505a20,0x305070,0x5a2040,0xe09020], rough:0.68,metal:0.12,name:'burnt-savanna' },
  /* 14 */ { z:[0xb0c8d8,0x90c0b0,0x90b0d8,0xa898c8,0xd8e0f0], rough:0.32,metal:0.12,name:'glacier-peak' },
  /* 15 */ { z:[0x9c204c,0x245c40,0x20408c,0x5c1060,0xac5c24], rough:0.44,metal:0.22,name:'magenta-fog' },
  /* 16 */ { z:[0x7c3010,0x304020,0x182840,0x381840,0x7c5010], rough:0.55,metal:0.28,name:'dark-amber' },
  /* 17 */ { z:[0x8090c8,0x6898a0,0x68a0c8,0x8878b8,0xa0b0d8], rough:0.48,metal:0.10,name:'alice-blue' },
  /* 18 */ { z:[0x00c8b0,0x00b898,0x0098c8,0x8800c8,0xb8c800], rough:0.30,metal:0.20,name:'aurora' },
  /* ── glb3 (ghost_3d3.glb) 8パレット ─────────────────── */
  /* 19 */ { z:[0x183820,0x104830,0x102830,0x181840,0x283818], rough:0.72,metal:0.08,name:'jungle-moss' },
  /* 20 */ { z:[0xe0708c,0x78c898,0x78a8e0,0xb078d0,0xf0c878], rough:0.52,metal:0.06,name:'spring-blossom' },
  /* 21 */ { z:[0xd8e4f0,0xc0dcd8,0xc0d4f0,0xd0c8e8,0xeee8d8], rough:0.60,metal:0.04,name:'porcelain-sky' },
  /* 22 */ { z:[0xa04828,0x486038,0x304868,0x583050,0xb07828], rough:0.62,metal:0.15,name:'terracotta' },
  /* 23 */ { z:[0x00e090,0x00d8a0,0x00b8e0,0x8000e0,0xe0d000], rough:0.28,metal:0.30,name:'neon-lagoon' },
  /* 24 */ { z:[0x4a6040,0x3a6848,0x3a5058,0x4a3a60,0x5a6038], rough:0.75,metal:0.06,name:'misty-wood' },
  /* 25 */ { z:[0xc04858,0x488860,0x4870c0,0x9840b0,0xe0a040], rough:0.46,metal:0.14,name:'cherry-blossom' },
  /* 26 */ { z:[0xe8eef8,0xd0e8e0,0xd0e0f8,0xe0d8f0,0xf8f0e8], rough:0.65,metal:0.03,name:'arctic-fox' },
  /* ── glb4 (ghost_3d4.glb) 8パレット ─────────────────── */
  /* 27 */ { z:[0x800020,0x102010,0x001030,0x200010,0x602000], rough:0.35,metal:0.30,name:'black-ruby' },
  /* 28 */ { z:[0xa04820,0x286040,0x205878,0x403058,0x907020], rough:0.48,metal:0.55,name:'copper-verde' },
  /* 29 */ { z:[0x181070,0x103040,0x101880,0x300870,0x303080], rough:0.38,metal:0.20,name:'ultramarine' },
  /* 30 */ { z:[0x886020,0x505828,0x304068,0x5a3848,0xa08020], rough:0.58,metal:0.50,name:'bronze-age' },
  /* 31 */ { z:[0x104850,0x106050,0x084858,0x181848,0x205840], rough:0.55,metal:0.25,name:'teal-forest' },
  /* 32 */ { z:[0xb0a0c8,0x90b8a8,0x90a8c8,0xb090c8,0xd0c8a8], rough:0.50,metal:0.08,name:'lavender-mist' },
  /* 33 */ { z:[0xd04030,0x486030,0x304878,0x682850,0xe09030], rough:0.42,metal:0.18,name:'sunset-crimson' },
  /* 34 */ { z:[0x909098,0x789088,0x7890a8,0x907898,0xa8a888], rough:0.35,metal:0.60,name:'moonlit-silver' },
  /* ── glb5 (ghost_3d5.glb) 7パレット ─────────────────── */
  /* 35 */ { z:[0x100818,0x081418,0x080c20,0x100818,0x100c08], rough:0.40,metal:0.20,name:'ink-shadow' },
  /* 36 */ { z:[0x701850,0x184848,0x101870,0x481070,0x504818], rough:0.38,metal:0.25,name:'violet-storm' },
  /* 37 */ { z:[0xd09020,0x607030,0x3060a0,0x704080,0xe0b820], rough:0.45,metal:0.35,name:'golden-hour' },
  /* 38 */ { z:[0x607880,0x4a8078,0x4a7090,0x606898,0x7a8870], rough:0.58,metal:0.35,name:'float-glass' },
  /* 39 */ { z:[0xc04848,0x389060,0x304890,0x703090,0xd08030], rough:0.52,metal:0.15,name:'deep-coral' },
  /* 40 */ { z:[0xe0c8c8,0xc0d8c0,0xc0c8e0,0xd0c0e0,0xe8dcc0], rough:0.68,metal:0.05,name:'powder-frost' },
  /* 41 */ { z:[0x004080,0x004060,0x002080,0x400080,0x208000], rough:0.30,metal:0.40,name:'electric-night' },
  /* ── glb6 (ghost_3d6.glb) 8パレット ─────────────────── */
  /* 42 */ { z:[0x103848,0x0c4838,0x0c2858,0x201048,0x204040], rough:0.45,metal:0.30,name:'petrol-azure' },
  /* 43 */ { z:[0xc06880,0x788890,0x6888b8,0xa868a8,0xd0a878], rough:0.55,metal:0.10,name:'rose-wine' },
  /* 44 */ { z:[0x980818,0x283828,0x182048,0x381038,0x781808], rough:0.50,metal:0.22,name:'crimson-slate' },
  /* 45 */ { z:[0x284828,0x206040,0x183850,0x282848,0x305028], rough:0.68,metal:0.12,name:'kelp-forest' },
  /* 46 */ { z:[0xc89060,0x888068,0x6878a0,0x987888,0xe0b068], rough:0.72,metal:0.08,name:'sandstone' },
  /* 47 */ { z:[0x181840,0x102838,0x101848,0x181038,0x202040], rough:0.42,metal:0.28,name:'dark-marine' },
  /* 48 */ { z:[0xb84010,0x405028,0x283868,0x481838,0xc07010], rough:0.48,metal:0.32,name:'firestone' },
  /* 49 */ { z:[0x104870,0x106858,0x104898,0x280870,0x286890], rough:0.40,metal:0.20,name:'blue-lagoon' },
  /* ── glb7 (ghost_3d7.glb) 7パレット ─────────────────── */
  /* 50 */ { z:[0x180828,0x0c2818,0x081020,0x180820,0x182010], rough:0.45,metal:0.20,name:'midnight-garden' },
  /* 51 */ { z:[0xb87828,0x608040,0x385888,0x684060,0xc09820], rough:0.55,metal:0.42,name:'amber-gut' },
  /* 52 */ { z:[0x801858,0x284840,0x181868,0x501068,0x704818], rough:0.48,metal:0.18,name:'plum-haze' },
  /* 53 */ { z:[0xd8dae0,0xc8d8d0,0xc8d0e0,0xd0c8e0,0xe0dcc8], rough:0.62,metal:0.06,name:'zinc-white' },
  /* 54 */ { z:[0x900000,0x101810,0x080810,0x200010,0x580800], rough:0.32,metal:0.35,name:'carbon-red' },
  /* 55 */ { z:[0x483868,0x2a5848,0x283070,0x5a2868,0x4a6030], rough:0.50,metal:0.22,name:'mystic-plum' },
  /* 56 */ { z:[0xd08840,0x6a9050,0x4070a0,0x785880,0xe0b040], rough:0.44,metal:0.38,name:'ochre-sky' },
  /* ── glb8 (ghost_3d8.glb) 5パレット ─────────────────── */
  /* 57 */ { z:[0x208888,0x209870,0x206898,0x402888,0x489820], rough:0.40,metal:0.25,name:'mini-aqua' },
  /* 58 */ { z:[0xd06048,0x609870,0x486098,0x887090,0xe09848], rough:0.50,metal:0.12,name:'mini-coral' },
  /* 59 */ { z:[0x282028,0x182818,0x181828,0x281828,0x282818], rough:0.55,metal:0.30,name:'mini-shadow' },
  /* 60 */ { z:[0xd0c8b8,0xb8ccc0,0xb8c0d0,0xc8b8d0,0xd8d0b8], rough:0.60,metal:0.04,name:'mini-ivory' },
  /* 61 */ { z:[0x183858,0x187048,0x183878,0x301870,0x285840], rough:0.45,metal:0.28,name:'mini-navy' },
  /* ── glb9 (ghost_3d9.glb) 6パレット ─────────────────── */
  /* 62 */ { z:[0x287050,0x208860,0x185870,0x204060,0x387850], rough:0.50,metal:0.22,name:'nimbus-green' },
  /* 63 */ { z:[0xd07820,0x507840,0x386090,0x684870,0xe09820], rough:0.42,metal:0.28,name:'solstice' },
  /* 64 */ { z:[0x705880,0x487860,0x486090,0x705880,0x907060], rough:0.55,metal:0.15,name:'dusk-lavender' },
  /* 65 */ { z:[0xd0d8e8,0xb8d8d0,0xb8d0e8,0xd0c8e0,0xe8e0d0], rough:0.48,metal:0.08,name:'cold-moon' },
  /* 66 */ { z:[0x984020,0x407050,0x305090,0x603078,0xb06820], rough:0.52,metal:0.20,name:'rust-tide' },
  /* 67 */ { z:[0x286890,0x288878,0x2860a0,0x482890,0x407888], rough:0.40,metal:0.35,name:'cerulean-deep' },
  /* 68 */ { z:[0x184848,0x107858,0x104868,0x201848,0x285858], rough:0.42,metal:0.32,name:'dark-teal' },
  /* 69 */ { z:[0x600018,0x182818,0x100828,0x280018,0x481008], rough:0.35,metal:0.38,name:'ruby-night' },
  /* 70 */ { z:[0x1c3820,0x143c24,0x102830,0x1c1c38,0x243820], rough:0.70,metal:0.10,name:'forest-shadow' },
];

/* モデル別パレットインデックスマップ */
var _GLB_MODEL_PAL_MAP = {
  'glb':  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  'glb2': [10,11,12,13,14,15,16,17,18],
  'glb3': [19,20,21,22,23,24,25,26],
  'glb4': [27,28,29,30,31,32,33,34],
  'glb5': [35,36,37,38,39,40,41],
  'glb6': [42,43,44,45,46,47,48,49],
  'glb7': [50,51,52,53,54,55,56,68,69,70],
  'glb8': [57,58,59,60,61],
  'glb9': [62,63,64,65,66,67],
};

var _GLB_SIZE_RANGES = {
  /* ── 新2段階サイズ ──────────────────────────────────────
     child : 幼体・小型  1.40 〜 1.70 m
     adult : 成体・大型  1.70 〜 3.00 m
  ─────────────────────────────────────────────────────── */
  'child':  [1.40, 0.30],   // 1.40 + R()*0.30  → 1.40〜1.70
  'adult':  [1.70, 1.30],   // 1.70 + R()*1.30  → 1.70〜3.00
  /* 旧名称エイリアス（後方互換） */
  'tiny':   [1.40, 0.30],
  'small':  [1.40, 0.30],
  'normal': [1.70, 0.80],
  'large':  [2.20, 0.60],
  'giant':  [2.70, 0.30],
};

var _GLB_GEO_KEYS = {
  'glb':  '_ghostGLBGeometry',
  'glb2': '_ghostGLBGeometry2',
  'glb3': '_ghostGLBGeometry3',
  'glb4': '_ghostGLBGeometry4',
  'glb5': '_ghostGLBGeometry5',
  'glb6': '_ghostGLBGeometry6',
  'glb7': '_ghostGLBGeometry7',
  'glb8': '_ghostGLBGeometry8',
  'glb9': '_ghostGLBGeometry9',
};

/* ============================================================
   makeGlowMesh — 3Dモデルの周囲に半透明フレネルオーラを生成
   geo      : BufferGeometry (GLBから取得済み)
   pal      : パレットオブジェクト { z:[], rough, metal, name }
   sc       : モデルのスケール (buildGLBVariantのscと同じ)
   posVec3  : モデルメッシュのpositionと同じオフセット
   glowFactor: オーラの膨らみ倍率 (default 1.06)
   ─────────────────────────────────────────────────────────────
   戻り値: { mesh, mat }  mat.uniforms.uTime を毎フレーム更新すること
============================================================ */
function makeGlowMesh(geo, pal, sc, posVec3, glowFactor) {
  glowFactor = glowFactor || 1.06;

  /* パレットの最初の色をベースにオーラ色を決定 */
  var baseHex  = pal.z[0];
  var accentHex = pal.z[2];

  var glowMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:    { value: 0.0 },
      uGlowCol: { value: new THREE.Color(baseHex) },
      uRimCol:  { value: new THREE.Color(accentHex) },
    },
    vertexShader: [
      'varying vec3 vN;',
      'varying vec3 vVD;',
      'void main(){',
      '  vN  = normalize(normalMatrix * normal);',
      '  vec4 wp = modelMatrix * vec4(position, 1.0);',
      '  vVD = normalize(cameraPosition - wp.xyz);',
      /* 法線方向に膨らませてオーラシェルを作る */
      '  vec3 p = position + normal * 0.04;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime;',
      'uniform vec3  uGlowCol;',
      'uniform vec3  uRimCol;',
      'varying vec3  vN;',
      'varying vec3  vVD;',
      'void main(){',
      '  float rim    = 1.0 - max(0.0, dot(normalize(vN), normalize(vVD)));',
      '  float glow   = pow(rim, 1.6);',
      /* 時間で脈動するオーラ */
      '  float pulse  = 0.72 + 0.28 * sin(uTime * 2.4);',
      '  float alpha  = glow * 0.55 * pulse;',
      '  vec3  col    = mix(uGlowCol * 0.6, uRimCol * 1.4, glow) * pulse;',
      '  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.7));',
      '}'
    ].join('\n'),
    transparent:  true,
    side:         THREE.BackSide,   /* 法線反転面 → モデルの外側がオーラ */
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
  });

  var glowScale = sc * glowFactor;
  var glowMesh  = new THREE.Mesh(geo, glowMat);
  glowMesh.scale.setScalar(glowScale);
  glowMesh.position.copy(posVec3);
  glowMesh.castShadow    = false;
  glowMesh.receiveShadow = false;

  return { mesh: glowMesh, mat: glowMat };
}

function buildGLBVariant(R2, glbKey, sizeKey, palOverride) {
  var geoKey = _GLB_GEO_KEYS[glbKey] || '_ghostGLBGeometry';
  var geo    = window[geoKey];
  if (!geo) {
    /* GLBロード失敗時フォールバック: 半透明の球体で存在を示す */
    var _fg = new THREE.Group();
    var _fbMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff, roughness: 0.4, metalness: 0.1,
      transparent: true, opacity: 0.55,
      emissive: new THREE.Color(0x224488), emissiveIntensity: 0.6
    });
    var _fbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), _fbMat);
    _fbMesh.castShadow = true;
    _fbMesh.position.y = 0.55;
    _fg.add(_fbMesh);
    _fg.userData.isCreature   = true;
    _fg.userData.bodyH        = 1.0;
    _fg.userData.wanderTarget = new THREE.Vector3(0, 0, 0);
    _fg.userData.wanderSpeed  = 0.01;
    _fg.userData.alertSpeed   = 0.03;
    _fg.userData.wanderTimer  = 3.0;
    _fg.userData.wanderFacing = 0;
    _fg.userData.isAlert      = false;
    return _fg;
  }

  /* ── パレット選択: 固有番号優先、なければモデル別プールからランダム ── */
  var palPool  = _GLB_MODEL_PAL_MAP[glbKey] || [0];
  var palIdx   = (palOverride !== undefined) ? palOverride
               : palPool[Math.floor(R2() * palPool.length)];
  var pal      = _GLB_PALETTES[palIdx] || _GLB_PALETTES[0];

  var sizeRange = _GLB_SIZE_RANGES[sizeKey] || _GLB_SIZE_RANGES['normal'];
  var targetH   = sizeRange[0] + R2() * sizeRange[1];

  var g = new THREE.Group();

  geo.computeBoundingBox();
  var box    = geo.boundingBox;
  var bbSize = new THREE.Vector3(); box.getSize(bbSize);
  var center = new THREE.Vector3(); box.getCenter(center);
  var maxDim = Math.max(bbSize.x, bbSize.y, bbSize.z);
  var sc     = targetH / maxDim;

  /* ── ゾーン色 → THREE.Color 変換 ── */
  function palCol(hex) { return new THREE.Color(hex); }

  /* ── 不透明ゾーン色シェーダー ──────────────────────────────
     COLOR_0 頂点カラーを5ゾーン最近傍で分類し、
     パレット色をライティング付きで描画する。
     NOTE: vertexColors:true + VEC4 COLOR_0 のとき Three.js r128 は
     USE_COLOR_ALPHA を設定して attribute vec4 color; を自動注入する。
     そこへ vVC = color; (vec3) を代入すると型エラーでコンパイル失敗。
     → vertexColors:false にして attribute を完全自前宣言で回避する。
  ─────────────────────────────────────────────────────────── */
  // 問題1対応: Three.js が 'color' を特殊バインドするのを回避するため
  //   _extractGeo 側で 'aZoneColor' にリネーム済みの属性を参照する
  var colorAttr        = geo.attributes.aZoneColor;
  var hasVertexColor   = !!colorAttr;
  var colorItemSize    = hasVertexColor ? colorAttr.itemSize : 0;
  var colorAttrDecl    = colorItemSize === 4 ? 'attribute vec4 aZoneColor;'
                       : colorItemSize === 3 ? 'attribute vec3 aZoneColor;'
                       : '';
  var colorAssign      = hasVertexColor ? '  vVC = aZoneColor.rgb;'
                       : '  vVC = vec3(0.5);';
  // 問題3対応: 頂点カラー欠損を無言でフォールバックせず警告する
  if (!hasVertexColor) {
    console.warn('[buildGLBVariant] ' + glbKey + ' に頂点カラー(aZoneColor)なし → 全頂点がデフォルトゾーンにフォールバック');
  }

  var zoneMat = new THREE.ShaderMaterial({
    vertexColors: false,   // 自前宣言するので THREE.js 自動注入は不要
    uniforms: {
      uTime: { value: 0.0 },
      uZ0: { value: palCol(pal.z[0]) },
      uZ1: { value: palCol(pal.z[1]) },
      uZ2: { value: palCol(pal.z[2]) },
      uZ3: { value: palCol(pal.z[3]) },
      uZ4: { value: palCol(pal.z[4]) },
      uRoughness: { value: pal.rough },
      uMetalness: { value: pal.metal },
    },
    vertexShader: [
      colorAttrDecl,
      'varying vec3 vN;',
      'varying vec3 vViewDir;',
      'varying vec3 vVC;',
      'void main(){',
      '  vN = normalize(normalMatrix * normal);',
      '  vec4 wp = modelMatrix * vec4(position, 1.0);',
      '  vViewDir = normalize(cameraPosition - wp.xyz);',
      colorAssign,
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime, uRoughness, uMetalness;',
      'uniform vec3 uZ0, uZ1, uZ2, uZ3, uZ4;',
      'varying vec3 vN, vViewDir, vVC;',
      '',
      '// Zone prototypes (normalized from Blender vertex paint)',
      'const vec3 PR = vec3(1.000, 0.392, 0.392);', // Red   (255,100,100)
      'const vec3 PG = vec3(0.392, 0.784, 0.392);', // Green (100,200,100)
      'const vec3 PB = vec3(0.392, 0.588, 1.000);', // Blue  (100,150,255)
      'const vec3 PP = vec3(0.784, 0.392, 1.000);', // Purp  (200,100,255)
      'const vec3 PY = vec3(1.000, 0.784, 0.314);', // Yell  (255,200, 80)
      '',
      'void main(){',
      '  // Nearest-prototype zone classification',
      '  float dR = length(vVC - PR);',
      '  float dG = length(vVC - PG);',
      '  float dB = length(vVC - PB);',
      '  float dP = length(vVC - PP);',
      '  float dY = length(vVC - PY);',
      '  vec3 palColor;',
      '  if(dR <= dG && dR <= dB && dR <= dP && dR <= dY) palColor = uZ0;',
      '  else if(dG <= dB && dG <= dP && dG <= dY)        palColor = uZ1;',
      '  else if(dB <= dP && dB <= dY)                    palColor = uZ2;',
      '  else if(dP <= dY)                                palColor = uZ3;',
      '  else                                             palColor = uZ4;',
      '',
      '  // Lighting: 2 directional + ambient',
      '  vec3 N  = normalize(vN);',
      '  vec3 L1 = normalize(vec3(1.0, 2.0, 1.5));',
      '  vec3 L2 = normalize(vec3(-1.0, 0.6, -0.6));',
      '  float d1 = max(dot(N, L1), 0.0) * 0.68;',
      '  float d2 = max(dot(N, L2), 0.0) * 0.22;',
      '  float amb = 0.22;',
      '',
      '  // Blinn-Phong specular',
      '  vec3 H    = normalize(L1 + vViewDir);',
      '  float shininess = mix(8.0, 64.0, 1.0 - uRoughness);',
      '  float spec = pow(max(dot(N, H), 0.0), shininess)',
      '               * (1.0 - uRoughness) * (0.3 + uMetalness * 0.4);',
      '  // Subtle time-based specular shimmer',
      '  float shimmer = 1.0 + 0.04 * sin(uTime * 1.8);',
      '',
      '  float light = amb + d1 + d2;',
      '  // Metalness: blend towards palette color in specular',
      '  vec3 specCol = mix(vec3(1.0), palColor, uMetalness);',
      '  vec3 final = palColor * light * shimmer + specCol * spec * shimmer;',
      '  gl_FragColor = vec4(clamp(final, 0.0, 1.0), 1.0);',
      '}'
    ].join('\n'),
    transparent: false,
    side:        THREE.FrontSide,
    depthWrite:  true,
  });

  var bodyMesh = new THREE.Mesh(geo, zoneMat);
  bodyMesh.castShadow    = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.scale.setScalar(sc);
  bodyMesh.position.set(-center.x*sc, -box.min.y*sc, -center.z*sc);
  g.add(bodyMesh);

  /* ── オーラグロウレイヤー ── */
  var glowEntry = makeGlowMesh(geo, pal, sc, bodyMesh.position);
  g.add(glowEntry.mesh);

  g.userData.isGLBGhost   = true;
  g.userData.ghostBodyMat = zoneMat;        // uTime更新用
  g.userData.ghostGlowMat = glowEntry.mat;  // オーラuTime更新用
  g.userData.paletteName  = pal.name;

  // サイズ比例のドロップシャドウ
  var shadowR = targetH * 0.42;
  g.add(_c3d_makeDropShadow(shadowR, shadowR, 0.28 + targetH * 0.04));

  // 大きいほど遅く、小さいほど素早く徘徊
  var wanderSpd = 0.014 / Math.max(0.4, targetH * 0.8);
  _c3d_setWanderMeta(g, R2, wanderSpd, wanderSpd * 4.2);

  g.userData.bodyH = targetH;
  return g;
}

/* 後方互換ラッパー (サイズ省略時は adult) */
function buildGLB(R2)  { return buildGLBVariant(R2, 'glb',  'adult'); }
function buildGLB2(R2) { return buildGLBVariant(R2, 'glb2', 'adult'); }
function buildGLB3(R2) { return buildGLBVariant(R2, 'glb3', 'adult'); }
function buildGLB4(R2) { return buildGLBVariant(R2, 'glb4', 'adult'); }
function buildGLB5(R2) { return buildGLBVariant(R2, 'glb5', 'adult'); }
function buildGLB6(R2) { return buildGLBVariant(R2, 'glb6', 'adult'); }
function buildGLB7(R2) { return buildGLBVariant(R2, 'glb7', 'adult'); }
function buildGLB8(R2) { return buildGLBVariant(R2, 'glb8', 'child'); }  // 幼体
function buildGLB9(R2) { return buildGLBVariant(R2, 'glb9', 'adult'); }

/* ============================================================
   DISPATCHER: visualType → ビルド関数
   index.html のスポーンコードから呼び出す統一インターフェイス
   使い方:
     var mesh = buildCreature3D(crDef.visualType, R2);
============================================================ */
function buildCreature3D(visualType, R2, palOverride) {
  // 全クリーチャーはGLBモデル: 'glb-normal', 'glb4-giant', 'glb7-tiny' etc.
  if (visualType.indexOf('glb') === 0) {
    var parts   = visualType.split('-');
    var glbKey  = parts[0];             // 'glb' | 'glb2' … 'glb9'
    var sizeKey = parts[1] || 'normal'; // 'tiny' | 'small' | 'normal' | 'large' | 'giant'
    return buildGLBVariant(R2, glbKey, sizeKey, palOverride);
  }
  // フォールバック: GLBモデルが未指定の場合はglb (デフォルト)
  return buildGLBVariant(R2, 'glb', 'normal', palOverride);
}
