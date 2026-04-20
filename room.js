/* ----------------------------------------------------------
   Texture builders
---------------------------------------------------------- */
function makeWallTex(r, g, b) {
  var S  = 1024;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');
  var rr = Math.max(r, 80), rg = Math.max(g, 80), rb = Math.max(b, 80);
  cx.fillStyle = 'rgb(' + rr + ',' + rg + ',' + rb + ')';
  cx.fillRect(0, 0, S, S);
  var i, d, sz;
  for (i = 0; i < 22000; i++) {
    d  = (Math.random() - 0.5) * 32;
    sz = Math.random() * 2.2 + 0.3;
    cx.fillStyle = 'rgba('
      + Math.floor(Math.min(255, Math.max(0, r + d))) + ','
      + Math.floor(Math.min(255, Math.max(0, g + d))) + ','
      + Math.floor(Math.min(255, Math.max(0, b + d))) + ','
      + (0.04 + Math.random() * 0.08) + ')';
    cx.fillRect(Math.random() * S, Math.random() * S, sz, sz);
  }
  for (i = 0; i < 60; i++) {
    var y = Math.random() * S;
    cx.strokeStyle = 'rgba('
      + (r - 18) + ',' + (g - 18) + ',' + (b - 18) + ','
      + (0.03 + Math.random() * 0.05) + ')';
    cx.lineWidth = Math.random() * 1.2 + 0.3;
    cx.beginPath();
    cx.moveTo(0, y);
    cx.lineTo(S, y + Math.random() * 8 - 4);
    cx.stroke();
  }

  var style = Math.floor(Math.random() * 4);
  if (style === 1) { 
    cx.fillStyle = 'rgba(255,255,255,0.06)';
    for(var j=0; j<40; j++) {
      cx.beginPath();
      cx.arc(Math.random()*S, Math.random()*S, 40+Math.random()*120, 0, Math.PI*2);
      cx.fill();
    }
  } else if (style === 2) { 
    cx.fillStyle = 'rgba(0,0,0,0.04)';
    for(var j=0; j<15000; j++) { cx.fillRect(Math.random()*S, Math.random()*S, 1, 1); }
    cx.strokeStyle = 'rgba(0,0,0,0.1)'; cx.lineWidth = 0.8;
    for(var j=0; j<8; j++) {
      cx.beginPath(); cx.moveTo(Math.random()*S, 0); cx.lineTo(Math.random()*S, S); cx.stroke();
    }
  } else if (style === 3) { 
    cx.fillStyle = 'rgba(255,255,255,0.05)';
    for(var j=0; j<S; j+=24) { cx.fillRect(j, 0, 12, S); }
  }

  var grad = cx.createRadialGradient(0, S, 0, 0, S, S * 0.4);
  grad.addColorStop(
    0,
    'rgba(' + (r-20) + ',' + (g-20) + ',' + (b-22) + ',0.18)'
  );
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = grad;
  cx.fillRect(0, 0, S, S);
  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeFloorTex(r, g, b) {
  var S  = 1024;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');
  var rr = Math.max(r, 65), rg = Math.max(g, 65), rb = Math.max(b, 65);
  cx.fillStyle = 'rgb(' + rr + ',' + rg + ',' + rb + ')';
  cx.fillRect(0, 0, S, S);
  var TS = 256;
  var x, y, v;
  cx.strokeStyle
    = 'rgba(' + (r-55) + ',' + (g-55) + ',' + (b-55) + ',0.55)';
  cx.lineWidth = 2.5;

  var style = Math.floor(Math.random() * 3);
  if (style === 0 || style === 2) { 
    for (x = 0; x <= S; x += TS) {
      cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, S); cx.stroke();
    }
    for (y = 0; y <= S; y += TS) {
      cx.beginPath(); cx.moveTo(0, y); cx.lineTo(S, y); cx.stroke();
    }
    var tx, ty;
    for (ty = 0; ty < 4; ty++) {
      for (tx = 0; tx < 4; tx++) {
        v = (Math.random() - 0.5) * 20;
        cx.fillStyle = 'rgba('
          + Math.floor(r + v) + ',' + Math.floor(g + v) + ','
          + Math.floor(b + v) + ',0.22)';
        cx.fillRect(tx * TS + 3, ty * TS + 3, TS - 6, TS - 6);
      }
    }
  } else if (style === 1) {
    cx.fillStyle = 'rgba(0,0,0,0.03)';
    for(var j=0; j<20000; j++) { cx.fillRect(Math.random()*S, Math.random()*S, 1.5, 1.5); }
  }

  var gl = cx.createLinearGradient(0, 0, S, S);
  gl.addColorStop(0,   'rgba(255,255,255,0.06)');
  gl.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  gl.addColorStop(1,   'rgba(255,255,255,0.04)');
  cx.fillStyle = gl;
  cx.fillRect(0, 0, S, S);
  var i, d, sz;
  for (i = 0; i < 8000; i++) {
    d  = (Math.random() - 0.5) * 14;
    sz = Math.random() * 1.5 + 0.2;
    cx.fillStyle = 'rgba('
      + Math.floor(r+d) + ',' + Math.floor(g+d) + ','
      + Math.floor(b+d) + ',0.06)';
    cx.fillRect(Math.random() * S, Math.random() * S, sz, sz);
  }
  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeCeilTex(r, g, b) {
  var S  = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');
  cx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  cx.fillRect(0, 0, S, S);
  var i, d;
  for (i = 0; i < 10000; i++) {
    d = (Math.random() - 0.5) * 18;
    cx.fillStyle = 'rgba('
      + Math.floor(r + d) + ',' + Math.floor(g + d) + ','
      + Math.floor(b + d) + ',0.04)';
    cx.fillRect(
      Math.random() * S, Math.random() * S,
      Math.random() * 1.8, Math.random() * 1.8
    );
  }

  if (Math.random() > 0.5) { 
    cx.fillStyle = 'rgba(0,0,0,0.04)';
    for(var j=0; j<S; j+=32) { cx.fillRect(0, j, S, 2); }
  }

  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Floor micro-surface: roughness variation + bump height.
function makeFloorRoughTex() {
  var S = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');

  // Mid-gray base = medium roughness
  cx.fillStyle = '#8f8f8f';
  cx.fillRect(0, 0, S, S);

  // Random smooth/polished patches (lower roughness = brighter in map)
  for (var i = 0; i < 12000; i++) {
    var v = Math.floor(120 + Math.random() * 95); // 120..214
    var a = 0.03 + Math.random() * 0.08;
    cx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')';
    cx.fillRect(Math.random() * S, Math.random() * S, 2.0 + Math.random() * 3.5, 2.0 + Math.random() * 3.5);
  }

  // Scratches / streaks
  for (var j = 0; j < 300; j++) {
    var ly = Math.random() * S;
    cx.strokeStyle = 'rgba(30,30,30,' + (0.06 + Math.random() * 0.14) + ')';
    cx.lineWidth = 1 + Math.random() * 2.0;
    cx.beginPath();
    cx.moveTo(0, ly);
    cx.lineTo(S, ly + (Math.random() - 0.5) * 16);
    cx.stroke();
  }

  // Subtle corner darkening so edges feel more worn.
  var g = cx.createRadialGradient(S * 0.5, S * 0.6, S * 0.05, S * 0.5, S * 0.6, S * 0.9);
  g.addColorStop(0, 'rgba(255,255,255,0.0)');
  g.addColorStop(1, 'rgba(0,0,0,0.22)');
  cx.fillStyle = g;
  cx.fillRect(0, 0, S, S);

  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeFloorBumpTex() {
  var S = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');

  // Height map: mid gray baseline
  cx.fillStyle = '#808080';
  cx.fillRect(0, 0, S, S);

  // Small noise
  for (var i = 0; i < 26000; i++) {
    var v = Math.floor(110 + Math.random() * 80); // 110..190
    var a = 0.02 + Math.random() * 0.06;
    cx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')';
    cx.fillRect(Math.random() * S, Math.random() * S, 1.0 + Math.random() * 1.6, 1.0 + Math.random() * 1.6);
  }

  // Directional micro scratches
  for (var j = 0; j < 500; j++) {
    var x0 = Math.random() * S;
    var y0 = Math.random() * S;
    var len = 6 + Math.random() * 22;
    var ang = (Math.random() - 0.5) * Math.PI * 0.25;
    cx.strokeStyle = 'rgba(15,15,15,' + (0.03 + Math.random() * 0.10) + ')';
    cx.lineWidth = 0.8 + Math.random() * 1.4;
    cx.beginPath();
    cx.moveTo(x0, y0);
    cx.lineTo(x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len);
    cx.stroke();
  }

  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Wall micro-surface bump: subtler than floor (less relief, shallower scratches)
function makeWallBumpTex() {
  var S = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');

  // Height map: neutral mid-gray baseline
  cx.fillStyle = '#808080';
  cx.fillRect(0, 0, S, S);

  // Gentle surface noise (fewer & smaller than floor)
  for (var i = 0; i < 10000; i++) {
    var v = Math.floor(118 + Math.random() * 60); // 118..178 — narrower range = shallower bumps
    var a = 0.015 + Math.random() * 0.04;
    cx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')';
    cx.fillRect(Math.random() * S, Math.random() * S, 1.0 + Math.random() * 2.0, 1.0 + Math.random() * 2.0);
  }

  // Very fine vertical streaks (plaster / paint texture)
  for (var j = 0; j < 180; j++) {
    var x0 = Math.random() * S;
    var len = 8 + Math.random() * 30;
    var ang = (Math.PI * 0.5) + (Math.random() - 0.5) * 0.15; // near-vertical
    cx.strokeStyle = 'rgba(20,20,20,' + (0.02 + Math.random() * 0.06) + ')';
    cx.lineWidth = 0.5 + Math.random() * 1.0;
    cx.beginPath();
    cx.moveTo(x0, Math.random() * S);
    cx.lineTo(x0 + Math.cos(ang) * len, Math.random() * S + Math.sin(ang) * len);
    cx.stroke();
  }

  // Very soft corner darkening (lower edges feel slightly more worn)
  var g = cx.createRadialGradient(S * 0.5, S, S * 0.05, S * 0.5, S, S * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = g;
  cx.fillRect(0, 0, S, S);

  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Ceiling light shaft texture (vertical gradient).
function makeLightShaftTex() {
  var W = 64, H = 256;
  var cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  var cx = cv.getContext('2d');
  cx.clearRect(0, 0, W, H);

  // Soft core + wider falloff.
  for (var y = 0; y < H; y++) {
    var t = y / (H - 1); // 0 at top, 1 at bottom
    // Brighter in the mid (feels like haze in the ray)
    var a = 0.00 + Math.max(0, 1 - Math.abs(t - 0.58) / 0.40) * 0.55;
    // Side fade (fake volumetric width)
    for (var x = 0; x < W; x++) {
      var dx = Math.abs(x - W * 0.5) / (W * 0.5);
      var side = Math.max(0, 1 - dx);
      var alpha = a * side * 0.65;
      var v = 255;
      cx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + alpha + ')';
      cx.fillRect(x, y, 1, 1);
    }
  }

  var t = new THREE.CanvasTexture(cv);
  return t;
}

function rrect(cx, x, y, w, h, r) {
  cx.beginPath();
  cx.moveTo(x + r, y);
  cx.lineTo(x + w - r, y);
  cx.arcTo(x + w, y,     x + w, y + r,     r);
  cx.lineTo(x + w, y + h - r);
  cx.arcTo(x + w, y + h, x + w - r, y + h, r);
  cx.lineTo(x + r, y + h);
  cx.arcTo(x, y + h,     x, y + h - r,     r);
  cx.lineTo(x, y + r);
  cx.arcTo(x, y,         x + r, y,         r);
  cx.closePath();
}

function makeOutletTex() {
  var cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#e2ddd6'; cx.fillRect(0, 0, 128, 128);
  cx.strokeStyle = '#b8b2aa'; cx.lineWidth = 2;
  cx.strokeRect(5, 5, 118, 118);
  cx.strokeStyle = '#a8a29a'; cx.lineWidth = 1.2;
  rrect(cx, 13, 13, 102, 102, 7); cx.stroke();
  cx.fillStyle = '#1e1a16';
  cx.fillRect(40, 25, 9, 20);
  cx.fillRect(79, 25, 9, 20);
  cx.beginPath(); cx.arc(64, 74, 9, 0, Math.PI * 2); cx.fill();
  cx.fillStyle = '#8a857e';
  [[22,22],[106,22],[22,106],[106,106]].forEach(function (p) {
    cx.beginPath(); cx.arc(p[0], p[1], 5, 0, Math.PI * 2); cx.fill();
    cx.strokeStyle = '#6a6560'; cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(p[0]-4,p[1]); cx.lineTo(p[0]+4,p[1]); cx.stroke();
    cx.beginPath();
    cx.moveTo(p[0],p[1]-4); cx.lineTo(p[0],p[1]+4); cx.stroke();
  });
  return new THREE.CanvasTexture(cv);
}

function makeSwitchTex(n) {
  n = n || 1;
  var W2 = 72 + n * 48;
  var H2 = 114;
  var cv = document.createElement('canvas');
  cv.width = W2; cv.height = H2;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#e4e0d8'; cx.fillRect(0, 0, W2, H2);
  cx.strokeStyle = '#c0bab0'; cx.lineWidth = 1.8;
  cx.strokeRect(4, 4, W2 - 8, H2 - 8);
  var i, sx, isOn;
  for (i = 0; i < n; i++) {
    sx   = 36 + i * 48;
    isOn = Math.random() > 0.4;
    cx.fillStyle = '#d0ccc4';
    rrect(cx, sx-14, 24, 28, 66, 5); cx.fill();
    cx.strokeStyle = '#aca8a0'; cx.lineWidth = 1.2;
    rrect(cx, sx-14, 24, 28, 66, 5); cx.stroke();
    cx.fillStyle = isOn ? '#eeeae4' : '#b8b4ae';
    rrect(cx, sx-10, isOn ? 28 : 52, 20, 24, 3); cx.fill();
    if (isOn) {
      cx.fillStyle = 'rgba(60,190,60,0.88)';
      cx.beginPath();
      cx.arc(sx, 78, 4, 0, Math.PI * 2); cx.fill();
    }
  }
  cx.fillStyle = '#9a958e';
  [[14,14],[W2-14,14],[14,H2-14],[W2-14,H2-14]].forEach(
    function (p) {
      cx.beginPath();
      cx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = '#6a6560'; cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(p[0]-4,p[1]); cx.lineTo(p[0]+4,p[1]); cx.stroke();
      cx.beginPath();
      cx.moveTo(p[0],p[1]-4); cx.lineTo(p[0],p[1]+4); cx.stroke();
    }
  );
  return new THREE.CanvasTexture(cv);
}

function makeExitTex() {
  var cv = document.createElement('canvas');
  cv.width = 256; cv.height = 96;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#162216'; cx.fillRect(0, 0, 256, 96);
  cx.strokeStyle = 'rgba(70,210,70,0.85)'; cx.lineWidth = 2.5;
  cx.strokeRect(3, 3, 250, 90);
  cx.fillStyle = 'rgba(70,210,70,0.95)';
  cx.beginPath();
  cx.moveTo(28,48); cx.lineTo(56,32); cx.lineTo(56,43);
  cx.lineTo(76,43); cx.lineTo(76,53); cx.lineTo(56,53);
  cx.lineTo(56,64); cx.closePath(); cx.fill();
  cx.font         = 'bold 36px Arial';
  cx.fillStyle    = 'rgba(70,210,70,0.98)';
  cx.textAlign    = 'center';
  cx.textBaseline = 'middle';
  cx.fillText('EXIT', 160, 50);
  return new THREE.CanvasTexture(cv);
}

function makeEmergTex() {
  var cv = document.createElement('canvas');
  cv.width = 192; cv.height = 72;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#081408'; cx.fillRect(0, 0, 192, 72);
  cx.strokeStyle = 'rgba(50,220,50,0.85)'; cx.lineWidth = 2;
  cx.strokeRect(3, 3, 186, 66);
  // Running man
  cx.fillStyle = 'rgba(50,220,50,0.95)';
  cx.beginPath();
  cx.moveTo(18,36); cx.lineTo(38,25); cx.lineTo(38,33);
  cx.lineTo(52,33); cx.lineTo(52,40); cx.lineTo(38,40);
  cx.lineTo(38,48); cx.closePath(); cx.fill();
  // EXIT text
  cx.font = 'bold 26px Arial';
  cx.fillStyle = 'rgba(50,220,50,1.0)';
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText('EXIT', 128, 38);
  return new THREE.CanvasTexture(cv);
}

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */
function matStd(col, rough, metal, opts) {
  var o = Object.assign(
    { color: col, roughness: rough, metalness: metal },
    opts || {}
  );
  return new THREE.MeshStandardMaterial(o);
}

function mkMesh(geo, mat) {
  var m = new THREE.Mesh(geo, mat);
  m.castShadow    = true;
  m.receiveShadow = true;
  return m;
}
/* ----------------------------------------------------------
   Drop-shadow helper  (gradient blob, replaces solid circle)
---------------------------------------------------------- */
var _shadowTexCache = null;
function getShadowTex() {
  if (_shadowTexCache) return _shadowTexCache;
  var S = 256;
  var cv = document.createElement('canvas');
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
  _shadowTexCache = new THREE.CanvasTexture(cv);
  return _shadowTexCache;
}

/* rx, rz = half-extents; opacity = overall master opacity */
function makeDropShadow(rx, rz, opacity) {
  opacity = (opacity !== undefined) ? opacity : 0.58;
  var mat = new THREE.MeshBasicMaterial({
    map: getShadowTex(),
    transparent: true,
    opacity: opacity,
    depthWrite: false
  });
  var shd = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2.4, rz * 2.4), mat);
  shd.rotation.x = -Math.PI / 2;
  shd.position.y  = 0.004;
  return shd;
}


/* ----------------------------------------------------------
   Wall details
---------------------------------------------------------- */
function addDetails(grp, axis, side, len, H2, hw2, hd2, R2) {
  var oMat = new THREE.MeshStandardMaterial({
    map: makeOutletTex(), roughness: 0.75, metalness: 0.07
  });
  var sMat = new THREE.MeshStandardMaterial({
    map: makeSwitchTex(1 + Math.floor(R2() * 2)),
    roughness: 0.72, metalness: 0.06
  });
  var eMat = new THREE.MeshStandardMaterial({
    map: makeEmergTex(),
    roughness: 0.5, metalness: 0.15,
    emissive: new THREE.Color(0.3, 0.9, 0.2),
    emissiveIntensity: 3.5
  });
  var rotY = axis === 0
    ? (side > 0 ? 0 : Math.PI)
    : (side > 0 ? -Math.PI / 2 : Math.PI / 2);
  var wallZ = axis === 0 ? side * hd2 : side * hw2;
  var i, cp;
  var oc = 3 + Math.floor(R2() * 3);
  for (i = 0; i < oc; i++) {
    cp = -len / 2 + len / (oc + 1) * (i + 1);
    var om = mkMesh(
      new THREE.PlaneGeometry(0.14, 0.14), oMat
    );
    if (axis === 0) {
      om.position.set(cp, 0.32, wallZ);
    } else {
      om.position.set(wallZ, 0.32, cp);
    }
    om.rotation.y = rotY;
    grp.add(om);
  }
  [-len/2 + 0.75, len/2 - 0.75].forEach(function (sp) {
    var sm = mkMesh(
      new THREE.PlaneGeometry(0.17, 0.24), sMat
    );
    if (axis === 0) {
      sm.position.set(sp, 1.1, wallZ);
    } else {
      sm.position.set(wallZ, 1.1, sp);
    }
    sm.rotation.y = rotY;
    grp.add(sm);
  });
  var em = mkMesh(
    new THREE.PlaneGeometry(0.44, 0.22), eMat
  );
  if (axis === 0) {
    em.position.set(0, H2 - 0.45, wallZ);
  } else {
    em.position.set(wallZ, H2 - 0.45, 0);
  }
  em.rotation.y = rotY;
  grp.add(em);
  var el = new THREE.PointLight(0xffe090, 0.35, 3.5, 2.2);
  if (axis === 0) {
    el.position.set(0, H2 - 0.3, side * hd2 * 0.95);
  } else {
    el.position.set(side * hw2 * 0.95, H2 - 0.3, 0);
  }
  grp.add(el);
}

/* ----------------------------------------------------------
   _makeGLTFLoader — DRACOLoader 付き GLTFLoader を生成する共通ヘルパー
   Draco 圧縮 GLB（家具等）を正しく読み込むために必要。
---------------------------------------------------------- */
var _sharedDracoLoader = null;
function _makeGLTFLoader() {
  var l = new THREE.GLTFLoader();
  if (typeof THREE.DRACOLoader !== 'undefined') {
    if (!_sharedDracoLoader) {
      _sharedDracoLoader = new THREE.DRACOLoader();
      _sharedDracoLoader.setDecoderPath(
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/'
      );
    }
    l.setDRACOLoader(_sharedDracoLoader);
  }
  return l;
}

/* ----------------------------------------------------------
   preloadGLBProps — 家具・備品GLBを並列プリロード
   init.js の loadRoomProps から呼び出される。
   全件ロード完了（失敗含む）後に onDone() を呼ぶ。
---------------------------------------------------------- */
var _GLB_PROP_NAMES = [
  'sofa1','sofa2','sofa3','sofa4',
  'table1','table2','table3','table4',
  'bench','wooden_storage_shelf',
  'taru','kusa','beach_ball','traffic_cone',
  'barrier','bird','swing','kaidan'
];

function preloadGLBProps(onProgress, onDone) {
  var loader = _makeGLTFLoader();
  var toLoad  = _GLB_PROP_NAMES.concat(['unicon']);
  var total   = toLoad.length;
  var remain  = total;

  function _done() {
    remain--;
    if (typeof onProgress === 'function') onProgress(total - remain, total);
    if (remain <= 0 && typeof onDone === 'function') onDone();
  }

  toLoad.forEach(function(name) {
    loader.load(
      'glb/' + name + '.glb',
      function(gltf) {
        if (name === 'unicon') {
          window._unicornGLTF = gltf;
        } else {
          if (!window._glbCache) window._glbCache = {};
          window._glbCache[name] = gltf;
        }
        _done();
      },
      null,
      function(err) {
        console.warn('[preloadGLBProps] ' + name + '.glb load failed:', err);
        _done();
      }
    );
  });
}

// ============================================================
//  WALL PAINTINGS
// ============================================================
function buildFramedPainting(R2, palWr, palWg, palWb) {
  var g = new THREE.Group();
  var fw = 0.7 + R2() * 1.8;
  var fh = 0.55 + R2() * 1.4;
  var thick = 0.045;

  // Frame material — dark wood / gilt / minimal white
  var frameStyles = [
    matStd(0x2a1e0e, 0.7, 0.05),  // dark wood
    matStd(0xc8a830, 0.25, 0.65),  // gilt
    matStd(0x111111, 0.55, 0.35),  // black metal
    matStd(0xf0ede8, 0.80, 0.02)   // white minimal
  ];
  var fMat = frameStyles[Math.floor(R2() * frameStyles.length)];

  // Four frame bars
  var bars = [
    [fw + thick*2, thick, thick,  0,        fh/2 + thick/2, 0],
    [fw + thick*2, thick, thick,  0,       -fh/2 - thick/2, 0],
    [thick,        fh,    thick, -fw/2 - thick/2, 0,        0],
    [thick,        fh,    thick,  fw/2 + thick/2, 0,        0]
  ];
  bars.forEach(function(b) {
    var m = mkMesh(new THREE.BoxGeometry(b[0],b[1],b[2]), fMat.clone());
    m.position.set(b[3],b[4],b[5]); g.add(m);
  });

  // Canvas texture — painting styles
  var cv = document.createElement('canvas');
  var px = 512, py = Math.floor(512 * fh / fw);
  cv.width = px; cv.height = py;
  var cx = cv.getContext('2d');
  var style = Math.floor(R2() * 6);
  var bg = [Math.floor(R2()*30+220), Math.floor(R2()*30+210), Math.floor(R2()*30+200)];

  if (style === 0) {
    // Abstract colour field (Rothko-ish)
    var c1 = [Math.floor(R2()*255), Math.floor(R2()*180), Math.floor(R2()*120)];
    var c2 = [Math.floor(R2()*80), Math.floor(R2()*80), Math.floor(R2()*255)];
    cx.fillStyle = 'rgb('+c1+')'; cx.fillRect(0,0,px,py);
    cx.fillStyle = 'rgba('+c2[0]+','+c2[1]+','+c2[2]+',0.72)';
    cx.fillRect(px*0.08, py*0.2, px*0.84, py*0.3);
    cx.fillStyle = 'rgba('+Math.floor(R2()*255)+','+Math.floor(R2()*200)+','+Math.floor(R2()*100)+',0.55)';
    cx.fillRect(px*0.06, py*0.55, px*0.88, py*0.28);
  } else if (style === 1) {
    // Landscape silhouette
    cx.fillStyle = 'rgb('+Math.floor(R2()*40+8)+','+Math.floor(R2()*30+12)+','+Math.floor(R2()*60+30)+')';
    cx.fillRect(0,0,px,py);
    // Sky gradient
    var sg = cx.createLinearGradient(0,0,0,py*0.6);
    sg.addColorStop(0,'rgba('+Math.floor(R2()*80+20)+','+Math.floor(R2()*40+10)+','+Math.floor(R2()*120+40)+',1)');
    sg.addColorStop(1,'rgba('+Math.floor(R2()*200+50)+','+Math.floor(R2()*100+30)+','+Math.floor(R2()*60+20)+',1)');
    cx.fillStyle=sg; cx.fillRect(0,0,px,py*0.65);
    // Ground
    cx.fillStyle='rgba('+Math.floor(R2()*30)+','+Math.floor(R2()*30)+','+Math.floor(R2()*20)+',1)';
    cx.fillRect(0,py*0.6,px,py*0.4);
    // Moon/sun
    cx.fillStyle='rgba(255,240,180,0.9)';
    cx.beginPath(); cx.arc(px*(0.2+R2()*0.6), py*(0.1+R2()*0.25), px*0.04+R2()*px*0.03, 0, Math.PI*2); cx.fill();
    // Tree silhouettes
    for (var ti=0; ti<3+Math.floor(R2()*4); ti++) {
      var tx=R2()*px, th=py*(0.15+R2()*0.25), tw=px*0.03;
      cx.fillStyle='rgba(10,8,6,0.9)';
      cx.fillRect(tx-tw/2, py*0.6-th, tw, th);
      cx.beginPath(); cx.arc(tx, py*0.6-th, tw*2.5, 0, Math.PI*2); cx.fill();
    }
  } else if (style === 2) {
    // Geometric abstract (Mondrian-ish)
    cx.fillStyle='#f8f4ee'; cx.fillRect(0,0,px,py);
    var cols3 = ['#c8201c','#1a3a7c','#f0c020','#111111'];
    for (var ri=0; ri<3+Math.floor(R2()*4); ri++) {
      cx.fillStyle=cols3[Math.floor(R2()*cols3.length)];
      cx.fillRect(Math.floor(R2()*px*0.7), Math.floor(R2()*py*0.7), px*(0.1+R2()*0.4), py*(0.08+R2()*0.35));
    }
    cx.strokeStyle='#111'; cx.lineWidth=6;
    for (var li=0; li<5+Math.floor(R2()*4); li++) {
      cx.beginPath();
      if (R2()>0.5) { cx.moveTo(Math.floor(R2()*px),0); cx.lineTo(Math.floor(R2()*px),py); }
      else          { cx.moveTo(0,Math.floor(R2()*py)); cx.lineTo(px,Math.floor(R2()*py)); }
      cx.stroke();
    }
  } else if (style === 3) {
    // Portrait-like abstract face
    cx.fillStyle='rgb('+bg+')'; cx.fillRect(0,0,px,py);
    var fc=[Math.floor(R2()*60+180),Math.floor(R2()*40+160),Math.floor(R2()*40+140)];
    cx.fillStyle='rgb('+fc+')';
    cx.beginPath(); cx.ellipse(px/2,py/2,px*0.22,py*0.32,0,0,Math.PI*2); cx.fill();
    cx.fillStyle='rgba(30,20,15,0.8)';
    cx.beginPath(); cx.ellipse(px*0.42,py*0.42,px*0.04,py*0.055,0,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.ellipse(px*0.58,py*0.42,px*0.04,py*0.055,0,0,Math.PI*2); cx.fill();
    cx.strokeStyle='rgba(30,20,15,0.6)'; cx.lineWidth=8;
    cx.beginPath(); cx.arc(px/2,py*0.56,px*0.06,0.15,Math.PI-0.15); cx.stroke();
  } else if (style === 4) {
    // All-over texture marks (Pollock-ish)
    cx.fillStyle='rgb('+Math.floor(R2()*30+8)+','+Math.floor(R2()*20+4)+','+Math.floor(R2()*20+4)+')';
    cx.fillRect(0,0,px,py);
    for (var si=0; si<18+Math.floor(R2()*20); si++) {
      cx.strokeStyle='rgba('+Math.floor(R2()*255)+','+Math.floor(R2()*255)+','+Math.floor(R2()*200)+','+(0.4+R2()*0.55)+')';
      cx.lineWidth = 1+R2()*4; cx.beginPath();
      var sx=R2()*px, sy=R2()*py;
      cx.moveTo(sx,sy);
      for (var k=0; k<4+Math.floor(R2()*6); k++) { cx.lineTo(sx+R2()*px*0.4-px*0.2, sy+R2()*py*0.4-py*0.2); }
      cx.stroke();
    }
  } else {
    // Minimalist — single shape on white
    cx.fillStyle='#f6f3ee'; cx.fillRect(0,0,px,py);
    var mc=[Math.floor(R2()*100),Math.floor(R2()*100),Math.floor(R2()*100)];
    cx.fillStyle='rgba('+mc+',0.88)';
    var ms = Math.floor(R2()*3);
    if (ms===0) { cx.beginPath(); cx.arc(px/2,py/2,Math.min(px,py)*0.25,0,Math.PI*2); cx.fill(); }
    else if (ms===1) { cx.fillRect(px*0.25,py*0.2,px*0.5,py*0.6); }
    else { cx.beginPath(); cx.moveTo(px/2,py*0.2); cx.lineTo(px*0.8,py*0.8); cx.lineTo(px*0.2,py*0.8); cx.closePath(); cx.fill(); }
  }

  var canvas_mesh = mkMesh(new THREE.BoxGeometry(fw, fh, 0.012),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv), roughness:0.88, metalness:0.0 }));
  canvas_mesh.position.z = thick/2 + 0.006;
  g.add(canvas_mesh);

  // Spotlight above painting
  var spl = new THREE.SpotLight(0xfff4e0, 1.6, fh * 4.5, Math.PI/7, 0.35, 1.8);
  spl.position.set(0, fh/2 + 1.1, 0.6);
  spl.target.position.set(0, 0, 0);
  g.add(spl); g.add(spl.target);

  return g;
}

function addWallPaintings(grp, W, D, H, hw, hd, R2, pal, doorInfo) {
  doorInfo = doorInfo || {};
  var n = 1 + Math.floor(R2() * 3);
  var INSET = WALL_T / 2 + 0.008;

  // Conservative bounds to avoid overlapping the door opening.
  // (buildFramedPainting sizes vary with R2; we approximate with the maximum half extents.)
  var paintHalfW = 1.35; // approx half of (fw + frame)
  var paintHalfH = 1.10; // approx half of (fh + frame)
  var overlapGap = 0.10; // extra safety space

  function pickPaintY(isDoorWall) {
    var baseY = H * (0.42 + R2() * 0.2);
    if (!isDoorWall) return baseY;

    // Door opening spans y:[0 .. DOOR_H] at each door location.
    var minY = paintHalfH + 0.05;
    var maxY = H - paintHalfH - 0.05;
    var above = doorInfo.DOOR_H + paintHalfH + overlapGap;
    var below = doorInfo.DOOR_H - paintHalfH - overlapGap;

    if (above <= maxY) return above + (R2() - 0.5) * 0.15;
    if (below >= minY) return below + (R2() - 0.5) * 0.15;
    // Fallback: clamp
    return Math.max(minY, Math.min(maxY, baseY));
  }

  var wallDefs = [
    // Front wall (z = -hd): always has a door.
    { name:'front', axis:'z', pos:-hd+INSET, rotY:0,          len:W, doorExists:true,               doorCenterX:doorInfo.frontDX || 0 },
    // Back wall (z = +hd): only if generated.
    { name:'back',  axis:'z', pos: hd-INSET, rotY:Math.PI,    len:W, doorExists:!!doorInfo.hasDoorBack, doorCenterX:doorInfo.backDX  || 0 },
    // Left wall (x = -hw)
    { name:'left',  axis:'x', pos:-hw+INSET, rotY:Math.PI/2,  len:D, doorExists:!!doorInfo.hasDoorLeft, doorCenterZ:doorInfo.leftDZ   || 0 },
    // Right wall (x = +hw)
    { name:'right', axis:'x', pos: hw-INSET, rotY:-Math.PI/2, len:D, doorExists:!!doorInfo.hasDoorRight,doorCenterZ:doorInfo.rightDZ  || 0 }
  ];
  // Shuffle walls
  for (var i=wallDefs.length-1; i>0; i--) {
    var j=Math.floor(R2()*(i+1)); var tmp=wallDefs[i]; wallDefs[i]=wallDefs[j]; wallDefs[j]=tmp;
  }
  for (var pi=0; pi<Math.min(n, wallDefs.length); pi++) {
    var wd = wallDefs[pi];
    var p = buildFramedPainting(R2, pal.wr, pal.wg, pal.wb);

    var hangY = pickPaintY(!!wd.doorExists);
    var offset = (R2()-0.5) * wd.len * 0.45;

    if (wd.doorExists) {
      var doorW = doorInfo.DOOR_W || 2.5;
      var limit = doorW / 2 + paintHalfW + overlapGap;
      var doorCenter = (wd.axis === 'z') ? (wd.doorCenterX || 0) : (wd.doorCenterZ || 0);

      // Re-roll a few times; if still overlapping, push to the nearest side.
      var tries = 0;
      while (tries < 6 && Math.abs(offset - doorCenter) < limit) {
        offset = (R2()-0.5) * wd.len * 0.45;
        tries++;
      }
      if (Math.abs(offset - doorCenter) < limit) {
        var dir = offset - doorCenter;
        if (dir === 0) dir = 1;
        offset = doorCenter + (dir > 0 ? 1 : -1) * (limit + 0.05);
      }
    }

    if (wd.axis==='z') p.position.set(offset, hangY, wd.pos);
    else               p.position.set(wd.pos, hangY, offset);
    p.rotation.y = wd.rotY;
    grp.add(p);
  }
}

// ============================================================
//  MYSTERIOUS MEMO
// ============================================================
var MEMO_TEXTS = [
  "day 47\n\nthe ceiling moved\nagain last night.\ni measured it.\n3cm lower than\nyesterday.\n\nI didn't tell anyone.",
  "note to self:\n\nif the door on the\nleft is the same door\nas the one on the right\nthen where did I go\nbetween them\n\n?",
  "9月18日\n\n今日また同じ部屋に\n戻ってきた気がする。\nでも家具の配置が\n微妙に違う。\n\n違う、よな。",
  "THINGS THAT ARE\nSTILL HERE:\n- the smell\n- the humming\n- me\n\nTHINGS THAT LEFT:\n- everything else",
  "she said the walls\nwere breathing.\n\nI told her walls\ndon't breathe.\n\nI can hear it now.\nshe was right.",
  "第三の廊下について\n\n地図には存在しない。\nでも毎朝そこを歩く。\n足音が二つ聞こえる。\n私は一人だ。",
  "light from\nnon-existent windows\n\nI have photographed it\n14 times.\n\nthe photos show\nonly darkness.\n\nstill I feel the warmth.",
  "あの部屋には\n何もなかった。\n\nだが帰宅すると\nポケットに石が入っていた。\n\n今日で11個目。",
  "FLOOR LOG:\n01 - normal\n02 - normal\n03 - longer than possible\n04 - see note 03\n05 - [no entry]\n06 - I don't remember 06\n07 - writing this in 06",
  "君へ\n\n会いたかった。\nでも鍵を持っていなかった。\nだから壁をつくった。\n\n——わかるはずの人へ",
  "the echoes arrive\nbefore the sound.\n\ni speak.\nthe echo waits.\nthe echo waits.\nthe echo says something different.",
  "inventory:\n- 1 chair (familiar)\n- 1 window (outside: inside)\n- 1 mirror\n (shows room without me)\n- 1 door (warm to touch)\n- me (unconfirmed)",
  "3:17am\n\n起きていた。\n天井に何か書いてある。\n読もうとすると\n電気が消える。\n\n内容は知っている気がする。",
  "day 112\n\nfound a staircase\nthat only goes up.\n\nI have descended it\nthree times.",
  "扉の数を数えた。\n行きは14枚。\n帰りは9枚。\n\n5枚はどこへ行った。\n\nいや——\n私がどこへ行ったのか。",
  "MEMO:\n\nthe room at the end\nof the hall\n\nis the same room\nas the one at the start.\n\nbut the clock shows\na different time.\n\nalways 4 minutes ahead.",
  "誰かがここで\n食事をしていた。\n\nテーブルに皿が二枚。\nまだ温かい。\n\n私はずっと一人で\nここにいる。",
  "the compass\npoints to the wall.\n\nnot north.\n\nTHE WALL.\n\ni have stopped\nquestioning it.\ni follow the wall now.",
  "10月某日\n\n窓の外に廊下がある。\nここは三階のはずだ。\n\n廊下を歩く人影が見えた。\n顔はこちらを向いていた。\nずっと向いていた。",
  "note:\n\nthe blueprints show\n12 rooms.\n\nI have been in\nat least 19.\n\nsome of them\nI have been in before.\n\nnone of them\nfeel like before.",
  "声が聞こえた。\n名前を呼んでいた。\n\n私の名前ではなかった。\n\nでも振り返った。\n\nなぜ振り返ったのか\nまだわからない。",
  "EXIT LOG:\nattempt 01 - returned to start\nattempt 02 - returned to start\nattempt 03 - found new room\nattempt 04 - [unknown]\nattempt 05 - writing this\n\n(this is not the start)",
  "壁に文字が刻まれていた。\n\n读んだ。\n意味はわからなかった。\n\n翌朝、自分の手に\n同じ文字があった。\n\n筆跡は私のものだった。",
  "the shadows here\ndo not match\nthe lights.\n\nI drew a map\nof the shadows instead.\n\nit looks like\na floor plan.\n\na different building.",
  "記録 —— 通路Cについて\n\n長さ：測定不能\n温度：廊下より2度低い\n音：自分の足音のみ\n　　（ただし歩数が合わない）\n\n次の調査は見合わせる。",
  "she left a note\non the door.\n\nit said:\n'don't look for the window'\n\nthere are no windows\nin this building.\n\nthere never were.\n\nI have been\nlooking for the window.",
  "今日発見したこと：\n\nこの建物には影がない。\n外から見ると\nたしかにそこにある。\n\nでも地面に影が落ちない。\n\n私の影も\n最近薄くなった気がする。",
  "day 89\n\nI counted the steps\nbetween room 7 and room 8.\n\nThere were 47.\n\nYesterday there were 31.\n\nTomorrow I might not reach it at all.",
"鏡に映る私は\nいつも半歩遅れて動く。\n\n今朝、初めて\n私が先に動いた。\n\n鏡の中の私は\nまだ動いていない。",
"夜中に目が覚めた。\n誰かが私の名前を\n小声で呼んでいた。\n\nでもこの建物に\n私の名前を知っている人は\nいないはずだ。",
"FOUND:\n- a pair of glasses\n  (prescription matches mine)\n- a watch stopped at 4:12\n- my own handwriting\n  on a note I don't remember writing\n\nLOST:\n- the concept of 'outside'",
"この廊下は\n曲がり角が多すぎる。\n\n地図では直線のはずなのに。\n\n曲がるたび、\n自分の背後から\n自分の足音が聞こえる。",
"4時を過ぎると\n電灯が全部\n赤みを帯びる。\n\n理由はわからない。\n\nただ、その赤い光の下では\n自分の手が\n誰かの手のように見える。",
"note to self:\n\ndo not drink from the faucet\nin the blue bathroom.\n\nthe water tastes like\nmy childhood bedroom.\n\nI have never lived\nin a blue bathroom.",
"階段を上っているのに\n窓の外の景色が\nどんどん下に沈んでいく。\n\n私はまだ上っている。\n\nそれとも建物の方が\n沈んでいるのか。",
"壁に耳を当ててみた。\n\n向こう側で\n誰かが同じように\n壁に耳を当てていた。\n\n息のタイミングが\n完全に一致した。",
"今日、部屋の隅に\n自分のコートが落ちていた。\n\n私は今もコートを着ている。\n\n二着目だ。\n\n中にはまだ体温が残っていた。",
"the clock in the lobby\nhas no hands.\n\nyet every hour\nI hear it chime.\n\n13 times.",
"通路の端に\n「ここから先は戻れない」\nと書かれた札が下がっていた。\n\n私はその札を\n昨日も見た。\n\n場所が違っていた。",
"夢の中でこの建物の\n完全な設計図を見た。\n\n起きたらポケットに\n同じ設計図が入っていた。\n\nただし、私のいる位置に\n×印が書かれていた。",
"声がする。\n『もう帰ろう』と。\n\nでも私はまだ\nここに来た覚えがない。\n\n帰るところなど\n最初からなかったのに。",
"inventory update:\n- 1 shadow (mine?)\n- 17 doors that lead to the same corridor\n- 1 memory that doesn't belong to me\n- the feeling that I'm late for something\n  I never agreed to",
"午前2時\n\n天井から\nゆっくりと\n私の名前が落ちてきた。\n\n文字はまだ湿っていた。",
"この部屋の家具は\n全部私が生まれる前に\n作られたものだ。\n\nなのに傷や汚れが\n私の生活の痕跡と\n完全に一致する。",
"I tried to leave a trail\nof breadcrumbs.\n\nthey disappeared one by one.\n\nthen I found them\narranged into an arrow\npointing deeper inside.",
"日付が変わる瞬間、\nすべての部屋の扉が\n同時にノックされた。\n\n私はどの部屋にも\nいなかったはずなのに。",
"壁紙の模様が\n少しずつ私の記憶を\n再現し始めている。\n\n今朝、子供の頃の\n飼っていた犬の姿が\n浮かび上がっていた。\n\n犬は私を見ていた。",
"最後に見た出口の札には\n『出口まであと 0m』\nと書いてあった。\n\nそれから何時間歩いても\nまだ『あと 0m』のまま。"
];

function buildMemoNote(R2) {
  var g = new THREE.Group();
  var paperW = 0.22, paperH = 0.28, paperT = 0.006;
  // Yellowed paper
  var pv = Math.floor(R2() * 3);
  var paperCol = pv===0 ? 0xf5f0e0 : (pv===1 ? 0xe8e0cc : 0xf2ece0);
  var paper = mkMesh(new THREE.BoxGeometry(paperW, paperH, paperT),
    matStd(paperCol, 0.88, 0.0));
  g.add(paper);
  // Pin / tape
  var pin = mkMesh(new THREE.SphereGeometry(0.012, 8, 6),
    new THREE.MeshStandardMaterial({color:0xcc2020,roughness:0.4,metalness:0.3,
      emissive:new THREE.Color(0x880000),emissiveIntensity:0.4}));
  pin.position.set(0, paperH/2 - 0.02, paperT/2 + 0.012); g.add(pin);
  // Faint ruled lines
  var lineTex = document.createElement('canvas');
  lineTex.width=128; lineTex.height=160;
  var ltx = lineTex.getContext('2d');
  ltx.fillStyle='#f5f0e0'; ltx.fillRect(0,0,128,160);
  ltx.strokeStyle='rgba(100,80,60,0.18)'; ltx.lineWidth=1;
  for (var li=18; li<160; li+=14) { ltx.beginPath(); ltx.moveTo(8,li); ltx.lineTo(120,li); ltx.stroke(); }
  var linesMat = new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(lineTex), roughness:0.88});
  var face = mkMesh(new THREE.PlaneGeometry(paperW*0.9, paperH*0.9), linesMat);
  face.position.z = paperT/2 + 0.001; g.add(face);
  // Subtle fold crease
  var crease = mkMesh(new THREE.BoxGeometry(paperW, 0.003, 0.001), matStd(0xd0c8b0, 0.9, 0.0));
  crease.position.set(0, R2()*0.06-0.03, paperT/2+0.001); g.add(crease);
  return g;
}

// ============================================================
//  INTERACTABLE SYSTEM
// ============================================================
var roomInteractables = [];  // { type, worldPos, data, mesh, alive }
var activeBeams = [];        // { mesh, dir, speed, age }
var activeWaterSurfaces = []; // { rippleCv, rippleCx, rippleTex, causticLight, spouts, phase, sources }

var memoPopupEl   = document.getElementById('memo-popup');
var memoLabelEl   = document.getElementById('memo-label');
var shootBtnEl    = document.getElementById('shoot-btn');
var crosshairEl   = document.getElementById('crosshair-hit');

function clearInteractables() {
  /* 飛び道具・チャージエフェクトをプールに返却 */
  if (typeof clearCreatureAttacks === 'function') clearCreatureAttacks();
  // ★ クリーチャー音声ノードを先に切断してからリセット（WebAudioリーク防止）
  for (var _cai = 0; _cai < roomInteractables.length; _cai++) {
    _releaseCreatureAudio(roomInteractables[_cai]);
  }
  roomInteractables = [];
  activeBeams = [];
  // ★ 水面テクスチャを破棄（CanvasTextureはGPUに残り続ける）
  for (var _wsi = 0; _wsi < activeWaterSurfaces.length; _wsi++) {
    if (activeWaterSurfaces[_wsi].rippleTex) {
      activeWaterSurfaces[_wsi].rippleTex.dispose();
    }
  }
  activeWaterSurfaces = [];
  // ロック中クリーチャーのテザー・ライトを解放（combat.js管理）
  clearLockedCreatures();
  memoPopupEl.classList.remove('visible');
  memoLabelEl.classList.remove('visible');
  shootBtnEl.classList.remove('visible');
  crosshairEl.classList.remove('aimed');
}

function registerInteractable(type, worldX, worldY, worldZ, data, mesh) {
  var isInsect = !!(mesh && mesh.userData && mesh.userData.isInsect);
  /* ── モデル実寸 bodyH を取得し当たり判定半径を計算 ── */
  var bodyH = (mesh && mesh.userData && mesh.userData.bodyH)
              ? mesh.userData.bodyH
              : (isInsect ? 0.7 : 1.2);
  var it = {
    type:       type,
    pos:        new THREE.Vector3(worldX, worldY, worldZ),
    data:       data,
    mesh:       mesh,
    alive:      true,
    bodyH:      bodyH,
    /* aimRange / shootRange はモデル高さに比例させる */
    aimRange:   Math.max(12.0, bodyH * 10.0),
    shootRange: Math.max(10.0, bodyH *  9.0),
    /* sdLimit は fireBeam / updateInteractables で distance から動的計算するため
       ここでは最大値のみ保持（極近距離での上限として使用）*/
    sdLimit:    0.90
  };
  roomInteractables.push(it);
  // Try to attach audio immediately; if _audioReady is still false,
  // updateInteractables will retry lazily on the first frame after gesture.
  if (type === 'creature') _attachCreatureAudio(it);
}


shootBtnEl.addEventListener('click', fireBeam);
shootBtnEl.addEventListener('touchend', function(e) { e.preventDefault(); fireBeam(); }, {passive:false});

function updateInteractables(dt) {
  if (!currentRoom) return;
  var camPos = camera.position;
  var showMemo = false, showMemoText = '';
  var showShoot = false;

  // プラズマ引き寄せフェーズ更新
  updateLockedCreatures(dt);

  // Check proximity to interactables
  for (var i = 0; i < roomInteractables.length; i++) {
    var it = roomInteractables[i];
    if (!it.alive) continue;
    var d = camPos.distanceTo(it.pos);

    if (it.type === 'memo') {
      if (d < 3.5) {
        showMemo = true;
        showMemoText = it.data.text;
      }
    } else if (it.type === 'creature') {
      var aimRange   = it.aimRange;
      var shootRange = it.shootRange;
      if (d < aimRange) {
        // Check if aimed at creature (project to screen)
        _v3_cp.copy(it.pos).project(camera);
        var screenDist = Math.sqrt(_v3_cp.x*_v3_cp.x + _v3_cp.y*_v3_cp.y);
        var dynSd2 = Math.min(it.sdLimit, it.bodyH / Math.max(1.5, d));
        if (screenDist < dynSd2 && _v3_cp.z < 1.0 && d < shootRange) {
          showShoot = true;
        }
      }
      // Lazy-attach PositionalAudio if audio became ready after spawn
      if (!it._posAudio && _audioReady) _attachCreatureAudio(it);
      // Tick positional audio (interval-based playback)
      _tickCreatureAudio(it, dt);

      // Animate creature bob + eye flicker + wander
      if (it.mesh) {
        var ud = it.mesh.userData;
        ud.phase = (ud.phase || 0) + dt * 1.2;

        var _distToCam = it.mesh.position.distanceTo(camPos);
        var _nearAnim  = _distToCam < 22.0;  /* 22m以内のみフル更新 */

        if (_nearAnim) {
          it.mesh.position.y = ud.baseY + Math.sin(ud.phase) * 0.06;
        }

        // Eye flicker
        if (_nearAnim && ud.eyePl) {
          ud.eyePl.intensity = 1.2 + Math.sin(ud.phase * 3.1) * 0.4;
        }

        // ---- Insect-specific: leg scurry animation + player reaction ----
        if (ud.isInsect) {
          // Leg animation (カサカサ) — 近くのみ
          if (_nearAnim) {
            var lms = ud.legMeshes;
            if (lms) {
              var spd = ud.isAlert ? 9.5 : 5.8;
              var amp = ud.isAlert ? 0.32 : 0.22;
              for (var lii = 0; lii < lms.length; lii++) {
                var lm = lms[lii];
                var lph = ud.phase * spd + lm.userData.legPhaseOffset;
                lm.rotation.x = Math.sin(lph) * amp;
              }
            }
            // Eye glow pulse (red)
            if (ud.eyeMeshes && ud.eyeMeshes.length) {
              var baseInt = ud.eyeEmissiveBase || 8.0;
              var eyePulse = 1.0 + Math.sin(ud.phase * 10.0) * (ud.isAlert ? 0.35 : 0.22);
              var eyeInt = baseInt * eyePulse;
              for (var ei = 0; ei < ud.eyeMeshes.length; ei++) {
                var em = ud.eyeMeshes[ei];
                if (em && em.material) em.material.emissiveIntensity = eyeInt;
              }
            }
          }
          // Player proximity reaction
          var dToPlayer = _distToCam;
          if (dToPlayer < 8.0) {
            ud.isAlert = true;
            // Face toward/away from player
            var dxP = camPos.x - it.mesh.position.x;
            var dzP = camPos.z - it.mesh.position.z;
            if (dToPlayer < 5.0) {
              // Run away
              var awayLen = Math.sqrt(dxP*dxP + dzP*dzP);
              if (awayLen > 0.01) {
                var aspd = ud.alertSpeed || 0.04;
                it.mesh.position.x -= (dxP/awayLen) * aspd;
                it.mesh.position.z -= (dzP/awayLen) * aspd;
                // Clamp inside room
                if (currentRoom) {
                  it.mesh.position.x = Math.max(-currentRoom.hw+0.5, Math.min(currentRoom.hw-0.5, it.mesh.position.x));
                  it.mesh.position.z = Math.max(-currentRoom.hd+0.5, Math.min(currentRoom.hd-0.5, it.mesh.position.z));
                }
                it.pos.set(it.mesh.position.x, it.pos.y, it.mesh.position.z);
              }
              // Face away from player
              var awayFacing = Math.atan2(-dxP, -dzP);
              var dfA = wrapAngle(awayFacing - it.mesh.rotation.y);
              it.mesh.rotation.y += dfA * Math.min(1.0, dt*4.5);
            } else {
              // Just turn to face player (watching)
              var watchFacing = Math.atan2(dxP, dzP);
              var dfW = wrapAngle(watchFacing - it.mesh.rotation.y);
              it.mesh.rotation.y += dfW * Math.min(1.0, dt*2.0);
            }
          } else {
            ud.isAlert = false;
          }
          // no stinger glow
        }

        // ---- Crystal: コア回転 + 発光パルス ----
        if (_nearAnim && ud.isCrystal) {
          if (ud.coreRef) {
            ud.coreRef.rotation.y = ud.phase * 0.8;
            ud.coreRef.rotation.z = Math.sin(ud.phase * 0.55) * 0.35;
          }
          if (ud.eyePl) {
            ud.eyePl.intensity = 1.8 + Math.sin(ud.phase * 4.2) * 0.9;
          }
        }

        // ---- Blob: 呼吸スケール + 内核グロウ ----
        if (_nearAnim && ud.isBlob) {
          if (ud.mainBlobRef) {
            var bScl = 1.0 + Math.sin(ud.phase * 2.1) * 0.07;
            ud.mainBlobRef.scale.y = bScl;
            ud.mainBlobRef.scale.x = 1.0 - (bScl - 1.0) * 0.5;
          }
          if (ud.innerRef && ud.innerRef.material) {
            ud.innerRef.material.emissiveIntensity = 2.8 + Math.sin(ud.phase * 5.0) * 1.6;
          }
          if (ud.eyePl) {
            ud.eyePl.intensity = 1.5 + Math.sin(ud.phase * 3.7) * 0.7;
          }
        }

        // ---- Wire: ノードフリッカー ----
        if (_nearAnim && ud.isWire) {
          if (ud.eyePl) {
            ud.eyePl.intensity = 1.2 + Math.abs(Math.sin(ud.phase * 6.0)) * 1.8;
          }
        }

        // ---- GLB Ghost: シェーダー uTime 更新 ----
        if (_nearAnim && ud.isGLBGhost) {
          if (ud.ghostBodyMat) ud.ghostBodyMat.uniforms.uTime.value = ud.phase;
          if (ud.ghostGlowMat) ud.ghostGlowMat.uniforms.uTime.value = ud.phase;
        }

        // ---- Slime: MarchingCubesメタボールアニメ（22m以内のみ、非常に重い）----
        if (_nearAnim && ud.isSlime && ud.mcRef) {
          var slimeMC = ud.mcRef;
          slimeMC.reset();
          // 中心ブロブ (呼吸パルス)
          var sCenterY   = 0.46 + Math.sin(ud.phase * 2.3) * 0.035;
          var sCenterStr = 0.44 + Math.sin(ud.phase * 1.9) * 0.09;
          slimeMC.addBall(0.5, sCenterY, 0.5, sCenterStr, 12);
          // 衛星ボール
          var sBalls = ud.ballCfgs;
          for (var sbi = 0; sbi < sBalls.length; sbi++) {
            var sbc   = sBalls[sbi];
            var sAng  = ud.phase * sbc.speed + sbc.phase;
            var sX    = 0.5 + Math.cos(sAng) * sbc.orbitR;
            var sY    = 0.5 + sbc.yOff + Math.sin(ud.phase * 1.4 + sbi * 1.1) * 0.045;
            var sZ    = 0.5 + Math.sin(sAng) * sbc.orbitR;
            slimeMC.addBall(sX, sY, sZ, sbc.str, sbc.sub);
          }
          // PointLight グロウ変化
          if (ud.eyePl) {
            ud.eyePl.intensity = 2.8 + Math.sin(ud.phase * 2.7) * 1.1;
          }
          // emissive パルス
          if (ud.mcMat) {
            ud.mcMat.emissiveIntensity = ud.slimePal.eInt * (0.72 + Math.sin(ud.phase * 3.3) * 0.30);
          }
        }

        // Wander toward target
        ud.wanderTimer -= dt;
        if (ud.wanderTimer <= 0) {
          // Pick new wandering destination within room
          var rwHW = Math.max(1.0, currentRoom.hw - 1.5);
          var rwHD = Math.max(1.0, currentRoom.hd - 1.5);
          ud.wanderTarget.set(
            (Math.random() - 0.5) * 2 * rwHW,
            0,
            (Math.random() - 0.5) * 2 * rwHD
          );
          ud.wanderTimer = (ud.isInsect ? 5.0 : 10.0) + Math.random() * (ud.isInsect ? 10.0 : 16.0);
        }

        // Insects only wander when not alert (not fleeing player)
        var canWander = !ud.isInsect || !ud.isAlert || it.mesh.position.distanceTo(camPos) >= 5.0;
        if (canWander) {
          var wdx = ud.wanderTarget.x - it.mesh.position.x;
          var wdz = ud.wanderTarget.z - it.mesh.position.z;
          var wdist = Math.sqrt(wdx * wdx + wdz * wdz);
          if (wdist > 0.15) {
            var sp = ud.wanderSpeed || 0.01;
            it.mesh.position.x += (wdx / wdist) * sp;
            it.mesh.position.z += (wdz / wdist) * sp;
            // Smoothly face movement direction
            var targetFacing = Math.atan2(wdx, wdz);
            var df = wrapAngle(targetFacing - it.mesh.rotation.y);
            it.mesh.rotation.y += df * Math.min(1.0, dt * 2.5);
            // Keep registered position in sync
            it.pos.set(it.mesh.position.x, it.pos.y, it.mesh.position.z);
          }
        }
      }
    }
  }

  // Update UI
  if (showMemo) {
    memoPopupEl.textContent = showMemoText;
    memoPopupEl.classList.add('visible');
    memoLabelEl.classList.remove('visible');
  } else {
    memoPopupEl.classList.remove('visible');
    // Show label if close but not reading distance
    var nearMemo = false;
    for (var j = 0; j < roomInteractables.length; j++) {
      if (roomInteractables[j].type==='memo' && roomInteractables[j].alive) {
        if (camPos.distanceTo(roomInteractables[j].pos) < 6.0) nearMemo = true;
      }
    }
    memoLabelEl.classList.toggle('visible', nearMemo);
  }
  shootBtnEl.classList.toggle('visible', showShoot);
  shootBtnEl.classList.toggle('glowing', showShoot);
  crosshairEl.classList.toggle('aimed', showShoot);
}

/* ----------------------------------------------------------
   GLBプロップ定数 — room_patches.js の buildGLBProp が参照する
---------------------------------------------------------- */
/* プロップ名 → ターゲットサイズ（m）の対応表 */
var GLB_PROP_SIZES = {
  sofa1: 2.2,  sofa2: 2.0,  sofa3: 2.4,  sofa4: 2.1,
  table1: 1.5, table2: 1.6, table3: 1.4, table4: 1.7,
  bench: 1.8,  wooden_storage_shelf: 2.0,
  taru: 1.2,   kusa: 1.2,   beach_ball: 0.8,
  traffic_cone: 0.8, barrier: 1.8, bird: 0.5, swing: 3.2,
  kaidan: 3.0, house: 6.0,  bus: 8.0
};

/* グロー付与時に使うカラーパレット */
var GLB_FANCY_COLORS = [
  0xff6688, 0x44ddff, 0x88ff44, 0xffaa00, 0xcc44ff,
  0xff4444, 0x44ffcc, 0x8844ff, 0xffff44, 0x4488ff,
  0xff8844, 0x44ff88, 0xdd44ff, 0x88ddff, 0xffcc44
];

/* ----------------------------------------------------------
   Room builder helpers
---------------------------------------------------------- */
var WALL_T = 0.18; // wall thickness in metres

function buildWallFB(grp, W, H, DOOR_W, DOOR_H, doorX, z, facingBack, matFn) {
  var sign = facingBack ? 1 : -1;
  var leftW  = W / 2 + doorX - DOOR_W / 2;
  var rightW = W / 2 - doorX - DOOR_W / 2;
  var topH   = H - DOOR_H;
  if (leftW > 0.01) {
    var m = mkMesh(new THREE.BoxGeometry(leftW, H, WALL_T), matFn());
    m.position.set(-W/2 + leftW/2, H/2, z); grp.add(m);
  }
  if (rightW > 0.01) {
    var m2 = mkMesh(new THREE.BoxGeometry(rightW, H, WALL_T), matFn());
    m2.position.set(W/2 - rightW/2, H/2, z); grp.add(m2);
  }
  if (topH > 0.01) {
    var m3 = mkMesh(new THREE.BoxGeometry(DOOR_W, topH, WALL_T), matFn());
    m3.position.set(doorX, DOOR_H + topH/2, z); grp.add(m3);
  }
}

function buildWallLR(grp, D, H, DOOR_W, DOOR_H, doorZ, x, isLeft, matFn) {
  var frontD = D / 2 + doorZ - DOOR_W / 2;
  var backD  = D / 2 - doorZ - DOOR_W / 2;
  var topH   = H - DOOR_H;
  if (frontD > 0.01) {
    var m = mkMesh(new THREE.BoxGeometry(WALL_T, H, frontD), matFn());
    m.position.set(x, H/2, -D/2 + frontD/2); grp.add(m);
  }
  if (backD > 0.01) {
    var m2 = mkMesh(new THREE.BoxGeometry(WALL_T, H, backD), matFn());
    m2.position.set(x, H/2, D/2 - backD/2); grp.add(m2);
  }
  if (topH > 0.01) {
    var m3 = mkMesh(new THREE.BoxGeometry(WALL_T, topH, DOOR_W), matFn());
    m3.position.set(x, DOOR_H + topH/2, doorZ); grp.add(m3);
  }
}

function addDoorGlow(grp, dx, dz, dh, rotY, color, inset) {
  // Default inset: push sign/lights away from wall along its inward normal.
  // rotY=0 → normal is +z; rotY=PI → -z; rotY=PI/2 → +x; rotY=-PI/2 → -x
  inset = (inset !== undefined) ? inset : 0.08;
  var nx = Math.sin(rotY) * inset;
  var nz = Math.cos(rotY) * inset;
  var px = dx + nx, pz = dz + nz;

  var c = new THREE.Color(color);
  // Glowing bar above door opening
  var mat = new THREE.MeshStandardMaterial({
    color: color, emissive: c, emissiveIntensity: 2.2,
    roughness: 0.2, transparent: true, opacity: 0.95, depthWrite: false
  });
  var bar = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.07), mat);
  bar.rotation.y = rotY;
  bar.position.set(px, dh + 0.07, pz);
  grp.add(bar);
  // Strong point light at door
  var pl = new THREE.PointLight(color, 3.5, 8.0, 1.8);
  pl.position.set(px, dh - 0.5, pz);
  grp.add(pl);
  var pl2 = new THREE.PointLight(color, 1.8, 5.5, 2.0);
  pl2.position.set(px, 0.8, pz);
  grp.add(pl2);
  // EXIT sign
  var ecv = document.createElement('canvas');
  ecv.width = 256; ecv.height = 96;
  var ecx = ecv.getContext('2d');
  ecx.fillStyle = '#0a1a0a'; ecx.fillRect(0, 0, 256, 96);
  ecx.strokeStyle = 'rgba(60,240,60,0.9)'; ecx.lineWidth = 2.5;
  ecx.strokeRect(3, 3, 250, 90);
  ecx.fillStyle = 'rgba(60,240,60,0.97)';
  ecx.beginPath();
  ecx.moveTo(26,48); ecx.lineTo(52,34); ecx.lineTo(52,44);
  ecx.lineTo(72,44); ecx.lineTo(72,54); ecx.lineTo(52,54);
  ecx.lineTo(52,64); ecx.closePath(); ecx.fill();
  ecx.font = 'bold 38px Arial';
  ecx.fillStyle = 'rgba(60,240,60,1.0)';
  ecx.textAlign = 'center'; ecx.textBaseline = 'middle';
  ecx.fillText('EXIT', 162, 50);
  var eg = ecx.createRadialGradient(162,50,0,162,50,80);
  eg.addColorStop(0,'rgba(60,240,60,0.08)'); eg.addColorStop(1,'rgba(0,0,0,0)');
  ecx.fillStyle = eg; ecx.fillRect(0,0,256,96);
  var exitMat = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(ecv),
    emissive: new THREE.Color(0x00cc00), emissiveIntensity: 4.5,
    roughness: 0.2
  });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.20), exitMat);
  sign.rotation.y = rotY;
  sign.position.set(px, dh + 0.32, pz);
  grp.add(sign);
  var sl = new THREE.PointLight(0x00ff44, 1.6, 4.0, 2.0);
  sl.position.set(px, dh + 0.32, pz);
  grp.add(sl);
}

/* ----------------------------------------------------------
   Room builder — 12 dramatic palettes + 白基調追加
---------------------------------------------------------- */
var PALETTES = [
  { wr:210,wg:204,wb:195, fr:90, fg:74, fb:58,  lc:0xffe8c0, li:1.4, ac:0xfff0d8, ai:0.50 },
  { wr:170,wg:180,wb:220, fr:80, fg:90, fb:130, lc:0x8090ff, li:1.8, ac:0x6070ee, ai:0.50 },
  { wr:185,wg:205,wb:195, fr:40, fg:80, fb:60,  lc:0xb0ffd8, li:1.4, ac:0x90ffcc, ai:0.50 },
  { wr:210,wg:192,wb:175, fr:118,fg:60, fb:30,  lc:0xff9030, li:1.6, ac:0xff7010, ai:0.50 },
  { wr:190,wg:190,wb:196, fr:170,fg:170,fb:180, lc:0xd8e4ff, li:1.3, ac:0xd0daff, ai:0.50 },
  { wr:200,wg:148,wb:148, fr:180,fg:100,fb:100, lc:0xff4030, li:2.0, ac:0xee2010, ai:0.50 },
  { wr:175,wg:175,wb:175, fr:140,fg:140,fb:140, lc:0xdddddd, li:1.3, ac:0xdddddd, ai:0.50 }, // グレー — 輝度下げ
  { wr:200,wg:204,wb:182, fr:70, fg:84, fb:50,  lc:0xdeff60, li:1.4, ac:0xceff40, ai:0.50 },
  { wr:200,wg:186,wb:208, fr:76, fg:46, fb:96,  lc:0xcc60ff, li:1.5, ac:0xbb40ff, ai:0.50 },
  { wr:178,wg:205,wb:208, fr:36, fg:86, fb:100, lc:0x30ddff, li:1.4, ac:0x10ccff, ai:0.50 },
  { wr:208,wg:196,wb:175, fr:106,fg:86, fb:60,  lc:0xffc870, li:1.4, ac:0xffb850, ai:0.50 },
  { wr:170,wg:200,wb:225, fr:130,fg:160,fb:190, lc:0x20e8ff, li:1.6, ac:0x10ccee, ai:0.50 },
  { wr:195,wg:195,wb:195, fr:165,fg:165,fb:165, lc:0xddddff, li:1.3, ac:0xddddff, ai:0.50 }, // 旧純白 → 中グレーに
  { wr:205,wg:207,wb:205, fr:150,fg:150,fb:150, lc:0xddddff, li:1.4, ac:0xeeeeff, ai:0.50 },
  { wr:205,wg:200,wb:196, fr:175,fg:158,fb:142, lc:0xffeedd, li:1.4, ac:0xffeedd, ai:0.50 }
];

/* ----------------------------------------------------------
   Room shape geometry builders
---------------------------------------------------------- */
function buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM) {
  buildWallFB(g, W, H, DW, DH, fDX, -hd, false, wM);
  if (dB) { buildWallFB(g, W, H, DW, DH, bDX, hd, true, wM); }
  else { var m = mkMesh(new THREE.BoxGeometry(W, H, WALL_T), wM()); m.position.set(0,H/2,hd); g.add(m); }
  if (dL) { buildWallLR(g, D, H, DW, DH, lDZ, -hw, true, wM); }
  else { var m2 = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); m2.position.set(-hw,H/2,0); g.add(m2); }
  if (dR) { buildWallLR(g, D, H, DW, DH, rDZ, hw, false, wM); }
  else { var m3 = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); m3.position.set(hw,H/2,0); g.add(m3); }
}

function buildShapeHex(g, W, D, H, hw, hd, DW, DH, fDX, bDX, dB, wM) {
  // Flat-top hex (diagonal panels removed) → plain rect walls
  buildWallFB(g, W, H, DW, DH, fDX, -hd, false, wM);
  if (dB) { buildWallFB(g, W, H, DW, DH, bDX, hd, true, wM); }
  else { var m = mkMesh(new THREE.BoxGeometry(W, H, WALL_T), wM()); m.position.set(0,H/2,hd); g.add(m); }
  var ml = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); ml.position.set(-hw,H/2,0); g.add(ml);
  var mr = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); mr.position.set(hw,H/2,0); g.add(mr);
}

function buildShapeCylinder(g, R, H, DW, dB, wM) {
  var N = 36;
  var dA = Math.asin(Math.min(0.98, DW / (2*R))) * 2 * 1.15;
  var doorAs = [Math.PI]; if (dB) doorAs.push(0);
  for (var i = 0; i < N; i++) {
    var a = (i / N) * Math.PI * 2;
    var skip = false;
    doorAs.forEach(function(da) {
      var diff = Math.abs(((a - da) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI);
      if (diff < dA/2) skip = true;
    });
    if (skip) continue;
    var pW = (2*Math.PI*R/N) * 1.08;
    var p = mkMesh(new THREE.BoxGeometry(pW, H, WALL_T), wM());
    p.position.set(Math.sin(a)*R, H/2, Math.cos(a)*R);
    p.rotation.y = a + Math.PI;
    g.add(p);
  }
}

function buildShapeDome(g, R, H, DW, DH, wM) {
  // Hemisphere — BackSide so interior is visible
  var dMat = wM(); dMat.side = THREE.BackSide;
  var dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24, 0, Math.PI*2, 0, Math.PI/2), dMat);
  g.add(dome);
  // Cylindrical base ring — height covers full door height, gap at front (a=PI)
  var ringN = 48;
  var ringDAngle = (DW / R) * 1.25; // arc subtended by door width + margin
  for (var i = 0; i < ringN; i++) {
    var a = (i / ringN) * Math.PI * 2;
    var diff = Math.abs(((a - Math.PI) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI);
    if (diff < ringDAngle / 2) continue;
    var pW = (2*Math.PI*R/ringN) * 1.06;
    var m = mkMesh(new THREE.BoxGeometry(pW, DH + 0.3, WALL_T), wM());
    m.position.set(Math.sin(a)*R, (DH + 0.3)/2, Math.cos(a)*R);
    m.rotation.y = a + Math.PI;
    g.add(m);
  }

  // ★ Thick door portal frames
  // The hemisphere curves inward with height: at y=DH the sphere surface is at
  // z = -sqrt(R^2 - DH^2), visibly closer to room center than the base at z=-R.
  // Fix: place thick wall slabs flanking the door opening so they always
  // protrude past the sphere surface, hiding the embedded-door appearance.
  //   minDepth = how far inward the sphere has moved at door height
  //   DOOR_DEPTH = minDepth + 0.55m clearance
  var minDepth = R - Math.sqrt(Math.max(0, R * R - DH * DH));
  var DOOR_DEPTH = minDepth + 0.55;
  var sideW = R - DW / 2;
  if (sideW > 0.01) {
    var lp = mkMesh(new THREE.BoxGeometry(sideW, DH + 0.3, DOOR_DEPTH), wM());
    lp.position.set(-DW / 2 - sideW / 2, (DH + 0.3) / 2, -R + DOOR_DEPTH / 2);
    g.add(lp);
    var rp = mkMesh(new THREE.BoxGeometry(sideW, DH + 0.3, DOOR_DEPTH), wM());
    rp.position.set( DW / 2 + sideW / 2, (DH + 0.3) / 2, -R + DOOR_DEPTH / 2);
    g.add(rp);
  }
  // Top lintel — seals the 0.3 gap above the door opening up to ring top
  var lt = mkMesh(new THREE.BoxGeometry(DW, 0.3, DOOR_DEPTH), wM());
  lt.position.set(0, DH + 0.15, -R + DOOR_DEPTH / 2);
  g.add(lt);
}

function buildShapeLShape(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM, R2) {
  buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM);
  // Inner walls blocking one corner → L shape
  var bx = hw * (0.28 + R2() * 0.22), bz = hd * (0.28 + R2() * 0.22);
  var sides = [[-1,-1],[-1,1],[1,-1],[1,1]];
  var corner = sides[Math.floor(R2() * 4)];
  var ox = corner[0] * (hw - bx), oz = corner[1] * (hd - bz);
  // Horizontal inner wall
  var m1 = mkMesh(new THREE.BoxGeometry(bx*2, H, WALL_T), wM());
  m1.position.set(corner[0]*(hw-bx), H/2, corner[1]*(hd-bz)); g.add(m1);
  // Vertical inner wall
  var m2 = mkMesh(new THREE.BoxGeometry(WALL_T, H, bz*2), wM());
  m2.position.set(corner[0]*(hw-bx*2), H/2, corner[1]*(hd-bz)); g.add(m2);
}

function buildShapeCross(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM, R2) {
  buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM);
  // Block 4 corners with inner walls
  var cx = hw * (0.30 + R2() * 0.18), cz = hd * (0.30 + R2() * 0.18);
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(s) {
    // Horizontal wall
    var wh1 = mkMesh(new THREE.BoxGeometry(cx*2, H, WALL_T), wM());
    wh1.position.set(s[0]*(hw-cx), H/2, s[1]*(hd-cz)); g.add(wh1);
    // Vertical wall
    var wv1 = mkMesh(new THREE.BoxGeometry(WALL_T, H, cz*2), wM());
    wv1.position.set(s[0]*(hw-cx*2), H/2, s[1]*(hd-cz)); g.add(wv1);
  });
}

function buildShapeAtrium(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM, flMat, R2) {
  buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM);
  var levels = 2 + Math.floor(R2() * 3);
  var balD = 1.1 + R2() * 1.3;
  var rMat = matStd(0xaaaaaa, 0.5, 0.6);
  for (var lv = 1; lv <= levels; lv++) {
    var lvH = H * lv / (levels + 1);
    // Front + back balcony slabs
    [{ z:-hd+balD/2, ry:0 }, { z:hd-balD/2, ry:Math.PI }].forEach(function(b) {
      var bal = mkMesh(new THREE.BoxGeometry(W*0.72, 0.1, balD), flMat());
      bal.position.set(0, lvH, b.z); g.add(bal);
      var rz = b.ry===0 ? balD/2-0.02 : -balD/2+0.02;
      var rail = mkMesh(new THREE.BoxGeometry(W*0.72, 0.07, 0.04), rMat.clone());
      rail.position.set(0, lvH+0.085, b.z+rz); g.add(rail);
      // Balusters
      var nb = Math.floor(W*0.72/0.32);
      for (var bi=0; bi<nb; bi++) {
        var bpost = mkMesh(new THREE.BoxGeometry(0.03, 0.09, 0.03), rMat.clone());
        bpost.position.set(-W*0.36+bi*0.32+0.16, lvH+0.05, b.z+rz); g.add(bpost);
      }
    });
    // Side balcony slabs
    [{ x:-hw+balD/2 }, { x:hw-balD/2 }].forEach(function(b) {
      var bal2 = mkMesh(new THREE.BoxGeometry(balD, 0.1, D*0.55), flMat());
      bal2.position.set(b.x, lvH, 0); g.add(bal2);
      var rx = b.x<0 ? balD/2-0.02 : -balD/2+0.02;
      var rail2 = mkMesh(new THREE.BoxGeometry(0.04, 0.07, D*0.55), rMat.clone());
      rail2.position.set(b.x+rx, lvH+0.085, 0); g.add(rail2);
    });
    // Support columns
    var cMat = matStd(0xcccccc, 0.7, 0.05);
    [-W*0.28, W*0.28].forEach(function(bx) {
      var col = mkMesh(new THREE.CylinderGeometry(0.06, 0.06, lvH, 8), cMat.clone());
      col.position.set(bx, lvH/2, -hd+balD); g.add(col);
    });
  }
}

function buildShapeCave(g, W, D, H, hw, hd, DW, DH, fDX, wM, R2) {
  buildWallFB(g, W, H, DW, DH, fDX, -hd, false, wM);
  var wallDefs = [
    { isZ:true,  pos:hd,  dir:Math.PI,   len:W },
    { isZ:false, pos:-hw, dir:Math.PI/2, len:D },
    { isZ:false, pos:hw,  dir:-Math.PI/2,len:D }
  ];
  wallDefs.forEach(function(w) {
    var secs = 3 + Math.floor(R2()*5), cursor = -w.len/2;
    for (var s=0; s<secs; s++) {
      var sLen = (w.len/secs)*(0.45+R2()*1.1);
      if (cursor+sLen > w.len/2) sLen = w.len/2-cursor;
      if (sLen < 0.3) { cursor+=sLen; continue; }
      var pH = H*(0.5+R2()*0.55);
      var jit = (R2()-0.5)*0.55, tilt = (R2()-0.5)*0.28;
      var m = mkMesh(new THREE.BoxGeometry(sLen, pH, WALL_T*0.8), wM());
      m.rotation.y = w.dir + tilt;
      if (w.isZ) m.position.set(cursor+sLen/2+jit, pH/2, w.pos);
      else       m.position.set(w.pos, pH/2, cursor+sLen/2+jit);
      g.add(m); cursor += sLen;
    }
  });
  // Random stalactite-like boxes hanging from ceiling
  var ns = 4 + Math.floor(R2()*8);
  var sMat = matStd(0x888880, 0.88, 0.02);
  for (var i=0; i<ns; i++) {
    var sh = H*(0.15+R2()*0.4), sw = 0.08+R2()*0.18;
    var st = mkMesh(new THREE.BoxGeometry(sw, sh, sw*(0.6+R2()*0.8)), sMat.clone());
    st.position.set((R2()-0.5)*W*0.7, H-sh/2, (R2()-0.5)*D*0.6); g.add(st);
  }
}

function buildShapeBrutalist(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM, R2) {
  buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM);
  var nc = 2+Math.floor(R2()*3), nr = 1+Math.floor(R2()*2);
  var pMat = matStd(0x909090, 0.92, 0.0);
  for (var ci=0; ci<nc; ci++) {
    for (var ri=0; ri<nr; ri++) {
      var px = -hw+(W/(nc+1))*(ci+1), pz = -hd+(D/(nr+1))*(ri+1);
      var pr = 0.13+R2()*0.15;
      var pil = mkMesh(new THREE.BoxGeometry(pr*2, H, pr*2), pMat.clone());
      pil.position.set(px, H/2, pz); g.add(pil);
      var base = mkMesh(new THREE.BoxGeometry(pr*3.8, 0.09, pr*3.8), matStd(0x777777, 0.88, 0.0));
      base.position.set(px, 0.045, pz); g.add(base);
      var cap = mkMesh(new THREE.BoxGeometry(pr*3.8, 0.07, pr*3.8), matStd(0x777777, 0.88, 0.0));
      cap.position.set(px, H-0.035, pz); g.add(cap);
    }
  }
  // Ceiling beams
  var bMat = matStd(0x686868, 0.88, 0.0);
  for (var bi=0; bi<nc-1; bi++) {
    var bx = -hw+(W/nc)*(bi+1);
    var beam = mkMesh(new THREE.BoxGeometry(0.22, 0.24, D), bMat.clone());
    beam.position.set(bx, H-0.12, 0); g.add(beam);
  }
}

function buildShapeNarrow(g, W, D, H, hw, hd, DW, DH, fDX, bDX, dB, wM, R2) {
  buildWallFB(g, W, H, DW, DH, fDX, -hd, false, wM);
  if (dB) { buildWallFB(g, W, H, DW, DH, bDX, hd, true, wM); }
  else { var m = mkMesh(new THREE.BoxGeometry(W, H, WALL_T), wM()); m.position.set(0,H/2,hd); g.add(m); }
  var ml = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); ml.position.set(-hw,H/2,0); g.add(ml);
  var mr = mkMesh(new THREE.BoxGeometry(WALL_T, H, D), wM()); mr.position.set(hw,H/2,0); g.add(mr);
  // Arch dividers along the length
  var nA = Math.max(2, Math.floor(D/4.5));
  var aW = W*0.58 + R2()*W*0.2;
  for (var ai=1; ai<nA; ai++) {
    var az = -hd+(D/nA)*ai;
    var aH = H*(0.68+R2()*0.2);
    var sW = (W-aW)/2;
    if (sW>0.05) {
      var al = mkMesh(new THREE.BoxGeometry(sW, aH, 0.16), wM()); al.position.set(-aW/2-sW/2, aH/2, az); g.add(al);
      var ar = mkMesh(new THREE.BoxGeometry(sW, aH, 0.16), wM()); ar.position.set(aW/2+sW/2, aH/2, az); g.add(ar);
    }
    var topH = H-aH;
    if (topH>0.05) { var at = mkMesh(new THREE.BoxGeometry(W, topH, 0.16), wM()); at.position.set(0,aH+topH/2,az); g.add(at); }
    var aR = aW/2;
    var arc = mkMesh(new THREE.TorusGeometry(aR, 0.08, 6, 18, Math.PI), wM());
    arc.position.set(0, aH, az); arc.rotation.z=Math.PI; g.add(arc);
  }
}

function buildShapeOctagon(g, W, D, H, hw, hd, DW, DH, fDX, bDX, dB, wM, R2) {
  // 8-sided room: 4 flat walls (cardinal) + 4 corner cuts
  buildWallFB(g, W, H, DW, DH, fDX, -hd, false, wM);
  if (dB) { buildWallFB(g, W, H, DW, DH, bDX, hd, true, wM); }
  else { var m = mkMesh(new THREE.BoxGeometry(W, H, WALL_T), wM()); m.position.set(0,H/2,hd); g.add(m); }
  var ml = mkMesh(new THREE.BoxGeometry(WALL_T, H, D*0.6), wM()); ml.position.set(-hw,H/2,0); g.add(ml);
  var mr = mkMesh(new THREE.BoxGeometry(WALL_T, H, D*0.6), wM()); mr.position.set(hw,H/2,0); g.add(mr);
  // diagonal corner panels removed
}

function buildShapeVault(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM, R2) {
  // Rect floor/walls but vaulted ceiling (barrel vault or groin vault feel)
  buildShapeRect(g, W, D, H, hw, hd, DW, DH, fDX, bDX, lDZ, rDZ, dB, dL, dR, wM);
  // Vaulted ceiling arches running along D axis
  var nArches = Math.max(2, Math.floor(D/5));
  var aMat = wM();
  for (var ai=0; ai<=nArches; ai++) {
    var az = -hd+(D/nArches)*ai;
    var arc = mkMesh(new THREE.TorusGeometry(W/2, 0.14, 8, 24, Math.PI), aMat.clone());
    arc.position.set(0, H, az); arc.rotation.z=Math.PI; g.add(arc);
  }
  // Ribs along Z between arches
  var nRibs = 4 + Math.floor(R2()*4);
  for (var ri2=0; ri2<nRibs; ri2++) {
    var rx = -hw+(W/(nRibs+1))*(ri2+1);
    var rib = mkMesh(new THREE.CylinderGeometry(0.055, 0.055, D, 8), aMat.clone());
    rib.rotation.x = Math.PI/2; rib.position.set(rx, H, 0); g.add(rib);
  }
}

/* ----------------------------------------------------------
   Wall PBR roughness map generator (Step B)
---------------------------------------------------------- */
function makeWallRoughTex() {
  var S  = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');
  // Mid-gray base = medium roughness (0.5 in roughnessMap ≈ material.roughness * 0.5)
  cx.fillStyle = '#aaaaaa';
  cx.fillRect(0, 0, S, S);
  // Bright patches = smoother spots (polished)
  for (var i = 0; i < 6000; i++) {
    var v = Math.floor(160 + Math.random() * 85);
    cx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (0.04 + Math.random() * 0.07) + ')';
    cx.fillRect(Math.random() * S, Math.random() * S, Math.random() * 3.5 + 0.5, Math.random() * 3.5 + 0.5);
  }
  // Dark seams = rougher joints
  for (var j = 0; j < 50; j++) {
    var ly = Math.random() * S;
    cx.strokeStyle = 'rgba(40,40,40,' + (0.08 + Math.random() * 0.14) + ')';
    cx.lineWidth = Math.random() * 2.2 + 0.4;
    cx.beginPath();
    cx.moveTo(0, ly);
    cx.lineTo(S, ly + (Math.random() - 0.5) * 12);
    cx.stroke();
  }
  // Corner darkening = rough grime
  var grad = cx.createRadialGradient(0, S, 0, 0, S, S * 0.38);
  grad.addColorStop(0, 'rgba(30,30,30,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = grad;
  cx.fillRect(0, 0, S, S);
  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}


/* ----------------------------------------------------------
   Room builder — multi-shape
---------------------------------------------------------- */
function buildRoom(seed) {
  var R2 = makeRng(seed);

  // ---- shape & size selection ----
  // Open, modern / spacey room shapes.
  // (Exclude lshape/cross/narrow to avoid cramped clutter.)
  var ALL_SHAPES  = [
    'rect','rect','rect',
    'hex','hex',
    'cylinder','dome',
    'atrium','atrium',
    'brutalist',
    'octagon','octagon',
    'vault',
    'cave'
  ];
  var MEGA_SHAPES = ['rect','hex','cylinder','dome','brutalist','atrium'];
  // Bias toward larger rooms (mega rooms also spawn fewer exhibits).
  var isMega = R2() > 0.72;
  var shapeType = isMega
    ? MEGA_SHAPES[Math.floor(R2() * MEGA_SHAPES.length)]
    : ALL_SHAPES[Math.floor(R2() * ALL_SHAPES.length)];

  var W, D, H, r0;
  if (isMega) {
    if (shapeType==='dome'||shapeType==='cylinder') { r0=20+R2()*20; W=D=r0*2; H=r0; }
    else { W=40+R2()*60; D=50+R2()*70; H=15+R2()*20; }
  } else {
    if (shapeType==='dome')     { r0=8+R2()*14; W=D=r0*2; H=r0; }
    else if (shapeType==='cylinder') { r0=6+R2()*12; W=D=r0*2; H=5+R2()*10; }
    else if (shapeType==='atrium')   { W=10+R2()*18; D=14+R2()*22; H=14+R2()*18; }
    else if (shapeType==='narrow')   { W=5+R2()*3; D=18+R2()*36; H=4+R2()*5; }
    else if (shapeType==='vault')    { W=8+R2()*14; D=18+R2()*28; H=6+R2()*6; }
    else if (shapeType==='hex')      { W=14+R2()*16; D=18+R2()*20; H=7+R2()*6; }
    else { W=16+R2()*36; D=22+R2()*62; H=5+R2()*9; }
  }
  var hw = W/2, hd = D/2;
  var fogNear = isMega ? 20+R2()*20 : (shapeType==='narrow'?6 : shapeType==='hex'?8 : 12);
  // Scale fogFar with room depth so distant walls don't dissolve to solid white
  // in large rooms.  Narrow rooms keep the original 28 cap; hex uses tighter D*1.4+10;
  // others use D*1.6+20 which keeps the far wall at ≤60% fog density.
  var fogFar  = isMega ? D*0.8+40 : (shapeType==='narrow'?28 : shapeType==='hex'? D*1.4+10 : Math.max(90, D*1.6+20));

  var DOOR_W = 2.1+R2()*0.7, DOOR_H = 2.5+R2()*0.6;
  var pal = PALETTES[Math.floor(R2() * PALETTES.length)];
  var grp = new THREE.Group();

  var wallTex  = makeWallTex(pal.wr, pal.wg, pal.wb);
  wallTex.repeat.set(W/4, H/4);
  var wallRoughTex = makeWallRoughTex();
  wallRoughTex.repeat.set(W/4, H/4);
  var wallBumpTex = makeWallBumpTex();
  wallBumpTex.repeat.set(W/4, H/4);
  var floorTex = makeFloorTex(pal.fr, pal.fg, pal.fb);
  floorTex.repeat.set(W/4, D/4);
  var floorRoughTex = makeFloorRoughTex();
  floorRoughTex.repeat.set(W/4, D/4);
  var floorBumpTex  = makeFloorBumpTex();
  floorBumpTex.repeat.set(W/4, D/4);
  var ceilTex  = makeCeilTex(
    Math.max(pal.wr-14,0), Math.max(pal.wg-14,0), Math.max(pal.wb-14,0));
  ceilTex.repeat.set(W/4, D/4);

  function wallMat()  { return new THREE.MeshStandardMaterial({ map:wallTex, roughnessMap:wallRoughTex, roughness:0.80, metalness:0.02, bumpMap:wallBumpTex, bumpScale:0.022 }); }
  function floorMat() { return new THREE.MeshStandardMaterial({
    map: floorTex,
    roughnessMap: floorRoughTex,
    roughness: 0.70,
    bumpMap: floorBumpTex,
    bumpScale: 0.06,
    metalness: 0.05
  }); }
  function ceilMat()  { return new THREE.MeshStandardMaterial({ map:ceilTex, roughness:0.90, metalness:0.0 }); }

  // ---- floor ----
  var floorGeo = (shapeType==='dome'||shapeType==='cylinder')
    ? new THREE.CircleGeometry(hw, 48)
    : new THREE.PlaneGeometry(W, D);
  var floor = mkMesh(floorGeo, floorMat());
  floor.rotation.x = -Math.PI/2; grp.add(floor);

  // Edge wear: small dark bands along the floor/wall junction.
  (function addFloorEdgeWear() {
    var edgeCol = new THREE.Color(pal.wr / 255 * 0.70, pal.wg / 255 * 0.70, pal.wb / 255 * 0.70);
    var edgeMat = new THREE.MeshStandardMaterial({
      color: edgeCol,
      roughness: 0.95,
      metalness: 0.02
    });
    var y0 = 0.002;
    var t = 0.014;
    if (shapeType === 'dome' || shapeType === 'cylinder') {
      var inner = hw * 0.88;
      var outer = hw * 0.99;
      var ring = mkMesh(new THREE.RingGeometry(inner, outer, 64), edgeMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = y0;
      grp.add(ring);
    } else {
      var zEdge = hd;
      var xEdge = hw;
      var inset = 0.005;
      // front/back strips
      var stripZ = mkMesh(new THREE.BoxGeometry(W, t, 0.06), edgeMat);
      stripZ.position.set(0, y0 + t / 2, -zEdge + inset);
      grp.add(stripZ);
      var stripZ2 = mkMesh(new THREE.BoxGeometry(W, t, 0.06), edgeMat);
      stripZ2.position.set(0, y0 + t / 2, zEdge - inset);
      grp.add(stripZ2);
      // left/right strips
      var stripX = mkMesh(new THREE.BoxGeometry(0.06, t, D), edgeMat);
      stripX.position.set(-xEdge + inset, y0 + t / 2, 0);
      grp.add(stripX);
      var stripX2 = mkMesh(new THREE.BoxGeometry(0.06, t, D), edgeMat);
      stripX2.position.set(xEdge - inset, y0 + t / 2, 0);
      grp.add(stripX2);
    }
  })();

  // ---- ceiling ----
  if (shapeType==='dome') {
    // no separate ceiling — dome IS the ceiling
  } else if (shapeType==='cylinder') {
    var cc = mkMesh(new THREE.CircleGeometry(hw,48), ceilMat());
    cc.rotation.x = Math.PI/2; cc.position.y = H; grp.add(cc);
  } else {
    var ceil = mkMesh(new THREE.PlaneGeometry(W, D), ceilMat());
    ceil.rotation.x = Math.PI/2; ceil.position.y = H; grp.add(ceil);
  }

  // ---- doors ----
  var numDoors = 1 + Math.floor(R2()*3);
  if (shapeType==='dome'||shapeType==='narrow') numDoors=1;
  if (shapeType==='hex'||shapeType==='cylinder'||shapeType==='octagon') numDoors=Math.min(numDoors,2);
  var extraWalls = ['back','left','right'];
  for (var si=extraWalls.length-1; si>0; si--) {
    var sj=Math.floor(R2()*(si+1)); var st=extraWalls[si]; extraWalls[si]=extraWalls[sj]; extraWalls[sj]=st;
  }
  var activeExtra = extraWalls.slice(0, numDoors-1);
  if (shapeType==='hex'||shapeType==='cylinder'||shapeType==='octagon') {
    activeExtra = activeExtra.filter(function(e){ return e==='back'; });
  }
  var hasDoorBack  = activeExtra.indexOf('back')  >= 0;
  var hasDoorLeft  = activeExtra.indexOf('left')  >= 0;
  var hasDoorRight = activeExtra.indexOf('right') >= 0;
  var maxXOff = Math.max(0,(W-DOOR_W)/2-1.4);
  var maxZOff = Math.max(0,(D-DOOR_W)/2-1.4);
  // Dome & cylinder: door must be centered — no offset
  var isRound = (shapeType==='dome'||shapeType==='cylinder');
  var frontDX = isRound ? 0 : (R2()*2-1)*maxXOff;
  var backDX  = isRound ? 0 : (R2()*2-1)*maxXOff;
  var leftDZ=(R2()*2-1)*maxZOff,  rightDZ=(R2()*2-1)*maxZOff;

  // ---- walls by shape ----
  if      (shapeType==='hex')      buildShapeHex(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,hasDoorBack,wallMat);
  else if (shapeType==='cylinder') buildShapeCylinder(grp,hw,H,DOOR_W,hasDoorBack,wallMat);
  else if (shapeType==='dome')     buildShapeDome(grp,hw,H,DOOR_W,DOOR_H,wallMat);
  else if (shapeType==='lshape')   buildShapeLShape(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat,R2);
  else if (shapeType==='cross')    buildShapeCross(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat,R2);
  else if (shapeType==='atrium')   buildShapeAtrium(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat,floorMat,R2);
  else if (shapeType==='cave')     buildShapeCave(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,wallMat,R2);
  else if (shapeType==='brutalist') buildShapeBrutalist(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat,R2);
  else if (shapeType==='narrow')   buildShapeNarrow(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,hasDoorBack,wallMat,R2);
  else if (shapeType==='octagon')  buildShapeOctagon(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,hasDoorBack,wallMat,R2);
  else if (shapeType==='vault')    buildShapeVault(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat,R2);
  else buildShapeRect(grp,W,D,H,hw,hd,DOOR_W,DOOR_H,frontDX,backDX,leftDZ,rightDZ,hasDoorBack,hasDoorLeft,hasDoorRight,wallMat);

  // ---- skirting & cornice (rect-like shapes only) ----
  var rectLike = ['rect','lshape','cross','atrium','brutalist','narrow','vault'];
  if (rectLike.indexOf(shapeType) >= 0) {
    var skC = new THREE.Color(pal.wr/255*0.82, pal.wg/255*0.82, pal.wb/255*0.82);
    var skMat = new THREE.MeshStandardMaterial({ color:skC, roughness:0.80, metalness:0.02 });
    var skH=0.11, skT=0.045;
    [[new THREE.BoxGeometry(W,skH,skT),0,skH/2,-hd],
     [new THREE.BoxGeometry(W,skH,skT),0,skH/2, hd],
     [new THREE.BoxGeometry(skT,skH,D),-hw,skH/2,0],
     [new THREE.BoxGeometry(skT,skH,D), hw,skH/2,0],
     [new THREE.BoxGeometry(W,0.05,skT),0,H-0.025,-hd],
     [new THREE.BoxGeometry(W,0.05,skT),0,H-0.025, hd],
     [new THREE.BoxGeometry(skT,0.05,D),-hw,H-0.025,0],
     [new THREE.BoxGeometry(skT,0.05,D), hw,H-0.025,0]
    ].forEach(function(s) {
      var m=mkMesh(s[0],skMat.clone()); m.position.set(s[1],s[2],s[3]); grp.add(m);
    });
  }

  // ---- wall details (outlets/switches) ----
  var detailShapes = ['rect','brutalist','atrium','vault'];
  if (detailShapes.indexOf(shapeType) >= 0) {
    addDetails(grp,0, 1,W,H,hw,hd,R2);
    addDetails(grp,0,-1,W,H,hw,hd,R2);
    addDetails(grp,1, 1,D,H,hw,hd,R2);
    addDetails(grp,1,-1,D,H,hw,hd,R2);
  }

  // ---- door glows ----
  // For dome: sphere wall curves inward with height, so sign needs extra inset
  // at sign height h: wall_z = -sqrt(R²-h²), inset needed = R - sqrt(R²-h²)
  // Default: must be >= WALL_T/2 (0.09) to avoid embedding into wall geometry
  var doorInset = WALL_T / 2 + 0.06; // 0.15 — just clear of the inner wall face
  if (shapeType === 'dome') {
    // Sphere wall at sign height h curves to z = -sqrt(R^2 - h^2).
    // The thick portal frame inner face is at z = -R + (R-sqrt(R^2-DH^2)) + 0.55.
    // EXIT sign must be in front of BOTH the portal inner face AND the sphere surface.
    // Use signH for sphere calc, then add 0.75m clearance (was 0.25) to clear the frame.
    var signH = DOOR_H + 0.45;
    var safeH = Math.min(signH, hw * 0.98);
    doorInset = hw - Math.sqrt(hw * hw - safeH * safeH) + 0.75;
  }
  // Front wall: door at z=-hd, sign faces +z (rotY=0)
  addDoorGlow(grp, frontDX, -hd, DOOR_H, 0, pal.lc, doorInset);
  // Back wall: door at z=+hd, sign faces -z (rotY=PI)
  if (hasDoorBack)  addDoorGlow(grp, backDX,  hd,  DOOR_H, Math.PI,    pal.lc, doorInset);
  // Left wall: door at x=-hw, sign faces +x (rotY=PI/2). dx=wall pos, dz=door offset along wall
  if (hasDoorLeft)  addDoorGlow(grp, -hw, leftDZ,  DOOR_H, Math.PI/2,  pal.lc, doorInset);
  // Right wall: door at x=+hw, sign faces -x (rotY=-PI/2)
  if (hasDoorRight) addDoorGlow(grp,  hw, rightDZ, DOOR_H, -Math.PI/2, pal.lc, doorInset);

  // ---- lighting ----
  // パレット輝度に応じてライト強度をスケール:
  // 明るいパレット (luma≈200) ほど強度を下げて白飛びを防ぐ
  var _palLuma = (pal.wr + pal.wg + pal.wb) / 3;
  var _liScale = Math.max(0.30, 1.0 - (_palLuma - 80) / 180); // luma=80→1.0, luma=175→0.472
  var _adjLi   = pal.li * _liScale;

  // Guarantee a minimum ambient so dark-palette rooms stay navigable
  var minAmbInt = 0.22;
  var amb = new THREE.AmbientLight(pal.ac, Math.max(minAmbInt, pal.ai * 0.55));
  grp.add(amb);
  // 白フィル: 明るいパレットでは大幅に抑える
  var fillInt = Math.max(0.05, 0.28 - (_palLuma - 120) / 400);
  var fill = new THREE.AmbientLight(0xffffff, fillInt);
  grp.add(fill);
  if (shapeType==='dome'||shapeType==='cylinder') {
    // Central point light for round rooms
    var cpl = new THREE.PointLight(pal.lc, _adjLi*1.0, H*3, 1.5);
    cpl.position.set(0, H*0.65, 0); grp.add(cpl);
    // dome/cylinder は SpotLight がないので補助ライトを4点追加
    var R = (shapeType==='dome') ? (W*0.5) : hw;
    var domeOffsets = [[R*0.55,0],[- R*0.55,0],[0,R*0.55],[0,-R*0.55]];
    for (var _di=0; _di<domeOffsets.length; _di++) {
      var dpl = new THREE.PointLight(pal.lc, _adjLi*0.55, H*2.2, 1.8);
      dpl.position.set(domeOffsets[_di][0], H*0.6, domeOffsets[_di][1]);
      grp.add(dpl);
    }
    } else {
    var rows = Math.min(Math.ceil(D/8), isMega?4:2);
    var cols2 = Math.min(Math.ceil(W/8), isMega?4:2);
    var shaftTex = makeLightShaftTex();
    var shaftMat = new THREE.MeshBasicMaterial({
      map: shaftTex,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      color: new THREE.Color(pal.lc)
    });
    var shaftAdded = 0;
    var shaftMax = isMega ? 8 : 5;

    // ---- 蛍光灯フィクスチャ ----
    var _fluColor = new THREE.Color(pal.lc).lerp(new THREE.Color(0xffffff), 0.55);
    var _fluTubeLen = isMega ? Math.min(W / cols2 * 0.72, 6.0) : Math.min(W / cols2 * 0.68, 3.2);
    var _fluBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a, roughness: 0.7, metalness: 0.4
    });
    var _fluTubeMat = new THREE.MeshStandardMaterial({
      color: _fluColor,
      emissive: _fluColor,
      emissiveIntensity: 2.8,
      roughness: 0.15,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92
    });

    for (var ri=0; ri<rows; ri++) {
      for (var ci=0; ci<cols2; ci++) {
        var lx=-hw+(W/cols2)*(ci+0.5), lz=-hd+(D/rows)*(ri+0.5);
        var sl = new THREE.SpotLight(pal.lc, _adjLi, Math.max(W,D)*0.9, Math.PI/5.5, 0.42, 1.5);
        sl.position.set(lx,H-0.1,lz); sl.target.position.set(lx,0,lz);
        sl.castShadow = false;
        grp.add(sl); grp.add(sl.target);

        // 蛍光灯フィクスチャを天井に取り付け
        var _fix = new THREE.Group();
        var _body = new THREE.Mesh(
          new THREE.BoxGeometry(_fluTubeLen + 0.12, 0.06, 0.18),
          _fluBodyMat.clone()
        );
        _body.position.y = -0.03;
        _fix.add(_body);
        // 蛍光管（1本 or 2本）
        var _tubeCount = R2() > 0.5 ? 2 : 1;
        for (var _ti = 0; _ti < _tubeCount; _ti++) {
          var _tubeZ = _tubeCount === 2 ? (_ti === 0 ? -0.045 : 0.045) : 0;
          var _tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, _fluTubeLen, 8),
            _fluTubeMat.clone()
          );
          _tube.rotation.z = Math.PI / 2;
          _tube.position.set(0, -0.052, _tubeZ);
          _fix.add(_tube);
        }
        // エンドキャップ
        var _capGeoL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.22), _fluBodyMat.clone());
        _capGeoL.position.set(-_fluTubeLen / 2, -0.035, 0);
        _fix.add(_capGeoL);
        var _capGeoR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.22), _fluBodyMat.clone());
        _capGeoR.position.set(_fluTubeLen / 2, -0.035, 0);
        _fix.add(_capGeoR);

        _fix.position.set(lx, H - 0.001, lz);
        _fix.rotation.y = Math.floor(R2() * 2) * Math.PI / 2;
        grp.add(_fix);

        // 蛍光灯用PointLight（拡散光）
        var _fluPL = new THREE.PointLight(_fluColor, _adjLi * 1.1, H * 2.0, 1.6);
        _fluPL.position.set(lx, H - 0.12, lz);
        grp.add(_fluPL);

        // Light shaft ← ループの中
        if (shaftAdded < shaftMax && ((ri + ci) % 2 === 0)) {
          var shaft = new THREE.Mesh(
            new THREE.PlaneGeometry(1.0, H * 1.05),
            shaftMat
          );
          shaft.position.set(lx, H * 0.52, lz);
          shaft.rotation.y = (R2() - 0.5) * 0.35;
          grp.add(shaft);
          shaftAdded++;
        }
      }
    }
  }

  // ---- hex補助ライト ← elseブロックの外、ループの外
  if (shapeType === 'hex') {
    var hexCorners = [[-hw*0.6,-hd*0.6],[hw*0.6,-hd*0.6],[-hw*0.6,hd*0.6],[hw*0.6,hd*0.6]];
    for (var _hxi = 0; _hxi < hexCorners.length; _hxi++) {
      var _hxl = new THREE.PointLight(pal.lc, pal.li * 0.6, Math.max(W,D) * 0.5, 1.8);
      _hxl.position.set(hexCorners[_hxi][0], H * 0.75, hexCorners[_hxi][1]);
      grp.add(_hxl);
    }
  }

  // ---- cave補助ライト: 不規則な壁で影ができやすいため低いPointLightを分散配置 ----
  if (shapeType === 'cave') {
    var caveN = 4;
    for (var _cvi = 0; _cvi < caveN; _cvi++) {
      var _cvx = (R2() - 0.5) * W * 0.7;
      var _cvz = (R2() - 0.5) * D * 0.7;
      var _cvl = new THREE.PointLight(pal.lc, pal.li * 0.55, Math.max(W, D) * 0.45, 1.8);
      _cvl.position.set(_cvx, 0.8, _cvz);
      grp.add(_cvl);
    }
  }

  // ルーム全体のコリジョンリスト（XZ円）
  var collidables = [];
  // 登れる階段データ
  var stairData = [];

  // ---- GLBプロップ（家具・備品）配置 ---- クラスター方式 ----
  (function() {
    if (typeof buildGLBProp !== 'function') return;

    var SOFAS  = ['sofa1','sofa2','sofa3','sofa4'];
    var TABLES = ['table1','table2','table3','table4'];
    var MISC   = ['taru','beach_ball','traffic_cone','barrier','swing','kusa','wooden_storage_shelf','bench'];
    var ALL    = SOFAS.concat(TABLES).concat(MISC);

    // ドアゾーン
    var _dz = [{ x: frontDX, z: -hd }];
    if (hasDoorBack)  _dz.push({ x: backDX,  z:  hd });
    if (hasDoorLeft)  _dz.push({ x: -hw,     z: leftDZ });
    if (hasDoorRight) _dz.push({ x:  hw,     z: rightDZ });
    var DOOR_CLEAR = 3.2;

    // アイテムごとの衝突半径（GLB_PROP_SIZES × 0.52 + 여유0.35）
    // 大きな家具は広く、草・小物は狭く
    var _PROP_R = {
      sofa1: 1.65, sofa2: 1.55, sofa3: 1.70, sofa4: 1.60,
      table1: 1.15, table2: 1.20, table3: 1.10, table4: 1.25,
      bench: 1.40,
      wooden_storage_shelf: 1.55,
      taru: 0.80, kusa: 0.60, beach_ball: 0.55,
      traffic_cone: 0.55, barrier: 1.05,
      swing: 2.10
    };
    function _r(name) { return _PROP_R[name] || 1.20; }

    // 配置済みプロップリスト（重複防止用）
    var _placed = [];

    // 安全チェック: ドア・壁・既存プロップと干渉しないか
    function _safe(x, z, r) {
      r = r || 1.0;
      if (Math.abs(x) > hw - 1.8 || Math.abs(z) > hd - 2.2) return false;
      for (var i = 0; i < _dz.length; i++) {
        var dx = x - _dz[i].x, dz = z - _dz[i].z;
        if (dx*dx + dz*dz < (DOOR_CLEAR+r)*(DOOR_CLEAR+r)) return false;
      }
      for (var j = 0; j < _placed.length; j++) {
        var pd = _placed[j];
        var pdx = x - pd.x, pdz = z - pd.z;
        var md = r + pd.r;
        if (pdx*pdx + pdz*pdz < md*md) return false;
      }
      return true;
    }

    // プロップ1個を配置（失敗時 false を返す）
    function _place(name, x, z, ry) {
      var r = _r(name);
      if (!_safe(x, z, r)) return false;
      var g = buildGLBProp(R2, name);
      g.position.set(x, 0, z);
      g.rotation.y = (ry !== undefined) ? ry : R2() * Math.PI * 2;
      grp.add(g);
      _placed.push({ x: x, z: z, r: r });
      collidables.push({ x: x, z: z, r: r });
      return true;
    }

    // クラスター中心座標を安全な位置に取得
    function _center(margin) {
      margin = margin || 3.5;
      var cx, cz, tries = 0;
      do {
        cx = (R2()-0.5) * Math.max(1, W - margin*2);
        cz = (R2()-0.5) * Math.max(1, D - margin*2);
        tries++;
      } while (!_safe(cx, cz, 1.8) && tries < 10);
      return { x: cx, z: cz };
    }

    // ──────────────────────────────────────────
    // クラスター定義
    // ──────────────────────────────────────────

    // ソファ一列（同向き or 交互でも可）
    function cl_sofa_row() {
      var c = _center(4.5);
      var n = 2 + Math.floor(R2()*3);         // 2〜4脚
      var sp = 3.4 + R2()*0.8;               // ソファ幅2.2+余白分
      var horiz = R2() < 0.5;
      var ry = horiz ? 0 : Math.PI/2;
      var sameSofa = R2() < 0.6;
      var baseSofa = SOFAS[Math.floor(R2()*SOFAS.length)];
      var ofs = -(n-1)*sp*0.5;
      for (var i = 0; i < n; i++) {
        var s = sameSofa ? baseSofa : SOFAS[Math.floor(R2()*SOFAS.length)];
        var px = c.x + (horiz ? ofs+i*sp : (R2()-0.5)*0.25);
        var pz = c.z + (horiz ? (R2()-0.5)*0.25 : ofs+i*sp);
        _place(s, px, pz, ry + (R2()-0.5)*0.12);
      }
      // 端にテーブルを添える（40%）
      if (R2() < 0.4) {
        var tx = c.x + (horiz ? ofs+(n+0.4)*sp : (R2()-0.5)*1.5);
        var tz = c.z + (horiz ? (R2()-0.5)*1.5 : ofs+(n+0.4)*sp);
        _place(TABLES[Math.floor(R2()*TABLES.length)], tx, tz, R2()*Math.PI*2);
      }
    }

    // ソファ向かい合わせ（対面配置）
    function cl_sofa_face() {
      var c = _center(4.5);
      var horiz = R2() < 0.5;
      var gap = 3.8 + R2()*1.8;              // 両ソファ半径合計3.3+余白
      var sA = SOFAS[Math.floor(R2()*SOFAS.length)];
      var sB = R2()<0.55 ? sA : SOFAS[Math.floor(R2()*SOFAS.length)];
      var ryA = horiz ? 0        : Math.PI/2;
      var ryB = horiz ? Math.PI  : -Math.PI/2;
      if (horiz) {
        _place(sA, c.x-gap/2, c.z, ryA);
        _place(sB, c.x+gap/2, c.z, ryB);
      } else {
        _place(sA, c.x, c.z-gap/2, ryA);
        _place(sB, c.x, c.z+gap/2, ryB);
      }
      // 中央にテーブル（65%）
      if (R2() < 0.65) {
        _place(TABLES[Math.floor(R2()*TABLES.length)], c.x, c.z, R2()*Math.PI*2);
      }
    }

    // ラウンジセット（ソファ + 前テーブル）
    function cl_lounge() {
      var c = _center(4.5);
      var horiz = R2() < 0.5;
      var ry = horiz ? 0 : Math.PI/2;
      var n = 1 + Math.floor(R2()*2);
      var sp = 3.4;                           // ソファ間隔
      var ofs = -(n-1)*sp*0.5;
      for (var i = 0; i < n; i++) {
        var px = c.x + (horiz ? ofs+i*sp : 0);
        var pz = c.z + (horiz ? 0 : ofs+i*sp);
        _place(SOFAS[Math.floor(R2()*SOFAS.length)], px, pz, ry);
      }
      // 手前にテーブル（ソファ幅の外）
      var fwd = 2.6 + R2()*0.5;
      _place(
        TABLES[Math.floor(R2()*TABLES.length)],
        c.x + (horiz ? 0 : fwd),
        c.z + (horiz ? fwd : 0),
        R2()*Math.PI*2
      );
    }

    // ベンチ一列（バス停・列車待ち風）
    function cl_bench_line() {
      var c = _center(4.0);
      var n = 2 + Math.floor(R2()*3);          // 2〜4台
      var sp = 3.0 + R2()*0.6;                // bench幅1.8+余白
      var horiz = R2() < 0.5;
      var ry = horiz ? 0 : Math.PI/2;
      var ofs = -(n-1)*sp*0.5;
      for (var i = 0; i < n; i++) {
        var px = c.x + (horiz ? ofs+i*sp : (R2()-0.5)*0.2);
        var pz = c.z + (horiz ? (R2()-0.5)*0.2 : ofs+i*sp);
        _place('bench', px, pz, ry + (R2()-0.5)*0.1);
      }
    }

    // 草むら（密集）— 草は小さいので狭くてよい
    function cl_kusa() {
      var c = _center(3);
      var n = 4 + Math.floor(R2()*5);          // 4〜8株
      var spread = 2.0 + R2()*1.8;
      for (var i = 0; i < n; i++) {
        var ang = R2()*Math.PI*2;
        var dist = R2()*spread;
        _place('kusa', c.x+Math.cos(ang)*dist, c.z+Math.sin(ang)*dist, R2()*Math.PI*2);
      }
    }

    // コーン・バリアライン（工事ゾーン風）
    function cl_cone_line() {
      var c = _center(3);
      var n = 3 + Math.floor(R2()*3);          // 3〜5本
      var sp = 1.4 + R2()*0.5;                // コーンは小さいので狭くてよい
      var horiz = R2() < 0.5;
      var ofs = -(n-1)*sp*0.5;
      var item = R2() < 0.5 ? 'traffic_cone' : 'barrier';
      for (var i = 0; i < n; i++) {
        var px = c.x + (horiz ? ofs+i*sp : (R2()-0.5)*0.15);
        var pz = c.z + (horiz ? (R2()-0.5)*0.15 : ofs+i*sp);
        _place(item, px, pz, R2()*Math.PI*2);
      }
    }

    // 収納コーナー（棚 + 樽）
    function cl_storage() {
      var c = _center(4.0);
      var ry = Math.floor(R2()*4)*Math.PI/2;
      _place('wooden_storage_shelf', c.x, c.z, ry);
      var tn = 2 + Math.floor(R2()*3);
      for (var i = 0; i < tn; i++) {
        // 棚から 1.8〜3.5 離した位置にランダム配置
        var ang = R2()*Math.PI*2;
        var dist = 1.8 + R2()*1.7;
        _place('taru', c.x+Math.cos(ang)*dist, c.z+Math.sin(ang)*dist, R2()*Math.PI*2);
      }
    }

    // ゆるいカオス散らばり（テーマなし）
    function cl_scatter() {
      var c = _center(3);
      var n = 3 + Math.floor(R2()*4);
      for (var i = 0; i < n; i++) {
        _place(ALL[Math.floor(R2()*ALL.length)],
          c.x+(R2()-0.5)*6, c.z+(R2()-0.5)*6, R2()*Math.PI*2);
      }
    }

    // ──────────────────────────────────────────
    // ルームテーマ選択
    // ──────────────────────────────────────────
    var CLUSTERS = [
      cl_sofa_row, cl_sofa_row,       // 高確率
      cl_sofa_face,
      cl_lounge, cl_lounge,           // 高確率
      cl_bench_line, cl_bench_line,   // 高確率
      cl_kusa, cl_kusa,               // 高確率
      cl_cone_line,
      cl_storage,
      cl_scatter
    ];

    // 12%: フルカオスルーム（全部バラバラ）
    var isChaosRoom = R2() < 0.12;
    if (isChaosRoom) {
      var n2 = 5 + Math.floor(R2()*8);
      for (var pi = 0; pi < n2; pi++) {
        var px2 = (R2()-0.5)*Math.max(1, W-4);
        var pz2 = (R2()-0.5)*Math.max(1, D-6);
        _place(ALL[Math.floor(R2()*ALL.length)], px2, pz2, R2()*Math.PI*2);
      }
      return;
    }

    // 通常: クラスターを 1〜3 個配置
    var numClusters = isMega
      ? 2 + Math.floor(R2()*3)   // メガルームは 2〜4
      : 1 + Math.floor(R2()*2);  // 通常は 1〜2

    // 45%: 同種クラスターを繰り返す（テーマ感強め）
    var dominant = (R2() < 0.45)
      ? CLUSTERS[Math.floor(R2()*CLUSTERS.length)]
      : null;

    for (var ci = 0; ci < numClusters; ci++) {
      var fn = dominant || CLUSTERS[Math.floor(R2()*CLUSTERS.length)];
      fn();
    }

    // 草がないルームに草を足す（25%）
    var hasKusa = false;
    for (var ki = 0; ki < _placed.length; ki++) {
      if (_placed[ki].r < 0.7) { hasKusa = true; break; }
    }
    if (!hasKusa && R2() < 0.25) cl_kusa();
  })();

  // ---- wall paintings ----
  var shapeLabel = { rect:'ROOM',hex:'HEX',cylinder:'CYLINDER',dome:'DOME',
    lshape:'L-SHAPE',cross:'CROSS',atrium:'ATRIUM',cave:'CAVE',
    brutalist:'BRUTALIST',narrow:'CORRIDOR',octagon:'OCTAGON',vault:'VAULT' };
  var paintableShapes = ['rect','lshape','cross','brutalist','atrium','vault','narrow','octagon','hex'];
  if (paintableShapes.indexOf(shapeType) >= 0) {
    addWallPaintings(grp, W, D, H, hw, hd, R2, pal, {
      DOOR_W: DOOR_W, DOOR_H: DOOR_H,
      frontDX: frontDX, backDX: backDX,
      leftDZ: leftDZ, rightDZ: rightDZ,
      hasDoorBack: hasDoorBack,
      hasDoorLeft: hasDoorLeft,
      hasDoorRight: hasDoorRight
    });
  }

  // ---- interactables (memo + creature) ----
  var interactables = [];
  // Rare memo (25% chance)
  if (R2() < 0.25) {
    var memoText = MEMO_TEXTS[Math.floor(R2() * MEMO_TEXTS.length)];
    var memoMesh = buildMemoNote(R2);
    // Place on a wall (front or side, mid-height)
    var mWallSide = Math.floor(R2()*4);
    var mInset = WALL_T/2 + 0.007;
    var mHangY = 1.4 + R2()*0.4;
    if (mWallSide===0) {
      memoMesh.position.set((R2()-0.5)*W*0.5, mHangY, -hd+mInset); memoMesh.rotation.y=0;
    } else if (mWallSide===1) {
      memoMesh.position.set((R2()-0.5)*W*0.5, mHangY, hd-mInset); memoMesh.rotation.y=Math.PI;
    } else if (mWallSide===2) {
      memoMesh.position.set(-hw+mInset, mHangY, (R2()-0.5)*D*0.5); memoMesh.rotation.y=Math.PI/2;
    } else {
      memoMesh.position.set(hw-mInset, mHangY, (R2()-0.5)*D*0.5); memoMesh.rotation.y=-Math.PI/2;
    }
    grp.add(memoMesh);
    interactables.push({ type:'memo', lx:memoMesh.position.x, ly:mHangY+0.05, lz:memoMesh.position.z, data:{text:memoText}, mesh:memoMesh });
  }
  // Very rare creature (15% chance)
  if (R2() < 0.15) {
    var crId = Math.floor(R2() * CREATURE_DATA.length);
    var crDef = CREATURE_DATA[crId];
    var crMesh = buildCreature3D(crDef.visualType, R2, crDef.palette);
    var crX = (R2()-0.5)*Math.max(2, W-6);
    var crZ = (R2()-0.5)*Math.max(2, D-6);
    crMesh.position.set(crX, 0, crZ);
    crMesh.rotation.y = R2()*Math.PI*2;
    crMesh.userData.baseY = 0;
    crMesh.userData.creatureId = crId;
    // Set initial wander target
    crMesh.userData.wanderTarget.set(crX, 0, crZ);
    crMesh.userData.wanderTimer = 2.0 + Math.random() * 3.0;
    grp.add(crMesh);
    var crBodyH = crMesh.userData.bodyH || 1.4;
    interactables.push({ type:'creature', lx:crX, ly:crBodyH * 0.5, lz:crZ, data:{creatureId:crId}, mesh:crMesh });
  }
  // Insects: 55% chance, 1-3 insects per room
  if (R2() < 0.55) {
    var insectCount = 1 + Math.floor(R2() * 3);
    for (var ii=0; ii<insectCount; ii++) {
      var insId = Math.floor(R2() * CREATURE_DATA.length);
      var insDef = CREATURE_DATA[insId];
      var insMesh = buildCreature3D(insDef.visualType, R2);
      var insX = (R2()-0.5)*Math.max(2, W-4);
      var insZ = (R2()-0.5)*Math.max(2, D-4);
      insMesh.position.set(insX, 0, insZ);
      insMesh.rotation.y = R2()*Math.PI*2;
      insMesh.userData.baseY = 0;
      insMesh.userData.creatureId = insId;
      insMesh.userData.wanderTarget.set(insX, 0, insZ);
      insMesh.userData.wanderTimer = 0.5 + Math.random() * 2.0;
      grp.add(insMesh);
      var insBodyH = insMesh.userData.bodyH || 0.7;
      interactables.push({ type:'creature', lx:insX, ly:insBodyH * 0.5, lz:insZ, data:{insect:true, creatureId:insId}, mesh:insMesh });
    }
  }

  // ---- door trigger data ----
  var doors = [{ wall:'front', dx:frontDX, dz:0, seed:Math.floor(R2()*99991)+1 }];
  if (hasDoorBack)  doors.push({ wall:'back',  dx:backDX,  dz:0,      seed:Math.floor(R2()*99991)+1 });
  if (hasDoorLeft)  doors.push({ wall:'left',  dx:0,       dz:leftDZ, seed:Math.floor(R2()*99991)+1 });
  if (hasDoorRight) doors.push({ wall:'right', dx:0,       dz:rightDZ,seed:Math.floor(R2()*99991)+1 });

  return { group:grp, W:W, D:D, H:H, hw:hw, hd:hd,
           DOOR_W:DOOR_W, DOOR_H:DOOR_H, doors:doors,
           shapeType:shapeType, shapeLabel:shapeLabel,
           interactables: interactables,
           collidables: collidables,
           stairData: stairData,
           // Cap brightness to ~82% (210/255) so the sky/fog never become
           // pure white even on bright palettes, while wall textures stay vivid.
           palColor: new THREE.Color(
             Math.min(pal.wr, 210) / 255,
             Math.min(pal.wg, 210) / 255,
             Math.min(pal.wb, 210) / 255),
           fogNear:fogNear, fogFar:fogFar };
}

/* ----------------------------------------------------------
   Camera / movement
---------------------------------------------------------- */
var yaw       = 0;
var pitch     = 0;
var walkPhase = 0;
var SPEED     = 0.052;
var SPEED_WALK = 0.052;
var SPEED_RUN  = 0.155;
var moveHoldTime = 0;   // seconds held down
var RUN_THRESHOLD = 1.8; // seconds until running kicks in
var currentSpeed = SPEED_WALK;
var speedIndicatorEl = document.getElementById('speed-indicator');
var _floorY = 0;   // 階段昇降による床面オフセット（0=地面）

/* ----------------------------------------------------------
   Room & transition state
---------------------------------------------------------- */
var currentRoom   = null;
var roomNum       = 1;
var transitioning = false;
var fadeEl        = document.getElementById('fade');

/* ----------------------------------------------------------
   disposeRoom — 旧ルームのGPU/CPUリソースを完全解放
   Three.jsはscene.remove()だけではGPUメモリを解放しないため、
   geometry / material / texture を個別にdisposeする必要がある。
---------------------------------------------------------- */
function disposeRoom(room) {
  if (!room || !room.group) return;

  room.group.traverse(function(obj) {
    // ジオメトリ
    if (obj.geometry) {
      obj.geometry.dispose();
    }

    // マテリアル（配列の場合もある）
    if (obj.material) {
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (var mi = 0; mi < mats.length; mi++) {
        var mat = mats[mi];
        // PBRマテリアルが持ちうる全テクスチャスロットを破棄
        var texSlots = [
          'map', 'roughnessMap', 'metalnessMap',
          'normalMap', 'bumpMap', 'emissiveMap',
          'aoMap', 'lightMap', 'alphaMap',
          'envMap', 'displacementMap'
        ];
        for (var ti = 0; ti < texSlots.length; ti++) {
          if (mat[texSlots[ti]]) {
            mat[texSlots[ti]].dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}

function spawnRoom(seed) {
  var r = buildRoom(seed);
  r.group.position.set(0, 0, 0);
  scene.add(r.group);
  // Register interactables for this room
  clearInteractables();
  if (r.interactables) {
    r.interactables.forEach(function(it) {
      registerInteractable(it.type, it.lx, it.ly, it.lz, it.data, it.mesh);
    });
  }
  return r;
}

function forceRecoverTransition() {
  // Snap opacity to 0 immediately (disable transition first to bypass any
  // in-progress CSS animation that might be holding the screen black).
  fadeEl.style.transition = 'none';
  fadeEl.style.opacity = '0';
  void fadeEl.offsetHeight; // force reflow so the change is committed
  fadeEl.style.transition = 'opacity 0.5s ease';
  transitioning = false;
  if (document.getElementById('stick-zone')) {
    document.getElementById('stick-zone').style.display = isMobile ? 'block' : 'none';
  }
}

function enterDoor(door) {
  if (transitioning) return;
  transitioning = true;
  fadeEl.style.transition = 'opacity 0.35s ease';
  fadeEl.style.opacity    = '1';

  // Safety net: if anything goes wrong, force-recover after 1.5 seconds
  var recoveryTimer = setTimeout(function () {
    forceRecoverTransition();
  }, 1500);

  setTimeout(function () {
    try {
      disposeRoom(currentRoom);          // ★ GPU/CPUメモリを先に解放
      scene.remove(currentRoom.group);
      currentRoom = spawnRoom(door.seed);

      scene.fog.near = currentRoom.fogNear;
      scene.fog.far  = currentRoom.fogFar;
      scene.background.copy(currentRoom.palColor);
      scene.fog.color.copy(currentRoom.palColor);

      camera.position.set(0, 1.72 + (Math.random() - 0.5) * 0.14, currentRoom.hd - 2.5);
      walkPhase = Math.random() * Math.PI * 2;
      yaw       = 0;
      _floorY   = 0;

      roomNum++;
      var sl2 = currentRoom.shapeLabel || {};
      var sname = sl2[currentRoom.shapeType] || 'ROOM';
      roomInfoEl.textContent = sname + ' ' + String(roomNum).padStart(3, '0');
    } catch (e) {
      console.warn('[enterDoor] spawnRoom error:', e);
      // Fallback: try a different seed
      try {
        var fallbackSeed = Math.floor(Math.random() * 99991) + 1;
        currentRoom = spawnRoom(fallbackSeed);
        scene.fog.near = currentRoom.fogNear;
        scene.fog.far  = currentRoom.fogFar;
        scene.background.copy(currentRoom.palColor);
        scene.fog.color.copy(currentRoom.palColor);
        camera.position.set(0, 1.72, currentRoom.hd - 2.5);
        walkPhase = 0; yaw = 0; _floorY = 0;
        roomNum++;
        roomInfoEl.textContent = 'ROOM ' + String(roomNum).padStart(3, '0');
      } catch (e2) {
        console.error('[enterDoor] fallback also failed:', e2);
        clearTimeout(recoveryTimer);
        forceRecoverTransition();
        return;
      }
    }

    clearTimeout(recoveryTimer);
    // Snap-then-restore: ensures fade-out commits even on low-spec/suspended tabs.
    setTimeout(function () {
      fadeEl.style.transition = 'none';
      fadeEl.style.opacity = '0';
      void fadeEl.offsetHeight; // force reflow
      fadeEl.style.transition = 'opacity 0.35s ease';
      setTimeout(function () { transitioning = false; }, 420);
    }, 110);
  }, 370);
}

function checkDoors() {
  if (transitioning || !currentRoom) return;
  var r   = currentRoom;
  var lx  = camera.position.x;
  var lz  = camera.position.z;
  var hw  = r.hw, hd = r.hd;
  var DW  = r.DOOR_W;
  var thr = DW / 2 + 0.28;

  for (var i = 0; i < r.doors.length; i++) {
    var d   = r.doors[i];
    var hit = false;
    if (d.wall === 'front'  && lz < -hd + 0.5 && Math.abs(lx - d.dx) < thr) hit = true;
    if (d.wall === 'back'   && lz >  hd - 0.5 && Math.abs(lx - d.dx) < thr) hit = true;
    if (d.wall === 'left'   && lx < -hw + 0.5 && Math.abs(lz - d.dz) < thr) hit = true;
    if (d.wall === 'right'  && lx >  hw - 0.5 && Math.abs(lz - d.dz) < thr) hit = true;
    if (hit) { enterDoor(d); return; }
  }
}

function checkDoorHint() {
  if (!currentRoom) return;
  var r = currentRoom;
  var lx = camera.position.x, lz = camera.position.z;
  var near = false;
  r.doors.forEach(function (d) {
    var dist = 999;
    if (d.wall === 'front') dist = lz - (-r.hd);
    else if (d.wall === 'back')  dist = r.hd - lz;
    else if (d.wall === 'left')  dist = lx - (-r.hw);
    else                         dist = r.hw - lx;
    if (dist < 4.0) near = true;
  });
  doorHintEl.classList.toggle('visible', near);
}
/* ----------------------------------------------------------
   Water surface animation
---------------------------------------------------------- */
function updateWaterSurfaces(dt) {
  for (var i = 0; i < activeWaterSurfaces.length; i++) {
    var ws = activeWaterSurfaces[i];
    ws.phase += dt * 1.05;
    var cv = ws.rippleCv, cx = ws.rippleCx, S = cv.width;

    // Mid-gray base = neutral roughness (0.5 in map = material roughness value)
    cx.fillStyle = '#7a7a7a';
    cx.fillRect(0, 0, S, S);

    // Expanding ripple rings from multiple independent sources
    for (var ri = 0; ri < ws.sources.length; ri++) {
      var src = ws.sources[ri];
      src.radius += dt * src.speed;
      if (src.radius > S * 1.35) {
        src.radius = 0;
        src.x = Math.random() * S;
        src.y = Math.random() * S;
      }
      var fade = Math.max(0, 1 - src.radius / (S * 1.35));
      if (fade <= 0) continue;
      // Crests = lighter gray (lower roughness = more reflective)
      // Troughs = darker gray (higher roughness)
      var wave = Math.sin(src.radius * 0.18) * 0.5 + 0.5; // 0..1
      var grayVal = Math.floor(85 + wave * 100);
      cx.strokeStyle = 'rgba(' + grayVal + ',' + grayVal + ',' + grayVal + ',' + (fade * 0.70) + ')';
      cx.lineWidth = 1.0 + fade * 1.8;
      cx.beginPath();
      cx.arc(src.x, src.y, src.radius, 0, Math.PI * 2);
      cx.stroke();
    }

    // Glinting highlights (tiny bright specks that move with phase)
    for (var sp = 0; sp < 10; sp++) {
      var frac1 = ((ws.phase * 0.065 + sp * 0.1731) % 1);
      var frac2 = ((ws.phase * 0.051 + sp * 0.1337) % 1);
      var gx = frac1 * S;
      var gy = frac2 * S;
      var intensity = 0.5 + Math.sin(ws.phase * 6.3 + sp * 2.1) * 0.5;
      var sv = Math.floor(185 + intensity * 55);
      cx.fillStyle = 'rgba(' + sv + ',' + sv + ',' + sv + ',0.5)';
      cx.fillRect(gx, gy, 2.5, 2.5);
    }

    ws.rippleTex.needsUpdate = true;

    // Caustic light: pulsing intensity + slow drift
    if (ws.causticLight) {
      var lPhase = ws.phase;
      ws.causticLight.intensity = 0.45
        + Math.sin(lPhase * 2.3) * 0.14
        + Math.cos(lPhase * 3.9) * 0.08;
      ws.causticLight.position.x = Math.sin(lPhase * 0.65) * 0.32;
      ws.causticLight.position.z = Math.cos(lPhase * 0.88) * 0.32;
    }

    // Fountain spout scale + opacity flicker
    for (var fsi = 0; fsi < ws.spouts.length; fsi++) {
      var sp2 = ws.spouts[fsi];
      var sp2Phase = ws.phase + fsi * 0.75;
      sp2.mesh.scale.y = 0.82 + Math.sin(sp2Phase * 4.5) * 0.18;
      sp2.mesh.material.opacity = 0.38 + Math.sin(sp2Phase * 3.2) * 0.16;
    }
  }
}

