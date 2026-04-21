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
   GLB モデルはオリジナル頂点カラーをそのまま使用
============================================================ */

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

function buildGLBVariant(R2, glbKey, sizeKey) {
  var geoKey = _GLB_GEO_KEYS[glbKey] || '_ghostGLBGeometry';
  var geo    = window[geoKey];
  if (!geo) {
    /* GLBロード失敗時フォールバック */
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

  var sizeRange = _GLB_SIZE_RANGES[sizeKey] || _GLB_SIZE_RANGES['normal'];
  var targetH   = sizeRange[0] + R2() * sizeRange[1];

  var g = new THREE.Group();

  geo.computeBoundingBox();
  var box    = geo.boundingBox;
  var bbSize = new THREE.Vector3(); box.getSize(bbSize);
  var center = new THREE.Vector3(); box.getCenter(center);
  var maxDim = Math.max(bbSize.x, bbSize.y, bbSize.z);
  var sc     = targetH / maxDim;

  /* モデルごとのベースカラー（シェーダー削除後の表示用） */
  var _GLB_MAT_COLORS = {
    'glb':  { color: 0x44ccff, emissive: 0x112244 },
    'glb2': { color: 0xff44cc, emissive: 0x441122 },
    'glb3': { color: 0x88ff44, emissive: 0x224411 },
    'glb4': { color: 0xff8844, emissive: 0x442211 },
    'glb5': { color: 0x9944ff, emissive: 0x221144 },
    'glb6': { color: 0xff3322, emissive: 0x441111 },
    'glb7': { color: 0xffcc22, emissive: 0x443311 },
    'glb8': { color: 0xaaddff, emissive: 0x112233 },
    'glb9': { color: 0xccffee, emissive: 0x113322 },
  };
  var _mc = _GLB_MAT_COLORS[glbKey] || { color: 0xffffff, emissive: 0x111111 };
  var mat = new THREE.MeshStandardMaterial({
    color:            _mc.color,
    emissive:         new THREE.Color(_mc.emissive),
    emissiveIntensity: 0.55,
    roughness:        0.55,
    metalness:        0.05,
  });

  var bodyMesh = new THREE.Mesh(geo, mat);
  bodyMesh.castShadow    = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.scale.setScalar(sc);
  bodyMesh.position.set(-center.x * sc, -box.min.y * sc, -center.z * sc);

  g.add(bodyMesh);

  g.userData.isGLBGhost   = true;
  g.userData.ghostBodyMat = mat;
  g.userData.ghostGlowMat = null;

  var shadowR = targetH * 0.42;
  g.add(_c3d_makeDropShadow(shadowR, shadowR, 0.28 + targetH * 0.04));

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
function buildCreature3D(visualType, R2) {
  if (visualType.indexOf('glb') === 0) {
    var parts   = visualType.split('-');
    var glbKey  = parts[0];
    var sizeKey = parts[1] || 'normal';
    return buildGLBVariant(R2, glbKey, sizeKey);
  }
  return buildGLBVariant(R2, 'glb', 'normal');
}
