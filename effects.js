'use strict';
/* ================================================================
   effects.js  —  VHSシェーダー拡張 + 戦闘エフェクト
   ロード順: engine.js → effects.js → ...
   ================================================================

   【統合手順】
   1. index.html の <script> でこのファイルを engine.js の直後に追加
   2. _startGame() 内の spawnRoom() 呼び出し後に initEffects() を呼ぶ
   3. loop.js の animate() 内、最初の updateInteractables(dt) の前あたりで
        updateEffects(dt);
      を追加（描画より前に呼ぶこと）

   【公開API】
     initEffects()               — 初期化（一度だけ呼ぶ）
     triggerEffect(name, dur)    — エフェクト発火
     updateEffects(dt)           — 毎フレーム呼ぶ
     triggerHitEffect()          — 被弾合成エフェクト
     triggerDeathEffect()        — ゲームオーバー合成エフェクト
     triggerRoomTransitionEffect() — 部屋移動合成エフェクト

   【エフェクト種別】
     'sandStorm'   砂嵐（静電気ノイズ）
     'blockNoise'  ブロックノイズ（低解像度化）
     'motionBlur'  超残像（スクリーンスペースブラー）
     'warp'        波歪みグニョグニョ
     'chromaBurst' 色収差爆発
     'hitFlash'    被弾フラッシュ（赤ビネット）
================================================================ */

/* ── エフェクトステート ── */
var _eff = {
  sandStorm:   { active: false, timer: 0.0, dur: 0.0 },
  blockNoise:  { active: false, timer: 0.0, dur: 0.0 },
  motionBlur:  { active: false, timer: 0.0, dur: 0.0 },
  warp:        { active: false, timer: 0.0, dur: 0.0 },
  chromaBurst: { active: false, timer: 0.0, dur: 0.0 },
  hitFlash:    { active: false, timer: 0.0, dur: 0.0 }
};

var _effectsReady = false;

/* ================================================================
   拡張VHSフラグメントシェーダー
   元の engine.js の VHS_FRAG を完全に置き換える。
   新規ユニフォーム 6本を追加。元の全エフェクトを維持。
================================================================ */
var _EFF_FRAG = [
  'uniform sampler2D tDiffuse;',
  'uniform float     time;',
  'uniform vec2      resolution;',
  /* ── 戦闘エフェクト用ユニフォーム ── */
  'uniform float uSandStorm;',    // 0-1  砂嵐強度
  'uniform float uBlockNoise;',   // 0-1  ブロックノイズ強度
  'uniform float uMotionBlur;',   // 0-1  残像強度
  'uniform float uWarp;',         // 0-1  波歪み強度
  'uniform float uChromaBurst;',  // 0-1  色収差爆発強度
  'uniform float uHitFlash;',     // 0-1  被弾フラッシュ強度
  'varying vec2 vUv;',
  '',
  'float rand(vec2 co){ return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453); }',
  'float rand2(vec2 co){ return fract(cos(dot(co.xy,vec2(4.1247,91.701)))*38291.7143); }',
  '',
  'vec3 sCurve(vec3 c){',
  '  c = clamp(c, 0.0, 1.0);',
  '  return c * c * (3.0 - 2.0 * c);',   /* smoothstep S字コントラスト */
  '}',
  '',
  'void main(){',
  '  vec2 uv = vUv;',

  /* ── 波歪み（warp）── uWarp > 0 のとき適用 */
  '  if(uWarp > 0.0){',
  '    float wa = uWarp * 0.034;',
  '    uv.x += sin(uv.y * 18.0 + time * 4.0) * wa;',
  '    uv.y += cos(uv.x * 14.0 + time * 3.2) * wa * 0.55;',
  '  }',

  /* ── バレル歪み（常時）── */
  '  vec2 cc = uv - 0.5;',
  '  float dist = dot(cc, cc);',
  '  uv = uv + cc * (dist * 0.06);',
  '  if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){ gl_FragColor=vec4(0,0,0,1); return; }',

  /* ── ブロックノイズ：UV をタイルに丸める ── */
  '  vec2 sUv = uv;',
  '  if(uBlockNoise > 0.0){',
  '    float bs  = mix(64.0, 10.0, uBlockNoise * uBlockNoise);',  /* 強いほど粗くなる */
  '    float jit = rand(vec2(floor(time * 7.0) * 0.07, 2.31)) * uBlockNoise;',
  '    if(jit > 0.25){',
  '      sUv = floor(uv * bs) / bs;',
  '    }',
  '  }',

  /* ── 色収差（ベース + 爆発）── */
  '  float chromaAdd  = uChromaBurst * 0.052;',
  '  float chromaPulse = uChromaBurst * 0.014 * sin(time * 14.0);',
  '  float edge  = dot(cc, cc) * 4.5;',
  '  float shift = (0.005 + chromaAdd) * edge + 0.001 * sin(time * 0.35) + chromaPulse;',
  '  vec4 col;',
  '  col.r = texture2D(tDiffuse, sUv + vec2( shift,  shift * 0.4)).r;',
  '  col.g = texture2D(tDiffuse, sUv).g;',
  '  col.b = texture2D(tDiffuse, sUv - vec2( shift,  shift * 0.4)).b;',
  '  col.a = 1.0;',

  /* ── 残像ブラー（スクリーンスペース放射ブラー）── */
  '  if(uMotionBlur > 0.0){',
  '    float br = 0.006 * uMotionBlur;',
  '    vec4 blurred = col;',
  '    blurred += texture2D(tDiffuse, sUv + vec2( br,  0.0));',
  '    blurred += texture2D(tDiffuse, sUv + vec2(-br,  0.0));',
  '    blurred += texture2D(tDiffuse, sUv + vec2( 0.0, br ));',
  '    blurred += texture2D(tDiffuse, sUv + vec2( 0.0,-br ));',
  '    blurred += texture2D(tDiffuse, sUv + vec2( br,  br ) * 0.7);',
  '    blurred += texture2D(tDiffuse, sUv + vec2(-br, -br ) * 0.7);',
  '    col = mix(col, blurred / 7.0, uMotionBlur * 0.85);',
  '  }',

  /* ── Sカーブコントラスト ── */
  '  float luma0 = dot(col.rgb, vec3(0.299, 0.587, 0.114));',
  '  col.rgb = mix(col.rgb, sCurve(col.rgb), 0.38);',

  /* ── スキャンライン ── */
  '  float scan = sin(uv.y * resolution.y * 1.6) * 0.045;',
  '  col.rgb -= clamp(scan, 0.0, 1.0);',

  /* ── 横グリッチ帯（砂嵐時は頻度増加）── */
  '  float gs = floor(time * 0.6);',
  '  float glitchFreq = 0.03 + uSandStorm * 0.55;',   /* 砂嵐時は大幅増加 */
  '  float doGlitch = step(1.0 - glitchFreq, rand(vec2(gs, 3.7)));',
  '  float bandY  = rand(vec2(gs, 5.1));',
  '  float bandH  = 0.007 + rand(vec2(gs, 9.3)) * 0.016;',
  '  if(doGlitch > 0.0 && abs(uv.y - bandY) < bandH){',
  '    float hs = (rand(vec2(uv.y * 50.0, gs)) - 0.5) * 0.028 * (1.0 + uSandStorm * 3.5);',
  '    vec4 gc = texture2D(tDiffuse, vec2(fract(uv.x + hs), uv.y));',
  '    col.rgb = gc.rgb + vec3(0.09, 0.05, 0.0);',
  '  }',

  /* ── フィルムグレイン ── */
  '  float grain  = rand(uv + fract(time * 0.007)) - 0.5;',
  '  float grain2 = rand2(uv * 1.7 + fract(time * 0.013 + 0.3)) - 0.5;',
  '  float grainAmp = 0.055 + uSandStorm * 0.24;',
  '  col.rgb += grain * grainAmp + grain2 * 0.025;',

  /* ── 砂嵐：ホワイトノイズ粒子 ── */
  '  if(uSandStorm > 0.0){',
  '    float storm = rand(uv * 88.0 + fract(time * 0.11)) * uSandStorm;',
  '    float storm2 = rand2(uv * 53.1 + fract(time * 0.09 + 0.5)) * uSandStorm * 0.5;',
  '    col.rgb = mix(col.rgb, vec3(storm + storm2), uSandStorm * 0.52);',
  '  }',

  /* ── ビネット ── */
  '  float vig = 1.0 - dot(cc * 1.18, cc * 1.18);',
  '  vig = clamp(vig, 0.0, 1.0);',
  '  col.rgb *= pow(vig, 0.9);',

  /* ── VHSカラートーン + 軽い脱彩色 ── */
  '  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));',
  '  col.rgb = mix(col.rgb, vec3(luma), 0.15);',
  '  col.rgb *= vec3(0.96, 0.982, 0.91);',

  /* ── シャドークラッシュ ── */
  '  float luma2 = dot(col.rgb, vec3(0.299, 0.587, 0.114));',
  '  float crush = 1.0 - smoothstep(0.0, 0.45, luma2);',
  '  col.rgb *= (1.0 - crush * 0.38);',

  /* ── ハイライトブルーム ── */
  '  float hi = smoothstep(0.72, 1.0, luma2);',
  '  col.rgb += vec3(hi * 0.06);',

  /* ── 被弾フラッシュ（赤ビネット）── */
  '  if(uHitFlash > 0.0){',
  '    float fvig = clamp(1.0 - (1.0 - dot(cc * 0.85, cc * 0.85)), 0.0, 1.0);',
  '    col.rgb = mix(col.rgb, vec3(0.95, 0.02, 0.02), fvig * uHitFlash * 0.72);',
  '    col.rgb += vec3(uHitFlash * 0.06, 0.0, 0.0);',
  '  }',

  '  col.rgb = max(col.rgb, 0.0);',
  '  gl_FragColor = col;',
  '}'
].join('\n');

var _EFF_VERT = [
  'varying vec2 vUv;',
  'void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }'
].join('\n');

/* ================================================================
   initEffects()
   ゲーム開始後（loadingEl が消えた後）に一度だけ呼ぶ。
   vhsQuad.material を拡張版に差し替える。
================================================================ */
function initEffects() {
  if (_effectsReady) return;

  var enhancedMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse:     { value: null },
      time:         { value: 0.0 },
      resolution:   { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uSandStorm:   { value: 0.0 },
      uBlockNoise:  { value: 0.0 },
      uMotionBlur:  { value: 0.0 },
      uWarp:        { value: 0.0 },
      uChromaBurst: { value: 0.0 },
      uHitFlash:    { value: 0.0 }
    },
    vertexShader:   _EFF_VERT,
    fragmentShader: _EFF_FRAG,
    depthWrite: false,
    depthTest:  false
  });

  /* vhsQuad のマテリアルを差し替え（engine.js で定義済みのグローバル） */
  if (typeof vhsQuad !== 'undefined') {
    vhsQuad.material = enhancedMat;
  }
  /* グローバル参照を更新（loop.js が vhsMaterial.uniforms に直接触れる場合のため） */
  vhsMaterial = enhancedMat;   // eslint-disable-line no-global-assign

  /* リサイズ時の解像度同期 */
  window.addEventListener('resize', function() {
    if (vhsMaterial && vhsMaterial.uniforms.resolution) {
      vhsMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  _effectsReady = true;
  console.log('[effects] 拡張VHSシェーダー初期化完了');
}

/* ================================================================
   triggerEffect(name, duration)
   エフェクトを発火させる。複数の同時起動OK。
================================================================ */
function triggerEffect(name, duration) {
  if (!_eff[name]) return;
  _eff[name].active = true;
  _eff[name].timer  = duration;
  _eff[name].dur    = duration;
}

/* ================================================================
   updateEffects(dt)
   loop.js の animate() 内、renderer.render の前に呼ぶ。
================================================================ */
function updateEffects(dt) {
  if (!_effectsReady || !vhsMaterial || !vhsMaterial.uniforms.uSandStorm) return;

  var t = typeof vhsTime !== 'undefined' ? vhsTime : (Date.now() * 0.001);

  /* エフェクト強度を計算（フェードイン10%・フェードアウト20%のエンベロープ） */
  function _eval(key) {
    var e = _eff[key];
    if (!e.active) return 0.0;
    e.timer -= dt;
    if (e.timer <= 0.0) { e.active = false; e.timer = 0.0; return 0.0; }
    var prog    = e.timer / e.dur;              /* 1→0 */
    var fadeIn  = Math.min(1.0, (1.0 - prog) / 0.10);
    var fadeOut = Math.min(1.0, prog           / 0.20);
    return Math.min(fadeIn, fadeOut);
  }

  var sandInt   = _eval('sandStorm');
  var blockInt  = _eval('blockNoise');
  var blurInt   = _eval('motionBlur');
  var warpInt   = _eval('warp');
  var chromaInt = _eval('chromaBurst');
  var hitInt    = _eval('hitFlash');

  /* 砂嵐：sin変調でザザッ→静止→ザザザッのリズム */
  if (sandInt > 0.0) {
    sandInt *= 0.45 + 0.55 * Math.abs(Math.sin(t * 8.5));
  }

  /* 色収差爆発：サイン波で点滅させてよりサイケデリックに */
  if (chromaInt > 0.0) {
    chromaInt *= 0.6 + 0.4 * Math.abs(Math.sin(t * 22.0));
  }

  vhsMaterial.uniforms.uSandStorm.value   = sandInt;
  vhsMaterial.uniforms.uBlockNoise.value  = blockInt;
  vhsMaterial.uniforms.uMotionBlur.value  = blurInt;
  vhsMaterial.uniforms.uWarp.value        = warpInt;
  vhsMaterial.uniforms.uChromaBurst.value = chromaInt;
  vhsMaterial.uniforms.uHitFlash.value    = hitInt;

  /* loop.js が vhsTime を別に設定している場合は上書きしない */
  /* （重複設定だが無害） */
  vhsMaterial.uniforms.time.value = t;
}

/* ================================================================
   合成エフェクト便利ラッパー
================================================================ */

/** 被弾時 */
function triggerHitEffect() {
  triggerEffect('hitFlash',    0.22);
  triggerEffect('chromaBurst', 0.14);
}

/** 生物撃破時 */
function triggerKillEffect() {
  triggerEffect('chromaBurst', 0.35);
  triggerEffect('warp',        0.20);
}

/** ゲームオーバー */
function triggerDeathEffect() {
  triggerEffect('sandStorm',   4.00);
  triggerEffect('warp',        2.00);
  triggerEffect('chromaBurst', 1.20);
  triggerEffect('blockNoise',  1.50);
}

/** 部屋移動 */
function triggerRoomTransitionEffect() {
  triggerEffect('motionBlur',  0.70);
  triggerEffect('blockNoise',  0.35);
  triggerEffect('warp',        0.25);
}

/** 武器発射（ショットガン用）*/
function triggerShotgunEffect() {
  triggerEffect('chromaBurst', 0.20);
  triggerEffect('motionBlur',  0.12);
}
