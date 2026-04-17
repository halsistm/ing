/* ============================================================
   AUDIO SYSTEM
   THREE.AudioListener + THREE.PositionalAudio + Web Audio API
   procedural synthesis — no external file loading
============================================================ */
var audioEnabled = true;
var audioListener = new THREE.AudioListener();
camera.add(audioListener);

var _audioCtx = null;
var _masterGain = null;  // = audioListener.gain → audioCtx.destination
var _audioReady = false;
var _lastFootstepFloor = 0;

/* ---- MP3 buffer cache ---- */
var _bufCache = {};  // { url: AudioBuffer }

function _loadAudioBuffer(url, callback) {
  if (_bufCache[url]) { callback(_bufCache[url]); return; }
  fetch(url)
    .then(function(r) { return r.arrayBuffer(); })
    .then(function(ab) { return _audioCtx.decodeAudioData(ab); })
    .then(function(buf) { _bufCache[url] = buf; callback(buf); })
    .catch(function(e) { console.warn('[audio] load failed:', url, e); });
}

/* ---- Audio toggle button ---- */
var audioBtnEl = document.getElementById('audio-btn');
if (audioBtnEl) {
  function _toggleAudio(e) {
    if (e) e.stopPropagation();
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      audioBtnEl.textContent = '♪ ON';
      audioBtnEl.classList.remove('muted');
      if (_audioReady) audioListener.setMasterVolume(1.0);
    } else {
      audioBtnEl.textContent = '♪ OFF';
      audioBtnEl.classList.add('muted');
      if (_audioReady) audioListener.setMasterVolume(0.0);
    }
  }
  audioBtnEl.addEventListener('click', _toggleAudio);
  audioBtnEl.addEventListener('touchend', function(e) {
    e.preventDefault();
    _toggleAudio(e);
  }, { passive: false });
}

/* ---- Init (call on first user gesture to satisfy autoplay policy) ---- */
function _resumeAudioCtx() {
  if (_audioReady) return;
  _audioCtx = audioListener.context;
  // audioListener.gain is the THREE.js master gain → audioCtx.destination
  _masterGain = audioListener.gain;
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(function(){});
  }
  _audioReady = true;
  audioListener.setMasterVolume(audioEnabled ? 1.0 : 0.0);
  _startAmbientDrone();
}

/* ---- Helper: connect synthesized node to master ---- */
function _toMaster(node) {
  // Non-THREE.Audio nodes need to connect to audioListener.gain
  // to respect master volume / THREE.AudioListener chain
  node.connect(_masterGain);
}

/* ============================================================
   AMBIENT DRONE  ——  近未来の静寂空間、遠くでなる音
============================================================ */
var _ambientDroneOsc = null;
var _gongLoopRunning = false;

function _startAmbientDrone() {
  if (!_audioCtx || _ambientDroneOsc) return;

  // Sub-bass sine (遠くの空間に溶けるような超低音)
  _ambientDroneOsc = _audioCtx.createOscillator();
  _ambientDroneOsc.type = 'sine';
  _ambientDroneOsc.frequency.value = 46;

  var drone2 = _audioCtx.createOscillator();
  drone2.type = 'sine';
  drone2.frequency.value = 92.5; // 微妙なデチューンで空気感を出す

  var droneGain1 = _audioCtx.createGain();
  droneGain1.gain.value = 0.022; // 少し抑えめ
  var droneGain2 = _audioCtx.createGain();
  droneGain2.gain.value = 0.009;

  // ローパスフィルタ — 高域カットで籠った・遠くから聞こえる質感
  var droneLpf = _audioCtx.createBiquadFilter();
  droneLpf.type = 'lowpass';
  droneLpf.frequency.value = 260;  // ぐっとモコッとさせる
  droneLpf.Q.value = 0.4;

  // 超スローLFO — 遠くでゆっくり呼吸しているような揺らぎ
  var droneLfo = _audioCtx.createOscillator();
  droneLfo.type = 'sine';
  droneLfo.frequency.value = 0.055; // 約18秒周期
  var droneLfoDepth = _audioCtx.createGain();
  droneLfoDepth.gain.value = 0.10;
  droneLfo.connect(droneLfoDepth);

  // アタック12秒 — ふわっと気づいたら鳴っている感じ
  var droneEnv = _audioCtx.createGain();
  droneEnv.gain.setValueAtTime(0, _audioCtx.currentTime);
  droneEnv.gain.linearRampToValueAtTime(0.85, _audioCtx.currentTime + 12.0);
  // LFOでgainを微妙に揺らす
  droneLfoDepth.connect(droneEnv.gain);

  _ambientDroneOsc.connect(droneGain1);
  drone2.connect(droneGain2);
  droneGain1.connect(droneLpf);
  droneGain2.connect(droneLpf);
  droneLpf.connect(droneEnv);
  _toMaster(droneEnv);

  _ambientDroneOsc.start();
  drone2.start();
  droneLfo.start();

  // Schedule distant gong / horn events
  if (!_gongLoopRunning) {
    _gongLoopRunning = true;
    _scheduleNextGong();
  }
}

var _gongTimerId = null; // clearTimeout で止められるようにIDを保持

function _scheduleNextGong() {
  var delay = 9000 + Math.random() * 20000; // 9-29 seconds
  _gongTimerId = setTimeout(function() {
    if (_audioReady && audioEnabled) _playAmbientGong();
    _scheduleNextGong();
  }, delay);
}

function _playAmbientGong() {
  if (!_audioCtx) return;
  var now = _audioCtx.currentTime;

  if (Math.random() < 0.55) {
    /* ---- コーーーーーーーン : FM bell gong (遠くの鐘) ---- */
    var freq = 55 + Math.random() * 55; // very low bell fundamental
    var carrier = _audioCtx.createOscillator();
    var modulator = _audioCtx.createOscillator();
    var modGain = _audioCtx.createGain();
    var ampEnv = _audioCtx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = freq;
    modulator.type = 'sine';
    modulator.frequency.value = freq * (2.0 + Math.random() * 0.06);
    modGain.gain.value = freq * 2.8;

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    ampEnv.gain.setValueAtTime(0, now);
    ampEnv.gain.linearRampToValueAtTime(0.11, now + 0.012);
    ampEnv.gain.setValueAtTime(0.11, now + 0.05);
    // 長い余韻: 20秒かけてゆっくり消える
    ampEnv.gain.exponentialRampToValueAtTime(0.001, now + 18);
    // プツ音防止: stop直前に真0へ滑らかに収束
    ampEnv.gain.linearRampToValueAtTime(0.0, now + 21.5);

    carrier.connect(ampEnv);
    _toMaster(ampEnv);
    carrier.start(now); carrier.stop(now + 22);
    modulator.start(now); modulator.stop(now + 22);

  } else {
    /* ---- ホーーーーーーン : bandpass noise sweep (遠くのホーン) ---- */
    var dur = 10 + Math.random() * 14; // 10-24秒（より長い持続）
    var bufSize = Math.floor(_audioCtx.sampleRate * (dur + 4)); // 余韻バッファを長めに確保
    var buf = _audioCtx.createBuffer(1, bufSize, _audioCtx.sampleRate);
    var bd = buf.getChannelData(0);
    for (var bi = 0; bi < bufSize; bi++) bd[bi] = Math.random() * 2 - 1;

    var src = _audioCtx.createBufferSource();
    src.buffer = buf;

    var filt = _audioCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.Q.value = 32;
    var hFreq = 75 + Math.random() * 55;
    filt.frequency.setValueAtTime(hFreq * 1.25, now);
    filt.frequency.exponentialRampToValueAtTime(hFreq * 0.72, now + dur);

    var amp = _audioCtx.createGain();
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(0.16, now + 0.9);
    amp.gain.setValueAtTime(0.16, now + dur * 0.55);
    // 余韻をゆっくり消す → プツ音防止
    amp.gain.exponentialRampToValueAtTime(0.001, now + dur + 1.5);
    amp.gain.linearRampToValueAtTime(0.0, now + dur + 3.5);

    src.connect(filt);
    filt.connect(amp);
    _toMaster(amp);
    src.start(now);
  }
}

/* ============================================================
   ROOM TRANSITION  ——  ルーム移動のウーッシュ音
============================================================ */
function playSoundRoomTransition() {
  if (!_audioReady || !audioEnabled) return;
  var now = _audioCtx.currentTime;

  var dur = 0.65;
  var bufSize = Math.floor(_audioCtx.sampleRate * dur);
  var buf = _audioCtx.createBuffer(1, bufSize, _audioCtx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.sin(i / bufSize * Math.PI);
  }

  var src = _audioCtx.createBufferSource();
  src.buffer = buf;

  var filt = _audioCtx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.Q.value = 0.7;
  filt.frequency.setValueAtTime(1800, now);
  filt.frequency.exponentialRampToValueAtTime(180, now + dur);

  var amp = _audioCtx.createGain();
  amp.gain.value = 0.48;

  src.connect(filt);
  filt.connect(amp);
  _toMaster(amp);
  src.start(now);
}

/* ============================================================
   FOOTSTEPS  ——  コッコッコッコ（歩く）/ 速い走る音
============================================================ */
function playSoundFootstep(running) {
  if (!_audioReady || !audioEnabled) return;
  var now = _audioCtx.currentTime;

  var decayRate = running ? 55 : 40;
  var bufSize = Math.floor(_audioCtx.sampleRate * 0.06);
  var buf = _audioCtx.createBuffer(1, bufSize, _audioCtx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i * decayRate / _audioCtx.sampleRate);
  }

  var src = _audioCtx.createBufferSource();
  src.buffer = buf;

  var filt = _audioCtx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = running ? 480 : 310;
  filt.Q.value = 1.6;

  // Body resonance low layer
  var filt2 = _audioCtx.createBiquadFilter();
  filt2.type = 'peaking';
  filt2.frequency.value = 120;
  filt2.Q.value = 1.0;
  filt2.gain.value = 6;

  var amp = _audioCtx.createGain();
  amp.gain.value = running ? 0.13 : 0.07;

  src.connect(filt);
  filt.connect(filt2);
  filt2.connect(amp);
  _toMaster(amp);
  src.start(now);
}

/* ============================================================
   CAPTURE BEAM  ——  プラズマ結晶音（千鳥的チリチリ質感・アンビエント空間に馴染む）
   設計思想:
     サイン波キャリア ×3 + FM変調で倍音を有機的に生成。
     ゲームの安っぽいSE音ではなく、空間に溶け込みながら
     電気的なテクスチャを持つ「静かな放電」感を目指す。
     チリチリ感の核はFMインデックスの変動と極細ノイズ層で表現。
============================================================ */
/* ============================================================
   CAPTURE BEAM  ——  laser.mp3 ループ再生
   ループ区間: 0.897秒 〜 3.200秒
============================================================ */
var _beamSrcNode = null;  // AudioBufferSourceNode（ループ再生中）
var _beamGain    = null;

function startBeamSound() {
  if (!_audioReady || !audioEnabled) return;
  if (_beamSrcNode) return;  // 既に再生中

  _loadAudioBuffer('mp3/laser.mp3', function(buf) {
    if (_beamSrcNode) return;  // ロード中に再度呼ばれた場合
    if (!_audioCtx) return;

    var now = _audioCtx.currentTime;

    _beamGain = _audioCtx.createGain();
    _beamGain.gain.setValueAtTime(0, now);
    _beamGain.gain.linearRampToValueAtTime(1.0, now + 0.25); // フェードイン
    _toMaster(_beamGain);

    _beamSrcNode = _audioCtx.createBufferSource();
    _beamSrcNode.buffer    = buf;
    _beamSrcNode.loop      = true;
    _beamSrcNode.loopStart = 0.897;  // ループ開始点
    _beamSrcNode.loopEnd   = 3.200;  // ループ終了点
    _beamSrcNode.connect(_beamGain);
    _beamSrcNode.start(now, 0.897);  // 最初から0.897秒位置で再生開始
  });
}

function stopBeamSound() {
  if (!_beamSrcNode || !_audioCtx) return;
  var now = _audioCtx.currentTime;
  _beamGain.gain.setValueAtTime(_beamGain.gain.value, now);
  _beamGain.gain.linearRampToValueAtTime(0, now + 0.18); // フェードアウト
  var src  = _beamSrcNode;
  var gain = _beamGain;
  setTimeout(function() {
    try { src.stop(); } catch(e) {}
    try { gain.disconnect(); } catch(e) {}
  }, 280);
  _beamSrcNode = null;
  _beamGain    = null;
}

/* ============================================================
   CAPTURE COMPLETE  ——  pop.mp3 を1回再生
============================================================ */
function playSoundCapture() {
  if (!_audioReady || !audioEnabled) return;

  _loadAudioBuffer('mp3/pop.mp3', function(buf) {
    if (!_audioCtx) return;
    var src = _audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop   = false;
    _toMaster(src);
    src.start(_audioCtx.currentTime);
  });
}

/* ============================================================
   ZUKAN (図鑑)  ——  しゅっ（柔らかな紙をめくる音・小音量）
============================================================ */
function playSoundZukan() {
  if (!_audioReady || !audioEnabled) return;
  var now = _audioCtx.currentTime;

  // ── ノイズバッファ生成 ─────────────────────────────────
  var dur     = 0.28;
  var bufSize = Math.floor(_audioCtx.sampleRate * dur);
  var buf     = _audioCtx.createBuffer(1, bufSize, _audioCtx.sampleRate);
  var d       = buf.getChannelData(0);

  // ホワイト＋ピンク風ノイズを混ぜて低域成分を足す
  var b0 = 0, b1 = 0, b2 = 0;  // ピンクノイズ用ローパス蓄積
  for (var i = 0; i < bufSize; i++) {
    var white = Math.random() * 2 - 1;

    // ピンクノイズ近似（Paul Kelletアルゴリズム簡易版）
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    var pink = (b0 + b1 + b2 + white * 0.1848) / 4;

    // ホワイト30%・ピンク70%でブレンド → やわらかい質感
    var mixed = white * 0.3 + pink * 0.7;

    // ゆっくりした減衰（6）＋末尾フェードアウト
    var env = Math.exp(-i * 6 / bufSize);
    var fade = 1 - i / bufSize;  // リニアフェードアウト
    d[i] = mixed * env * fade;
  }

  var src = _audioCtx.createBufferSource();
  src.buffer = buf;

  // ── フィルタ：低めのバンドパスで高域の尖りを除去 ──────
  var filt = _audioCtx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.setValueAtTime(1800, now);
  filt.frequency.exponentialRampToValueAtTime(400, now + dur);
  filt.Q.value = 1.8;

  // ── ローシェルフで耳障りな高域をさらに丸める ──────────
  var shelf = _audioCtx.createBiquadFilter();
  shelf.type = 'highshelf';
  shelf.frequency.value = 3000;
  shelf.gain.value = -10;  // 3kHz以上を-10dB削る

  // ── ゲイン ────────────────────────────────────────────
  var amp = _audioCtx.createGain();
  amp.gain.value = 0.22;

  src.connect(filt);
  filt.connect(shelf);
  shelf.connect(amp);
  _toMaster(amp);
  src.start(now);
}

/* ============================================================
   CREATURE SOUNDS  ——  謎の生命体（THREE.PositionalAudio）
   6種類のmp3ファイルをcreatureId % 6 でカテゴリ分け
============================================================ */

// 生き物の声 mp3 リスト（6種類）
var CREATURE_MP3S = [
  'mp3/469163__hawkeye_sprout__child-hum-02.mp3',         // 0: フワフワ浮遊系
  'mp3/469071__hawkeye_sprout__girl-humming.mp3',          // 1: やわらかい系
  'mp3/469091__hawkeye_sprout__cute-creature-humming.mp3', // 2: キュート系
  'mp3/469100__hawkeye_sprout__girl-exhaling.mp3',         // 3: 神秘・息系
  'mp3/469107__hawkeye_sprout__falling-voice.mp3',         // 4: 落下・大型系
  'mp3/469156__hawkeye_sprout__creature-voice-asking.mp3'  // 5: 疑問・問いかけ系
];

// Attach THREE.PositionalAudio to creature interactable
function _attachCreatureAudio(it) {
  if (!_audioReady || !audioListener || !it.mesh) return;
  var category = (it.data && it.data.creatureId !== undefined)
    ? (it.data.creatureId % CREATURE_MP3S.length) : 0;

  var pa = new THREE.PositionalAudio(audioListener);
  pa.setRefDistance(4.0);
  pa.setMaxDistance(22.0);
  pa.setRolloffFactor(1.5);
  pa.setLoop(false);
  pa.setVolume(0.75);
  it.mesh.add(pa);
  it._posAudio   = pa;
  it._audioCat   = category;
  it._audioTimer = 1.5 + Math.random() * 5.0; // 初回発声まで1.5〜6.5秒

  // バッファをプリロードしておく
  _loadAudioBuffer(CREATURE_MP3S[category], function(buf) {
    if (it._posAudio === pa) pa.setBuffer(buf);
  });
}

// Per-frame update for creature audio (called inside updateInteractables)
function _tickCreatureAudio(it, dt) {
  if (!it._posAudio || !_audioReady || !audioEnabled) return;
  if (!it.alive || it.locked) return;
  it._audioTimer -= dt;
  if (it._audioTimer <= 0) {
    // 次の発声間隔: 2〜10秒（短い音声ファイル用にやや短め）
    it._audioTimer = 2.0 + Math.random() * 8.0;
    _loadAudioBuffer(CREATURE_MP3S[it._audioCat], function(buf) {
      if (!it._posAudio) return;
      it._posAudio.setBuffer(buf);
      if (!it._posAudio.isPlaying) {
        try { it._posAudio.play(); } catch(ex) {}
      }
    });
  }
}

// Release creature audio on room change
function _releaseCreatureAudio(it) {
  if (!it._posAudio) return;
  try {
    if (it._posAudio.isPlaying) it._posAudio.stop();
    if (it.mesh) it.mesh.remove(it._posAudio);
    it._posAudio.disconnect();
  } catch(ex) {}
  it._posAudio = null;
}

/* ============================================================
   PISTOL SHOT  ——  shut.mp3 を1回再生
============================================================ */
function playSoundShot() {
  if (!_audioReady || !audioEnabled) return;

  _loadAudioBuffer('mp3/shut.mp3', function(buf) {
    if (!_audioCtx) return;
    var src = _audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop   = false;
    _toMaster(src);
    src.start(_audioCtx.currentTime);
  });
}

/* ============================================================
   END AUDIO SYSTEM
============================================================ */