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
   1. CLOTH CREATURE (霊布型) - 修正版
============================================================ */
function buildCreature(R2) {
  var g = new THREE.Group();

  /* ── 色: 画像に近い白系 ── */
  var clothColOptions = [0xffffff, 0xfcfaf5, 0xf0f0f0];
  var clothCol = clothColOptions[Math.floor(R2() * clothColOptions.length)];
  var clothMat = _c3d_matStd(clothCol, 0.85, 0.0, { side: THREE.DoubleSide });

  var scale = 0.9 + R2() * 0.2;

  /* ── ① 頭部のシルエット ── */
  var headR = 0.22 * scale;
  var headY = 1.20 * scale;
  // 頭のてっぺんを少し尖らせるか丸めるかのバランス
  var head = _c3d_mkMesh(new THREE.SphereGeometry(headR, 24, 18), clothMat);
  head.position.y = headY;
  head.scale.set(0.95, 1.1, 0.95); // 少し縦長に
  g.add(head);

  /* ── ② 布ボディ (LatheGeometry で裾を広げる) ── */
  var lathePoints = [];
  var segments = 20;
  for (var li = 0; li <= segments; li++) {
    var t = li / segments;
    var bodyY = headY - t * 1.25 * scale; // 地面までの高さ
    
    var r;
    if (t < 0.2) {
      // 頭から肩にかけて
      r = headR * (0.9 + t * 1.5);
    } else if (t < 0.8) {
      // 胴体
      r = headR * (1.2 + (t - 0.2) * 2.5);
    } else {
      // 裾の広がり（ここで半径を急増させる）
      r = headR * (2.7 + (t - 0.8) * 8.0);
    }
    lathePoints.push(new THREE.Vector2(r, Math.max(0, bodyY)));
  }
  
  var bodyGeo = new THREE.LatheGeometry(lathePoints, 32);
  
  /* ── ③ 裾にランダムな「たわみ」を入れる ── */
  var pos = bodyGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var y = pos.getY(i);
    if (y < 0.2 * scale) { // 地面に近い頂点だけ動かす
      var strength = (0.2 * scale - y) * 1.5;
      pos.setX(i, pos.getX(i) + (R2() - 0.5) * strength);
      pos.setZ(i, pos.getZ(i) + (R2() - 0.5) * strength);
    }
  }
  bodyGeo.computeVertexNormals();

  var body = _c3d_mkMesh(bodyGeo, clothMat);
  g.add(body);

  /* ── ④ 目 (画像のような3つの配置) ── */
  var eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  function makeEye(ex, ey, ez, s) {
    var e = _c3d_mkMesh(new THREE.SphereGeometry(0.045 * scale * s, 12, 10), eyeMat);
    e.scale.set(1, 1.2, 0.5); // 少し縦長の楕円に
    e.position.set(ex, ey, ez);
    g.add(e);
  }
  
  var eyeZ = headR * 0.95;
  var eyeY = headY + 0.05;
  makeEye(-0.07 * scale, eyeY, eyeZ, 1.0);      // 左目
  makeEye( 0.07 * scale, eyeY, eyeZ, 1.0);      // 右目
  makeEye( 0, eyeY - 0.12 * scale, eyeZ, 1.2);  // 口（画像の一番下の丸）

  /* ── ドロップシャドウ (裾が広いので大きめに) ── */
  var shadowS = headR * 5.0 * scale;
  g.add(_c3d_makeDropShadow(shadowS, shadowS, 0.4));

  _c3d_setWanderMeta(g, R2, 0.005);
  g.userData.bodyH = headY + headR;
  return g;
}

/* ============================================================
   2. INSECT CREATURE  (虫型 / 多面核・半透明殻・多面堆積・環冠)
   visualType: 'insect0' | 'insect1' | 'insect2' | 'insect3'
============================================================ */
function buildInsect(R2, forcedType) {
  var g = new THREE.Group();
  var type = (forcedType !== undefined) ? forcedType : Math.floor(R2() * 4);
  var s    = 0.55 + R2() * 0.45;
  var legMeshes  = [];
  var eyeMeshes  = [];
  var eyeEmissiveBase = 7.5 + R2() * 2.5;
  var eyeMatGlow = new THREE.MeshStandardMaterial({
    color: 0xff2a2a, emissive: new THREE.Color(0xff0000),
    emissiveIntensity: eyeEmissiveBase, roughness: 0.12, metalness: 0.25
  });

  var OBJ_COLS = [
    0xf8f4ee, 0xfafafa, 0xe8e4dc, 0xd4d0cc,
    0xc8c4c0, 0xf0ece4, 0xe4dcd4, 0x0c0c0a, 0x1a1816
  ];
  function rndObjCol() { return OBJ_COLS[Math.floor(R2() * OBJ_COLS.length)]; }
  var colMain = rndObjCol();
  var colDark = R2() > 0.5 ? 0x0c0c0a : OBJ_COLS[Math.floor(R2() * (OBJ_COLS.length - 2) + 2)];
  var shellMat = _c3d_matStd(colMain, 0.12 + R2() * 0.22, 0.45 + R2() * 0.35);
  var darkMat  = _c3d_matStd(colDark, 0.18 + R2() * 0.22, 0.35 + R2() * 0.35);
  var glassMat = new THREE.MeshStandardMaterial({
    color: colMain, roughness: 0.06, metalness: 0.08,
    transparent: true, opacity: 0.58 + R2() * 0.22
  });
  var accentCols = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff, 0xcc00ff, 0x00ff88];
  var accent = accentCols[Math.floor(R2() * accentCols.length)];
  var accentMat = new THREE.MeshStandardMaterial({
    color: accent, emissive: new THREE.Color(accent),
    emissiveIntensity: 2.2 + R2() * 1.6, roughness: 0.16, metalness: 0.22
  });

  function addTendril(angle, radius, len, thickness, phaseOffset) {
    var lg = new THREE.Group();
    lg.position.set(Math.cos(angle) * radius, 0.12 * s, Math.sin(angle) * radius);
    lg.rotation.y = angle + Math.PI / 2;
    var seg1 = _c3d_mkMesh(new THREE.BoxGeometry(thickness, len * 0.55, thickness * 0.8), darkMat.clone());
    seg1.position.set(0, -len * 0.18, 0); seg1.rotation.z = (R2() - 0.5) * 0.55;
    lg.add(seg1);
    var seg2 = _c3d_mkMesh(new THREE.BoxGeometry(thickness * 0.85, len * 0.55, thickness * 0.65), shellMat.clone());
    seg2.position.set(0, -len * 0.60, 0.06 * s); seg2.rotation.z = (R2() - 0.5) * 0.75;
    lg.add(seg2);
    var tip = _c3d_mkMesh(new THREE.BoxGeometry(thickness * 1.2, thickness * 0.55, thickness * 0.25), accentMat.clone());
    tip.position.set(0, -len * 0.88, 0.04 * s);
    lg.add(tip);
    lg.userData.legPhaseOffset = phaseOffset;
    legMeshes.push(lg);
    g.add(lg);
  }

  function addEyesCluster(y, z, count, spread) {
    var em = eyeMatGlow.clone();
    for (var i = 0; i < count; i++) {
      var ex = (R2() - 0.5) * spread;
      var ey = y + (R2() - 0.5) * spread * 0.5;
      var ez = z + (R2() - 0.5) * spread * 0.4;
      var e = _c3d_mkMesh(new THREE.SphereGeometry((0.03 + R2() * 0.028) * s, 10, 8), em);
      e.position.set(ex, ey, ez);
      g.add(e); eyeMeshes.push(e);
    }
  }

  var coreY = (0.30 + R2() * 0.16) * s;
  var coreR = (0.18 + R2() * 0.22) * s;
  var baseR = (0.22 + R2() * 0.18) * s;

  if (type === 0) {
    var core = _c3d_mkMesh(new THREE.IcosahedronGeometry(coreR, 0), shellMat);
    core.position.y = coreY; core.rotation.set(R2()*1.2, R2()*1.2, R2()*1.2); g.add(core);
    var ring = _c3d_mkMesh(new THREE.TorusGeometry(coreR*1.05, coreR*0.10, 10, 48), accentMat.clone());
    ring.position.y = coreY; ring.rotation.x = Math.PI/2 + (R2()-0.5)*0.35; ring.rotation.y = (R2()-0.5)*0.6; g.add(ring);
    addEyesCluster(coreY + 0.02*s, -coreR*0.9, 2 + Math.floor(R2()*2), 0.18*s);
    for (var i = 0; i < 6; i++) addTendril((i/6)*Math.PI*2+(R2()-0.5)*0.25, baseR, (0.55+R2()*0.35)*s, 0.05*s, i*(Math.PI/3));

  } else if (type === 1) {
    var cap = _c3d_mkMesh(new THREE.SphereGeometry(coreR*1.15, 14, 10), glassMat);
    cap.scale.set(1.2, 0.7, 1.4); cap.position.y = coreY + 0.02*s; g.add(cap);
    var spineN = 5 + Math.floor(R2() * 4);
    for (var si = 0; si < spineN; si++) {
      var t = si / Math.max(1, spineN-1);
      var finW = (0.08 + R2()*0.06)*s, finH = (0.18 + R2()*0.22)*s;
      var fin = _c3d_mkMesh(new THREE.BoxGeometry(finW, finH, 0.015*s), accentMat.clone());
      fin.position.set((R2()-0.5)*0.06*s, coreY+finH*0.25, (t-0.5)*coreR*2.4);
      fin.rotation.y = (R2()-0.5)*0.6; fin.rotation.x = (R2()-0.5)*0.4; g.add(fin);
    }
    addEyesCluster(coreY + 0.04*s, -coreR*0.85, 3 + Math.floor(R2()*2), 0.22*s);
    for (var j = 0; j < 8; j++) addTendril((j/8)*Math.PI*2+(R2()-0.5)*0.3, baseR*1.05, (0.50+R2()*0.45)*s, 0.045*s, j*(Math.PI/4));

  } else if (type === 2) {
    var c1 = _c3d_mkMesh(new THREE.OctahedronGeometry(coreR*0.9, 0), shellMat.clone());
    c1.position.y = coreY; c1.rotation.set(R2(), R2(), R2()); g.add(c1);
    var c2 = _c3d_mkMesh(new THREE.TetrahedronGeometry(coreR*0.55, 0), darkMat.clone());
    c2.position.y = coreY + coreR*0.65; c2.rotation.set(R2(), R2(), R2()); g.add(c2);
    var shardN = 10 + Math.floor(R2() * 10);
    for (var sh = 0; sh < shardN; sh++) {
      var aa = (sh / shardN) * Math.PI * 2;
      var rad = coreR * (1.10 + R2()*0.55);
      var shard = _c3d_mkMesh(new THREE.BoxGeometry(coreR*0.38, coreR*0.06, coreR*0.06), accentMat.clone());
      shard.position.set(Math.cos(aa)*rad, coreY+(R2()-0.5)*coreR*0.35, Math.sin(aa)*rad);
      shard.rotation.y = aa + Math.PI/2; shard.rotation.x = (R2()-0.5)*0.8; g.add(shard);
    }
    addEyesCluster(coreY + 0.03*s, -coreR*0.75, 2, 0.16*s);
    for (var k = 0; k < 6; k++) addTendril((k/6)*Math.PI*2+(R2()-0.5)*0.2, baseR*0.95, (0.72+R2()*0.55)*s, 0.05*s, k*(Math.PI/3));

  } else {
    var crown = _c3d_mkMesh(new THREE.TorusGeometry(coreR*1.25, coreR*0.12, 10, 52), accentMat.clone());
    crown.position.y = coreY + coreR*0.15;
    crown.rotation.x = (R2()-0.5)*0.7; crown.rotation.z = (R2()-0.5)*0.7; g.add(crown);
    var voidCore = _c3d_mkMesh(new THREE.SphereGeometry(coreR*0.62, 12, 10), darkMat.clone());
    voidCore.position.y = coreY; g.add(voidCore);
    var satN = 4 + Math.floor(R2() * 4);
    for (var st = 0; st < satN; st++) {
      var a4 = (st/satN)*Math.PI*2 + (R2()-0.5)*0.4;
      var sat = _c3d_mkMesh(new THREE.OctahedronGeometry(coreR*0.18, 0), shellMat.clone());
      sat.position.set(Math.cos(a4)*coreR*1.35, coreY+(R2()-0.5)*coreR*0.35, Math.sin(a4)*coreR*1.35);
      sat.rotation.set(R2(), R2(), R2()); g.add(sat);
    }
    addEyesCluster(coreY + 0.04*s, -coreR*0.70, 4 + Math.floor(R2()*2), 0.26*s);
    for (var t2 = 0; t2 < 10; t2++) addTendril((t2/10)*Math.PI*2+(R2()-0.5)*0.22, baseR*1.10, (0.48+R2()*0.40)*s, 0.042*s, t2*(Math.PI/5));
  }

  g.add(_c3d_makeDropShadow(0.48*s, 0.48*s, 0.72));
  _c3d_setWanderMeta(g, R2, 0.014 + R2()*0.008, 0.038 + R2()*0.018);
  g.userData.isInsect        = true;
  g.userData.insectType      = type;
  g.userData.insectScale     = s;
  g.userData.bodyH           = 0.62 * s;
  g.userData.legMeshes       = legMeshes;
  g.userData.eyeMeshes       = eyeMeshes;
  g.userData.eyeEmissiveBase = eyeEmissiveBase;
  return g;
}

/* ============================================================
   3. CRYSTAL CREATURE  (結晶体型)
   visualType: 'crystal'
   鋭い角柱クラスター + 発光コア + 細かいシャード群
============================================================ */
function buildCrystal(R2) {
  var g = new THREE.Group();
  var s = 0.5 + R2() * 0.5;

  // 属性由来のアクセントカラー
  var accentCols = [0x88ffff, 0xffdd00, 0x00aaff, 0xff88ff, 0xaaffaa, 0xff6600];
  var accent = accentCols[Math.floor(R2() * accentCols.length)];

  // マテリアル
  var cryMat = new THREE.MeshStandardMaterial({
    color: 0xd8eeff, roughness: 0.04, metalness: 0.1,
    transparent: true, opacity: 0.72 + R2() * 0.18
  });
  var glowMat = new THREE.MeshStandardMaterial({
    color: accent, emissive: new THREE.Color(accent),
    emissiveIntensity: 3.5 + R2() * 2.5,
    roughness: 0.05, metalness: 0.15,
    transparent: true, opacity: 0.85
  });
  var darkCryMat = new THREE.MeshStandardMaterial({
    color: 0x112233, roughness: 0.12, metalness: 0.55,
    transparent: true, opacity: 0.88
  });

  // 中央発光コア
  var coreSize = (0.12 + R2() * 0.10) * s;
  var core = _c3d_mkMesh(new THREE.OctahedronGeometry(coreSize, 0), glowMat);
  core.position.y = (0.32 + R2() * 0.12) * s;
  core.rotation.set(R2(), R2(), R2());
  g.add(core);

  // コアの発光ライト
  var corePl = new THREE.PointLight(accent, 1.8, 3.5, 2.0);
  corePl.position.copy(core.position);
  g.add(corePl);

  // メインクリスタル柱 (3〜6本)
  var pillarN = 3 + Math.floor(R2() * 4);
  for (var pi = 0; pi < pillarN; pi++) {
    var pa = (pi / pillarN) * Math.PI * 2 + R2() * 0.4;
    var pr = (0.06 + R2() * 0.10) * s;
    var ph = (0.35 + R2() * 0.45) * s;
    var pw = (0.04 + R2() * 0.06) * s;
    // 四角柱 + 先端を細くして疑似的な針状に
    var pillar = _c3d_mkMesh(new THREE.CylinderGeometry(pw * 0.2, pw, ph, 4), cryMat.clone());
    pillar.position.set(Math.cos(pa) * pr, ph / 2, Math.sin(pa) * pr);
    pillar.rotation.y = pa + R2() * 0.6;
    pillar.rotation.z = (R2() - 0.5) * 0.55;
    g.add(pillar);
  }

  // サブクリスタル (細かいシャード, 6〜12本)
  var shardN = 6 + Math.floor(R2() * 7);
  for (var shi = 0; shi < shardN; shi++) {
    var sha = R2() * Math.PI * 2;
    var shr = (0.08 + R2() * 0.18) * s;
    var shh = (0.08 + R2() * 0.22) * s;
    var shw = (0.015 + R2() * 0.025) * s;
    var mat = R2() > 0.55 ? glowMat.clone() : darkCryMat.clone();
    var shard = _c3d_mkMesh(new THREE.CylinderGeometry(shw * 0.15, shw, shh, 4), mat);
    shard.position.set(Math.cos(sha) * shr, (R2() * 0.28 + 0.04) * s, Math.sin(sha) * shr);
    shard.rotation.y = sha; shard.rotation.z = (R2() - 0.5) * 1.1;
    g.add(shard);
  }

  // 眼 (2〜4個)
  var eyeN = 2 + Math.floor(R2() * 3);
  var eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff2222, emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 8.0 + R2() * 3.0
  });
  for (var ei = 0; ei < eyeN; ei++) {
    var ea = (ei / eyeN) * Math.PI * 2;
    var er = coreSize * (0.5 + R2() * 0.4);
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.018 * s, 8, 6), eyeMat.clone());
    eye.position.set(
      Math.cos(ea) * er + core.position.x,
      core.position.y + (R2() - 0.5) * coreSize * 0.6,
      Math.sin(ea) * er + core.position.z - coreSize * 0.6
    );
    g.add(eye);
  }

  g.add(_c3d_makeDropShadow(0.40*s, 0.40*s, 0.60));
  _c3d_setWanderMeta(g, R2, 0.006 + R2() * 0.006, 0.025 + R2() * 0.012);
  g.userData.bodyH  = core.position.y;
  g.userData.eyePl  = corePl;
  g.userData.isCrystal = true;
  g.userData.coreRef   = core;
  return g;
}

/* ============================================================
   4. BLOB CREATURE  (液体核型)
   visualType: 'blob'
   球体クラスター + 不定形に変形したような有機的構造
============================================================ */
function buildBlob(R2) {
  var g    = new THREE.Group();
  var s    = 0.5 + R2() * 0.55;

  // ベースカラー (半透明ゼリー系)
  var blobCols = [0x88ddcc, 0x99ccff, 0xccbb88, 0xffaacc, 0xaaffaa, 0xffcc88];
  var blobCol  = blobCols[Math.floor(R2() * blobCols.length)];
  var accentCols = [0x00ffaa, 0xff2266, 0xffee00, 0x22aaff, 0xff88ff];
  var accent = accentCols[Math.floor(R2() * accentCols.length)];

  var blobMat = new THREE.MeshStandardMaterial({
    color: blobCol, roughness: 0.05, metalness: 0.0,
    transparent: true, opacity: 0.52 + R2() * 0.28
  });
  var innerMat = new THREE.MeshStandardMaterial({
    color: accent, emissive: new THREE.Color(accent),
    emissiveIntensity: 2.8 + R2() * 2.0, roughness: 0.08, metalness: 0.0,
    transparent: true, opacity: 0.72
  });
  var membraneMat = new THREE.MeshStandardMaterial({
    color: blobCol, roughness: 0.0, metalness: 0.0,
    transparent: true, opacity: 0.25 + R2() * 0.18, side: THREE.DoubleSide
  });

  // メイン球体 (変形スケールで有機感)
  var mainR = (0.25 + R2() * 0.15) * s;
  var main  = _c3d_mkMesh(new THREE.SphereGeometry(mainR, 16, 12), blobMat.clone());
  main.scale.set(1.0 + R2()*0.35, 0.75 + R2()*0.35, 1.0 + R2()*0.35);
  main.position.y = mainR * (0.9 + R2() * 0.3);
  g.add(main);

  // 内部核 (発光)
  var innerR = mainR * (0.35 + R2() * 0.25);
  var inner  = _c3d_mkMesh(new THREE.SphereGeometry(innerR, 10, 8), innerMat);
  inner.position.copy(main.position);
  inner.position.y += (R2() - 0.5) * mainR * 0.3;
  g.add(inner);

  // 発光ポイントライト
  var corePl = new THREE.PointLight(accent, 1.5, 3.0, 2.0);
  corePl.position.copy(inner.position);
  g.add(corePl);

  // 衛星バブル (3〜6個)
  var satN = 3 + Math.floor(R2() * 4);
  for (var si = 0; si < satN; si++) {
    var sa  = (si / satN) * Math.PI * 2 + R2() * 0.6;
    var sd  = mainR * (0.80 + R2() * 0.55);
    var sr  = mainR * (0.20 + R2() * 0.30);
    var sy  = main.position.y + (R2() - 0.5) * mainR * 0.8;
    var sat = _c3d_mkMesh(new THREE.SphereGeometry(sr, 12, 9), blobMat.clone());
    sat.scale.set(1.0 + R2()*0.4, 0.8 + R2()*0.4, 1.0 + R2()*0.4);
    sat.position.set(Math.cos(sa) * sd, sy, Math.sin(sa) * sd);
    g.add(sat);
  }

  // 外膜リング (薄い透明シート)
  var ringN = 2 + Math.floor(R2() * 2);
  for (var ri = 0; ri < ringN; ri++) {
    var rRad = mainR * (1.15 + ri * 0.22 + R2() * 0.15);
    var rTube = mainR * (0.025 + R2() * 0.02);
    var ringMesh = _c3d_mkMesh(new THREE.TorusGeometry(rRad, rTube, 8, 36), membraneMat.clone());
    ringMesh.position.copy(main.position);
    ringMesh.rotation.x = R2() * Math.PI;
    ringMesh.rotation.y = R2() * Math.PI;
    g.add(ringMesh);
  }

  // 眼 (3〜5個, 表面に分布)
  var eyeN = 3 + Math.floor(R2() * 3);
  var eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff2222, emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 9.0 + R2() * 3.5
  });
  for (var ei = 0; ei < eyeN; ei++) {
    var ea  = (ei / eyeN) * Math.PI * 2;
    var eEl = (R2() - 0.35) * Math.PI; // elevation
    var eRad = mainR;
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.022 * s, 8, 6), eyeMat.clone());
    eye.position.set(
      Math.cos(ea) * Math.cos(eEl) * eRad + main.position.x,
      main.position.y + Math.sin(eEl) * eRad,
      Math.sin(ea) * Math.cos(eEl) * eRad + main.position.z - eRad * 0.1
    );
    g.add(eye);
  }

  g.add(_c3d_makeDropShadow(0.45*s, 0.45*s, 0.65));
  _c3d_setWanderMeta(g, R2, 0.010 + R2() * 0.007, 0.028 + R2() * 0.014);
  g.userData.bodyH    = main.position.y;
  g.userData.eyePl    = corePl;
  g.userData.isBlob   = true;
  g.userData.mainBlobRef = main;
  g.userData.innerRef    = inner;
  return g;
}

/* ============================================================
   5. WIRE CREATURE  (骨格線型)
   visualType: 'wire'
   幾何学的な細線フレーム構造 + 発光ノード
============================================================ */
function buildWire(R2) {
  var g = new THREE.Group();
  var s = 0.5 + R2() * 0.55;

  // カラー
  var wireCols = [0x00ffcc, 0x88aaff, 0xffcc00, 0xff66aa, 0xaaffaa, 0xff8800];
  var wc  = wireCols[Math.floor(R2() * wireCols.length)];
  var wc2 = wireCols[Math.floor(R2() * wireCols.length)];

  var wireMat = new THREE.MeshStandardMaterial({
    color: wc, emissive: new THREE.Color(wc),
    emissiveIntensity: 1.8 + R2() * 1.4, roughness: 0.22, metalness: 0.55
  });
  var nodeMat = new THREE.MeshStandardMaterial({
    color: wc2, emissive: new THREE.Color(wc2),
    emissiveIntensity: 5.5 + R2() * 3.0, roughness: 0.1, metalness: 0.3
  });
  var eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff2222, emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 10.0 + R2() * 4.0
  });

  var WIRE_R = 0.015 * s;
  function addEdge(ax, ay, az, bx, by, bz) {
    var dx = bx-ax, dy = by-ay, dz = bz-az;
    var len = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (len < 0.001) return;
    var mid = new THREE.Vector3((ax+bx)/2, (ay+by)/2, (az+bz)/2);
    var edge = _c3d_mkMesh(new THREE.CylinderGeometry(WIRE_R, WIRE_R, len, 5), wireMat.clone());
    edge.position.copy(mid);
    var dir = new THREE.Vector3(dx, dy, dz).normalize();
    var up  = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.999) up.set(1, 0, 0);
    edge.quaternion.setFromUnitVectors(up, dir);
    g.add(edge);
  }
  function addNode(x, y, z, r) {
    var nd = _c3d_mkMesh(new THREE.SphereGeometry(r || WIRE_R * 2.5, 8, 6), nodeMat.clone());
    nd.position.set(x, y, z);
    g.add(nd);
  }

  // フレームの種類 (3タイプをランダム選択)
  var frameType = Math.floor(R2() * 3);
  var centerY = (0.28 + R2() * 0.15) * s;
  var frameR  = (0.20 + R2() * 0.16) * s;

  if (frameType === 0) {
    // 正八面体フレーム
    var verts0 = [
      [0, frameR, 0], [0, -frameR, 0],
      [frameR, 0, 0], [-frameR, 0, 0],
      [0, 0, frameR],  [0, 0, -frameR]
    ];
    var edges0 = [
      [0,2],[0,3],[0,4],[0,5],
      [1,2],[1,3],[1,4],[1,5],
      [2,4],[4,3],[3,5],[5,2]
    ];
    for (var vi = 0; vi < verts0.length; vi++) {
      addNode(verts0[vi][0], verts0[vi][1] + centerY, verts0[vi][2], WIRE_R * 3);
    }
    for (var ei = 0; ei < edges0.length; ei++) {
      var va = verts0[edges0[ei][0]], vb = verts0[edges0[ei][1]];
      addEdge(va[0], va[1]+centerY, va[2], vb[0], vb[1]+centerY, vb[2]);
    }

  } else if (frameType === 1) {
    // 二重テトラ + 中心リング
    var tetR = frameR * 0.95;
    var verts1 = [];
    for (var ti = 0; ti < 3; ti++) {
      var ta = (ti / 3) * Math.PI * 2;
      verts1.push([Math.cos(ta)*tetR, centerY - tetR*0.5, Math.sin(ta)*tetR]);
      verts1.push([Math.cos(ta+Math.PI/3)*tetR*0.75, centerY + tetR*0.7, Math.sin(ta+Math.PI/3)*tetR*0.75]);
    }
    for (var tvi = 0; tvi < verts1.length; tvi++) {
      addNode(verts1[tvi][0], verts1[tvi][1], verts1[tvi][2], WIRE_R * 2.8);
    }
    // 下三角
    addEdge(verts1[0][0],verts1[0][1],verts1[0][2], verts1[2][0],verts1[2][1],verts1[2][2]);
    addEdge(verts1[2][0],verts1[2][1],verts1[2][2], verts1[4][0],verts1[4][1],verts1[4][2]);
    addEdge(verts1[4][0],verts1[4][1],verts1[4][2], verts1[0][0],verts1[0][1],verts1[0][2]);
    // 上三角
    addEdge(verts1[1][0],verts1[1][1],verts1[1][2], verts1[3][0],verts1[3][1],verts1[3][2]);
    addEdge(verts1[3][0],verts1[3][1],verts1[3][2], verts1[5][0],verts1[5][1],verts1[5][2]);
    addEdge(verts1[5][0],verts1[5][1],verts1[5][2], verts1[1][0],verts1[1][1],verts1[1][2]);
    // 縦接続
    for (var tci = 0; tci < 3; tci++) {
      addEdge(verts1[tci*2][0],verts1[tci*2][1],verts1[tci*2][2],
              verts1[tci*2+1][0],verts1[tci*2+1][1],verts1[tci*2+1][2]);
    }

  } else {
    // 螺旋ケージ (等間隔頂点を螺旋で接続)
    var aN = 10 + Math.floor(R2() * 6);
    var spiralVerts = [];
    for (var ai = 0; ai < aN; ai++) {
      var at  = ai / aN;
      var aAng = at * Math.PI * 4; // 2ターン
      var aH  = (at - 0.5) * frameR * 2.2 + centerY;
      var aR  = frameR * (0.6 + Math.sin(at * Math.PI) * 0.4);
      spiralVerts.push([Math.cos(aAng)*aR, aH, Math.sin(aAng)*aR]);
    }
    for (var avi = 0; avi < spiralVerts.length; avi++) {
      addNode(spiralVerts[avi][0], spiralVerts[avi][1], spiralVerts[avi][2], WIRE_R * 2);
      if (avi > 0) {
        addEdge(
          spiralVerts[avi-1][0], spiralVerts[avi-1][1], spiralVerts[avi-1][2],
          spiralVerts[avi][0],   spiralVerts[avi][1],   spiralVerts[avi][2]
        );
      }
      // クロス接続
      if (avi + Math.floor(aN/3) < spiralVerts.length && R2() > 0.55) {
        var ci2 = avi + Math.floor(aN / 3);
        addEdge(
          spiralVerts[avi][0], spiralVerts[avi][1], spiralVerts[avi][2],
          spiralVerts[ci2][0], spiralVerts[ci2][1], spiralVerts[ci2][2]
        );
      }
    }
  }

  // 眼 (2〜3個)
  var eyeN = 2 + Math.floor(R2() * 2);
  for (var wi = 0; wi < eyeN; wi++) {
    var wea = (wi / eyeN) * Math.PI * 2;
    var wer = frameR * (0.3 + R2() * 0.3);
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.020 * s, 8, 6), eyeMat.clone());
    eye.position.set(Math.cos(wea) * wer, centerY + (R2() - 0.5) * frameR * 0.4, Math.sin(wea) * wer - frameR * 0.2);
    g.add(eye);
  }

  // 発光ライト
  var wPl = new THREE.PointLight(wc, 1.2, 2.8, 2.0);
  wPl.position.set(0, centerY, 0);
  g.add(wPl);

  g.add(_c3d_makeDropShadow(0.36*s, 0.36*s, 0.55));
  _c3d_setWanderMeta(g, R2, 0.012 + R2() * 0.008, 0.032 + R2() * 0.016);
  g.userData.bodyH   = centerY;
  g.userData.eyePl   = wPl;
  g.userData.isWire  = true;
  g.userData.frameType = frameType;
  return g;
}

/* ============================================================
   6. MARSHMALLOW CREATURE  (Stay Puft マシュマロマン)
   visualType: 'marshmallow'
   本物に忠実：セーラー帽・紺カラー・赤ネッカチーフ・プクプク脚腕
============================================================ */
function buildMarshmallow(R2) {
  var g = new THREE.Group();

  // --- マテリアル ---
  var bodyMat  = _c3d_matStd(0xf5f4f0, 0.82, 0.02);  // マシュマロホワイト (微妙にクリーム)
  var navyMat  = _c3d_matStd(0x1e3278, 0.58, 0.06);  // セーラーネイビー
  var whiteMat = _c3d_matStd(0xeeecea, 0.78, 0.01);  // セーラー帽ホワイト
  var redMat   = _c3d_matStd(0xbb1020, 0.62, 0.04);  // 赤ネッカチーフ
  var pinkMat  = _c3d_matStd(0xffaabb, 0.92, 0.00);  // 口の中ピンク
  var eyeBlack = _c3d_matStd(0x111111, 0.78, 0.06);  // 黒目
  var eyeWhite = _c3d_matStd(0xffffff, 0.72, 0.00);  // 白目

  // === 足 (左右・プクプク3段) ===
  [[-0.27, 0.04], [0.27, -0.04]].forEach(function(lp) {
    var lx = lp[0], lz = lp[1];
    // 太もも
    var thigh = _c3d_mkMesh(new THREE.SphereGeometry(0.225, 16, 12), bodyMat.clone());
    thigh.scale.set(1.0, 1.10, 0.96);
    thigh.position.set(lx, 0.52, lz);
    g.add(thigh);
    // 下腿
    var shin = _c3d_mkMesh(new THREE.SphereGeometry(0.200, 16, 12), bodyMat.clone());
    shin.scale.set(1.0, 1.05, 0.96);
    shin.position.set(lx, 0.28, lz);
    g.add(shin);
    // 足首くびれ (小さなリング)
    var ankle = _c3d_mkMesh(new THREE.CylinderGeometry(0.145, 0.155, 0.06, 16), bodyMat.clone());
    ankle.position.set(lx, 0.095, lz);
    g.add(ankle);
    // 足先 (前に張り出した楕円ブロブ)
    var foot = _c3d_mkMesh(new THREE.SphereGeometry(0.230, 16, 12), bodyMat.clone());
    foot.scale.set(1.10, 0.50, 1.55);
    foot.position.set(lx, 0.072, lz + 0.055);
    g.add(foot);
  });

  var waistY = 0.66;

  // === 胴体 (巨大な洋梨型 ─ Stay Puft 最大の特徴) ===
  var torsoRX = 0.80;
  var torsoRY = 0.78;
  var torsoRZ = 0.68;
  var torsoY  = waistY + torsoRY * 0.65;
  var torso = _c3d_mkMesh(new THREE.SphereGeometry(torsoRX, 28, 22), bodyMat.clone());
  torso.scale.set(1.0, torsoRY / torsoRX, torsoRZ / torsoRX);
  torso.position.set(0, torsoY, 0);
  g.add(torso);

  // === セーラー襟 ===
  var collarY  = torsoY + torsoRY * 0.28;
  var collarRX = torsoRX * 0.94;
  // 紺色の幅広リング
  var collarMain = _c3d_mkMesh(
    new THREE.CylinderGeometry(collarRX * 0.88, collarRX, 0.22, 32),
    navyMat.clone()
  );
  collarMain.position.set(0, collarY, 0);
  g.add(collarMain);
  // 上縁の白いストライプ
  var collarStripe = _c3d_mkMesh(
    new THREE.CylinderGeometry(collarRX * 0.882, collarRX * 1.002, 0.038, 32),
    whiteMat.clone()
  );
  collarStripe.position.set(0, collarY + 0.095, 0);
  g.add(collarStripe);
  // V字ノッチ (前面・三角形プリズム)
  var notch = _c3d_mkMesh(
    new THREE.CylinderGeometry(0.001, 0.195, 0.26, 3),
    navyMat.clone()
  );
  notch.position.set(0, collarY - 0.04, torsoRZ * 0.72);
  notch.rotation.set(Math.PI * 0.08, Math.PI, 0);
  g.add(notch);

  // === 赤いネッカチーフ ===
  var knotY = collarY - 0.06;
  var knotZ = torsoRZ * 0.74;
  // 結び目
  var knot = _c3d_mkMesh(new THREE.SphereGeometry(0.085, 14, 10), redMat.clone());
  knot.scale.set(0.92, 0.72, 0.60);
  knot.position.set(0, knotY, knotZ);
  g.add(knot);
  // 左右の蝶結び耳
  [-0.065, 0.065].forEach(function(kx) {
    var ear = _c3d_mkMesh(new THREE.SphereGeometry(0.055, 10, 8), redMat.clone());
    ear.scale.set(1.0, 0.55, 0.45);
    ear.position.set(kx, knotY + 0.005, knotZ - 0.012);
    g.add(ear);
  });
  // 垂れ下がる2本のテール
  [[-0.018, -0.08, -0.005], [0.022, -0.16, 0.008]].forEach(function(tp) {
    var tail = _c3d_mkMesh(
      new THREE.CylinderGeometry(0.028, 0.010, 0.22, 8),
      redMat.clone()
    );
    tail.rotation.z = tp[0] * 7;
    tail.position.set(tp[0] * 1.2, knotY - 0.12, knotZ - 0.01);
    g.add(tail);
  });

  // === 腕 (左右・プクプク3段) ===
  var armY = torsoY + torsoRY * 0.08;
  [[-1], [1]].forEach(function(ap) {
    var s = ap[0];
    var ax = s * (torsoRX * 0.97);
    // 肩球 (胴体との接続)
    var shoulder = _c3d_mkMesh(new THREE.SphereGeometry(0.230, 16, 12), bodyMat.clone());
    shoulder.scale.set(0.80, 0.90, 0.80);
    shoulder.position.set(ax + s * 0.08, armY + 0.05, 0);
    g.add(shoulder);
    // 上腕
    var upper = _c3d_mkMesh(new THREE.SphereGeometry(0.205, 16, 12), bodyMat.clone());
    upper.scale.set(0.80, 0.96, 0.80);
    upper.position.set(ax + s * 0.33, armY - 0.04, s * 0.02);
    g.add(upper);
    // 肘くびれ
    var elbow = _c3d_mkMesh(new THREE.CylinderGeometry(0.135, 0.145, 0.055, 14), bodyMat.clone());
    elbow.rotation.z = s * Math.PI / 2;
    elbow.position.set(ax + s * 0.52, armY - 0.10, s * 0.03);
    g.add(elbow);
    // 前腕
    var fore = _c3d_mkMesh(new THREE.SphereGeometry(0.190, 14, 12), bodyMat.clone());
    fore.scale.set(0.78, 0.92, 0.78);
    fore.position.set(ax + s * 0.68, armY - 0.16, s * 0.035);
    g.add(fore);
    // 手 (ずんぐりグローブ)
    var hand = _c3d_mkMesh(new THREE.SphereGeometry(0.175, 14, 12), bodyMat.clone());
    hand.scale.set(1.08, 0.68, 0.92);
    hand.position.set(ax + s * 0.88, armY - 0.24, s * 0.04);
    g.add(hand);
    // 親指の出っ張り
    var thumb = _c3d_mkMesh(new THREE.SphereGeometry(0.072, 10, 8), bodyMat.clone());
    thumb.scale.set(0.70, 1.15, 0.70);
    thumb.position.set(ax + s * 0.84, armY - 0.14, s * 0.06);
    g.add(thumb);
  });

  // === 首 ===
  var neckY = torsoY + torsoRY * 0.80;
  var neck  = _c3d_mkMesh(new THREE.CylinderGeometry(0.25, 0.30, 0.16, 18), bodyMat.clone());
  neck.position.set(0, neckY, 0);
  g.add(neck);

  // === 頭 (まん丸・ぷっくり) ===
  var headR = 0.47;
  var headY = neckY + 0.08 + headR * 0.90;
  var head  = _c3d_mkMesh(new THREE.SphereGeometry(headR, 24, 20), bodyMat.clone());
  head.scale.set(1.0, 1.02, 0.93);
  head.position.set(0, headY, 0);
  g.add(head);

  // === 目 (黒目・白目・ハイライト) ===
  [-0.145, 0.145].forEach(function(ex) {
    // 白目
    var ew = _c3d_mkMesh(new THREE.SphereGeometry(0.072, 14, 12), eyeWhite.clone());
    ew.position.set(ex, headY + 0.075, headR * 0.855);
    g.add(ew);
    // 黒目
    var eb = _c3d_mkMesh(new THREE.SphereGeometry(0.050, 12, 10), eyeBlack.clone());
    eb.position.set(ex, headY + 0.075, headR * 0.885);
    g.add(eb);
    // ハイライト白点
    var eh = _c3d_mkMesh(new THREE.SphereGeometry(0.015, 8, 6), eyeWhite.clone());
    eh.position.set(ex - 0.015, headY + 0.092, headR * 0.915);
    g.add(eh);
  });

  // 薄い環境光ポイントライト (発光しない穏やかな顔の照明)
  var eyePl = new THREE.PointLight(0xfff8f0, 0.45, 2.2, 2.0);
  eyePl.position.set(0, headY + 0.08, headR);
  g.add(eyePl);

  // === ほっぺた (半透明ピンク) ===
  var cheekMat = new THREE.MeshStandardMaterial({
    color: 0xff9999, roughness: 0.92, transparent: true, opacity: 0.38
  });
  [-0.255, 0.255].forEach(function(cx) {
    var cheek = _c3d_mkMesh(new THREE.SphereGeometry(0.095, 12, 10), cheekMat);
    cheek.position.set(cx, headY - 0.04, headR * 0.80);
    g.add(cheek);
  });

  // === 大きな笑顔 ===
  var smileY = headY - 0.095;
  for (var si = 0; si < 10; si++) {
    var sa = (si / 9 - 0.5) * 1.80;
    var smPt = _c3d_mkMesh(
      new THREE.SphereGeometry(0.024, 8, 6),
      _c3d_matStd(0x1a1a1a, 0.85, 0.0)
    );
    smPt.position.set(
      Math.sin(sa) * 0.195,
      smileY - Math.pow(Math.abs(Math.sin(sa * 0.80)), 1.6) * 0.068,
      headR * 0.875
    );
    g.add(smPt);
  }
  // 開いた口の内側 (ピンク)
  var mouth = _c3d_mkMesh(new THREE.SphereGeometry(0.098, 12, 10), pinkMat.clone());
  mouth.scale.set(1.65, 0.52, 0.42);
  mouth.position.set(0, smileY - 0.024, headR * 0.862);
  g.add(mouth);

  // === セーラー帽子 (白・平型) ===
  var hatBrimY = headY + headR * 0.72;
  var hR = headR;
  // 帽子本体 (低い白シリンダー)
  var hatBody = _c3d_mkMesh(
    new THREE.CylinderGeometry(hR * 0.74, hR * 0.76, 0.10, 30),
    whiteMat.clone()
  );
  hatBody.position.set(0, hatBrimY + 0.050, 0);
  g.add(hatBody);
  // 帽子上面キャップ
  var hatCap = _c3d_mkMesh(
    new THREE.CylinderGeometry(hR * 0.74, hR * 0.74, 0.022, 30),
    whiteMat.clone()
  );
  hatCap.position.set(0, hatBrimY + 0.100, 0);
  g.add(hatCap);
  // つば (白いフラットリング)
  var hatBrim = _c3d_mkMesh(
    new THREE.CylinderGeometry(hR * 1.16, hR * 1.20, 0.050, 30),
    whiteMat.clone()
  );
  hatBrim.position.set(0, hatBrimY, 0);
  g.add(hatBrim);
  // ハットバンド (ネイビー、"STAY PUFT" イメージ)
  var hatBand = _c3d_mkMesh(
    new THREE.CylinderGeometry(hR * 0.755, hR * 0.765, 0.072, 30),
    navyMat.clone()
  );
  hatBand.position.set(0, hatBrimY + 0.016, 0);
  g.add(hatBand);
  // バンドの白いストライプ (上下細線)
  [hatBrimY + 0.050, hatBrimY - 0.016].forEach(function(by) {
    var stripe = _c3d_mkMesh(
      new THREE.CylinderGeometry(hR * 0.756, hR * 0.766, 0.012, 30),
      whiteMat.clone()
    );
    stripe.position.set(0, by, 0);
    g.add(stripe);
  });
  // 赤いリボン (左横サイド)
  var ribbonAngle = 2.2; // ラジアン (約125°、左前方)
  var rBandR = hR * 0.762;
  var ribbon = _c3d_mkMesh(new THREE.BoxGeometry(0.018, 0.082, 0.012), redMat.clone());
  ribbon.position.set(
    Math.sin(ribbonAngle) * rBandR,
    hatBrimY + 0.016,
    Math.cos(ribbonAngle) * rBandR
  );
  ribbon.rotation.y = -ribbonAngle;
  g.add(ribbon);
  // リボンの小さな下タグ
  var tag = _c3d_mkMesh(new THREE.BoxGeometry(0.014, 0.030, 0.010), redMat.clone());
  tag.position.set(
    Math.sin(ribbonAngle) * rBandR,
    hatBrimY - 0.022,
    Math.cos(ribbonAngle) * rBandR
  );
  tag.rotation.y = -ribbonAngle + 0.08;
  g.add(tag);

  // --- ドロップシャドウ ---
  g.add(_c3d_makeDropShadow(0.85, 0.85, 0.80));

  // --- ワンダーメタ ---
  _c3d_setWanderMeta(g, R2, 0.003 + R2() * 0.002, 0.013 + R2() * 0.005);
  g.userData.bodyH       = headY + headR;
  g.userData.eyePl       = eyePl;
  g.userData.isMarshmallow = true;

  return g;
}

/* ============================================================
   7. SLIME CREATURE  (流体型) — MarchingCubes メタボール
   visualType: 'slime0' 〜 'slime8'
   slimeType 0-2: 毒・酸系  /  3-5: 深海・暗黒系  /  6-8: ネオン発光系
   ※ THREE.MarchingCubes が事前にロードされている必要あり
============================================================ */
function buildSlime(R2, slimeType) {
  var g = new THREE.Group();
  var st = (slimeType !== undefined && !isNaN(slimeType)) ? (slimeType % 9) : 0;

  /* --- パレット 9種 --- */
  var palettes = [
    /* 0 毒緑   */ { col: 0x11ee44, emit: 0x00ff22, eInt: 3.5, opacity: 0.84, lCol: 0x00ff44 },
    /* 1 紫毒   */ { col: 0xbb33ff, emit: 0x9900ee, eInt: 4.2, opacity: 0.80, lCol: 0xcc44ff },
    /* 2 酸黄緑 */ { col: 0xccff00, emit: 0xaaff00, eInt: 4.8, opacity: 0.78, lCol: 0xddff22 },
    /* 3 深海青 */ { col: 0x0055cc, emit: 0x0033bb, eInt: 2.5, opacity: 0.90, lCol: 0x0066ff },
    /* 4 深淵黒 */ { col: 0x111133, emit: 0x4400cc, eInt: 2.0, opacity: 0.96, lCol: 0x5522dd },
    /* 5 生物発光*/ { col: 0x002233, emit: 0x00ffcc, eInt: 6.0, opacity: 0.88, lCol: 0x00ffbb },
    /* 6 ネオンPK*/ { col: 0xff0088, emit: 0xff00aa, eInt: 7.0, opacity: 0.75, lCol: 0xff22aa },
    /* 7 電光シアン*/{ col: 0x00ccff, emit: 0x00eeff, eInt: 6.5, opacity: 0.72, lCol: 0x00ddff },
    /* 8 炎オレンジ*/{ col: 0xff5500, emit: 0xff7700, eInt: 5.8, opacity: 0.80, lCol: 0xff6600 },
  ];
  var pal = palettes[st];

  var mcMat = new THREE.MeshStandardMaterial({
    color:            pal.col,
    emissive:         new THREE.Color(pal.emit),
    emissiveIntensity: pal.eInt,
    roughness:        0.10,
    metalness:        0.03,
    transparent:      true,
    opacity:          pal.opacity,
    side:             THREE.DoubleSide,
  });

  /* --- MarchingCubes ボリューム --- */
  var resolution = 22; // 解像度: 品質と速度のバランス
  var mc = new THREE.MarchingCubes(resolution, mcMat, true, false);
  mc.isolation = 80;
  mc.scale.setScalar(1.05);
  mc.position.set(0, 0.92, 0);
  mc.castShadow = true;
  g.add(mc);

  /* --- 発光PointLight --- */
  var pl = new THREE.PointLight(pal.lCol, 2.8, 4.5, 2.0);
  pl.position.set(0, 0.92, 0);
  g.add(pl);

  /* --- 衛星ボール設定 (アニメ用) --- */
  var ballCfgs = [];
  var nBalls = 3 + Math.floor(R2() * 3); // 3〜5個
  for (var i = 0; i < nBalls; i++) {
    ballCfgs.push({
      orbitR:   0.14 + R2() * 0.16,   // バグ2修正: 0.14〜0.30 (旧: 0.055〜0.15)
      speed:    0.38 + R2() * 1.10,   // 回転速度
      phase:    R2() * Math.PI * 2,   // 初期位相
      yOff:     (R2() - 0.5) * 0.12, // 高さオフセット
      str:      0.38 + R2() * 0.18,  // バグ3修正: 0.38〜0.56 (旧: 0.18〜0.32)
      sub:      5.0  + R2() * 4.0,   // バグ3修正: 5〜9 (旧: 10〜16)
    });
  }

  /* --- 初期レンダリング (最初のフレームまでの仮形状) --- */
  mc.reset();
  mc.addBall(0.5, 0.46, 0.5, 0.55, 10);
  for (var j = 0; j < ballCfgs.length; j++) {
    var bc = ballCfgs[j];
    mc.addBall(
      0.5 + Math.cos(bc.phase) * bc.orbitR,
      0.5 + bc.yOff,
      0.5 + Math.sin(bc.phase) * bc.orbitR,
      bc.str, bc.sub
    );
  }

  g.add(_c3d_makeDropShadow(0.88, 0.88, 0.55));
  _c3d_setWanderMeta(g, R2, 0.005 + R2() * 0.005, 0.018 + R2() * 0.010);

  g.userData.bodyH     = 1.55;
  g.userData.eyePl     = pl;
  g.userData.isSlime   = true;
  g.userData.slimeType = st;
  g.userData.mcRef     = mc;
  g.userData.mcMat     = mcMat;
  g.userData.slimePal  = pal;
  g.userData.ballCfgs  = ballCfgs;

  return g;
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
  if (!geo) return buildCreature(R2);

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
  // GLBゴースト: 'glb-normal', 'glb4-giant', 'glb7-tiny' etc.
  if (visualType.indexOf('glb') === 0) {
    var parts   = visualType.split('-');
    var glbKey  = parts[0];             // 'glb' | 'glb2' … 'glb9'
    var sizeKey = parts[1] || 'normal'; // 'tiny' | 'small' | 'normal' | 'large' | 'giant'
    return buildGLBVariant(R2, glbKey, sizeKey, palOverride);
  } else if (visualType === 'cloth') {
    return buildCreature(R2);
  } else if (visualType === 'crystal') {
    return buildCrystal(R2);
  } else if (visualType === 'blob') {
    return buildBlob(R2);
  } else if (visualType === 'wire') {
    return buildWire(R2);
  } else if (visualType === 'marshmallow') {
    return buildMarshmallow(R2);
  } else if (visualType.indexOf('slime') === 0) {
    var sIdx = parseInt(visualType.replace('slime', ''), 10);
    return buildSlime(R2, isNaN(sIdx) ? 0 : sIdx);
  } else {
    // insect0 〜 insect3
    var t = parseInt(visualType.replace('insect', ''), 10);
    return buildInsect(R2, isNaN(t) ? 0 : t);
  }
}
