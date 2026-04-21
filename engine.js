/* ----------------------------------------------------------
   ルームシード事前確定
   Three.js のオブジェクト生成（UUID = Math.random）より前に
   シードを確保しておくことで、ファイル追加による Math.random
   シフトの影響を受けなくする。
---------------------------------------------------------- */
window._nextRoomSeed = Math.floor(Math.random() * 99991) + 1;

/* ----------------------------------------------------------
   DOM refs
---------------------------------------------------------- */
var loadingEl  = document.getElementById('loading');
var progressEl = document.getElementById('progress-fill');
var roomInfoEl = document.getElementById('room-info');
var doorHintEl = document.getElementById('door-hint');

function setProgress(v) {
  progressEl.style.width = Math.min(100, v) + '%';
}

/* ----------------------------------------------------------
   Mobile detection (used before player.js loads)
---------------------------------------------------------- */
var _isMob = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ----------------------------------------------------------
   Renderer
---------------------------------------------------------- */
var canvas   = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: !_isMob,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(_isMob ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled   = !_isMob;
renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
renderer.outputEncoding      = THREE.sRGBEncoding;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog        = new THREE.Fog(0x000000, 12, 90);

var camera = new THREE.PerspectiveCamera(
  72, window.innerWidth / window.innerHeight, 0.05, 200
);
camera.position.set(0, 1.72, 0);

/* ----------------------------------------------------------
   VHS Post-processing
---------------------------------------------------------- */
var vhsTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
});
var vhsTime = 0;

var VHS_VERT = [
  'varying vec2 vUv;',
  'void main() { vUv = uv; gl_Position = vec4(position, 1.0); }'
].join('\n');

var VHS_FRAG = [
  'uniform sampler2D tDiffuse;',
  'uniform float time;',
  'uniform vec2 resolution;',
  'varying vec2 vUv;',
  'float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}',
  /* S-curve contrast: lift blacks, punch mids */
  'vec3 contrast(vec3 c){',
  '  c=clamp(c,0.0,1.0);',
  '  return c*c*(3.0-2.0*c);',  /* smoothstep S-curve */
  '}',
  'void main(){',
  '  vec2 uv=vUv;',
  /* barrel distortion */
  '  vec2 cc=uv-0.5;',
  '  float dist=dot(cc,cc);',
  '  uv=uv+cc*(dist*0.06);',
  '  if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){gl_FragColor=vec4(0.0,0.0,0.0,1.0);return;}',
  /* chromatic aberration — slightly stronger for VHS look */
  '  float edge=dot(cc,cc)*4.5;',
  '  float shift=0.005*edge+0.001*sin(time*0.35);',
  '  vec4 col;',
  '  col.r=texture2D(tDiffuse,uv+vec2(shift,shift*0.4)).r;',
  '  col.g=texture2D(tDiffuse,uv).g;',
  '  col.b=texture2D(tDiffuse,uv-vec2(shift,shift*0.4)).b;',
  '  col.a=1.0;',
  /* contrast boost — S-curve on luma-preserving blend */
  '  float luma0=dot(col.rgb,vec3(0.299,0.587,0.114));',
  '  vec3 contrasted=contrast(col.rgb);',
  '  col.rgb=mix(col.rgb,contrasted,0.38);',
  /* scanlines — visible but not harsh */
  '  float scan=sin(uv.y*resolution.y*1.6)*0.045;',
  '  col.rgb-=clamp(scan,0.0,1.0);',
  /* horizontal glitch band */
  '  float gs=floor(time*0.6);',
  '  float doGlitch=step(0.97,rand(vec2(gs,3.7)));',
  '  float bandY=rand(vec2(gs,5.1));',
  '  float bandH=0.007+rand(vec2(gs,9.3))*0.016;',
  '  if(doGlitch>0.0&&abs(uv.y-bandY)<bandH){',
  '    float hs=(rand(vec2(uv.y*50.0,gs))-0.5)*0.028;',
  '    vec4 gc=texture2D(tDiffuse,vec2(fract(uv.x+hs),uv.y));',
  '    col.rgb=gc.rgb+vec3(0.09,0.05,0.0);',
  '  }',
  /* film grain — coarser for VHS tape feel */
  '  float grain=rand(uv+fract(time*0.007))-0.5;',
  '  float grain2=rand(uv*1.7+fract(time*0.013+0.3))-0.5;',
  '  col.rgb+=(grain*0.055+grain2*0.025);',
  /* vignette — moderate: dark corners, bright center */
  '  float vig=1.0-dot(cc*1.18,cc*1.18);',
  '  vig=clamp(vig,0.0,1.0);',
  '  col.rgb*=pow(vig,0.9);',
  /* VHS color tint + slight desaturate */
  '  float luma=dot(col.rgb,vec3(0.299,0.587,0.114));',
  '  col.rgb=mix(col.rgb,vec3(luma),0.15);',
  '  col.rgb*=vec3(0.96,0.982,0.91);',
  /* shadow crush: deepen darks for 3D depth */
  '  float luma2=dot(col.rgb,vec3(0.299,0.587,0.114));',
  '  float crush=1.0-smoothstep(0.0,0.45,luma2);',
  '  col.rgb*=(1.0-crush*0.38);',
  /* highlight bloom: gently lift near-white areas */
  '  float hi=smoothstep(0.72,1.0,luma2);',
  '  col.rgb+=vec3(hi*0.06);',
  '  col.rgb=max(col.rgb,0.0);',
  '  gl_FragColor=col;',
  '}'
].join('\n');

var vhsMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse:   { value: null },
    time:       { value: 0.0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader:   VHS_VERT,
  fragmentShader: VHS_FRAG,
  depthWrite: false,
  depthTest: false
});
var vhsQuad   = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vhsMaterial);
var vhsScene  = new THREE.Scene();
var vhsCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
vhsScene.add(vhsQuad);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  vhsTarget.setSize(window.innerWidth, window.innerHeight);
  vhsMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});



/* ----------------------------------------------------------
   iOS / Safari: resume AudioContext on first user gesture
   Web Audio API は autoplay policy により suspended 状態で
   始まるため、最初のタッチ/クリックで resume する必要がある
---------------------------------------------------------- */
(function() {
  function _firstGesture() {
    _resumeAudioCtx();
    document.removeEventListener('touchstart', _firstGesture, true);
    document.removeEventListener('touchend',   _firstGesture, true);
    document.removeEventListener('click',      _firstGesture, true);
    document.removeEventListener('keydown',    _firstGesture, true);
  }
  document.addEventListener('touchstart', _firstGesture, { passive: true, capture: true });
  document.addEventListener('touchend',   _firstGesture, { passive: true, capture: true });
  document.addEventListener('click',      _firstGesture, { capture: true });
  document.addEventListener('keydown',    _firstGesture, { capture: true });
})();

/* ----------------------------------------------------------
   RNG / Math utils
---------------------------------------------------------- */

// 角度を [-PI, PI] に正規化（4箇所で重複していたwhileループを一元化）
function wrapAngle(a) {
  a = a % (Math.PI * 2);
  if (a >  Math.PI) { a -= Math.PI * 2; }
  if (a < -Math.PI) { a += Math.PI * 2; }
  return a;
}

function makeRng(seed) {
  var s = seed % 2147483647;
  if (s <= 0) { s += 2147483646; }
  return function () {
    s = s * 16807 % 2147483647;
    return (s - 1) / 2147483646;
  };
}



/* ----------------------------------------------------------
   Init scene  （非同期化でプログレスバーを実際に更新させる）
---------------------------------------------------------- */
camera.rotation.order = 'YXZ';
setProgress(20);
