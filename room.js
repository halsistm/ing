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
   Rounded-box geometry  (used for "soft" objects)
   Sharp / futuristic objects keep plain BoxGeometry.
---------------------------------------------------------- */
function createRoundedBoxGeo(width, height, depth, radius, segs) {
  segs   = segs   || 3;
  radius = Math.min(radius, Math.min(width, height, depth) * 0.499);
  var hw = width  / 2 - radius;
  var hh = height / 2 - radius;
  var shape = new THREE.Shape();
  shape.absarc( hw,  hh, radius,           0, Math.PI / 2,    false);
  shape.absarc(-hw,  hh, radius, Math.PI / 2, Math.PI,        false);
  shape.absarc(-hw, -hh, radius, Math.PI,     Math.PI * 1.5,  false);
  shape.absarc( hw, -hh, radius, Math.PI * 1.5, Math.PI * 2,  false);
  var ext = new THREE.ExtrudeGeometry(shape, {
    depth:          Math.max(0.001, depth - radius * 2),
    bevelEnabled:   true,
    bevelSegments:  segs,
    steps:          1,
    bevelSize:      radius,
    bevelThickness: radius,
    curveSegments:  segs * 4
  });
  ext.center();
  return ext;
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
   Exhibits & Objects
---------------------------------------------------------- */
function buildMonolith(R2, H2) {
  var g    = new THREE.Group();
  var h    = 1.8 + R2() * H2 * 0.4;
  var w    = 0.14 + R2() * 0.2;
  var d    = 0.42 + R2() * 0.5;
  var cols = [0x080806, 0xf0ece6, 0xfafafa, 0x1a1814];
  var m    = mkMesh(
    new THREE.BoxGeometry(w, h, d),
    matStd(
      cols[Math.floor(R2() * cols.length)],
      0.12 + R2() * 0.5,
      0.1  + R2() * 0.6
    )
  );
  m.position.y = h / 2;
  g.add(m);
  var shd = makeDropShadow(Math.max(w, d) * 0.85, Math.max(w, d) * 0.85, 0.63);
  g.add(shd);
  return g;
}

function buildSphere(R2) {
  var g    = new THREE.Group();
  var r    = 0.55 + R2() * 1.8;
  var cols = [0xd8d4cc, 0xfcf8f4, 0x0a0a08, 0xe8d4b8];
  var s    = mkMesh(
    new THREE.SphereGeometry(r, 36, 24),
    matStd(
      cols[Math.floor(R2() * cols.length)],
      0.08 + R2() * 0.7,
      R2() * 0.6
    )
  );
  s.position.y = r;
  g.add(s);
  var shd = makeDropShadow(r * 0.9, r * 0.9, 0.53);
  g.add(shd);
  return g;
}

function buildSculpture(R2) {
  var g    = new THREE.Group();
  var mat1 = matStd(0x0c0c0a, 0.14, 0.5);
  var mat2 = matStd(0xe8ddd0, 0.86, 0.02);
  var ly   = 2 + Math.floor(R2() * 2);
  var y    = 0;
  var l, t, sz, hh, geo, part;
  for (l = 0; l < ly; l++) {
    t  = Math.floor(R2() * 3);
    sz = 0.25 + R2() * 0.35;
    hh = 0.25 + R2() * 0.7;
    if (t === 0) {
      geo = new THREE.BoxGeometry(sz, hh, sz);
    } else if (t === 1) {
      geo = new THREE.CylinderGeometry(
        sz * 0.5, sz * 0.5, hh, 12
      );
    } else {
      geo = new THREE.CylinderGeometry(
        sz * 0.45, sz * 0.1, hh, 12
      );
    }
    part = mkMesh(
      geo, l % 2 === 0 ? mat1.clone() : mat2.clone()
    );
    y += hh * 0.5;
    part.position.y = y;
    y += hh * 0.5;
    part.rotation.y = R2() * Math.PI;
    g.add(part);
  }
  var shd = makeDropShadow(0.5, 0.5, 0.56);
  g.add(shd);
  return g;
}

function buildCanvasArt(R2) {
  var g  = new THREE.Group();
  var cw = 1.2 + R2() * 2.6;
  var ch = 1.0 + R2() * 2.0;
  var CX = 512;
  var CY = Math.floor(512 * ch / cw);
  var cv2 = document.createElement('canvas');
  cv2.width  = CX;
  cv2.height = CY;
  var cx = cv2.getContext('2d');
  var pals = [
    [[245,240,232],[28,24,20]],
    [[240,235,226],[220,175,110]],
    [[228,232,234],[38,86,128]],
    [[240,236,232],[138,28,38]]
  ];
  var pal = pals[Math.floor(R2() * pals.length)];
  cx.fillStyle
    = 'rgb(' + pal[0][0] + ',' + pal[0][1] + ',' + pal[0][2] + ')';
  cx.fillRect(0, 0, CX, CY);
  var i, c, tp;
  for (i = 0; i < 3 + Math.floor(R2() * 7); i++) {
    c  = pal[Math.floor(R2() * pal.length)];
    tp = Math.floor(R2() * 3);
    cx.fillStyle = 'rgba('
      + c[0] + ',' + c[1] + ',' + c[2] + ','
      + (0.3 + R2() * 0.65) + ')';
    if (tp === 0) {
      cx.fillRect(
        R2() * CX * 0.6, R2() * CY * 0.6,
        16 + R2() * CX * 0.4, 4 + R2() * CY * 0.3
      );
    } else if (tp === 1) {
      cx.beginPath();
      cx.arc(
        R2() * CX, R2() * CY,
        6 + R2() * CX * 0.2, 0, Math.PI * 2
      );
      cx.fill();
    } else {
      cx.beginPath();
      cx.moveTo(R2() * CX, R2() * CY);
      cx.lineTo(R2() * CX, R2() * CY);
      cx.lineTo(R2() * CX, R2() * CY);
      cx.closePath(); cx.fill();
    }
  }
  var art = mkMesh(
    new THREE.BoxGeometry(cw, ch, 0.028),
    new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(cv2),
      roughness: 0.88, metalness: 0.0
    })
  );
  art.position.y = ch / 2;
  g.add(art);
  var sl = new THREE.PointLight(0xfff4e0, 1.8, 5.5, 2.0);
  sl.position.set(0, ch + 1.0, 0.5);
  g.add(sl);
  return g;
}

function buildBench(R2) {
  var g = new THREE.Group();
  var w = 1.5 + R2() * 1.5;
  var h = 0.4 + R2() * 0.2;
  var d = 0.4 + R2() * 0.2;
  var mat = matStd(0xeeeeee, 0.88, 0.05);
  // Rounded seat top
  var top = mkMesh(createRoundedBoxGeo(w, 0.06, d, 0.018, 3), mat);
  top.position.y = h;
  g.add(top);
  // Round legs (cylinder)
  var legMat = matStd(0xe0e0e0, 0.82, 0.08);
  var legGeo = new THREE.CylinderGeometry(0.022, 0.022, h, 12);
  var offX = w / 2 - 0.18;
  var offZ = d * 0.32;
  [[-offX,-offZ],[-offX,offZ],[offX,-offZ],[offX,offZ]].forEach(function(p) {
    var leg = mkMesh(legGeo, legMat.clone());
    leg.position.set(p[0], h / 2, p[1]);
    g.add(leg);
  });
  var shd = makeDropShadow(w * 0.55, d * 0.55, 0.50);
  g.add(shd);
  return g;
}

/* ----------------------------------------------------------
   Basin stone texture (for water feature)
---------------------------------------------------------- */
function makeBasinTex(hexColor) {
  var S = 512;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var cx = cv.getContext('2d');
  var r = (hexColor >> 16) & 0xff;
  var gv = (hexColor >> 8) & 0xff;
  var b = hexColor & 0xff;
  cx.fillStyle = 'rgb(' + r + ',' + gv + ',' + b + ')';
  cx.fillRect(0, 0, S, S);
  // Stone grain noise
  for (var i = 0; i < 40000; i++) {
    var dv = (Math.random() - 0.5) * 30;
    cx.fillStyle = 'rgba(' +
      Math.floor(Math.min(255, Math.max(0, r + dv))) + ',' +
      Math.floor(Math.min(255, Math.max(0, gv + dv))) + ',' +
      Math.floor(Math.min(255, Math.max(0, b + dv))) + ',0.045)';
    cx.fillRect(Math.random() * S, Math.random() * S, Math.random() * 2.5 + 0.4, Math.random() * 2.5 + 0.4);
  }
  // Tile grout lines
  var groutA = 0.15 + Math.random() * 0.1;
  cx.strokeStyle = 'rgba(' + Math.floor(r * 0.58) + ',' + Math.floor(gv * 0.58) + ',' + Math.floor(b * 0.58) + ',' + groutA + ')';
  cx.lineWidth = 1.8;
  for (var k = 0; k <= S; k += 64) {
    cx.beginPath(); cx.moveTo(k, 0); cx.lineTo(k, S); cx.stroke();
    cx.beginPath(); cx.moveTo(0, k); cx.lineTo(S, k); cx.stroke();
  }
  // Crack veins
  for (var j = 0; j < 6; j++) {
    var lx = Math.random() * S, ly = Math.random() * S;
    cx.strokeStyle = 'rgba(' + Math.floor(r * 0.55) + ',' + Math.floor(gv * 0.55) + ',' + Math.floor(b * 0.55) + ',0.2)';
    cx.lineWidth = 0.6 + Math.random() * 1.0;
    cx.beginPath();
    cx.moveTo(lx, ly);
    cx.lineTo(lx + (Math.random() - 0.5) * 160, ly + (Math.random() - 0.5) * 90);
    cx.stroke();
  }
  // Wet stain ring (algae/mineral deposit at waterline)
  var grad = cx.createRadialGradient(S/2, S/2, S*0.15, S/2, S/2, S*0.48);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(' + Math.floor(r*0.7) + ',' + Math.floor(gv*0.8) + ',' + Math.floor(b*0.75) + ',0.22)');
  cx.fillStyle = grad;
  cx.fillRect(0, 0, S, S);
  var t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ----------------------------------------------------------
   Water feature — enhanced (pool / fountain / puddles)
---------------------------------------------------------- */
function buildWaterFeature(R2) {
  var g = new THREE.Group();
  var waterType = Math.floor(R2() * 3); // 0=pool, 1=fountain, 2=puddles

  /* ---- shared water colours ---- */
  var waterPalettes = [
    { col: 0x0d3a5c, emit: 0x0a2840, lightCol: 0x4488cc }, // deep midnight blue
    { col: 0x0e4a3a, emit: 0x083020, lightCol: 0x44aaaa }, // dark teal
    { col: 0x1a1a3a, emit: 0x0a0a28, lightCol: 0x6666cc }, // near-black indigo
    { col: 0x2a4a1a, emit: 0x182810, lightCol: 0x66aa44 }, // swamp green
    { col: 0x3a2a10, emit: 0x201808, lightCol: 0xaa8844 }, // brackish brown
    { col: 0x1a3a3a, emit: 0x102020, lightCol: 0x44aaaa }, // dark cyan
  ];
  var wp = waterPalettes[Math.floor(R2() * waterPalettes.length)];

  /* ---- basin styles ---- */
  var basinStyles = [
    { hex: 0x6a6258, rough: 0.91 }, // concrete
    { hex: 0x4a4038, rough: 0.88 }, // dark wet stone
    { hex: 0x8a7c68, rough: 0.85 }, // limestone
    { hex: 0x303028, rough: 0.95 }, // granite
    { hex: 0x786050, rough: 0.82 }, // brick/terracotta
  ];
  var bs = basinStyles[Math.floor(R2() * basinStyles.length)];

  /* ==================================================
     TYPE 2 — Puddle cluster (flat, no basin walls)
  ================================================== */
  if (waterType === 2) {
    var pCount = 3 + Math.floor(R2() * 4);
    var rippleS2 = 128;
    var rippleCv2 = document.createElement('canvas');
    rippleCv2.width = rippleCv2.height = rippleS2;
    var rippleCx2 = rippleCv2.getContext('2d');
    var rippleTex2 = new THREE.CanvasTexture(rippleCv2);
    rippleTex2.wrapS = rippleTex2.wrapT = THREE.RepeatWrapping;

    var puddleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wp.col),
      transparent: true, opacity: 0.65,
      roughness: 0.04, metalness: 0.92,
      roughnessMap: rippleTex2,
    });

    for (var pi = 0; pi < pCount; pi++) {
      var pr = 0.22 + R2() * 0.7;
      var pxOff = (R2() - 0.5) * 3.0;
      var pzOff = (R2() - 0.5) * 3.0;
      var pGeo = new THREE.CircleGeometry(pr, 10 + Math.floor(R2() * 8));
      var pud = mkMesh(pGeo, puddleMat.clone());
      pud.rotation.x = -Math.PI / 2;
      pud.position.set(pxOff, 0.004, pzOff);
      g.add(pud);
    }

    // Dim caustic light
    var pdLight = new THREE.PointLight(wp.lightCol, 0.3, 3.5, 2.5);
    pdLight.position.set(0, 0.35, 0);
    g.add(pdLight);

    var sources2 = [];
    for (var si2 = 0; si2 < 4; si2++) {
      sources2.push({ x: Math.random() * rippleS2, y: Math.random() * rippleS2,
        radius: Math.random() * rippleS2, speed: 12 + Math.random() * 18 });
    }
    activeWaterSurfaces.push({
      rippleCv: rippleCv2, rippleCx: rippleCx2, rippleTex: rippleTex2,
      causticLight: pdLight, spouts: [], phase: R2() * Math.PI * 2,
      sources: sources2
    });
    return g;
  }

  /* ==================================================
     TYPES 0 & 1 — Pool or Fountain (with basin)
  ================================================== */
  var w  = 1.6 + R2() * 3.4;
  var d  = 1.6 + R2() * 3.4;
  var wallH = 0.14 + R2() * 0.18;
  var wallT = 0.11;
  var rimOvhg = 0.055;
  var rimH    = 0.055;

  // -- Basin texture --
  var basinTex = makeBasinTex(bs.hex);
  basinTex.repeat.set(4, 4);
  var basinMat = new THREE.MeshStandardMaterial({
    map: basinTex, roughness: bs.rough, metalness: 0.02
  });

  // -- Basin floor --
  var bFloor = mkMesh(new THREE.BoxGeometry(w, wallT, d), basinMat.clone());
  bFloor.position.y = wallT / 2;
  g.add(bFloor);

  // -- Basin walls (4 sides) --
  var wDefs = [
    [w + wallT*2, wallH, wallT,  0,             wallH/2 + wallT,  d/2 + wallT/2],
    [w + wallT*2, wallH, wallT,  0,             wallH/2 + wallT, -d/2 - wallT/2],
    [wallT,       wallH, d,     -w/2 - wallT/2, wallH/2 + wallT,  0            ],
    [wallT,       wallH, d,      w/2 + wallT/2, wallH/2 + wallT,  0            ],
  ];
  wDefs.forEach(function(wd) {
    var m = mkMesh(new THREE.BoxGeometry(wd[0], wd[1], wd[2]), basinMat.clone());
    m.position.set(wd[3], wd[4], wd[5]);
    g.add(m);
  });

  // -- Rim (overhang cap) --
  var rimBrightHex = bs.hex + 0x101008; // slightly lighter
  var rimTex = makeBasinTex(Math.min(0xffffff, rimBrightHex));
  rimTex.repeat.set(3, 3);
  var rimMat = new THREE.MeshStandardMaterial({
    map: rimTex, roughness: Math.max(0.55, bs.rough - 0.18), metalness: 0.05
  });
  var rimY = wallT + wallH + rimH / 2;
  var rimDefs = [
    [w + (wallT+rimOvhg)*2, rimH, wallT+rimOvhg*2,  0,             rimY,  d/2 + wallT/2],
    [w + (wallT+rimOvhg)*2, rimH, wallT+rimOvhg*2,  0,             rimY, -d/2 - wallT/2],
    [wallT+rimOvhg*2, rimH, d + (wallT+rimOvhg)*2, -w/2-wallT/2,  rimY,  0             ],
    [wallT+rimOvhg*2, rimH, d + (wallT+rimOvhg)*2,  w/2+wallT/2,  rimY,  0             ],
  ];
  rimDefs.forEach(function(rd) {
    var m = mkMesh(new THREE.BoxGeometry(rd[0], rd[1], rd[2]), rimMat.clone());
    m.position.set(rd[3], rd[4], rd[5]);
    g.add(m);
  });

  // -- Ripple canvas (animated roughnessMap) --
  var rippleS = 256;
  var rippleCv = document.createElement('canvas');
  rippleCv.width = rippleCv.height = rippleS;
  var rippleCx = rippleCv.getContext('2d');
  var rippleTex = new THREE.CanvasTexture(rippleCv);
  rippleTex.wrapS = rippleTex.wrapT = THREE.RepeatWrapping;
  rippleTex.repeat.set(Math.max(1, w * 0.55), Math.max(1, d * 0.55));

  // -- Water surface --
  var waterY = wallT + wallH;
  var waterMat = new THREE.MeshStandardMaterial({
    color:        new THREE.Color(wp.col),
    emissive:     new THREE.Color(wp.emit),
    emissiveIntensity: 0.35,
    transparent:  true,
    opacity:      0.80,
    roughness:    0.04,
    metalness:    0.90,
    roughnessMap: rippleTex,
  });
  var waterMesh = mkMesh(
    new THREE.PlaneGeometry(w - wallT * 0.2, d - wallT * 0.2, 1, 1),
    waterMat
  );
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = waterY;
  g.add(waterMesh);

  // -- Caustic / underwater light --
  var causticLight = new THREE.PointLight(wp.lightCol, 0.55, w * 2.8 + 2, 2.2);
  causticLight.position.set(0, waterY + 0.15, 0);
  g.add(causticLight);

  // -- Water-line wet stain (semi-transparent dark strip on inside wall top) --
  var stainMat = new THREE.MeshStandardMaterial({
    color: 0x050505, transparent: true, opacity: 0.28,
    roughness: 0.6, metalness: 0.0, depthWrite: false
  });
  var stainH = 0.04;
  var stainDefs = [
    [w, stainH, 0.01,  0,             waterY - stainH/2,  d/2 - 0.01],
    [w, stainH, 0.01,  0,             waterY - stainH/2, -d/2 + 0.01],
    [0.01, stainH, d, -w/2 + 0.01,   waterY - stainH/2,  0          ],
    [0.01, stainH, d,  w/2 - 0.01,   waterY - stainH/2,  0          ],
  ];
  stainDefs.forEach(function(sd) {
    var m = mkMesh(new THREE.BoxGeometry(sd[0], sd[1], sd[2]), stainMat.clone());
    m.position.set(sd[3], sd[4], sd[5]);
    g.add(m);
  });

  // ---- Ripple sources (multiple independent origins) ----
  var srcCount = 3 + Math.floor(R2() * 4);
  var sources = [];
  for (var si = 0; si < srcCount; si++) {
    sources.push({
      x: Math.random() * rippleS,
      y: Math.random() * rippleS,
      radius: Math.random() * rippleS,
      speed: 14 + Math.random() * 22,
    });
  }

  // ---- FOUNTAIN (type 1) ----
  var spouts = [];
  if (waterType === 1) {
    var colR = 0.055 + R2() * 0.085;
    var colH = 0.18 + R2() * 0.55;
    var colMat = basinMat.clone();
    var col = mkMesh(new THREE.CylinderGeometry(colR, colR * 1.35, colH, 14), colMat);
    col.position.y = waterY + colH / 2;
    g.add(col);

    // Small basin top on column
    var topBasin = mkMesh(new THREE.CylinderGeometry(colR * 2.8, colR * 2.2, 0.04, 14), rimMat.clone());
    topBasin.position.y = waterY + colH;
    g.add(topBasin);

    // Water spout streams
    var spoutN = 4 + Math.floor(R2() * 4);
    var spoutColor = new THREE.Color(wp.col).lerp(new THREE.Color(0xaaddff), 0.55);
    for (var fsi = 0; fsi < spoutN; fsi++) {
      var angle = (fsi / spoutN) * Math.PI * 2;
      var spoutH = 0.28 + R2() * 0.45;
      var spoutMat = new THREE.MeshStandardMaterial({
        color: spoutColor,
        emissive: spoutColor, emissiveIntensity: 0.25,
        transparent: true, opacity: 0.48,
        roughness: 0.04, metalness: 0.0,
      });
      var spoutMesh = mkMesh(
        new THREE.CylinderGeometry(0.007, 0.012, spoutH, 5),
        spoutMat
      );
      var tiltX = -Math.cos(angle) * 0.32;
      var tiltZ =  Math.sin(angle) * 0.32;
      spoutMesh.rotation.x = tiltX;
      spoutMesh.rotation.z = tiltZ;
      spoutMesh.position.set(
        Math.sin(angle) * (colR * 2.2),
        waterY + colH + spoutH * 0.45,
        Math.cos(angle) * (colR * 2.2)
      );
      g.add(spoutMesh);
      spouts.push({ mesh: spoutMesh });
    }

    // Glow above fountain
    var fLight = new THREE.PointLight(wp.lightCol, 1.1, 3.2, 2.2);
    fLight.position.set(0, waterY + colH + 0.7, 0);
    g.add(fLight);
  }

  // -- Shadow under basin --
  var shd = makeDropShadow(Math.max(w, d) * 0.72, Math.max(w, d) * 0.72, 0.56);
  g.add(shd);

  // -- Register for animation --
  activeWaterSurfaces.push({
    rippleCv: rippleCv, rippleCx: rippleCx, rippleTex: rippleTex,
    causticLight: causticLight, spouts: spouts,
    phase: R2() * Math.PI * 2, sources: sources
  });

  return g;
}

function buildStairs(R2, H) {
  var g = new THREE.Group();
  var steps = 10 + Math.floor(R2() * 15);
  var stepH = 0.15 + R2() * 0.05;
  var stepD = 0.25 + R2() * 0.05;
  var w = 1.0 + R2() * 1.0;
  var mat = matStd(0xdddddd, 0.8, 0.1);
  for(var i=0; i<steps; i++) {
    var step = mkMesh(new THREE.BoxGeometry(w, stepH, stepD), mat);
    step.position.set(0, i * stepH + stepH/2, -i * stepD);
    g.add(step);
  }
  return g;
}

function buildSpiralStairs(R2, H) {
  var g = new THREE.Group();
  var steps = 20 + Math.floor(R2() * 20);
  var mat = matStd(0xcccccc, 0.7, 0.2);
  var center = mkMesh(new THREE.CylinderGeometry(0.1, 0.1, steps * 0.15, 8), mat);
  center.position.y = steps * 0.15 / 2;
  g.add(center);
  for(var i=0; i<steps; i++) {
    var step = mkMesh(new THREE.BoxGeometry(1.2, 0.05, 0.3), mat);
    step.position.set(0.6, i * 0.15 + 0.025, 0);
    var pivot = new THREE.Group();
    pivot.position.y = i * 0.15;
    pivot.rotation.y = i * 0.4;
    pivot.add(step);
    g.add(pivot);
  }
  return g;
}

function buildPipes(R2, H) {
  var g = new THREE.Group();
  var h = 2.0 + R2() * (H - 2.0);
  var mat = matStd(0x888888, 0.4, 0.8);
  var pipe1 = mkMesh(new THREE.CylinderGeometry(0.08, 0.08, h, 8), mat);
  pipe1.position.y = h/2;
  g.add(pipe1);
  var w = 1.0 + R2() * 2.0;
  var pipe2 = mkMesh(new THREE.CylinderGeometry(0.08, 0.08, w, 8), mat);
  pipe2.rotation.z = Math.PI / 2;
  pipe2.position.set(w/2, h, 0);
  g.add(pipe2);
  return g;
}

// --- 新規追加: メガ・ルーム用巨大オブジェクト群 ---
function buildMegaSphere(R2, H) {
  var g = new THREE.Group();
  var r = 10 + R2() * 15;
  var mat = matStd(0x0a0a0a, 1.0, 0.0); // 光を完全に吸収する漆黒のマット質感
  var s = mkMesh(new THREE.SphereGeometry(r, 64, 32), mat);
  s.position.y = r;
  g.add(s);
  return g;
}

function buildMegaPillar(R2, H) {
  var g = new THREE.Group();
  var r = 2.5 + R2() * 5.0;
  var mat = matStd(0x1a1a1a, 1.0, 0.0); // ざらついた重いコンクリート調
  var p = mkMesh(new THREE.CylinderGeometry(r, r, H, 32), mat);
  p.position.y = H / 2;
  g.add(p);
  return g;
}

function buildMegaCube(R2, H) {
  var g = new THREE.Group();
  var sz = 12 + R2() * 20;
  var mat = matStd(0x111111, 0.95, 0.1); // 重厚で鈍い反射を持つ直方体
  var c = mkMesh(new THREE.BoxGeometry(sz, sz, sz), mat);
  c.position.y = sz / 2;
  c.rotation.y = R2() * Math.PI;
  g.add(c);
  return g;
}
// ------------------------------------------

/* ----------------------------------------------------------
   New smart / inorganic / stylish objects
---------------------------------------------------------- */

function buildObelisk(R2, H) {
  var g = new THREE.Group();
  var h = 2.0 + R2() * 3.5;
  var base = 0.18 + R2() * 0.12;
  var cols = [0x080808, 0xf2eee8, 0xb0a080, 0x1c2c3c, 0x2a1a0a];
  var mat = matStd(cols[Math.floor(R2() * cols.length)], 0.15 + R2() * 0.3, 0.4 + R2() * 0.4);
  var body = mkMesh(new THREE.CylinderGeometry(0.025, base, h * 0.88, 4), mat);
  body.position.y = h * 0.44; body.rotation.y = Math.PI / 4; g.add(body);
  var tip = mkMesh(new THREE.CylinderGeometry(0, 0.07, h * 0.12, 4), mat.clone());
  tip.position.y = h * 0.88 + h * 0.06; tip.rotation.y = Math.PI / 4; g.add(tip);
  var plate = mkMesh(new THREE.BoxGeometry(base * 2.8, 0.07, base * 2.8), mat.clone());
  plate.position.y = 0.035; g.add(plate);
  var shd = makeDropShadow(base * 1.8, base * 1.8, 0.49);
  g.add(shd);
  return g;
}

function buildTorus(R2) {
  var g = new THREE.Group();
  var r = 0.55 + R2() * 1.3;
  var tube = 0.045 + R2() * 0.1;
  var cols = [0x0a0a0a, 0xd8d8d8, 0xc8a050, 0x2a4a6a, 0x5a1a1a];
  var mat = matStd(cols[Math.floor(R2() * cols.length)], 0.1 + R2() * 0.3, 0.5 + R2() * 0.4);
  var torus = mkMesh(new THREE.TorusGeometry(r, tube, 20, 80), mat);
  torus.position.y = r + tube;
  var tilt = Math.floor(R2() * 3);
  if (tilt === 0) torus.rotation.x = Math.PI / 2;
  else if (tilt === 1) { torus.rotation.x = Math.PI / 5; torus.rotation.z = Math.PI / 7; }
  g.add(torus);
  var shd = makeDropShadow(r * 0.95, r * 0.95, 0.39);
  g.add(shd);
  return g;
}

function buildNeonFrame(R2) {
  var g = new THREE.Group();
  var w = 0.9 + R2() * 1.6;
  var h = 1.1 + R2() * 2.0;
  var t = 0.04;
  var neonColors = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff, 0xff4400, 0xcc00ff, 0x00ff88];
  var col = neonColors[Math.floor(R2() * neonColors.length)];
  var mat = new THREE.MeshStandardMaterial({
    color: col, emissive: new THREE.Color(col),
    emissiveIntensity: 3.0, roughness: 0.25, metalness: 0.4
  });
  var bars = [
    [w + t*2, t, t, 0, h, 0],
    [w + t*2, t, t, 0, 0, 0],
    [t, h, t, -w/2, h/2, 0],
    [t, h, t,  w/2, h/2, 0]
  ];
  bars.forEach(function(b) {
    var m = mkMesh(new THREE.BoxGeometry(b[0], b[1], b[2]), mat.clone());
    m.position.set(b[3], b[4], b[5]); g.add(m);
  });
  var pl = new THREE.PointLight(col, 2.2, 7.0, 2.0);
  pl.position.set(0, h / 2, 0.4); g.add(pl);
  return g;
}

function buildArch(R2, H) {
  var g = new THREE.Group();
  var w = 1.6 + R2() * 2.2;
  var h = 1.8 + R2() * 2.5;
  var t = 0.14 + R2() * 0.14;
  var cols = [0xe0e0e0, 0x111111, 0xb8a888, 0x3a3a3a, 0xf5f0e8];
  var mat = matStd(cols[Math.floor(R2() * cols.length)], 0.65, 0.05 + R2() * 0.2);
  var lp = mkMesh(new THREE.BoxGeometry(t, h, t), mat);
  lp.position.set(-w/2, h/2, 0); g.add(lp);
  var rp = mkMesh(new THREE.BoxGeometry(t, h, t), mat.clone());
  rp.position.set( w/2, h/2, 0); g.add(rp);
  var archR = w / 2 + t / 2;
  var arch = mkMesh(new THREE.TorusGeometry(archR, t / 2, 10, 40, Math.PI), mat.clone());
  arch.position.set(0, h, 0); arch.rotation.z = Math.PI; g.add(arch);
  var shd = makeDropShadow(w * 0.65, w * 0.65, 0.42);
  g.add(shd);
  return g;
}

function buildPyramid(R2) {
  var g = new THREE.Group();
  var base = 0.7 + R2() * 2.0;
  var h = base * (0.75 + R2() * 1.3);
  var cols = [0xf0ece4, 0x0a0a0a, 0xc8a850, 0x2a3a4a, 0x3a1a0a];
  var mat = matStd(cols[Math.floor(R2() * cols.length)], 0.25 + R2() * 0.5, R2() * 0.5);
  var pyr = mkMesh(new THREE.CylinderGeometry(0, base, h, 4), mat);
  pyr.position.y = h / 2; pyr.rotation.y = Math.PI / 4; g.add(pyr);
  var shd = makeDropShadow(base * 1.1, base * 1.1, 0.49);
  g.add(shd);
  return g;
}

function buildMirrorPillar(R2, H) {
  var g = new THREE.Group();
  var r = 0.12 + R2() * 0.2;
  var h = 0.8 + R2() * (H - 1.0) * 0.75;
  var shapeType = Math.floor(R2() * 3);
  var mat = matStd(0x080808, 0.02, 0.98);
  var geo;
  if (shapeType === 0) geo = new THREE.CylinderGeometry(r, r, h, 32);
  else if (shapeType === 1) geo = new THREE.BoxGeometry(r * 2, h, r * 2);
  else geo = new THREE.CylinderGeometry(r, r, h, 6);
  var pillar = mkMesh(geo, mat);
  pillar.position.y = h / 2; g.add(pillar);
  var cap = mkMesh(new THREE.CylinderGeometry(r * 1.25, r * 1.25, 0.05, 32),
    matStd(0x060606, 0.02, 0.99));
  cap.position.y = h + 0.025; g.add(cap);
  var shd = makeDropShadow(r * 1.8, r * 1.8, 0.72);
  g.add(shd);
  return g;
}

function buildCrystal(R2) {
  var g = new THREE.Group();
  var r = 0.28 + R2() * 0.85;
  var cols = [0xe0f4ff, 0xffe0f4, 0xf4ffe0, 0xffffff, 0xe8e0ff];
  var mat = new THREE.MeshStandardMaterial({
    color: cols[Math.floor(R2() * cols.length)],
    roughness: 0.04, metalness: 0.08,
    transparent: true, opacity: 0.72
  });
  var crystal = mkMesh(new THREE.OctahedronGeometry(r, 0), mat);
  crystal.position.y = r + 0.1;
  crystal.rotation.y = R2() * Math.PI;
  crystal.rotation.x = R2() * 0.4;
  g.add(crystal);
  var pl = new THREE.PointLight(0xd0ecff, 1.4, r * 6, 2.0);
  pl.position.y = r + 0.1; g.add(pl);
  var shd = makeDropShadow(r * 0.8, r * 0.8, 0.35);
  g.add(shd);
  return g;
}

function buildStackedBoxes(R2) {
  var g = new THREE.Group();
  var n = 2 + Math.floor(R2() * 5);
  var baseSize = 0.45 + R2() * 0.55;
  var lightMat = matStd(0xe8e4dc, 0.82, 0.04);
  var darkMat = matStd(0x111111, 0.78, 0.08);
  var metalMat = matStd(0x888888, 0.2, 0.9);
  var mats = [lightMat, darkMat, metalMat];
  var y = 0;
  for (var i = 0; i < n; i++) {
    var sz = baseSize * (1.0 - i * 0.06);
    var bh = sz * (0.5 + R2() * 0.7);
    var box = mkMesh(createRoundedBoxGeo(sz, bh, sz * (0.6 + R2() * 0.6), sz * 0.045, 3),
      mats[Math.floor(R2() * mats.length)].clone());
    box.position.y = y + bh / 2;
    box.rotation.y = R2() * Math.PI;
    g.add(box); y += bh;
  }
  var shd = makeDropShadow(baseSize * 0.9, baseSize * 0.9, 0.49);
  g.add(shd);
  return g;
}

function buildPendulum(R2, H) {
  var g = new THREE.Group();
  var pendH = H * (0.45 + R2() * 0.45);
  var mat = matStd(0x606060, 0.35, 0.85);
  var rod = mkMesh(new THREE.CylinderGeometry(0.012, 0.012, pendH, 8), mat);
  rod.position.y = H - pendH / 2; g.add(rod);
  var bobType = Math.floor(R2() * 3);
  var bobMat = matStd(0x060606, 0.04, 0.96);
  var bob;
  if (bobType === 0) bob = mkMesh(new THREE.SphereGeometry(0.14 + R2() * 0.22, 28, 18), bobMat);
  else if (bobType === 1) { bob = mkMesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), bobMat); bob.rotation.y = Math.PI/4; bob.rotation.x = Math.PI/8; }
  else bob = mkMesh(new THREE.OctahedronGeometry(0.18 + R2() * 0.14, 0), bobMat);
  bob.position.y = H - pendH - 0.15; g.add(bob);
  var pl = new THREE.PointLight(0xfff8f0, 0.7, 3.5, 2.0);
  pl.position.y = H - pendH - 0.15; g.add(pl);
  return g;
}

function buildWireframeCube(R2) {
  var g = new THREE.Group();
  var sz = 0.55 + R2() * 1.6;
  var cubeGeo = new THREE.BoxGeometry(sz, sz, sz);
  var edges = new THREE.EdgesGeometry(cubeGeo);
  var lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  var wf = new THREE.LineSegments(edges, lineMat);
  wf.position.y = sz / 2 + 0.25 + R2() * 0.5;
  wf.rotation.x = R2() * Math.PI; wf.rotation.z = R2() * Math.PI;
  g.add(wf);
  var ped = mkMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 16),
    matStd(0x111111, 0.85, 0.1));
  ped.position.y = 0.125; g.add(ped);
  var shd = makeDropShadow(0.3, 0.3, 0.42);
  g.add(shd);
  return g;
}

function buildGridPanel(R2, H) {
  var g = new THREE.Group();
  var pw = 1.4 + R2() * 2.0;
  var ph = 1.2 + R2() * 2.5;
  var cols = 6 + Math.floor(R2() * 8);
  var rows = Math.ceil(cols * ph / pw);
  var cw = pw / cols, rh = ph / rows;
  var mat = new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.4 });
  var points = [];
  var i;
  for (i = 0; i <= cols; i++) {
    points.push(new THREE.Vector3(-pw/2 + i*cw, -ph/2, 0));
    points.push(new THREE.Vector3(-pw/2 + i*cw,  ph/2, 0));
  }
  for (i = 0; i <= rows; i++) {
    points.push(new THREE.Vector3(-pw/2, -ph/2 + i*rh, 0));
    points.push(new THREE.Vector3( pw/2, -ph/2 + i*rh, 0));
  }
  var geo = new THREE.BufferGeometry().setFromPoints(points);
  var grid = new THREE.LineSegments(geo, mat);
  grid.position.y = ph / 2 + 0.05;
  g.add(grid);
  // Thin frame
  var frameMat = matStd(0x2a2a2a, 0.6, 0.5);
  var frame = mkMesh(new THREE.BoxGeometry(pw + 0.04, ph + 0.04, 0.02), frameMat);
  frame.position.y = ph / 2 + 0.05; g.add(frame);
  return g;
}

function buildOrb(R2, H) {
  // Glowing orb elevated on a pedestal
  var g = new THREE.Group();
  var pedH = 0.8 + R2() * 1.2;
  var pedR = 0.1 + R2() * 0.08;
  var orbR = 0.18 + R2() * 0.3;
  var pedMat = matStd(0x1a1a1a, 0.7, 0.2);
  var ped = mkMesh(new THREE.CylinderGeometry(pedR, pedR * 1.5, pedH, 24), pedMat);
  ped.position.y = pedH / 2; g.add(ped);
  var capMat = matStd(0x0d0d0d, 0.5, 0.3);
  var cap = mkMesh(new THREE.CylinderGeometry(orbR * 1.1, pedR, 0.06, 24), capMat);
  cap.position.y = pedH; g.add(cap);
  var orbCols = [0x00ffcc, 0xff4488, 0xffdd00, 0x4488ff, 0xff8800];
  var col = orbCols[Math.floor(R2() * orbCols.length)];
  var orbMat = new THREE.MeshStandardMaterial({
    color: col, emissive: new THREE.Color(col),
    emissiveIntensity: 1.8, roughness: 0.1, metalness: 0.0,
    transparent: true, opacity: 0.88
  });
  var orb = mkMesh(new THREE.SphereGeometry(orbR, 28, 20), orbMat);
  orb.position.y = pedH + orbR + 0.04; g.add(orb);
  var pl = new THREE.PointLight(col, 3.0, orbR * 18, 2.0);
  pl.position.y = pedH + orbR + 0.04; g.add(pl);
  var shd = makeDropShadow(pedR * 2.5, pedR * 2.5, 0.7);
  g.add(shd);
  return g;
}

function buildSlab(R2) {
  // Minimal altar / floating slab
  var g = new THREE.Group();
  var w = 1.2 + R2() * 2.5;
  var d = 0.6 + R2() * 1.0;
  var h = 0.08 + R2() * 0.1;
  var pedH = 0.6 + R2() * 1.0;
  var cols = [0xf4f0ec, 0x0c0c0c, 0x8a7a6a, 0xc4c4c4];
  var mat = matStd(cols[Math.floor(R2() * cols.length)], 0.5 + R2() * 0.3, 0.1 + R2() * 0.4);
  // Thin support
  var sup = mkMesh(new THREE.BoxGeometry(0.06, pedH, 0.06), matStd(0x1a1a1a, 0.8, 0.2));
  sup.position.y = pedH / 2; g.add(sup);
  // The slab
  var slab = mkMesh(createRoundedBoxGeo(w, h, d, Math.min(h, 0.025), 2), mat);
  slab.position.y = pedH; g.add(slab);
  var shd = makeDropShadow(Math.max(w, d) * 0.55, Math.max(w, d) * 0.55, 0.46);
  g.add(shd);
  return g;
}

// ------ ユニコーン置物 (unicon.glb) ------
function buildUnicorn(R2) {
  var g = new THREE.Group();
  var scale = 0.55 + R2() * 0.7;
  var s = scale;

  if (window._unicornGLTF) {
    // GLBモデルをクローンして配置
    var model = window._unicornGLTF.scene.clone(true);

    // バウンディングボックスで自動スケール調整
    var box = new THREE.Box3().setFromObject(model);
    var size = new THREE.Vector3();
    box.getSize(size);
    var maxDim = Math.max(size.x, size.y, size.z);
    var targetSize = 1.2 * s;
    var autoScale = (maxDim > 0) ? (targetSize / maxDim) : 1;
    model.scale.setScalar(autoScale);

    // 底面をY=0に合わせる
    box.setFromObject(model);
    model.position.y = -box.min.y;

    // マテリアルのshadowキャスト設定
    model.traverse(function(child) {
  if (child.isMesh) {
    child.geometry.computeVertexNormals(); // 法線を生成
    child.material = new THREE.MeshStandardMaterial({
      vertexColors: true,  // COLOR_0 の頂点カラーを使う
      roughness: 0.35,
      metalness: 0.1
    });
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

    g.add(model);

    // 台座
    var ped = mkMesh(new THREE.BoxGeometry(1.0*s, 0.08*s, 0.6*s), matStd(0xeeeae4, 0.7, 0.05));
    ped.position.y = 0.04*s; g.add(ped);

    // 淡いグロー
    var pl = new THREE.PointLight(0xffeeff, 0.5, s * 3.5, 2.0);
    pl.position.y = 0.9*s; g.add(pl);

  } else {
    // フォールバック: プロシージャル描画
    var bodyCol = Math.floor(R2() * 3);
    var mainCol = bodyCol === 0 ? 0xf8f4ff : (bodyCol === 1 ? 0xc8f0ff : 0xffe0f4);
    var hornCol = 0xffe066;
    var matBody = matStd(mainCol, 0.3, 0.1);
    var matHorn = new THREE.MeshStandardMaterial({ color: hornCol, roughness: 0.15, metalness: 0.7,
      emissive: new THREE.Color(0xffcc00), emissiveIntensity: 0.3 });
    var matHoof = matStd(0xc0a0c0, 0.55, 0.4);
    var matMane = matStd(bodyCol === 0 ? 0xffb0e0 : (bodyCol === 1 ? 0xffccaa : 0xb0d8ff), 0.4, 0.05);
    var body = mkMesh(new THREE.SphereGeometry(0.38*s, 16, 12), matBody);
    body.scale.set(1.55, 1.0, 1.0); body.position.y = 0.62*s; g.add(body);
    var neck = mkMesh(new THREE.CylinderGeometry(0.14*s, 0.18*s, 0.38*s, 10), matBody);
    neck.rotation.z = -0.35; neck.position.set(0.3*s, 0.88*s, 0); g.add(neck);
    var head = mkMesh(new THREE.SphereGeometry(0.18*s, 14, 10), matBody);
    head.scale.set(1.5, 1.0, 1.0); head.position.set(0.52*s, 1.08*s, 0); g.add(head);
    var snout = mkMesh(new THREE.CylinderGeometry(0.07*s, 0.09*s, 0.14*s, 10), matBody);
    snout.rotation.z = Math.PI/2; snout.position.set(0.69*s, 1.05*s, 0); g.add(snout);
    var horn = mkMesh(new THREE.CylinderGeometry(0, 0.055*s, 0.32*s, 8), matHorn);
    horn.rotation.z = -0.22; horn.position.set(0.56*s, 1.32*s, 0); g.add(horn);
    var eyeMat = matStd(0x220033, 0.8, 0.0);
    [[-0.04*s, 0.04*s], [0.04*s, 0.04*s]].forEach(function(ep) {
      var eye = mkMesh(new THREE.SphereGeometry(0.025*s, 8, 6), eyeMat);
      eye.position.set(0.69*s, 1.1*s, ep[0]); g.add(eye);
    });
    [[-0.18*s,-0.16*s], [-0.18*s,0.16*s], [0.16*s,-0.16*s], [0.16*s,0.16*s]].forEach(function(lp) {
      var legH = 0.42*s;
      var leg = mkMesh(new THREE.BoxGeometry(0.09*s, legH, 0.09*s), matBody);
      leg.position.set(lp[0], legH/2, lp[1]); g.add(leg);
      var hoof = mkMesh(new THREE.BoxGeometry(0.1*s, 0.07*s, 0.11*s), matHoof);
      hoof.position.set(lp[0], 0.035*s, lp[1]); g.add(hoof);
    });
    var tail = mkMesh(new THREE.CylinderGeometry(0.04*s, 0.01*s, 0.44*s, 8), matMane);
    tail.rotation.z = 0.7; tail.position.set(-0.5*s, 0.7*s, 0); g.add(tail);
    for (var mi = 0; mi < 4; mi++) {
      var mane = mkMesh(new THREE.SphereGeometry(0.07*s - mi*0.008*s, 8, 6), matMane);
      mane.position.set(0.28*s - mi*0.1*s, 1.05*s + mi*0.04*s, 0); g.add(mane);
    }
    var pl2 = new THREE.PointLight(mainCol, 0.6, s * 3.5, 2.0);
    pl2.position.y = 0.9*s; g.add(pl2);
    var ped2 = mkMesh(new THREE.BoxGeometry(1.0*s, 0.1*s, 0.6*s), matStd(0xeeeae4, 0.7, 0.05));
    ped2.position.y = 0.05*s; g.add(ped2);
  }

  var shd = makeDropShadow(0.55*s, 0.55*s, 0.56);
  g.add(shd);
  return g;
}

// ------ オイルタイマー（砂時計型オイルランプ） ------
function buildOilTimer(R2) {
  var g = new THREE.Group();
  var scale = 0.9 + R2() * 0.7;
  var s = scale;
  var glassCol = [0xffe8a0, 0xff8844, 0x88ddff, 0xff4499, 0x44ffaa];
  var oilCol = glassCol[Math.floor(R2() * glassCol.length)];
  var frameMat = matStd(0x1a1a18, 0.3, 0.85);
  var glassMat = new THREE.MeshStandardMaterial({
    color: oilCol, roughness: 0.05, metalness: 0.0,
    transparent: true, opacity: 0.62,
    emissive: new THREE.Color(oilCol), emissiveIntensity: 0.5
  });
  // Base plate
  var base = mkMesh(new THREE.CylinderGeometry(0.28*s, 0.32*s, 0.06*s, 24), frameMat);
  base.position.y = 0.03*s; g.add(base);
  // Top plate
  var top = mkMesh(new THREE.CylinderGeometry(0.28*s, 0.32*s, 0.06*s, 24), frameMat.clone());
  top.position.y = 1.14*s; g.add(top);
  // 4 frame rods
  for (var ri = 0; ri < 4; ri++) {
    var ra = ri * Math.PI / 2 + Math.PI/4;
    var rod = mkMesh(new THREE.CylinderGeometry(0.025*s, 0.025*s, 1.08*s, 8), frameMat.clone());
    rod.position.set(Math.cos(ra)*0.22*s, 0.57*s, Math.sin(ra)*0.22*s); g.add(rod);
  }
  // Upper glass bulb
  var upperBulb = mkMesh(new THREE.SphereGeometry(0.2*s, 18, 14, 0, Math.PI*2, 0, Math.PI/2), glassMat);
  upperBulb.rotation.x = Math.PI; upperBulb.position.y = 0.9*s; g.add(upperBulb);
  // Neck
  var neck = mkMesh(new THREE.CylinderGeometry(0.035*s, 0.035*s, 0.16*s, 10), glassMat.clone());
  neck.position.y = 0.62*s; g.add(neck);
  // Lower bulb (with oil filling partially)
  var lowerBulb = mkMesh(new THREE.SphereGeometry(0.2*s, 18, 14, 0, Math.PI*2, 0, Math.PI/2), glassMat.clone());
  lowerBulb.position.y = 0.38*s; g.add(lowerBulb);
  // Oil level indicator (flat disc inside lower bulb)
  var fillPct = 0.3 + R2() * 0.65;
  var oilFill = mkMesh(new THREE.CylinderGeometry(0.16*s * fillPct, 0.16*s * fillPct, 0.01, 16),
    new THREE.MeshStandardMaterial({color: oilCol, roughness:0.05, metalness:0.0,
      emissive: new THREE.Color(oilCol), emissiveIntensity: 1.2, transparent:true, opacity:0.9}));
  oilFill.position.y = 0.08*s + fillPct * 0.28*s; g.add(oilFill);
  // Glow from oil
  var pl = new THREE.PointLight(oilCol, 2.0, s*4.5, 2.0);
  pl.position.y = 0.55*s; g.add(pl);
  var shd = makeDropShadow(0.35*s, 0.35*s, 0.63);
  g.add(shd);
  return g;
}

// ------ 巨大スピーカー ------
function buildGiantSpeaker(R2, H) {
  var g = new THREE.Group();
  var w = 1.2 + R2() * 1.7;
  var h = 1.5 + R2() * 2.2;
  var d = 0.55 + R2() * 0.85;

  var matCab = matStd(0x0f0f0f, 0.12 + R2() * 0.25, 0.35 + R2() * 0.25);
  var body = mkMesh(createRoundedBoxGeo(w, h, d, 0.035, 3), matCab);
  body.position.y = h / 2;
  g.add(body);

  // Front baffle
  var baffleMat = matStd(0x0a0a0a, 0.75, 0.05);
  var baffle = mkMesh(new THREE.BoxGeometry(w * 0.94, h * 0.86, 0.02), baffleMat);
  baffle.position.set(0, h / 2, d / 2 + 0.01);
  g.add(baffle);

  var neonColors = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff, 0x00ff88, 0xff4400];
  var col = neonColors[Math.floor(R2() * neonColors.length)];
  var neonMat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: new THREE.Color(col),
    emissiveIntensity: 2.6 + R2() * 1.4,
    roughness: 0.22,
    metalness: 0.15
  });

  var wooMat = matStd(0xd8d8d8, 0.16 + R2() * 0.12, 0.25 + R2() * 0.25);
  var r1 = Math.min(w, h) * (0.16 + R2() * 0.05);
  var r2 = r1 * (0.92 + R2() * 0.06);

  function addWoofer(cy, r, makeNeonRing) {
    var face = mkMesh(new THREE.CircleGeometry(r, 32), wooMat);
    face.position.set(0, cy, d / 2 + 0.012);
    g.add(face);
    if (makeNeonRing) {
      var ring = mkMesh(new THREE.RingGeometry(r * 0.55, r * 0.95, 48), neonMat.clone());
      ring.position.set(0, cy, d / 2 + 0.013);
      g.add(ring);
      var pl = new THREE.PointLight(col, 0.9 + R2() * 0.9, 3.5 + R2() * 1.5, 2.0);
      pl.position.set(0, cy, d / 2 + 0.18);
      g.add(pl);
    }
  }

  addWoofer(h * 0.62, r1, true);
  addWoofer(h * 0.30, r2, false);

  // Simple feet
  var footMat = matStd(0x111111, 0.25, 0.65);
  [[-w*0.35, d*0.28], [w*0.35, d*0.28], [-w*0.35, -d*0.28], [w*0.35, -d*0.28]].forEach(function(p) {
    var ft = mkMesh(new THREE.BoxGeometry(w * 0.12, 0.08, d * 0.12), footMat.clone());
    ft.position.set(p[0], 0.04, p[1]);
    g.add(ft);
  });

  // Shadow
  var shd = makeDropShadow(Math.max(w, d) * 0.55, Math.max(w, d) * 0.55, 0.63);
  g.add(shd);
  return g;
}

// ------ 変電装置 / Transformer ------
function buildSubstationTransformer(R2, H) {
  var g = new THREE.Group();
  var w = 1.0 + R2() * 1.3;
  var d = 0.75 + R2() * 0.8;
  var h = 2.0 + R2() * 2.5;

  var baseMat = matStd(0x151515, 0.12 + R2() * 0.25, 0.2 + R2() * 0.3);
  var platform = mkMesh(new THREE.BoxGeometry(w * 1.05, 0.08, d * 1.05), baseMat);
  platform.position.y = 0.04;
  g.add(platform);

  var bodyMat = matStd(0x0f0f0f, 0.18 + R2() * 0.22, 0.25 + R2() * 0.2);
  var tank = mkMesh(createRoundedBoxGeo(w * 0.58, h * 0.42, d * 0.42, 0.030, 3), bodyMat);
  tank.position.y = h * 0.38;
  g.add(tank);

  var coreMat = matStd(0x2a2a2a, 0.06 + R2() * 0.12, 0.7);
  var coreW = w * 0.18;
  var coilR = Math.min(w, d) * (0.18 + R2() * 0.12);
  // Two coil rings (stylized)
  for (var i = 0; i < 2; i++) {
    var tor = mkMesh(new THREE.TorusGeometry(coilR, w * 0.02, 10, 40), coreMat.clone());
    tor.rotation.x = Math.PI / 2;
    tor.position.set((i === 0 ? -coreW : coreW), h * 0.40 + (i === 0 ? 0.06 : -0.04), 0);
    g.add(tor);
  }

  // Insulator fins
  var finMat = matStd(0x3a3a3a, 0.08, 0.3);
  for (var fi = 0; fi < 5; fi++) {
    var fin = mkMesh(new THREE.BoxGeometry(w * 0.04, h * 0.26, d * 0.02), finMat.clone());
    fin.position.set(0, h * 0.50, -d * 0.10 + fi * d * 0.04);
    g.add(fin);
  }

  // Control light
  var col = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff][Math.floor(R2() * 4)];
  var ledMat = new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 3.2, roughness: 0.25, metalness: 0.1 });
  var led = mkMesh(new THREE.SphereGeometry(0.05 + R2() * 0.03, 12, 8), ledMat);
  led.position.set(w * 0.18, h * 0.78, d * 0.12);
  g.add(led);
  var pl = new THREE.PointLight(col, 1.4, 4.0 + R2() * 2.0, 2.0);
  pl.position.copy(led.position);
  g.add(pl);

  var shd = makeDropShadow(Math.max(w, d) * 0.75, Math.max(w, d) * 0.75, 0.53);
  g.add(shd);
  return g;
}

// ------ DJブース ------
function buildDJBooth(R2, H) {
  var g = new THREE.Group();
  var w = 1.3 + R2() * 1.4;
  var d = 0.7 + R2() * 0.7;
  var tableH = 0.25 + R2() * 0.20;
  var panelH = 1.0 + R2() * 0.9;

  var topMat = matStd(0x111111, 0.22 + R2() * 0.20, 0.75);
  var top = mkMesh(createRoundedBoxGeo(w, tableH, d, 0.022, 3), topMat);
  top.position.y = tableH / 2;
  g.add(top);

  var panelMat = matStd(0x0c0c0c, 0.25, 0.45);
  var panel = mkMesh(new THREE.BoxGeometry(w * 0.93, panelH, d * 0.08), panelMat);
  panel.position.set(0, panelH / 2 + tableH, -d / 2 + d * 0.04);
  g.add(panel);

  // Deck discs
  var discMat = matStd(0x222222, 0.08, 0.6);
  var discR = Math.min(w, d) * (0.17 + R2() * 0.05);
  var discY = tableH + 0.55;

  function deckAt(cx) {
    var disc = mkMesh(new THREE.CylinderGeometry(discR, discR, 0.035, 28), discMat.clone());
    disc.position.set(cx, discY, d * 0.02);
    // Keep the deck surface horizontal (disk faces up).
    disc.rotation.x = 0;
    g.add(disc);
    var ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffdd,
      emissive: new THREE.Color(0x00ffdd),
      emissiveIntensity: 1.8,
      roughness: 0.22,
      metalness: 0.15
    });
    var ring = mkMesh(new THREE.RingGeometry(discR * 0.62, discR * 0.97, 48), ringMat);
    ring.position.set(cx, discY, d * 0.028);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }

  deckAt(-w * 0.22);
  deckAt(w * 0.22);

  // Mixer knobs
  var knobMat = matStd(0x3a3a3a, 0.12, 0.8);
  var knobCount = 10 + Math.floor(R2() * 8);
  for (var i = 0; i < knobCount; i++) {
    var kx = (R2() - 0.5) * w * 0.46;
    var ky = tableH + 0.28 + R2() * 0.20;
    var kz = d * (0.08 + R2() * 0.10);
    var knob = mkMesh(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 10), knobMat.clone());
    knob.position.set(kx, ky, kz);
    g.add(knob);
    if (R2() > 0.55) {
      var ledCol = [0xff0066, 0x00ffdd, 0xffee00, 0x0088ff][Math.floor(R2() * 4)];
      var led = mkMesh(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({
        color: ledCol,
        emissive: new THREE.Color(ledCol),
        emissiveIntensity: 2.4,
        roughness: 0.25,
        metalness: 0.08
      }));
      led.position.set(kx, ky + 0.05, kz + 0.01);
      g.add(led);
      var pl = new THREE.PointLight(ledCol, 0.55, 2.6, 1.8);
      pl.position.copy(led.position);
      g.add(pl);
    }
  }

  // Neon strip on panel
  var stripCol = [0xff0066, 0x00ffdd, 0xffee00, 0x0088ff][Math.floor(R2() * 4)];
  var stripMat = new THREE.MeshStandardMaterial({
    color: stripCol,
    emissive: new THREE.Color(stripCol),
    emissiveIntensity: 3.0,
    roughness: 0.2,
    metalness: 0.1
  });
  var strip = mkMesh(new THREE.BoxGeometry(w * 0.55, 0.02, d * 0.03), stripMat);
  strip.position.set(0, tableH + 0.85, -d/2 + d * 0.06);
  g.add(strip);
  var pl2 = new THREE.PointLight(stripCol, 1.0, 4.0, 2.0);
  pl2.position.set(0, tableH + 0.85, -d/2 + d * 0.02);
  g.add(pl2);

  var shd = makeDropShadow(Math.max(w, d) * 0.65, Math.max(w, d) * 0.65, 0.56);
  g.add(shd);

  return g;
}

// ------ アナログシンセ（コントローラ系） ------
function buildAnalogSynth(R2, H) {
  var g = new THREE.Group();
  var w = 1.2 + R2() * 1.4;
  var d = 0.55 + R2() * 0.65;
  var baseH = 0.28 + R2() * 0.22;
  var panelH = 0.55 + R2() * 0.6;

  var baseMat = matStd(0x0f0f0f, 0.20, 0.55);
  var base = mkMesh(createRoundedBoxGeo(w, baseH, d, 0.025, 3), baseMat);
  base.position.y = baseH / 2;
  g.add(base);

  var panelMat = matStd(0x111111, 0.35, 0.2);
  var panel = mkMesh(new THREE.BoxGeometry(w * 0.95, panelH, d * 0.10), panelMat);
  panel.position.set(0, baseH + panelH / 2, 0);
  g.add(panel);

  // Screen (canvas waveform)
  var cv = document.createElement('canvas');
  cv.width = 256; cv.height = 96;
  var cx = cv.getContext('2d');
  cx.fillStyle = '#041014';
  cx.fillRect(0, 0, cv.width, cv.height);
  var waveCol = [0x00ffdd, 0x00aaff, 0xffee00, 0xff33aa][Math.floor(R2() * 4)];
  cx.strokeStyle = 'rgba(' + ((waveCol>>16)&255) + ',' + ((waveCol>>8)&255) + ',' + (waveCol&255) + ',0.95)';
  cx.lineWidth = 2;
  cx.beginPath();
  for (var i = 0; i < 256; i++) {
    var t = i / 256;
    var y = cv.height * 0.52
      + Math.sin(t * (3 + R2()*4) * Math.PI*2 + R2()*3) * cv.height * (0.12 + R2()*0.08)
      + Math.sin(t * (1 + R2()*3) * Math.PI*2) * cv.height * 0.05;
    if (i === 0) cx.moveTo(i, y);
    else cx.lineTo(i, y);
  }
  cx.stroke();
  // Grid
  cx.strokeStyle = 'rgba(0,255,210,0.18)';
  for (var gx = 0; gx < 256; gx += 32) { cx.beginPath(); cx.moveTo(gx,0); cx.lineTo(gx,cv.height); cx.stroke(); }
  for (var gy = 0; gy < cv.height; gy += 24) { cx.beginPath(); cx.moveTo(0,gy); cx.lineTo(cv.width,gy); cx.stroke(); }

  var screenMat = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(cv),
    emissive: new THREE.Color(waveCol),
    emissiveIntensity: 1.6,
    roughness: 0.18,
    metalness: 0.05
  });
  var screen = mkMesh(new THREE.PlaneGeometry(w * 0.26, panelH * 0.42), screenMat);
  screen.position.set(-w * 0.26, baseH + panelH * 0.08, d / 2 + 0.03);
  g.add(screen);

  // Knobs
  var knobMat = matStd(0x333333, 0.18, 0.7);
  var knobCount = 12 + Math.floor(R2() * 10);
  for (var k = 0; k < knobCount; k++) {
    var kx = (R2() - 0.5) * w * 0.72;
    var ky = baseH + panelH * (0.10 + R2() * 0.72);
    var kz = d * (0.16 + R2() * 0.08);
    var knob = mkMesh(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 10), knobMat.clone());
    knob.position.set(kx, ky, kz);
    g.add(knob);
  }

  // LED strips
  var ledCol = [0xff0066, 0x00ffdd, 0xffee00, 0x0088ff][Math.floor(R2() * 4)];
  var ledMat = new THREE.MeshStandardMaterial({
    color: ledCol,
    emissive: new THREE.Color(ledCol),
    emissiveIntensity: 2.8,
    roughness: 0.22,
    metalness: 0.1
  });
  var strip = mkMesh(new THREE.BoxGeometry(w * 0.72, 0.02, d * 0.03), ledMat);
  strip.position.set(0, baseH + panelH * 0.82, d / 2 + 0.03);
  g.add(strip);
  var pl = new THREE.PointLight(ledCol, 1.0, 4.0, 2.0);
  pl.position.set(0, baseH + panelH * 0.82, d / 2 + 0.10);
  g.add(pl);

  var shd = makeDropShadow(Math.max(w, d) * 0.60, Math.max(w, d) * 0.60, 0.49);
  g.add(shd);
  return g;
}

// ------ アナログ・イコライザ / LEDバー系 ------
function buildAnalogEqualizer(R2, H) {
  var g = new THREE.Group();
  var w = 0.9 + R2() * 1.2;
  var d = 0.42 + R2() * 0.55;
  var h = 1.5 + R2() * 1.8;

  var rackMat = matStd(0x0f0f0f, 0.18, 0.65);
  var rack = mkMesh(createRoundedBoxGeo(w, 0.18, d, 0.018, 3), rackMat);
  rack.position.set(0, 0.18 / 2, 0);
  g.add(rack);

  var panelMat = matStd(0x101010, 0.22, 0.2);
  var panel = mkMesh(new THREE.BoxGeometry(w * 0.72, h, d * 0.16), panelMat);
  panel.position.y = h / 2;
  g.add(panel);

  var col = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff][Math.floor(R2() * 4)];
  var barMat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: new THREE.Color(col),
    emissiveIntensity: 3.1,
    roughness: 0.2,
    metalness: 0.1
  });

  var barCount = 10 + Math.floor(R2() * 10);
  for (var i = 0; i < barCount; i++) {
    var bw = (w * 0.62) / barCount;
    var bh = h * (0.15 + R2() * 0.80);
    var bar = mkMesh(new THREE.BoxGeometry(bw * 0.8, bh, d * 0.06), barMat.clone());
    var x = -w * 0.31 + bw * 0.5 + i * bw;
    bar.position.set(x, bh / 2, d * 0.06);
    g.add(bar);
  }

  var pl = new THREE.PointLight(col, 1.2, 5.0, 2.0);
  pl.position.set(0, h * 0.65, d * 0.22);
  g.add(pl);

  var shd = makeDropShadow(Math.max(w, d) * 0.55, Math.max(w, d) * 0.55, 0.49);
  g.add(shd);

  return g;
}

// ------ ネオン系彫刻 / Neon sculpture ------
function buildNeonSculpture(R2, H) {
  var g = new THREE.Group();
  var col = [0x00ffdd, 0xff0066, 0xffee00, 0x0088ff, 0xcc00ff, 0x00ff88][Math.floor(R2() * 6)];
  var neonMat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: new THREE.Color(col),
    emissiveIntensity: 3.6 + R2() * 1.3,
    roughness: 0.18,
    metalness: 0.28
  });

  var radius = 0.45 + R2() * 0.25;
  var baseY = 0.45 + R2() * 0.25;
  var n = 6 + Math.floor(R2() * 4);
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2 + (R2() - 0.5) * 0.5;
    var len = 0.35 + R2() * 0.65;
    var t = 0.03 + R2() * 0.04;

    var bar = mkMesh(new THREE.BoxGeometry(len, t, t), neonMat.clone());
    bar.position.set(Math.cos(a) * radius, baseY + (R2() - 0.5) * 0.5, Math.sin(a) * radius);
    bar.rotation.y = a + Math.PI / 2;
    bar.rotation.x = (R2() - 0.5) * 0.8;
    g.add(bar);
  }

  var pl = new THREE.PointLight(col, 1.4, 6.5, 2.2);
  pl.position.set(0, baseY + 0.3, 0);
  g.add(pl);

  var shd = makeDropShadow(radius * 1.25, radius * 1.25, 0.42);
  g.add(shd);

  return g;
}

// ------ 空調設備 (HVAC unit) ------
function buildHVAC(R2, H) {
  var g = new THREE.Group();
  var type = Math.floor(R2() * 3); // 0=ceiling unit, 1=wall cassette, 2=industrial floor unit

  if (type === 0) {
    // Ceiling-mount AC — hangs from ceiling
    var ceilH = H - 0.08;
    var unitW = 0.85 + R2() * 0.45, unitD = 0.32, unitH = 0.18;
    var mat = matStd(0xf0eeea, 0.75, 0.04);
    var body = mkMesh(new THREE.BoxGeometry(unitW, unitH, unitD), mat);
    body.position.set(0, ceilH - unitH/2, 0); g.add(body);
    // Vent louvers
    var nLouvers = 5;
    for (var li = 0; li < nLouvers; li++) {
      var louver = mkMesh(new THREE.BoxGeometry(unitW * 0.85, 0.015, 0.07), matStd(0xdddddb, 0.7, 0.0));
      louver.rotation.x = 0.25;
      louver.position.set(0, ceilH - unitH + 0.02, unitD/2 - 0.035 - li * 0.05); g.add(louver);
    }
    // LED strip
    var led = mkMesh(new THREE.BoxGeometry(unitW * 0.7, 0.012, 0.01),
      new THREE.MeshStandardMaterial({color:0x00ccff, emissive:new THREE.Color(0x00ccff), emissiveIntensity:3.0}));
    led.position.set(0, ceilH - 0.01, unitD/2 + 0.005); g.add(led);
    var pl = new THREE.PointLight(0x00aaff, 0.5, 2.5, 2.0);
    pl.position.set(0, ceilH - 0.05, unitD/2 + 0.3); g.add(pl);
    // Support rods
    [[-unitW*0.35, 0], [unitW*0.35, 0]].forEach(function(rp) {
      var rod = mkMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6), matStd(0x888888, 0.4, 0.7));
      rod.position.set(rp[0], ceilH + 0.14, rp[1]); g.add(rod);
    });

  } else if (type === 1) {
    // Wall cassette
    var cassW = 0.78, cassH = 0.62, cassD = 0.18;
    var mountH = 1.8 + R2() * (H - 2.2);
    var bodyMat = matStd(0xf2f0ed, 0.72, 0.04);
    var body2 = mkMesh(new THREE.BoxGeometry(cassW, cassH, cassD), bodyMat);
    body2.position.set(0, mountH, 0); g.add(body2);
    // Display strip
    var dpc = document.createElement('canvas'); dpc.width=128; dpc.height=32;
    var dct = dpc.getContext('2d');
    dct.fillStyle='#001a1a'; dct.fillRect(0,0,128,32);
    dct.fillStyle='#00eeff'; dct.font='bold 18px monospace'; dct.textAlign='center';
    dct.fillText((18 + Math.floor(R2()*8)) + '\u00b0C', 64, 22);
    var displayMat = new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(dpc),
      emissive:new THREE.Color(0x00aacc), emissiveIntensity:1.5});
    var disp2 = mkMesh(new THREE.PlaneGeometry(0.18, 0.045), displayMat);
    disp2.position.set(cassW*0.22, mountH + cassH*0.28, cassD/2+0.001); g.add(disp2);
    // Louver slots
    for (var li2=0; li2<4; li2++) {
      var lv = mkMesh(new THREE.BoxGeometry(cassW*0.8, 0.018, 0.12), matStd(0xe8e6e2, 0.7, 0.0));
      lv.rotation.x = 0.3; lv.position.set(0, mountH - cassH*0.15 - li2*0.08, cassD/2 - 0.05); g.add(lv);
    }
    // Remote control on floor
    var remote = mkMesh(new THREE.BoxGeometry(0.06, 0.015, 0.14), matStd(0x222222, 0.8, 0.0));
    remote.position.set(cassW/2 + 0.2, 0.007, 0.1); g.add(remote);

  } else {
    // Industrial floor unit — rooftop/mechanical room style
    var unitW2 = 1.2 + R2()*0.6, unitH2 = 0.85 + R2()*0.45, unitD2 = 0.7 + R2()*0.3;
    var indMat = matStd(0x3a3a3a, 0.75, 0.15);
    var body3 = mkMesh(new THREE.BoxGeometry(unitW2, unitH2, unitD2), indMat);
    body3.position.set(0, unitH2/2, 0); g.add(body3);
    // Fan grille on face
    var grilleMat = matStd(0x222222, 0.8, 0.1);
    var grille2 = mkMesh(new THREE.BoxGeometry(unitW2*0.55, unitH2*0.65, 0.02), grilleMat);
    grille2.position.set(-unitW2*0.1, unitH2/2, unitD2/2+0.001); g.add(grille2);
    // Fan blades
    var fanMat = matStd(0x555555, 0.5, 0.6);
    for (var fi=0; fi<5; fi++) {
      var blade = mkMesh(new THREE.BoxGeometry(unitW2*0.22, 0.025, 0.04), fanMat.clone());
      blade.rotation.z = fi * Math.PI*2/5; blade.position.set(-unitW2*0.1, unitH2/2, unitD2/2+0.012); g.add(blade);
    }
    // Pipes sticking out top
    for (var pi=0; pi<2; pi++) {
      var pipeH = 0.3 + R2()*0.5;
      var pipe = mkMesh(new THREE.CylinderGeometry(0.045, 0.045, pipeH, 8), matStd(0x606060,0.5,0.6));
      pipe.position.set(-unitW2*0.25+pi*unitW2*0.5, unitH2+pipeH/2, 0); g.add(pipe);
      var capPipe = mkMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), matStd(0x444444,0.6,0.5));
      capPipe.position.set(-unitW2*0.25+pi*unitW2*0.5, unitH2+pipeH, 0); g.add(capPipe);
    }
    // Status LED
    var ledInd = mkMesh(new THREE.SphereGeometry(0.022, 8, 6),
      new THREE.MeshStandardMaterial({color:0x00ff44, emissive:new THREE.Color(0x00ff44), emissiveIntensity:4.0}));
    ledInd.position.set(unitW2/2-0.08, unitH2-0.1, unitD2/2+0.001); g.add(ledInd);
    // Control panel
    var ctrlMat = matStd(0x2a2a2a, 0.8, 0.05);
    var ctrl = mkMesh(new THREE.BoxGeometry(0.32, 0.22, 0.01), ctrlMat);
    ctrl.position.set(unitW2*0.28, unitH2*0.55, unitD2/2+0.002); g.add(ctrl);
  }

  var shd = makeDropShadow(0.65, 0.65, 0.63);
  g.add(shd);
  return g;
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
  "3:17am\n\n起きていた。\n天井に何か書いてある。\n読もうとすると\n電気が消える。\n\n内容は知っている気がする。"
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
var _lockedCreatures = [];   // テザー捕獲中のクリーチャー
var activeWaterSurfaces = []; // { rippleCv, rippleCx, rippleTex, causticLight, spouts, phase, sources }

var memoPopupEl   = document.getElementById('memo-popup');
var memoLabelEl   = document.getElementById('memo-label');
var shootBtnEl    = document.getElementById('shoot-btn');
var crosshairEl   = document.getElementById('crosshair-hit');

function clearInteractables() {
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
  // ロック中クリーチャーのテザー・ライトを解放
  for (var _cli = 0; _cli < _lockedCreatures.length; _cli++) {
    _releaseTether(_lockedCreatures[_cli].tetherEntry);
    _releaseBeamLight(_lockedCreatures[_cli].lightEntry);
  }
  _lockedCreatures = [];
  memoPopupEl.classList.remove('visible');
  memoLabelEl.classList.remove('visible');
  shootBtnEl.classList.remove('visible');
  crosshairEl.classList.remove('aimed');
}

function registerInteractable(type, worldX, worldY, worldZ, data, mesh) {
  // isMegaMarshmallow と射程を登録時に一度だけ計算（3箇所の重複判定を排除）
  var isMega   = !!(data && data.isMegaMarshmallow);
  var isInsect = !!(mesh && mesh.userData && mesh.userData.isInsect);
  /* ── モデル実寸 bodyH を取得し当たり判定半径を計算 ── */
  var bodyH = (mesh && mesh.userData && mesh.userData.bodyH)
              ? mesh.userData.bodyH
              : (isMega ? 14.0 : (isInsect ? 0.7 : 1.2));
  var it = {
    type:              type,
    pos:               new THREE.Vector3(worldX, worldY, worldZ),
    data:              data,
    mesh:              mesh,
    alive:             true,
    isMegaMarshmallow: isMega,
    bodyH:             bodyH,
    /* aimRange / shootRange はモデル高さに比例させる */
    aimRange:   isMega ? 90.0  : Math.max(12.0, bodyH * 10.0),
    shootRange: isMega ? 80.0  : Math.max(10.0, bodyH *  9.0),
    /* sdLimit は fireBeam / updateInteractables で distance から動的計算するため
       ここでは最大値のみ保持（極近距離での上限として使用）*/
    sdLimit:    isMega ? 0.75  : 0.90
  };
  roomInteractables.push(it);
  // Try to attach audio immediately; if _audioReady is still false,
  // updateInteractables will retry lazily on the first frame after gesture.
  if (type === 'creature') _attachCreatureAudio(it);
}

// ================================================================
//  捕獲ビームシステム（プラズマジグザグ方式）
//  発射と同時にプレイヤー→生物までランダムジグザグ電撃が繋がり
//  びびびびと振動しながら引き寄せる
// ================================================================

// ---- ライトプール（プラズマ用 4 + フラッシュ用 4）----
var _beamLightPool = [];
var _flashLightPool = [];

// ---- プラズマジグザグライン プール ----
// 各スロット：3本のストランド（オレンジ・シアン・白黄）× N=18セグメント
var _tetherPool = [];
var _PLASMA_N = 12; // セグメント数（端点含む）※18→12で負荷約33%減、見た目ほぼ同等

(function() {
  var i, j;
  // プラズマ照明ライト
  for (i = 0; i < 4; i++) {
    var bl = new THREE.PointLight(0xff6600, 0, 8.0, 1.8);
    bl.visible = false; scene.add(bl);
    _beamLightPool.push({ light: bl, inUse: false });
  }
  // 捕獲フラッシュライト
  for (i = 0; i < 4; i++) {
    var fl = new THREE.PointLight(0xff8833, 0, 10.0, 2.0);
    fl.visible = false; scene.add(fl);
    _flashLightPool.push({ light: fl, age: 0, duration: 0, inUse: false });
  }

  // ジグザグライン（9本ストランド = 3グループ×3サブライン × 4スロット）
  var strandColors = [
    0xff4400, 0xff4400, 0xff4400,  // グループ0（オレンジ）
    0x00ccff, 0x00ccff, 0x00ccff,  // グループ1（シアン）
    0xffee44, 0xffee44, 0xffee44   // グループ2（イエロー）
  ];
  for (i = 0; i < 4; i++) {
    var strands = [];
    for (var s = 0; s < 9; s++) {
      var pts = [];
      for (j = 0; j < _PLASMA_N; j++) pts.push(new THREE.Vector3());
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var mat = new THREE.LineBasicMaterial({
        color: strandColors[s], transparent: true, opacity: 0.0
      });
      var line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      line.visible = false;
      scene.add(line);
      strands.push({ line: line, geo: geo, mat: mat });
    }
    _tetherPool.push({ strands: strands, inUse: false });
  }
})();

// ---- 毎フレーム再利用するスクラッチ Vector3（GC負荷削減）----
var _v3_camDir   = new THREE.Vector3();
var _v3_camRight = new THREE.Vector3();
var _v3_gunPos   = new THREE.Vector3();
var _v3_cp       = new THREE.Vector3();

function _acquireBeamLight() {
  for (var i = 0; i < _beamLightPool.length; i++) {
    if (!_beamLightPool[i].inUse) {
      _beamLightPool[i].inUse = true;
      _beamLightPool[i].light.visible = true;
      _beamLightPool[i].light.intensity = 6.0;
      return _beamLightPool[i];
    }
  }
  return null;
}
function _releaseBeamLight(pe) {
  if (!pe) return;
  pe.light.intensity = 0; pe.light.visible = false; pe.inUse = false;
}
function _acquireTether() {
  for (var i = 0; i < _tetherPool.length; i++) {
    if (!_tetherPool[i].inUse) {
      _tetherPool[i].inUse = true;
      for (var s = 0; s < 9; s++) {
        _tetherPool[i].strands[s].line.visible = true;
        _tetherPool[i].strands[s].mat.opacity = 0.0;
      }
      return _tetherPool[i];
    }
  }
  return null;
}
function _releaseTether(te) {
  if (!te) return;
  for (var s = 0; s < 9; s++) {
    te.strands[s].line.visible = false;
    te.strands[s].mat.opacity = 0.0;
  }
  te.inUse = false;
}

// ジグザグプラズマライン頂点を毎フレーム完全ランダム生成
function _updatePlasmaZigzag(te, from, to, age, alpha) {
  var N = _PLASMA_N;
  var dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  var len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.001;

  // 法線基底（ビーム方向に垂直な2軸）
  var ux = -dz / len, uy = 0, uz = dx / len;
  var ul = Math.sqrt(ux*ux + uz*uz);
  if (ul < 0.001) { ux = 1; uy = 0; uz = 0; } else { ux /= ul; uz /= ul; }
  var vx = dy*uz - dz*uy, vy = dz*ux - dx*uz, vz = dx*uy - dy*ux;
  var vl = Math.sqrt(vx*vx + vy*vy + vz*vz);
  if (vl > 0.001) { vx /= vl; vy /= vl; vz /= vl; }

  // 興奮度：時間とともに振れ幅が増す
  var excitement = Math.min(1.0, age * 0.8);
  var baseAmp = (0.12 + excitement * 0.22) * Math.min(len, 4.0) / 4.0;

  var groupOpacities = [
    alpha * (0.85 + Math.sin(age * 47) * 0.12),
    alpha * (0.6  + Math.sin(age * 38 + 1.4) * 0.25),
    alpha * (0.5  + Math.sin(age * 29 + 2.7) * 0.28)
  ];

  // ストランドオフセット（グループごとに別方向に広がる）
  var groupBias = [
    { u:  0.04, v:  0.0 },
    { u: -0.04, v:  0.06 },
    { u:  0.02, v: -0.06 }
  ];

  // カメラright方向（サブライン太さオフセット用）
  camera.getWorldDirection(_v3_camDir);
  _v3_camRight.crossVectors(_v3_camDir, camera.up).normalize();

  // サブライン間隔（3本で±0.006 world units = 見た目1〜3px相当）
  var subOffsets = [-0.006, 0.0, 0.006];

  // 各グループのランダム太さ（1〜3本）を毎フレーム決定 → ちらつき効果
  var groupWidth = [
    Math.floor(Math.random() * 3) + 1,
    Math.floor(Math.random() * 3) + 1,
    Math.floor(Math.random() * 3) + 1
  ];

  for (var s = 0; s < 9; s++) {
    var grp = Math.floor(s / 3);  // 0, 1, 2
    var sub = s % 3;               // 0, 1, 2（サブラインインデックス）

    var strand = te.strands[s];

    // このグループの太さに収まらないサブラインは非表示
    if (sub >= groupWidth[grp]) {
      strand.mat.opacity = 0.0;
      strand.line.visible = false;
      continue;
    }
    strand.line.visible = true;

    var pos = strand.geo.attributes.position;
    var bias = groupBias[grp];
    var soX = _v3_camRight.x * subOffsets[sub];
    var soY = _v3_camRight.y * subOffsets[sub];
    var soZ = _v3_camRight.z * subOffsets[sub];

    // 端点は固定
    pos.setXYZ(0,
      from.x + ux*bias.u + vx*bias.v + soX,
      from.y + uy*bias.u + vy*bias.v + soY,
      from.z + uz*bias.u + vz*bias.v + soZ);
    pos.setXYZ(N-1,
      to.x + soX,
      to.y + soY,
      to.z + soZ);

    // 中間点：完全ランダムジグザグ（毎フレーム再生成 = びびびび）
    for (var j = 1; j < N-1; j++) {
      var t = j / (N - 1);
      var bx = from.x + dx*t;
      var by = from.y + dy*t;
      var bz = from.z + dz*t;

      var env = Math.sin(t * Math.PI);
      var amp = baseAmp * env;

      var offU = (Math.random() - 0.5) * 2.2 * amp;
      var offV = (Math.random() - 0.5) * 2.2 * amp;

      pos.setXYZ(j,
        bx + ux*(offU + bias.u*env) + vx*(offV + bias.v*env) + soX,
        by + uy*(offU + bias.u*env) + vy*(offV + bias.v*env) + soY,
        bz + uz*(offU + bias.u*env) + vz*(offV + bias.v*env) + soZ
      );
    }
    pos.needsUpdate = true;
    strand.mat.opacity = groupOpacities[grp];
  }
}

// ---- 捕獲中クリーチャー管理 ----

function _lockCreature(itc) {
  if (itc.locked) return;
  itc.locked = true;
  itc.alive  = false;

  startBeamSound(); // ← ビーム音スタート

  var te  = _acquireTether();
  var ble = _acquireBeamLight();

  _lockedCreatures.push({
    itc:        itc,
    tetherEntry:te,
    lightEntry: ble,
    age:        0,
    startDist:  itc.pos.distanceTo(camera.position),
    jitterX: 0, jitterY: 0, jitterZ: 0,
    jitterAcc: 0
  });
}

function _finishCapture(lc) {
  var itc = lc.itc;
  _releaseTether(lc.tetherEntry);
  if (lc.lightEntry) _releaseBeamLight(lc.lightEntry);

  // 捕獲フラッシュ
  for (var fi = 0; fi < _flashLightPool.length; fi++) {
    if (!_flashLightPool[fi].inUse) {
      var fp = _flashLightPool[fi];
      fp.light.position.copy(itc.pos);
      fp.light.intensity = 22.0;
      fp.light.color.set(0xff7700);
      fp.light.visible = true;
      fp.inUse = true; fp.age = 0; fp.duration = 0.5;
      break;
    }
  }

  if (itc.mesh && itc.mesh.parent) itc.mesh.parent.remove(itc.mesh);
  else if (itc.mesh) scene.remove(itc.mesh);

  var capturedId = (itc.data && itc.data.creatureId !== undefined)
    ? itc.data.creatureId
    : Math.floor(Math.random() * CREATURE_DATA.length);
  updateCollection(capturedId);
  showCaptureNotification(capturedId);
  stopBeamSound(); // ← ビーム音を止めてから捕獲音を鳴らす
  playSoundCapture();
}

// ロック中クリーチャーを毎フレーム更新
function updateLockedCreatures(dt) {
  for (var li = _lockedCreatures.length - 1; li >= 0; li--) {
    var lc = _lockedCreatures[li];
    lc.age += dt;

    var itc = lc.itc;
    var camPos = camera.position;

    // ── クリーチャーのジッター（捕まれた抵抗感）──
    lc.jitterAcc += dt;
    if (lc.jitterAcc > 0.02) {
      lc.jitterAcc = 0;
      var jAmp = 0.05 + Math.min(0.18, lc.age * 0.05);
      lc.jitterX = (Math.random() - 0.5) * jAmp * 2;
      lc.jitterY = (Math.random() - 0.5) * jAmp;
      lc.jitterZ = (Math.random() - 0.5) * jAmp * 2;
    }

    // ── プレイヤーへ引き寄せ（加速付き）──
    var dist = itc.pos.distanceTo(camPos);
    var pullT = Math.min(1.0, lc.age / 2.0);
    var pullSpeed = (0.05 + pullT * pullT * 0.32) * dt * 60;
    var toDirX = camPos.x - itc.pos.x;
    var toDirY = (camPos.y - 0.4) - itc.pos.y;
    var toDirZ = camPos.z - itc.pos.z;
    var toDirLen = Math.sqrt(toDirX*toDirX + toDirY*toDirY + toDirZ*toDirZ);
    if (toDirLen > 0.01) {
      itc.pos.x += (toDirX / toDirLen) * pullSpeed;
      itc.pos.y += (toDirY / toDirLen) * pullSpeed;
      itc.pos.z += (toDirZ / toDirLen) * pullSpeed;
    }

    // メッシュ位置 = 引き寄せ位置 + ジッター
    if (itc.mesh) {
      itc.mesh.position.set(
        itc.pos.x + lc.jitterX,
        itc.pos.y + lc.jitterY,
        itc.pos.z + lc.jitterZ
      );
      itc.mesh.rotation.y += (Math.random() - 0.5) * 0.28;
      itc.mesh.rotation.z  = (Math.random() - 0.5) * 0.20;
    }

    // ── プラズマジグザグライン更新（毎フレームびびびび）──
    if (lc.tetherEntry) {
      var gunPos = _v3_gunPos.set(0, 0, -1).applyEuler(camera.rotation);
      gunPos.multiplyScalar(0.6).add(camPos);
      gunPos.y -= 0.18;

      var alpha;
      if (lc.age < 0.1) {
        alpha = lc.age / 0.1;
      } else if (dist < 1.8) {
        alpha = Math.max(0, dist / 1.8);
      } else {
        alpha = 0.82 + Math.sin(lc.age * 55.0) * 0.18;
      }

      _updatePlasmaZigzag(lc.tetherEntry, gunPos, itc.pos, lc.age, alpha);

      if (lc.lightEntry) {
        var midX = (gunPos.x + itc.pos.x) * 0.5;
        var midY = (gunPos.y + itc.pos.y) * 0.5;
        var midZ = (gunPos.z + itc.pos.z) * 0.5;
        lc.lightEntry.light.position.set(midX, midY, midZ);
        lc.lightEntry.light.color.set(0xff5500);
        lc.lightEntry.light.intensity = 4.0 + Math.sin(lc.age * 58.0) * 2.8;
      }
    }

    // ── 捕獲完了 ──
    if (dist < 0.9 || lc.age > 4.0) {
      _finishCapture(lc);
      _lockedCreatures.splice(li, 1);
    }
  }
}

// ---- fireBeam：弾丸なし、即プラズマ接続 ----
function fireBeam() {
  if (transitioning) return;
  _resumeAudioCtx();
  // 照準内のもっとも近い生物を探して即ロック
  // sdLimit は距離に応じて動的計算: bodyH / (d * tan(FOV/2))
  // FOV=72° → tan(36°)≈0.727  半径=bodyH*0.5*1/0.727/d ≈ bodyH*0.688/d
  // 少し余裕(×1.4)を持たせて bodyH / d
  var best = null, bestDist = Infinity;
  for (var ci = 0; ci < roomInteractables.length; ci++) {
    var itc = roomInteractables[ci];
    if (itc.type !== 'creature' || !itc.alive || itc.locked) continue;
    var d = camera.position.distanceTo(itc.pos);
    _v3_cp.copy(itc.pos).project(camera);
    var sd = Math.sqrt(_v3_cp.x*_v3_cp.x + _v3_cp.y*_v3_cp.y);
    var dynSd = Math.min(itc.sdLimit, itc.bodyH / Math.max(1.5, d));
    if (sd < dynSd && _v3_cp.z < 1.0 && d < itc.shootRange && d < bestDist) {
      best = itc; bestDist = d;
    }
  }
  if (best) {
    _lockCreature(best);
    // 発射の軽い反動
    _v3_gunPos.set(0, 0, -1).applyEuler(camera.rotation);
    camera.position.addScaledVector(_v3_gunPos, -0.03);
  }
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
        it.mesh.position.y = ud.baseY + Math.sin(ud.phase) * 0.06;

        // Eye flicker
        if (ud.eyePl) {
          ud.eyePl.intensity = 1.2 + Math.sin(ud.phase * 3.1) * 0.4;
        }

        // ---- Insect-specific: leg scurry animation + player reaction ----
        if (ud.isInsect) {
          // Leg animation (カサカサ)
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
          // Player proximity reaction
          var dToPlayer = it.mesh.position.distanceTo(camPos);
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
        if (ud.isCrystal) {
          if (ud.coreRef) {
            ud.coreRef.rotation.y = ud.phase * 0.8;
            ud.coreRef.rotation.z = Math.sin(ud.phase * 0.55) * 0.35;
          }
          if (ud.eyePl) {
            ud.eyePl.intensity = 1.8 + Math.sin(ud.phase * 4.2) * 0.9;
          }
        }

        // ---- Blob: 呼吸スケール + 内核グロウ ----
        if (ud.isBlob) {
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
        if (ud.isWire) {
          if (ud.eyePl) {
            ud.eyePl.intensity = 1.2 + Math.abs(Math.sin(ud.phase * 6.0)) * 1.8;
          }
        }

        // ---- GLB Ghost: シェーダー uTime 更新 ----
        if (ud.isGLBGhost) {
          if (ud.ghostBodyMat) ud.ghostBodyMat.uniforms.uTime.value = ud.phase;
          if (ud.ghostGlowMat) ud.ghostGlowMat.uniforms.uTime.value = ud.phase;
        }

        // ---- Slime: MarchingCubesメタボールアニメ ----
        if (ud.isSlime && ud.mcRef) {
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


// ------ 配管クラスター (industrial pipes) ------
function buildPipeCluster(R2, H) {
  var g = new THREE.Group();
  var pipes = 3 + Math.floor(R2() * 5);
  var metalMat  = matStd(0x888888, 0.35, 0.85);
  var rustMat   = matStd(0x6a3a1a, 0.80, 0.50);
  var yellowMat = matStd(0xddaa00, 0.55, 0.45);
  var mats = [metalMat, metalMat, metalMat, rustMat, yellowMat];
  var i, pr, ph, px, pz, mat, pipe, angle;
  for (i = 0; i < pipes; i++) {
    pr  = 0.045 + R2() * 0.09;
    ph  = 0.8   + R2() * (H * 0.9);
    px  = (R2() - 0.5) * 1.4;
    pz  = (R2() - 0.5) * 0.5;
    mat = mats[Math.floor(R2() * mats.length)];
    pipe = mkMesh(new THREE.CylinderGeometry(pr, pr, ph, 10), mat);
    pipe.position.set(px, ph / 2, pz); g.add(pipe);
    // Flange rings
    [[0.06, ph * 0.15], [0.06, ph * 0.75]].forEach(function(f) {
      var fl = mkMesh(new THREE.CylinderGeometry(pr * 2.0, pr * 2.0, f[0], 12), mat.clone());
      fl.position.set(px, f[1], pz); g.add(fl);
    });
    // Horizontal branch off ~halfway
    if (R2() > 0.45) {
      var hw = 0.5 + R2() * 1.8;
      var horiz = mkMesh(new THREE.CylinderGeometry(pr * 0.85, pr * 0.85, hw, 10), mat.clone());
      horiz.rotation.z = Math.PI / 2;
      angle = (R2() > 0.5 ? 1 : -1);
      horiz.position.set(px + angle * hw / 2, ph * (0.45 + R2() * 0.35), pz); g.add(horiz);
      // elbow sphere
      var el = mkMesh(new THREE.SphereGeometry(pr * 1.3, 12, 8), mat.clone());
      el.position.set(px + angle * hw, ph * (0.45 + R2() * 0.35), pz); g.add(el);
    }
    // Pressure gauge on some pipes
    if (R2() > 0.6) {
      var gaugeY = ph * (0.55 + R2() * 0.25);
      var gaugeStem = mkMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), mat.clone());
      gaugeStem.rotation.z = Math.PI / 2;
      gaugeStem.position.set(px + pr * 2.5, gaugeY, pz); g.add(gaugeStem);
      var gaugeFace = mkMesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20), matStd(0xdddddd, 0.6, 0.05));
      gaugeFace.rotation.z = Math.PI / 2;
      gaugeFace.position.set(px + pr * 2.5 + 0.1, gaugeY, pz); g.add(gaugeFace);
    }
  }
  // Valve wheel on one pipe
  var vx = (R2() - 0.5) * 1.0, vr = 0.18 + R2() * 0.12;
  var valveMat = matStd(0x555555, 0.5, 0.6);
  var valveTorus = mkMesh(new THREE.TorusGeometry(vr, 0.022, 8, 28), valveMat);
  valveTorus.position.set(vx - 0.35, 1.0 + R2() * 0.6, 0);
  valveTorus.rotation.x = Math.PI / 2; g.add(valveTorus);
  for (var sp = 0; sp < 4; sp++) {
    var spoke = mkMesh(new THREE.CylinderGeometry(0.014, 0.014, vr * 2, 6), valveMat.clone());
    spoke.rotation.z = Math.PI / 2; spoke.rotation.y = sp * Math.PI / 4;
    spoke.position.set(vx - 0.35, 1.0 + R2() * 0.6, 0); g.add(spoke);
  }
  var shd = makeDropShadow(1.1, 1.1, 0.56);
  g.add(shd);
  return g;
}

// ------ VHS感あるもの (VCR unit with glitch screen) ------
function buildVHSUnit(R2) {
  var g = new THREE.Group();
  // VCR / deck body
  var W = 1.1, H = 0.28, D = 0.65;
  var bodyMat = matStd(0x1a1a18, 0.82, 0.04);
  var body = mkMesh(new THREE.BoxGeometry(W, H, D), bodyMat);
  body.position.y = H / 2; g.add(body);
  // Cassette slot
  var slotMat = matStd(0x080808, 0.9, 0.0);
  var slot = mkMesh(new THREE.BoxGeometry(W * 0.52, H * 0.28, 0.04), slotMat);
  slot.position.set(-W * 0.08, H * 0.72, D / 2 + 0.001); g.add(slot);
  // Counter display (glitchy canvas)
  var dcv = document.createElement('canvas');
  dcv.width = 160; dcv.height = 48;
  var dcx = dcv.getContext('2d');
  dcx.fillStyle = '#001108'; dcx.fillRect(0, 0, 160, 48);
  // Segment display glow
  dcx.fillStyle = '#00ff88';
  dcx.font = 'bold 28px monospace';
  dcx.textAlign = 'center'; dcx.textBaseline = 'middle';
  var ctr = Math.floor(Math.random() * 9999);
  dcx.fillText(String(ctr).padStart(4, '0'), 80, 26);
  // Scanline overlay
  for (var sl = 0; sl < 48; sl += 3) {
    dcx.fillStyle = 'rgba(0,0,0,0.25)';
    dcx.fillRect(0, sl, 160, 1);
  }
  var dispMat = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(dcv),
    emissive: new THREE.Color(0x002211), emissiveIntensity: 1.2,
    roughness: 0.3
  });
  var disp = mkMesh(new THREE.PlaneGeometry(W * 0.28, H * 0.3), dispMat);
  disp.position.set(W * 0.22, H * 0.72, D / 2 + 0.002); g.add(disp);
  // Buttons row
  var btnMat = matStd(0x2a2a28, 0.7, 0.1);
  for (var bi = 0; bi < 5; bi++) {
    var btn = mkMesh(new THREE.BoxGeometry(0.055, 0.04, 0.04), btnMat.clone());
    btn.position.set(-W * 0.3 + bi * 0.075, H * 0.38, D / 2 + 0.022); g.add(btn);
  }
  // Monitor on top (CRT-style small monitor)
  var monW = 0.88, monH = 0.72, monD = 0.62;
  var monMat = matStd(0x1e1c18, 0.80, 0.05);
  var monBody = mkMesh(new THREE.BoxGeometry(monW, monH, monD), monMat);
  monBody.position.y = H + monH / 2 + 0.02; g.add(monBody);
  // CRT screen bezel
  var bezelMat = matStd(0x141412, 0.85, 0.0);
  var bezel = mkMesh(new THREE.BoxGeometry(monW * 0.84, monH * 0.78, 0.025), bezelMat);
  bezel.position.set(0, H + monH / 2 + 0.02, monD / 2 + 0.003); g.add(bezel);
  // VHS screen — static + scanlines
  var scv2 = document.createElement('canvas');
  scv2.width = 320; scv2.height = 240;
  var scx2 = scv2.getContext('2d');
  // Base color – washed-out grey-green VHS look
  scx2.fillStyle = '#0a0a08'; scx2.fillRect(0, 0, 320, 240);
  // Static noise
  for (var nx = 0; nx < 320; nx += 2) {
    for (var ny = 0; ny < 240; ny += 2) {
      var nv = Math.floor(Math.random() * 80);
      scx2.fillStyle = 'rgba(' + nv + ',' + nv + ',' + (nv * 0.8) + ',0.55)';
      scx2.fillRect(nx, ny, 2, 2);
    }
  }
  // Glitch bands
  for (var gb = 0; gb < 4; gb++) {
    var gy = Math.floor(Math.random() * 220);
    var gw = 50 + Math.floor(Math.random() * 200);
    var gx2 = Math.floor(Math.random() * (320 - gw));
    scx2.fillStyle = 'rgba(255,255,200,' + (0.08 + Math.random() * 0.18) + ')';
    scx2.fillRect(gx2, gy, gw, 3 + Math.floor(Math.random() * 6));
  }
  // Tracking lines
  scx2.strokeStyle = 'rgba(255,255,255,0.1)';
  scx2.lineWidth = 1.5;
  for (var tl = 0; tl < 8; tl++) {
    var ty = Math.floor(Math.random() * 240);
    scx2.beginPath(); scx2.moveTo(0, ty); scx2.lineTo(320, ty + Math.random() * 6 - 3); scx2.stroke();
  }
  // Vignette
  var vg = scx2.createRadialGradient(160, 120, 20, 160, 120, 160);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)');
  scx2.fillStyle = vg; scx2.fillRect(0, 0, 320, 240);

  var screenMat = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(scv2),
    emissive: new THREE.Color(0x080808), emissiveIntensity: 0.9,
    roughness: 0.15
  });
  var screen = mkMesh(new THREE.PlaneGeometry(monW * 0.76, monH * 0.69), screenMat);
  screen.position.set(0, H + monH / 2 + 0.02, monD / 2 + 0.018); g.add(screen);
  // Screen glow
  var sgl = new THREE.PointLight(0x88ff44, 0.55, 2.5, 2.2);
  sgl.position.set(0, H + monH / 2 + 0.02, monD / 2 + 0.4); g.add(sgl);
  // Knobs on side
  for (var ki = 0; ki < 2; ki++) {
    var kn = mkMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16), matStd(0x303028, 0.7, 0.1));
    kn.rotation.z = Math.PI / 2;
    kn.position.set(monW / 2 + 0.025, H + 0.25 + ki * 0.18, -0.1); g.add(kn);
  }
  var shd = makeDropShadow(0.62, 0.62, 0.7);
  g.add(shd);
  return g;
}

// ------ ブラウン管テレビ ------
function buildCRTTV(R2) {
  var g = new THREE.Group();
  // Proportions: wide boxy CRT body
  var W = 0.82 + R2() * 0.55;
  var H = W * 0.78;
  var D = W * 0.82 + 0.1; // CRTs are deep
  var bodyCol = R2() > 0.5 ? 0x2a2820 : (R2() > 0.5 ? 0xc8c0a8 : 0x1a1816);
  var bodyMat = matStd(bodyCol, 0.82, 0.04);
  // Main body
  var body = mkMesh(new THREE.BoxGeometry(W, H, D), bodyMat);
  body.position.y = H / 2 + 0.12; g.add(body);
  // Screen bulge (CRT glass – slightly convex box)
  var sW = W * 0.72, sH = H * 0.74;
  // Bezel frame
  var bezel = mkMesh(new THREE.BoxGeometry(sW + 0.055, sH + 0.055, 0.04), matStd(0x111110, 0.85, 0.02));
  bezel.position.set(0, H / 2 + 0.12, D / 2 + 0.002); g.add(bezel);
  // Screen content – TV static / broadcast
  var scv3 = document.createElement('canvas');
  scv3.width = 256; scv3.height = 200;
  var scx3 = scv3.getContext('2d');
  var tvMode = Math.floor(R2() * 3);
  if (tvMode === 0) {
    // Static noise
    scx3.fillStyle = '#0a0808'; scx3.fillRect(0, 0, 256, 200);
    for (var px2 = 0; px2 < 256; px2 += 2) {
      for (var py2 = 0; py2 < 200; py2 += 2) {
        var pv = Math.floor(Math.random() * 120);
        scx3.fillStyle = 'rgba(' + pv + ',' + pv + ',' + pv + ',0.7)';
        scx3.fillRect(px2, py2, 2, 2);
      }
    }
  } else if (tvMode === 1) {
    // Color bars (broadcast test pattern)
    var barCols = ['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0','#000000'];
    var bw = Math.ceil(256 / barCols.length);
    barCols.forEach(function(bc, bi) { scx3.fillStyle = bc; scx3.fillRect(bi * bw, 0, bw, 200); });
    scx3.fillStyle = 'rgba(0,0,0,0.18)';
    for (var sc2 = 0; sc2 < 200; sc2 += 4) { scx3.fillRect(0, sc2, 256, 2); }
  } else {
    // Dark dim room scene suggestion + scanlines
    scx3.fillStyle = '#060604'; scx3.fillRect(0, 0, 256, 200);
    scx3.fillStyle = 'rgba(50,50,40,0.4)';
    scx3.fillRect(30, 60, 196, 90);
    scx3.fillStyle = 'rgba(0,0,0,0.3)';
    for (var sc3 = 0; sc3 < 200; sc3 += 3) { scx3.fillRect(0, sc3, 256, 1); }
  }
  // Scanlines always on top
  scx3.fillStyle = 'rgba(0,0,0,0.22)';
  for (var sl2 = 0; sl2 < 200; sl2 += 2) { scx3.fillRect(0, sl2, 256, 1); }
  // CRT phosphor vignette
  var vg3 = scx3.createRadialGradient(128, 100, 10, 128, 100, 130);
  vg3.addColorStop(0, 'rgba(0,0,0,0)'); vg3.addColorStop(1, 'rgba(0,0,0,0.65)');
  scx3.fillStyle = vg3; scx3.fillRect(0, 0, 256, 200);
  var screenMat2 = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(scv3),
    emissive: new THREE.Color(tvMode === 1 ? 0x101008 : 0x050505),
    emissiveIntensity: 1.2, roughness: 0.08
  });
  var screen2 = mkMesh(new THREE.PlaneGeometry(sW * 0.93, sH * 0.93), screenMat2);
  screen2.position.set(0, H / 2 + 0.12, D / 2 + 0.025); g.add(screen2);
  // CRT screen glow
  var sg2 = new THREE.PointLight(tvMode === 1 ? 0xffff88 : 0x88aaff, 0.5, 2.8, 2.0);
  sg2.position.set(0, H / 2 + 0.12, D / 2 + 0.45); g.add(sg2);
  // Control panel right side: tuner knob + channel knob
  var knobMat = matStd(bodyCol, 0.6, 0.1);
  [[W/2 - 0.04, H/2 + 0.12 + 0.08], [W/2 - 0.04, H/2 + 0.12 - 0.12]].forEach(function(kp) {
    var kn = mkMesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 16), knobMat.clone());
    kn.rotation.z = Math.PI / 2; kn.position.set(kp[0] + 0.04, kp[1], 0); g.add(kn);
    // Knob line indicator
    var ind = mkMesh(new THREE.BoxGeometry(0.055, 0.008, 0.008), matStd(0x111111, 0.7, 0.0));
    ind.position.set(kp[0] + 0.07, kp[1], 0.025); g.add(ind);
  });
  // Speaker grille (left side)
  var grilleMat = matStd(0x0a0a08, 0.9, 0.0);
  var grille = mkMesh(new THREE.BoxGeometry(W * 0.16, H * 0.6, 0.015), grilleMat);
  grille.position.set(-W / 2 + W * 0.08 + 0.02, H / 2 + 0.12, D / 2 + 0.004); g.add(grille);
  // Legs / feet
  var feetMat = matStd(0x111110, 0.8, 0.0);
  [[-W*0.3, -D*0.28], [W*0.3, -D*0.28], [-W*0.3, D*0.28], [W*0.3, D*0.28]].forEach(function(fp) {
    var ft = mkMesh(new THREE.BoxGeometry(0.07, 0.12, 0.07), feetMat.clone());
    ft.position.set(fp[0], 0.06, fp[1]); g.add(ft);
  });
  // Antenna
  var antMat = matStd(0x888888, 0.4, 0.8);
  var antBase = mkMesh(new THREE.BoxGeometry(0.22, 0.04, 0.06), antMat);
  antBase.position.set(W * 0.15, H + 0.14, -D * 0.1); g.add(antBase);
  var antL = mkMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 8), antMat.clone());
  antL.rotation.z = 0.38; antL.position.set(W * 0.15 - 0.13, H + 0.14 + 0.26, -D * 0.1); g.add(antL);
  var antR = mkMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 8), antMat.clone());
  antR.rotation.z = -0.38; antR.position.set(W * 0.15 + 0.13, H + 0.14 + 0.26, -D * 0.1); g.add(antR);
  var shd = makeDropShadow(W * 0.65, W * 0.65, 0.72);
  g.add(shd);
  return g;
}

// ------ ビデオテープ (VHS cassette) ------
function buildVideoTape(R2) {
  var g = new THREE.Group();
  // Scale: roughly 10x actual (human-room scale) OR small cluster on floor
  var scale = R2() > 0.42 ? 1.0 + R2() * 0.5 : 0.25 + R2() * 0.15;
  var tW = 1.88 * scale, tH = 1.02 * scale, tD = 2.54 * scale;
  // Label color
  var labelCols = [0xe8e0d0, 0xd0e8e0, 0xd0d0e8, 0xe8d8d0, 0xd8e8d0, 0x222222];
  var lCol = labelCols[Math.floor(R2() * labelCols.length)];
  var caseMat = matStd(0x111111, 0.78, 0.04);
  var labelMat = matStd(lCol, 0.82, 0.0);
  var body = mkMesh(new THREE.BoxGeometry(tW, tH, tD), caseMat);
  body.position.y = tH / 2; g.add(body);
  // Label on top face
  var labelPanel = mkMesh(new THREE.BoxGeometry(tW * 0.86, 0.005, tD * 0.6), labelMat);
  labelPanel.position.set(0, tH + 0.001, -tD * 0.08); g.add(labelPanel);
  // Tape window (front face transparent-ish)
  var winMat = matStd(0x1a1208, 0.35, 0.15);
  var win = mkMesh(new THREE.BoxGeometry(tW * 0.72, tH * 0.42, 0.01), winMat);
  win.position.set(0, tH * 0.58, tD / 2 + 0.002); g.add(win);
  // Tape reels inside window
  [[-tW * 0.18, tH * 0.58], [tW * 0.18, tH * 0.58]].forEach(function(rp) {
    var hub = mkMesh(new THREE.CylinderGeometry(tH * 0.18, tH * 0.18, 0.025, 20), matStd(0x333333, 0.6, 0.1));
    hub.rotation.x = Math.PI / 2; hub.position.set(rp[0], rp[1], tD / 2 + 0.003); g.add(hub);
    var spool = mkMesh(new THREE.CylinderGeometry(tH * 0.09, tH * 0.09, 0.02, 16), matStd(0x0a0a0a, 0.9, 0.0));
    spool.rotation.x = Math.PI / 2; spool.position.set(rp[0], rp[1], tD / 2 + 0.012); g.add(spool);
    // Spoke lines
    for (var sp2 = 0; sp2 < 5; sp2++) {
      var spk = mkMesh(new THREE.BoxGeometry(tH * 0.17, 0.01, 0.025), matStd(0x555555, 0.7, 0.0));
      spk.rotation.z = sp2 * Math.PI / 2.5;
      spk.rotation.x = Math.PI / 2; spk.position.set(rp[0], rp[1], tD / 2 + 0.01); g.add(spk);
    }
  });
  // Guide pins
  [[-tW * 0.34, tH * 0.35], [tW * 0.34, tH * 0.35]].forEach(function(gp) {
    var pin = mkMesh(new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, 0.035, 8), matStd(0xaaaaaa, 0.3, 0.8));
    pin.rotation.x = Math.PI / 2; pin.position.set(gp[0], gp[1], tD / 2 + 0.004); g.add(pin);
  });
  // Small stacked second tape if scale is small (no recursion — use simple box)
  if (scale < 0.45) {
    var smallBody = mkMesh(
      new THREE.BoxGeometry(tW * 0.88, tH * 0.88, tD * 0.88),
      matStd(0x111111, 0.78, 0.04)
    );
    smallBody.position.set(tW * 0.6, tH * 1.05, 0);
    smallBody.rotation.y = (R2() - 0.5) * 0.6;
    g.add(smallBody);
  }
  var shd = makeDropShadow(Math.max(tW, tD) * 0.62, Math.max(tW, tD) * 0.62, 0.63);
  g.add(shd);
  return g;
}

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

// ------ 学校の机セット (vintage school desk + chair) ------
function buildSchoolDesk(R2) {
  var g = new THREE.Group();

  // --- Materials ---
  var chromeMat  = matStd(0xb8b8b8, 0.18, 0.88);
  // Seat color: petrol blue variants
  var seatCols = [0x2d5f8a, 0x26547c, 0x3a6b9a, 0x1e4d72, 0x336699];
  var seatCol  = seatCols[Math.floor(R2() * seatCols.length)];
  var seatMat  = matStd(seatCol, 0.45, 0.08);
  // Tabletop: cream / off-white laminate
  var topCols = [0xf0ece0, 0xe8e4d8, 0xf5f2ea, 0xdedad0];
  var topCol  = topCols[Math.floor(R2() * topCols.length)];
  var topMat   = matStd(topCol, 0.72, 0.02);
  var wireMat  = matStd(0x888888, 0.55, 0.65);

  // ========================
  //  DESK (left side)
  // ========================
  var deskH  = 0.75;   // desk surface height
  var deskW  = 0.60;   // table width  (left-right)
  var deskD  = 0.48;   // table depth  (front-back)
  var deskT  = 0.025;  // tabletop thickness
  var legR   = 0.014;  // leg radius
  var legTaper = 0.009;

  // Tabletop
  var top = mkMesh(new THREE.BoxGeometry(deskW, deskT, deskD), topMat);
  top.position.set(-deskW * 0.05, deskH, 0);
  g.add(top);

  // 4 tapered chrome legs
  var legOffX = deskW / 2 - 0.04;
  var legOffZ = deskD / 2 - 0.04;
  [[-legOffX, -legOffZ], [legOffX, -legOffZ],
   [-legOffX,  legOffZ], [legOffX,  legOffZ]].forEach(function(lp) {
    var leg = mkMesh(new THREE.CylinderGeometry(legTaper, legR, deskH, 8), chromeMat.clone());
    leg.position.set(lp[0] - deskW * 0.05, deskH / 2, lp[1]);
    g.add(leg);
    // rubber foot cap
    var foot = mkMesh(new THREE.CylinderGeometry(legR * 1.4, legR * 1.4, 0.018, 8), matStd(0x222222, 0.9, 0.0));
    foot.position.set(lp[0] - deskW * 0.05, 0.009, lp[1]);
    g.add(foot);
  });

  // ========================
  //  CHAIR (right side, offset toward desk)
  // ========================
  var chairX  = deskW * 0.42;   // chair center offset from desk center
  var seatH   = 0.44;   // seat surface height
  var seatW   = 0.38;
  var seatD   = 0.38;
  var seatT   = 0.028;
  var backH   = 0.36;
  var backT   = 0.028;
  var cLegR   = 0.012;
  var cLegT   = 0.008;

  // Seat shell
  var seat = mkMesh(new THREE.BoxGeometry(seatW, seatT, seatD), seatMat);
  seat.position.set(chairX, seatH, 0.04);
  g.add(seat);
  // Seat underside bulk
  var seatBot = mkMesh(new THREE.BoxGeometry(seatW * 0.88, seatT * 0.6, seatD * 0.88),
    matStd(seatCol - 0x111111, 0.55, 0.06));
  seatBot.position.set(chairX, seatH - seatT * 0.6, 0.04);
  g.add(seatBot);

  // Backrest shell
  var back = mkMesh(new THREE.BoxGeometry(seatW, backH, backT), seatMat);
  back.position.set(chairX, seatH + backH / 2 + 0.04, -seatD / 2 + backT / 2 + 0.04);
  back.rotation.x = -0.1; // slight recline
  g.add(back);

  // Horizontal top rail connecting chair to desk
  var railH = seatH + backH + 0.02;
  var railLen = Math.abs(chairX - (-deskW * 0.05 + legOffX)) + 0.06;
  var rail = mkMesh(new THREE.CylinderGeometry(cLegR, cLegR, railLen, 8), chromeMat.clone());
  rail.rotation.z = Math.PI / 2;
  rail.position.set(chairX - railLen / 2 + 0.02, railH, -seatD / 2 + 0.04);
  g.add(rail);

  // 4 chair legs
  var cLegOffX = seatW / 2 - 0.035;
  var cLegOffZ = seatD / 2 - 0.035;
  [[-cLegOffX, -cLegOffZ], [cLegOffX, -cLegOffZ],
   [-cLegOffX,  cLegOffZ], [cLegOffX,  cLegOffZ]].forEach(function(lp) {
    var cleg = mkMesh(new THREE.CylinderGeometry(cLegT, cLegR, seatH, 8), chromeMat.clone());
    cleg.position.set(chairX + lp[0], seatH / 2, 0.04 + lp[1]);
    g.add(cleg);
    // foot
    var cfoot = mkMesh(new THREE.CylinderGeometry(cLegR * 1.5, cLegR * 1.5, 0.015, 8), matStd(0x222222, 0.9, 0.0));
    cfoot.position.set(chairX + lp[0], 0.0075, 0.04 + lp[1]);
    g.add(cfoot);
  });

  // Wire basket below seat
  var bW = seatW * 0.72, bD2 = seatD * 0.70;
  var basketY = seatH * 0.38;
  var wires_x = 3 + Math.floor(R2() * 2);
  var wires_z = 3 + Math.floor(R2() * 2);
  for (var wi = 0; wi <= wires_x; wi++) {
    var wx = chairX - bW / 2 + (bW / wires_x) * wi;
    var wr = mkMesh(new THREE.CylinderGeometry(0.006, 0.006, bD2, 6), wireMat.clone());
    wr.rotation.x = Math.PI / 2;
    wr.position.set(wx, basketY, 0.04);
    g.add(wr);
  }
  for (var wj = 0; wj <= wires_z; wj++) {
    var wz = 0.04 - bD2 / 2 + (bD2 / wires_z) * wj;
    var wr2 = mkMesh(new THREE.CylinderGeometry(0.006, 0.006, bW, 6), wireMat.clone());
    wr2.rotation.z = Math.PI / 2;
    wr2.position.set(chairX, basketY, wz);
    g.add(wr2);
  }
  // basket corner verticals
  var bH2 = 0.14;
  [[-bW/2, -bD2/2],[bW/2, -bD2/2],[-bW/2, bD2/2],[bW/2, bD2/2]].forEach(function(fp) {
    var fv = mkMesh(new THREE.CylinderGeometry(0.007, 0.007, bH2, 6), wireMat.clone());
    fv.position.set(chairX + fp[0], basketY + bH2 / 2, 0.04 + fp[1]);
    g.add(fv);
  });

  // Drop shadow
  var shd = makeDropShadow(1.05, 0.78, 0.72);
  shd.position.x = chairX * 0.3;
  g.add(shd);

  return g;
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
  // ---- メガルーム限定: 巨大マシュマロマン (35%確率) ----
  if (isMega && R2() < 0.35) {
    var mmDef = CREATURE_DATA[50]; // マシュマロマン (glb7-adult)
    var mmMesh = buildCreature3D(mmDef.visualType, R2, mmDef.palette);
    // 巨大スケール: 8〜16倍
    var mmScale = 8 + R2() * 8;
    mmMesh.scale.set(mmScale, mmScale, mmScale);
    // 中央付近に配置
    var mmX = (R2() - 0.5) * Math.max(0, W - 30);
    var mmZ = (R2() - 0.5) * Math.max(0, D - 30);
    mmMesh.position.set(mmX, 0, mmZ);
    mmMesh.rotation.y = R2() * Math.PI * 2;
    mmMesh.userData.baseY = 0;
    mmMesh.userData.creatureId = 50;
    mmMesh.userData.wanderTarget.set(mmX, 0, mmZ);
    mmMesh.userData.wanderTimer = 5.0 + Math.random() * 8.0;
    // ゆっくりとした巨大移動速度
    mmMesh.userData.wanderSpeed  = 0.12 + R2() * 0.08;
    mmMesh.userData.alertSpeed   = 0.35 + R2() * 0.15;
    // 巨大マシュマロ専用ライト (暖かいホワイトグロウ)
    var mmGlow = new THREE.PointLight(0xfff4e0, 2.5, mmScale * 12, 1.6);
    mmGlow.position.set(mmX, mmScale * 2.2, mmZ);
    grp.add(mmGlow);
    grp.add(mmMesh);
    interactables.push({
      type: 'creature',
      lx: mmX, ly: mmScale * 1.5, lz: mmZ,
      data: { creatureId: 50, isMegaMarshmallow: true },
      mesh: mmMesh
    });
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

/* ----------------------------------------------------------
   Flash light pool update (extracted from animate for clarity)
---------------------------------------------------------- */
function updateFlashLightPool(dt) {
  for (var _fli = 0; _fli < _flashLightPool.length; _fli++) {
    var _fle = _flashLightPool[_fli];
    if (!_fle.inUse) continue;
    _fle.age += dt;
    var _ft = Math.min(1, _fle.age / _fle.duration);
    _fle.light.intensity = 10.0 * (1 - _ft);
    if (_ft >= 1) {
      _fle.light.intensity = 0;
      _fle.light.visible = false;
      _fle.inUse = false;
    }
  }
}