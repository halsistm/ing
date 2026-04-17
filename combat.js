'use strict';
/* ================================================================
   combat.js  —  HP・ダメージ・AIステートマシン・ゲームオーバー
   ロード順: engine.js → effects.js → combat.js → weapons.js
   ================================================================

   【統合手順】
   1. index.html の <script> にこのファイルを effects.js の後に追加
   2. loop.js の animate() 末尾に updateCombat(dt) を追加
      （updateInteractables(dt) の後・render より前が望ましい）
   3. 捕獲処理（既存コード）で生物の捕獲確率を
        getCaptureChance(creature)  （0.05 〜 0.95）
      で取得するよう変更する

   【公開API】
     initCreatureHP(creature)     — 生物スポーン後に呼ぶ（遅延初期化も可）
     damageCreature(creature, n)  — 弾丸ヒット時
     damagePlayer(n, source)      — 生物接触時
     getCaptureChance(creature)   — 捕獲成功率 0.05〜0.95
     updateCombat(dt)             — 毎フレーム呼ぶ
     updatePlayerHPBar()          — HP変化後にHUD再描画
     playerHp / playerMaxHp       — グローバル参照
     _gameOver                    — ゲームオーバーフラグ

   【AIステート】
     AI_WANDER (0): 既存のふらふら移動
     AI_ALERT  (1): プレイヤーへ蛇行接近 + 近接攻撃
================================================================ */

/* ── AIステート定数 ── */
var AI_WANDER = 0;
var AI_ALERT  = 1;

/* ── 捕獲中クリーチャーリスト（捕獲ビームシステムと共有） ── */
var _lockedCreatures = [];

/* ── プレイヤーHP ── */
var playerMaxHp = 100;
var playerHp    = 100;
var _playerInvincible      = false;
var _playerInvincibleTimer = 0.0;
var _gameOver              = false;

/* ── HPバーキャンバスサイズ ── */
var _HP_W = 128, _HP_H = 14;

/* ================================================================
   プレイヤーHP HUD（DOM）
================================================================ */
var _plrHPBarEl  = null;
var _plrHPTextEl = null;

(function _initPlayerHUD() {
  var wrap = document.createElement('div');
  wrap.id = 'combat-player-hp';
  wrap.style.cssText = [
    'position:fixed;bottom:80px;left:16px;',
    'display:flex;flex-direction:column;gap:3px;',
    'pointer-events:none;z-index:150;'
  ].join('');

  /* ラベル */
  var lbl = document.createElement('div');
  lbl.style.cssText = [
    'font-family:monospace;font-size:9px;',
    'color:rgba(255,255,255,0.45);letter-spacing:0.12em;'
  ].join('');
  lbl.textContent = 'HP';

  /* バー背景 */
  var bg = document.createElement('div');
  bg.style.cssText = [
    'width:120px;height:8px;',
    'background:rgba(0,0,0,0.65);',
    'border:1px solid rgba(255,255,255,0.18);',
    'border-radius:2px;overflow:hidden;'
  ].join('');

  /* バー本体 */
  var bar = document.createElement('div');
  bar.style.cssText = [
    'height:100%;width:100%;border-radius:2px;',
    'background:linear-gradient(90deg,#4477AA,#5588BB);',
    'transition:width 0.12s,background 0.25s;'
  ].join('');
  bg.appendChild(bar);
  _plrHPBarEl = bar;

  /* テキスト */
  var txt = document.createElement('div');
  txt.style.cssText = [
    'font-family:monospace;font-size:10px;',
    'color:rgba(255,255,255,0.72);letter-spacing:0.04em;'
  ].join('');
  txt.textContent = '100 / 100';
  _plrHPTextEl = txt;

  wrap.appendChild(lbl);
  wrap.appendChild(bg);
  wrap.appendChild(txt);
  document.body.appendChild(wrap);
})();

function updatePlayerHPBar() {
  if (!_plrHPBarEl) return;
  var ratio = Math.max(0.0, playerHp / playerMaxHp);
  _plrHPBarEl.style.width = (ratio * 100).toFixed(1) + '%';
  /* 落ち着いた青→紫系のグラデーション */
  var b = Math.round(120 + 80 * ratio);
  var r = Math.round(80  + 60 * (1.0 - ratio));
  _plrHPBarEl.style.background =
    'linear-gradient(90deg,rgb(' + r + ',80,' + b + '),rgb(' + Math.round(r * 0.7) + ',100,' + b + '))';
  if (_plrHPTextEl) {
    _plrHPTextEl.textContent = Math.max(0, Math.round(playerHp)) + ' / ' + playerMaxHp;
  }
}

/* ================================================================
   cleanupAllHPSprites()
   部屋移動時に呼ぶ。前ルームの生物HPバーを全消去。
================================================================ */
function cleanupAllHPSprites() {
  if (typeof roomInteractables === 'undefined') return;
  for (var i = 0; i < roomInteractables.length; i++) {
    var cr = roomInteractables[i];
    if (cr._hpSprite) {
      scene.remove(cr._hpSprite);
      cr._hpSprite = null;
    }
  }
}

/* ================================================================
   生物HP初期化
   creatures3D.js がスポーンした creature オブジェクトに
   プロパティを付与する。updateCombat 内で遅延初期化もされる。
================================================================ */
function initCreatureHP(creature) {
  if (creature._hpInitialized) return;
  var bh = creature.bodyH || 1.0;
  creature.maxHp          = Math.max(10, Math.round(bh * 20.0));
  creature.currentHp      = creature.maxHp;
  creature.aiState        = AI_WANDER;
  creature.aiAlertTimer   = 0.0;
  creature._warpPhase     = Math.random() * Math.PI * 2.0;  /* 蛇行位相 */
  creature._atkCooldown   = 0.0;
  creature._hpInitialized = true;
  _createHPSprite(creature);
}

/* ================================================================
   HPバー Sprite（THREE.Sprite + CanvasTexture）
================================================================ */
function _createHPSprite(creature) {
  var canvas = document.createElement('canvas');
  canvas.width  = _HP_W;
  canvas.height = _HP_H;
  var tex = new THREE.CanvasTexture(canvas);
  var mat = new THREE.SpriteMaterial({
    map: tex, depthTest: false, transparent: true, sizeAttenuation: true
  });
  var sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.4, 0.175, 1.0);
  sprite.visible = false;
  scene.add(sprite);

  creature._hpCanvas = canvas;
  creature._hpCtx    = canvas.getContext('2d');
  creature._hpTex    = tex;
  creature._hpSprite = sprite;
  _redrawHPBar(creature);
}

function _redrawHPBar(creature) {
  var ctx = creature._hpCtx;
  if (!ctx) return;
  var w = _HP_W, h = _HP_H;
  ctx.clearRect(0, 0, w, h);

  /* 背景 */
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  _rrect(ctx, 1, 1, w - 2, h - 2, 3); ctx.fill();

  /* HPバー */
  var ratio = Math.max(0.0, creature.currentHp / creature.maxHp);
  if (ratio > 0.0) {
    var r = Math.round(255 * (1.0 - ratio));
    var g = Math.round(210 * ratio);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',30)';
    _rrect(ctx, 2, 2, (w - 4) * ratio, h - 4, 2); ctx.fill();
  }

  /* 枠 */
  ctx.strokeStyle = 'rgba(255,255,255,0.30)';
  ctx.lineWidth = 1;
  _rrect(ctx, 1, 1, w - 2, h - 2, 3); ctx.stroke();

  creature._hpTex.needsUpdate = true;
}

function _rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ================================================================
   damageCreature(creature, damage)
================================================================ */
function damageCreature(creature, damage) {
  if (!creature || !creature.alive) return;
  if (!creature._hpInitialized) initCreatureHP(creature);

  creature.currentHp = Math.max(0, creature.currentHp - damage);
  _redrawHPBar(creature);
  if (creature._hpSprite) creature._hpSprite.visible = true;

  /* 低HP時エミッシブ演出（捕獲しやすい状態の視覚フィードバック）*/
  var ratio = creature.currentHp / creature.maxHp;
  if (creature.mesh && ratio < 0.35) {
    creature.mesh.traverse(function(c) {
      if (c.isMesh && c.material) {
        c.material.emissiveIntensity = 0.7 + (0.35 - ratio) * 2.5;
      }
    });
  }

  /* ALERT状態へ移行 */
  creature.aiState      = AI_ALERT;
  creature.aiAlertTimer = 10.0;

  /* 撃破 */
  if (creature.currentHp <= 0) {
    _killCreature(creature);
  }
}

function _killCreature(creature) {
  creature.alive = false;

  /* チャージ中ならエフェクトを解放 */
  if (typeof _caStopCharge === 'function' && creature._caPhase && creature._caPhase !== 'idle') {
    _caStopCharge(creature);
  }

  if (creature._hpSprite) {
    scene.remove(creature._hpSprite);
    creature._hpSprite = null;
  }

  if (creature.mesh) {
    /* collection.js の startFadeCapture に委譲（スケールダウン + フェードアウト）*/
    if (typeof startFadeCapture === 'function') {
      startFadeCapture(creature.mesh);
    } else {
      scene.remove(creature.mesh);
    }
    creature.mesh = null;
  }

  /* triggerKillEffect() は廃止（視覚異常エフェクトが意図せず発生するため）*/
}

/* ================================================================
   damagePlayer(amount, source)
================================================================ */
function damagePlayer(amount, source) {
  if (_gameOver || _playerInvincible) return;
  playerHp = Math.max(0, playerHp - amount);
  updatePlayerHPBar();

  /* 被弾後無敵時間 */
  _playerInvincible      = true;
  _playerInvincibleTimer = 0.55;

  if (typeof triggerHitEffect === 'function') triggerHitEffect();

  /* 生物の近接攻撃 → 15% の確率で20秒間の視覚異常 */
  if (!_gameOver && source && source.type === 'creature' && source.alive) {
    if (Math.random() < 0.15) triggerVisionAnomaly();
  }

  if (playerHp <= 0) _triggerGameOver();
}

/* ================================================================
   視覚異常エフェクト（生物被弾時 15% で発動）
   フェーズ: 0-5秒=フル発症 / 5-8秒=中程度 / 8-20秒=慢性持続
================================================================ */
var _visionNoticeEl      = null;
var _visionNoticeTimeout = null;

(function _createVisionNoticeEl() {
  var el = document.createElement('div');
  el.id = 'vision-anomaly-notice';
  el.style.cssText = [
    'position:fixed;top:18px;left:50%;transform:translateX(-50%);',
    'font-family:monospace;font-size:11px;letter-spacing:0.22em;',
    'color:rgba(255,60,60,0.0);',
    'text-shadow:0 0 14px rgba(255,0,0,0.7);',
    'pointer-events:none;z-index:8000;',
    'transition:color 0.5s;white-space:nowrap;'
  ].join('');
  el.textContent = '⚠ 視覚異常 VISION ANOMALY ⚠';
  document.body.appendChild(el);
  _visionNoticeEl = el;
})();

function triggerVisionAnomaly() {
  if (typeof triggerEffect !== 'function') return;
  triggerEffect('warp',        20.0);
  triggerEffect('sandStorm',   20.0);
  triggerEffect('motionBlur',   8.0);
  triggerEffect('blockNoise',   5.0);
  triggerEffect('chromaBurst',  5.0);

  if (!_visionNoticeEl) return;
  if (_visionNoticeTimeout !== null) { clearTimeout(_visionNoticeTimeout); _visionNoticeTimeout = null; }
  _visionNoticeEl.style.transition = 'color 0.5s';
  _visionNoticeEl.style.color = 'rgba(255,60,60,0.85)';
  _visionNoticeTimeout = setTimeout(function() {
    _visionNoticeEl.style.transition = 'color 2.0s';
    _visionNoticeEl.style.color = 'rgba(255,60,60,0.0)';
    _visionNoticeTimeout = null;
  }, 18000);
}

/* ================================================================
   捕獲成功率
   フル体力: 5%、HP ゼロ近く: 95%
================================================================ */
function getCaptureChance(creature) {
  if (!creature._hpInitialized) return 0.05;
  var ratio = creature.currentHp / creature.maxHp;
  return (1.0 - ratio) * 0.90 + 0.05;
}

/* ================================================================
   ゲームオーバー画面
================================================================ */
var _gameOverEl = null;

(function _initGameOverScreen() {
  var el = document.createElement('div');
  el.id = 'combat-gameover';
  el.style.cssText = [
    'position:fixed;inset:0;',
    'background:rgba(0,0,0,0);',
    'display:flex;flex-direction:column;',
    'align-items:center;justify-content:center;',
    'z-index:9900;pointer-events:none;',
    'transition:background 1.8s;',
    'font-family:monospace;'
  ].join('');

  /* YOU DIED */
  var title = document.createElement('div');
  title.style.cssText = [
    'font-size:clamp(30px,9vw,56px);',
    'color:#FF2222;letter-spacing:0.22em;margin-bottom:18px;',
    'text-shadow:0 0 28px #FF0000,0 0 60px #880000;',
    'opacity:0;transition:opacity 1.0s 0.6s;'
  ].join('');
  title.textContent = 'YOU DIED';

  /* サブテキスト */
  var sub = document.createElement('div');
  sub.style.cssText = [
    'font-size:13px;color:rgba(255,80,80,0.65);',
    'letter-spacing:0.16em;margin-bottom:44px;',
    'opacity:0;transition:opacity 1.0s 0.9s;'
  ].join('');
  sub.textContent = '生物に倒された';

  /* RESTARTボタン */
  var btn = document.createElement('button');
  btn.style.cssText = [
    'background:transparent;',
    'border:1px solid rgba(255,80,80,0.45);',
    'color:rgba(255,170,170,0.80);',
    'font-family:monospace;font-size:13px;',
    'padding:10px 32px;letter-spacing:0.18em;cursor:pointer;',
    'opacity:0;transition:opacity 1.0s 1.3s;pointer-events:none;', /* ★修正: 初期は none */
    'text-shadow:0 0 10px rgba(255,0,0,0.55);'
  ].join('');
  btn.textContent = 'RESTART';
  btn.addEventListener('click', function() { location.reload(); });
  btn.addEventListener('touchend', function(e) { e.preventDefault(); location.reload(); }, { passive: false });

  el.appendChild(title);
  el.appendChild(sub);
  el.appendChild(btn);
  document.body.appendChild(el);
  _gameOverEl = el;
})();

function _triggerGameOver() {
  _gameOver = true;
  if (!_gameOverEl) return;
  _gameOverEl.style.pointerEvents = 'auto';
  setTimeout(function() {
    _gameOverEl.style.background = 'rgba(25,0,0,0.90)';
    var kids = _gameOverEl.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].style.opacity = '1';
      /* ★修正: ボタンのpointer-eventsをゲームオーバー時に有効化 */
      if (kids[i].tagName === 'BUTTON') kids[i].style.pointerEvents = 'auto';
    }
  }, 60);
  if (typeof triggerDeathEffect === 'function') triggerDeathEffect();
}

/* ================================================================
   updateCombat(dt)
   loop.js の animate() 末尾で呼ぶ。
   — プレイヤー無敵時間カウントダウン
   — 生物ごとのHP遅延初期化
   — WANDER / ALERT ステート遷移
   — ALERT 時の wanderFacing 上書き（蛇行接近）
   — 近接ダメージ判定
   — HPバー位置更新
================================================================ */
function updateCombat(dt) {
  if (_gameOver) return;

  /* 無敵時間 */
  if (_playerInvincible) {
    _playerInvincibleTimer -= dt;
    if (_playerInvincibleTimer <= 0.0) _playerInvincible = false;
  }

  if (typeof roomInteractables === 'undefined' || !roomInteractables) return;

  for (var ri = 0; ri < roomInteractables.length; ri++) {
    var cr = roomInteractables[ri];
    if (cr.type !== 'creature') continue;

    /* 死亡・捕獲済みクリーチャーのHPバーを即時消去 */
    if (!cr.alive) {
      if (cr._hpSprite) { scene.remove(cr._hpSprite); cr._hpSprite = null; }
      continue;
    }

    /* 遅延初期化 */
    if (!cr._hpInitialized) initCreatureHP(cr);

    /* HPバー位置を頭上に追従 */
    if (cr._hpSprite) {
      var bh = cr.bodyH || 1.0;
      cr._hpSprite.position.set(
        cr.pos.x,
        cr.pos.y + bh + 0.30,
        cr.pos.z
      );
    }

    /* プレイヤーとの距離 */
    var dx = camera.position.x - cr.pos.x;
    var dz = camera.position.z - cr.pos.z;
    var dist2 = dx * dx + dz * dz;
    var dist  = Math.sqrt(dist2);

    var bh2        = cr.bodyH || 1.0;
    var alertRange = bh2 * 8.0;
    var meleeRange = bh2 * 0.42 + 1.0;  /* 体当たり距離 + 腕1m分（手を伸ばして殴る範囲）*/

    /* ── ステート遷移 ── */
    if (cr.aiState === AI_WANDER) {
      if (dist < alertRange) {
        cr.aiState      = AI_ALERT;
        cr.aiAlertTimer = 10.0;
      }
    } else {
      /* AI_ALERT */
      cr.aiAlertTimer -= dt;
      if (cr.aiAlertTimer <= 0.0 || dist > alertRange * 1.6) {
        cr.aiState = AI_WANDER;
      }
    }

    /* ── ALERT: wanderFacing を上書きして蛇行接近 ── */
    if (cr.aiState === AI_ALERT) {
      /* room.js は mesh.userData.wanderTarget (Vector3) + wanderTimer を参照する */
      if (cr.mesh && cr.mesh.userData && cr.mesh.userData.wanderTarget) {
        cr._warpPhase += dt * 2.2;
        var warp = Math.sin(cr._warpPhase) * 0.75;
        /* プレイヤー位置に蛇行オフセットを加えた目標点をセット */
        var sideOffset = Math.cos(cr._warpPhase) * (cr.bodyH || 1.0) * 0.9;
        var toPlayerAngle = Math.atan2(dx, dz);
        var perpX = Math.cos(toPlayerAngle) * sideOffset;
        var perpZ = -Math.sin(toPlayerAngle) * sideOffset;
        cr.mesh.userData.wanderTarget.set(
          camera.position.x + perpX,
          0,
          camera.position.z + perpZ
        );
        /* 短いインターバルで連続追尾、0にするとすぐ上書きされてしまう */
        cr.mesh.userData.wanderTimer = 0.35;
      }

      /* ALERTはHPバーを常時表示 */
      if (cr._hpSprite) cr._hpSprite.visible = true;
    } else {
      /* WANDER 中でフル体力ならHPバー非表示 */
      if (cr._hpSprite && cr.currentHp === cr.maxHp) {
        cr._hpSprite.visible = false;
      }
    }

    /* ── 捕獲中はダメージスキップ ── */
    {
      var locked = false;
      for (var li = 0; li < _lockedCreatures.length; li++) {
        if (_lockedCreatures[li].itc === cr) { locked = true; break; }
      }
      if (locked) continue;
    }

    /* ── 近接攻撃 ── */
    cr._atkCooldown -= dt;
    if (dist < meleeRange && cr._atkCooldown <= 0.0) {
      /* 攻撃力: 体長で決まる（小型6, 中型10, 大型15, 超大型20） */
      var dmg = bh2 < 0.8 ?  6 :
                bh2 < 1.5 ? 10 :
                bh2 < 2.5 ? 15 : 20;
      damagePlayer(dmg, cr);
      cr._atkCooldown = 1.3;
    }
  }
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

/* ----------------------------------------------------------------
   捕獲エフェクト フェーズ定数
   P0: ビビビビ振動 + 全身発光
   P1: 光の玉に収束（メッシュ縮小）
   P2: 弧を描いてプレイヤーへ飛翔
---------------------------------------------------------------- */
var _CAP_P0 = 1.40;
var _CAP_P1 = 0.55;
var _CAP_P2 = 0.95;

/* 捕獲失敗エフェクトキュー */
var _capFailEffects = [];

// ロック中クリーチャーのリソースを全解放（部屋遷移時に呼ぶ）
function clearLockedCreatures() {
  for (var i = 0; i < _lockedCreatures.length; i++) {
    var lc = _lockedCreatures[i];
    _releaseTether(lc.tetherEntry);
    _releaseBeamLight(lc.lightEntry);
    _disposeCaptureOrbs(lc);
    if (lc.itc && lc.itc.mesh) {
      var _m = lc.itc.mesh;
      if (_m.parent) _m.parent.remove(_m); else scene.remove(_m);
    }
  }
  _lockedCreatures = [];
  stopBeamSound();
}

function _disposeCaptureOrbs(lc) {
  if (lc.ball)   { scene.remove(lc.ball);  try { lc.ball.geometry.dispose();  lc.ballMat.dispose();  } catch(e){} }
  if (lc.halo)   { scene.remove(lc.halo);  try { lc.halo.geometry.dispose();  lc.haloMat.dispose();  } catch(e){} }
  if (lc.ballPl) { scene.remove(lc.ballPl); }
  if (lc.core)   { scene.remove(lc.core);  try { lc.core.geometry.dispose();  lc.coreMat.dispose();  } catch(e){} }
  if (lc.rings)  { for (var _ri = 0; _ri < lc.rings.length; _ri++) { scene.remove(lc.rings[_ri].mesh); try { lc.rings[_ri].mesh.geometry.dispose(); lc.rings[_ri].mat.dispose(); } catch(e){} } }
  if (lc.halo2)  { scene.remove(lc.halo2); try { lc.halo2.geometry.dispose(); lc.halo2Mat.dispose(); } catch(e){} }
  if (lc.trail)  { scene.remove(lc.trail); try { lc.trailGeo.dispose(); lc.trailMat.dispose(); } catch(e){} }
  if (lc.sparks) { for (var _dsi = 0; _dsi < lc.sparks.length; _dsi++) { scene.remove(lc.sparks[_dsi].mesh); try { lc.sparks[_dsi].mesh.geometry.dispose(); lc.sparks[_dsi].mat.dispose(); } catch(e){} } }
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

  /* チャージ中ならエフェクトを解放 */
  if (typeof _caStopCharge === 'function' && itc._caPhase && itc._caPhase !== 'idle') {
    _caStopCharge(itc);
  }

  /* メッシュの実際の Y 位置を pos に同期（ロック瞬間のジャンプを防ぐ）*/
  if (itc.mesh) itc.pos.y = itc.mesh.position.y;

  startBeamSound();

  var te  = _acquireTether();
  var ble = _acquireBeamLight();

  /* ── 発光アニメ用マテリアル収集 ── */
  var _mats = [];
  if (itc.mesh) {
    itc.mesh.traverse(function(child) {
      if (!child.isMesh) return;
      var ms = Array.isArray(child.material) ? child.material : [child.material];
      for (var _mi = 0; _mi < ms.length; _mi++) {
        if (ms[_mi] && ms[_mi].emissive) _mats.push(ms[_mi]);
      }
    });
  }

  /* ── 元のエミッシブ状態を保存（失敗時に復元）── */
  var _origEmissive = [];
  for (var _oi = 0; _oi < _mats.length; _oi++) {
    _origEmissive.push({
      intensity: _mats[_oi].emissiveIntensity || 0,
      r: _mats[_oi].emissive.r,
      g: _mats[_oi].emissive.g,
      b: _mats[_oi].emissive.b
    });
  }

  /* ── 光の玉 ── */
  var _ballGeo = new THREE.SphereGeometry(0.20, 12, 8);
  var _ballMat = new THREE.MeshBasicMaterial({ color: 0x88eeff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  var _ball    = new THREE.Mesh(_ballGeo, _ballMat);
  _ball.visible = false;
  scene.add(_ball);

  var _haloGeo = new THREE.SphereGeometry(0.40, 10, 7);
  var _haloMat = new THREE.MeshBasicMaterial({ color: 0x2277ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  var _halo    = new THREE.Mesh(_haloGeo, _haloMat);
  _halo.visible = false;
  scene.add(_halo);

  var _ballPl = new THREE.PointLight(0x88ccff, 0, 14);
  scene.add(_ballPl);

  /* ── 軌跡ライン（フェーズ2用、固定バッファ 30点）── */
  var _tBuf = new Float32Array(30 * 3);
  var _tGeo = new THREE.BufferGeometry();
  _tGeo.setAttribute('position', new THREE.BufferAttribute(_tBuf, 3));
  _tGeo.setDrawRange(0, 0);
  var _tMat  = new THREE.LineBasicMaterial({ color: 0x66eeff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  var _trail = new THREE.Line(_tGeo, _tMat);
  _trail.frustumCulled = false;
  _trail.visible = false;
  scene.add(_trail);

  /* ── 内コア（白く脈動する小球）── */
  var _coreGeo = new THREE.SphereGeometry(0.07, 8, 6);
  var _coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  var _core    = new THREE.Mesh(_coreGeo, _coreMat);
  _core.visible = false;
  scene.add(_core);

  /* ── エネルギーリング（3枚、異なる軸・色で回転）── */
  var _rings = [];
  var _ringCols = [0x00eeff, 0xffdd44, 0xaaffcc];
  var _ringRads = [0.28, 0.38, 0.50];
  for (var _ri = 0; _ri < 3; _ri++) {
    var _rGeo  = new THREE.TorusGeometry(_ringRads[_ri], 0.022, 6, 32);
    var _rMat  = new THREE.MeshBasicMaterial({
      color: _ringCols[_ri],
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    });
    var _rMesh = new THREE.Mesh(_rGeo, _rMat);
    _rMesh.visible = false;
    scene.add(_rMesh);
    _rings.push({ mesh: _rMesh, mat: _rMat });
  }

  /* ── 外殻ハロー2（より大きく淡い）── */
  var _halo2Geo = new THREE.SphereGeometry(0.70, 10, 7);
  var _halo2Mat = new THREE.MeshBasicMaterial({ color: 0x1155dd, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  var _halo2    = new THREE.Mesh(_halo2Geo, _halo2Mat);
  _halo2.visible = false;
  scene.add(_halo2);

  /* ── 周回スパーク（6粒、異なる軌道面）── */
  var _sparks = [];
  var _sparkCols  = [0x00ffff, 0xffffff, 0x88ffee, 0xffd080, 0x44ddff, 0xeeccff];
  var _sparkTilts = [
    { tx: 0,            ty: 0            },
    { tx: Math.PI / 3,  ty: 0            },
    { tx: -Math.PI / 4, ty: Math.PI / 5  },
    { tx: Math.PI / 6,  ty: Math.PI / 2  },
    { tx: -Math.PI / 3, ty: Math.PI / 3  },
    { tx: Math.PI / 2,  ty: Math.PI / 4  }
  ];
  for (var _si = 0; _si < 6; _si++) {
    var _sGeo  = new THREE.SphereGeometry(0.038, 4, 4);
    var _sMat  = new THREE.MeshBasicMaterial({
      color: _sparkCols[_si], transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var _sMesh = new THREE.Mesh(_sGeo, _sMat);
    _sMesh.visible = false;
    scene.add(_sMesh);
    _sparks.push({ mesh: _sMesh, mat: _sMat, r: 0.33 + _si * 0.05, speed: 2.0 + _si * 0.4, phase: _si * Math.PI / 3, tilt: _sparkTilts[_si] });
  }

  /* ── 捕獲成功・失敗を事前抽選 ── */
  var _willSucceed = (Math.random() < getCaptureChance(itc));

  _lockedCreatures.push({
    itc:         itc,
    tetherEntry: te,
    lightEntry:  ble,
    age:         0,
    phase:       0,            // 0=ビビビ  1=収束  2=飛翔
    jitterAcc:   0,
    jitterX: 0, jitterY: 0, jitterZ: 0,
    mats:        _mats,
    origEmissive:_origEmissive,
    origScale:   itc.mesh ? itc.mesh.scale.x : 1,
    ball:        _ball,   ballMat: _ballMat,
    halo:        _halo,   haloMat: _haloMat,
    ballPl:      _ballPl,
    core:        _core,   coreMat: _coreMat,
    rings:       _rings,
    halo2:       _halo2,  halo2Mat: _halo2Mat,
    trail:       _trail,  trailGeo: _tGeo, trailMat: _tMat,
    trailBuf:    _tBuf,   trailCount: 0,
    sparks:      _sparks,
    arcStart:    null,
    arcCtrl:     null,
    willSucceed: _willSucceed
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

  _disposeCaptureOrbs(lc);

  var capturedId = (itc.data && itc.data.creatureId !== undefined)
    ? itc.data.creatureId
    : Math.floor(Math.random() * CREATURE_DATA.length);
  updateCollection(capturedId);
  showCaptureNotification(capturedId);
  stopBeamSound(); // ← ビーム音を止めてから捕獲音を鳴らす
  playSoundCapture();
}

// ロック中クリーチャーを毎フレーム更新（3フェーズ式）
function updateLockedCreatures(dt) {
  // 失敗しぶきパーティクルを先に更新
  _updateCapFailEffects(dt);

  for (var li = _lockedCreatures.length - 1; li >= 0; li--) {
    var lc = _lockedCreatures[li];
    lc.age += dt;

    var T0 = _CAP_P0;               // Phase0終了時刻
    var T1 = _CAP_P0 + _CAP_P1;    // Phase1終了時刻
    var T2 = _CAP_P0 + _CAP_P1 + _CAP_P2; // Phase2終了時刻

    /* ─── Phase 0: ビビビビ + 全身発光 ─── */
    if (lc.phase === 0) {
      if (lc.age < T0) {
        _updatePhase0(lc, dt, lc.age / T0);
        continue;
      }
      /* Phase0 終了 → 成功 or 失敗の分岐 */
      if (!lc.willSucceed) {
        _triggerCaptureFailure(lc);
        _lockedCreatures.splice(li, 1);
        continue;
      }
      /* 成功: 弧の始点・制御点を確定してPhase1へ */
      lc.phase    = 1;
      lc.arcStart = lc.itc.pos.clone();
      var cp = camera.position;
      var midX = (lc.arcStart.x + cp.x) * 0.5;
      var midY = Math.max(lc.arcStart.y, cp.y) + 2.0 + Math.random() * 1.2;
      var midZ = (lc.arcStart.z + cp.z) * 0.5;
      /* 弧を左右どちらかに逸らす制御点 */
      var perpX = -(cp.z - lc.arcStart.z);
      var perpZ =  (cp.x - lc.arcStart.x);
      var perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
      var side = (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.6);
      lc.arcCtrl = new THREE.Vector3(
        midX + (perpX / perpLen) * side,
        midY,
        midZ + (perpZ / perpLen) * side
      );
    }

    /* ─── Phase 1: 身体が光の玉に収束 ─── */
    if (lc.phase === 1) {
      if (lc.age < T1) {
        _updatePhase1(lc, dt, (lc.age - T0) / _CAP_P1);
        continue;
      }
      lc.phase = 2;
    }

    /* ─── Phase 2: 光の玉が弧を描いてプレイヤーへ飛翔 ─── */
    if (lc.phase === 2) {
      var p2t = (lc.age - T1) / _CAP_P2;
      if (p2t < 1.0) {
        _updatePhase2(lc, dt, p2t);
        continue;
      }
      /* 到達 → 捕獲完了 */
      _finishCapture(lc);
      _lockedCreatures.splice(li, 1);
    }
  }
}

/* ================================================================
   Phase 0: ビビビビビ＋全身電撃発光
   t = 0→1 (Phase0の経過割合)
================================================================ */
function _updatePhase0(lc, dt, t) {
  var itc = lc.itc;
  var camPos = camera.position;

  /* ── 激しいジッター ── */
  lc.jitterAcc += dt;
  if (lc.jitterAcc > 0.016) {   // ~60fps刻みで毎フレーム更新
    lc.jitterAcc = 0;
    var jAmp = 0.05 + t * 0.18;
    lc.jitterX = (Math.random() - 0.5) * jAmp * 2.2;
    lc.jitterY = (Math.random() - 0.5) * jAmp * 1.2;
    lc.jitterZ = (Math.random() - 0.5) * jAmp * 2.2;
  }
  if (itc.mesh) {
    itc.mesh.position.set(
      itc.pos.x + lc.jitterX,
      itc.pos.y + lc.jitterY,
      itc.pos.z + lc.jitterZ
    );
    itc.mesh.rotation.y += (Math.random() - 0.5) * 0.32;
    itc.mesh.rotation.z  = (Math.random() - 0.5) * 0.24;
  }

  /* ── 電撃発光: 高速フリッカー（ビビビビビ）──
     sin(age*60) でざっくり60Hz点滅＋ノイズ上乗せ */
  var flicker  = (Math.sin(lc.age * 62.0) * 0.5 + 0.5)
               * (Math.sin(lc.age * 37.0) * 0.3 + 0.7);
  var glowBase = 0.5 + t * 1.8;
  var glow     = glowBase * flicker + 0.25;
  for (var mi = 0; mi < lc.mats.length; mi++) {
    lc.mats[mi].emissive.setRGB(
      0.25 + flicker * 0.4,
      0.75 + flicker * 0.25,
      1.0
    );
    lc.mats[mi].emissiveIntensity = glow;
  }

  /* ── プラズマジグザグ ── */
  if (lc.tetherEntry) {
    var gunPos = _v3_gunPos.set(0, 0, -1).applyEuler(camera.rotation);
    gunPos.multiplyScalar(0.6).add(camPos);
    gunPos.y -= 0.18;
    var alpha = lc.age < 0.1
      ? lc.age / 0.1
      : (0.82 + Math.sin(lc.age * 55.0) * 0.18);
    _updatePlasmaZigzag(lc.tetherEntry, gunPos, itc.pos, lc.age, alpha);

    if (lc.lightEntry) {
      lc.lightEntry.light.position.set(
        (gunPos.x + itc.pos.x) * 0.5,
        (gunPos.y + itc.pos.y) * 0.5,
        (gunPos.z + itc.pos.z) * 0.5
      );
      lc.lightEntry.light.color.setRGB(0.25 + flicker * 0.3, 0.8, 1.0);
      lc.lightEntry.light.intensity = 4.0 + Math.sin(lc.age * 58.0) * 2.8;
    }
  }
}

/* ================================================================
   Phase 1: メッシュが縮小 → 光の玉へ収束
   t = 0→1
================================================================ */
function _updatePhase1(lc, dt, t) {
  var itc = lc.itc;
  var ease = t * t * (3.0 - 2.0 * t); // smoothstep

  /* プラズマビームをフェードアウト */
  if (lc.tetherEntry) {
    var alphaFade = Math.max(0.0, 1.0 - t * 2.5);
    var gunPos2 = _v3_gunPos.set(0, 0, -1).applyEuler(camera.rotation);
    gunPos2.multiplyScalar(0.6).add(camera.position);
    gunPos2.y -= 0.18;
    if (alphaFade > 0) {
      _updatePlasmaZigzag(lc.tetherEntry, gunPos2, itc.pos, lc.age, alphaFade);
    } else {
      _releaseTether(lc.tetherEntry);
      lc.tetherEntry = null;
    }
    if (lc.lightEntry) {
      lc.lightEntry.light.intensity = Math.max(0, 4.0 * (1.0 - t * 2.0));
    }
  }

  /* メッシュが縮小し、白く燃え上がる */
  if (itc.mesh) {
    var s = Math.max(0.0, lc.origScale * (1.0 - ease));
    itc.mesh.scale.setScalar(s);
    /* 縮みながら白熱 */
    for (var mi = 0; mi < lc.mats.length; mi++) {
      lc.mats[mi].emissive.setRGB(1.0, 1.0, 1.0);
      lc.mats[mi].emissiveIntensity = 1.5 + ease * 4.0;
    }
    /* 軽いジッターは残す */
    lc.jitterAcc += dt;
    if (lc.jitterAcc > 0.02) {
      lc.jitterAcc = 0;
      var ja = 0.03 * (1.0 - t);
      lc.jitterX = (Math.random() - 0.5) * ja * 2;
      lc.jitterY = (Math.random() - 0.5) * ja;
      lc.jitterZ = (Math.random() - 0.5) * ja * 2;
    }
    itc.mesh.position.set(
      itc.pos.x + lc.jitterX,
      itc.pos.y + lc.jitterY,
      itc.pos.z + lc.jitterZ
    );
    if (t > 0.9) itc.mesh.visible = false;
  }

  /* 光の玉が現れる */
  lc.ball.visible = true;
  lc.ball.position.copy(itc.pos);
  lc.ballMat.opacity = ease;
  lc.ball.scale.setScalar(0.15 + ease * 1.0);
  /* カラーシフト：シアン↔ホワイト */
  var _cshift1 = 0.5 + 0.5 * Math.sin(lc.age * 2.5);
  lc.ballMat.color.setRGB(0.5 + _cshift1 * 0.5, 0.9, 1.0);

  /* ハロー（外周グロー）*/
  lc.halo.visible = true;
  lc.halo.position.copy(itc.pos);
  lc.haloMat.opacity = ease * 0.70;
  lc.halo.scale.setScalar(1.0 + ease * 0.8 + Math.sin(lc.age * 9.0) * 0.1);

  /* 光の玉のポイントライト */
  lc.ballPl.position.copy(itc.pos);
  lc.ballPl.intensity = ease * 12.0;
  lc.ballPl.color.set(0x88ddff);

  /* 内コア */
  lc.core.visible = true;
  lc.core.position.copy(itc.pos);
  lc.coreMat.opacity = ease * (0.85 + Math.sin(lc.age * 22.0) * 0.15);
  lc.core.scale.setScalar(0.7 + Math.sin(lc.age * 18.0) * 0.3);

  /* エネルギーリング */
  for (var _ri = 0; _ri < lc.rings.length; _ri++) {
    lc.rings[_ri].mesh.visible = true;
    lc.rings[_ri].mesh.position.copy(itc.pos);
    lc.rings[_ri].mat.opacity = ease * (0.85 - _ri * 0.10);
    lc.rings[_ri].mesh.scale.setScalar(0.3 + ease * 0.7);
    lc.rings[_ri].mesh.rotation.set(
      Math.PI / 3 + _ri * Math.PI / 6,
      lc.age * (2.2 - _ri * 0.6),
      _ri * Math.PI / 5
    );
  }

  /* 周回スパーク */
  for (var _spi = 0; _spi < lc.sparks.length; _spi++) {
    var _sp = lc.sparks[_spi];
    var _sa = lc.age * _sp.speed + _sp.phase;
    var _ctX = Math.cos(_sp.tilt.tx), _stX = Math.sin(_sp.tilt.tx);
    var _ctY = Math.cos(_sp.tilt.ty), _stY = Math.sin(_sp.tilt.ty);
    var _spX = Math.cos(_sa) * _ctY - Math.sin(_sa) * _stX * _stY;
    var _spY = Math.sin(_sa) * _ctX;
    var _spZ = Math.cos(_sa) * _stY + Math.sin(_sa) * _stX * _ctY;
    _sp.mesh.visible = true;
    _sp.mesh.position.set(itc.pos.x + _spX * _sp.r, itc.pos.y + _spY * _sp.r, itc.pos.z + _spZ * _sp.r);
    _sp.mat.opacity = ease * (0.85 + Math.sin(lc.age * 8.0 + _spi) * 0.15);
    _sp.mesh.scale.setScalar(0.8 + Math.sin(lc.age * 6.0 + _spi * 1.3) * 0.2);
  }

  /* 外殻ハロー2 */
  lc.halo2.visible = true;
  lc.halo2.position.copy(itc.pos);
  lc.halo2Mat.opacity = ease * 0.35;
  lc.halo2.scale.setScalar(1.0 + ease * 0.8 + Math.sin(lc.age * 5.0 + 1.2) * 0.2);
}

/* ================================================================
   Phase 2: 光の玉が二次ベジェ弧でプレイヤーへ飛翔
   t = 0→1
================================================================ */
function _updatePhase2(lc, dt, t) {
  /* 加速カーブ: ease-in（終盤に一気に突っ込む）*/
  var et = t * t * (2.0 - t);   // 緩加速カーブ

  /* 二次ベジェ曲線 P0→ctrl→camPos */
  var P0 = lc.arcStart;
  var P1 = lc.arcCtrl;
  var P2 = camera.position;
  var mt = 1.0 - et;
  var bx = mt*mt*P0.x + 2*mt*et*P1.x + et*et*P2.x;
  var by = mt*mt*P0.y + 2*mt*et*P1.y + et*et*P2.y;
  var bz = mt*mt*P0.z + 2*mt*et*P1.z + et*et*P2.z;

  lc.ball.position.set(bx, by, bz);
  lc.halo.position.set(bx, by, bz);
  lc.ballPl.position.set(bx, by, bz);

  /* 玉はスピードに比例して小さく見える（引き伸ばし感）*/
  var spd = 1.3 - t * 0.4;
  lc.ball.scale.setScalar(spd + Math.sin(lc.age * 14) * 0.04);
  lc.ballMat.opacity  = 1.0 - t * 0.25;
  /* 飛翔中もカラーシフト */
  var _cshift2 = 0.5 + 0.5 * Math.sin(lc.age * 4.0);
  lc.ballMat.color.setRGB(0.5 + _cshift2 * 0.5, 0.9, 1.0);

  /* ハローはフェードアウト */
  lc.haloMat.opacity  = (1.0 - t) * 0.65;
  lc.halo.scale.setScalar(1.8 + Math.sin(lc.age * 10) * 0.25);

  /* PointLight: 接近するほど明るく点滅 */
  lc.ballPl.intensity = 5.0 + t * 14.0 + Math.sin(lc.age * 50) * 2.0;
  lc.ballPl.color.set(0x99eeff);

  /* 内コア：高速点滅 */
  lc.core.position.set(bx, by, bz);
  lc.coreMat.opacity = 0.85 + Math.sin(lc.age * 28.0) * 0.15;
  lc.core.scale.setScalar(0.8 + Math.sin(lc.age * 20.0) * 0.2);

  /* エネルギーリング：高速回転 */
  for (var _ri = 0; _ri < lc.rings.length; _ri++) {
    lc.rings[_ri].mesh.position.set(bx, by, bz);
    lc.rings[_ri].mat.opacity = (0.80 - _ri * 0.10) * (1.0 - t * 0.35);
    lc.rings[_ri].mesh.scale.setScalar(0.9 + Math.sin(lc.age * 10.0 + _ri) * 0.06);
    lc.rings[_ri].mesh.rotation.set(
      Math.PI / 3 + _ri * Math.PI / 6,
      lc.age * (4.5 - _ri * 1.0),
      _ri * Math.PI / 5 + lc.age * 2.0
    );
  }

  /* 周回スパーク（軌道半径を縮めながら飛翔）*/
  for (var _spi2 = 0; _spi2 < lc.sparks.length; _spi2++) {
    var _sp2 = lc.sparks[_spi2];
    var _sa2 = lc.age * _sp2.speed * 2.5 + _sp2.phase;
    var _ctX2 = Math.cos(_sp2.tilt.tx), _stX2 = Math.sin(_sp2.tilt.tx);
    var _ctY2 = Math.cos(_sp2.tilt.ty), _stY2 = Math.sin(_sp2.tilt.ty);
    var _spX2 = Math.cos(_sa2) * _ctY2 - Math.sin(_sa2) * _stX2 * _stY2;
    var _spY2 = Math.sin(_sa2) * _ctX2;
    var _spZ2 = Math.cos(_sa2) * _stY2 + Math.sin(_sa2) * _stX2 * _ctY2;
    var _shrink = 1.0 - t * 0.80;
    _sp2.mesh.visible = true;
    _sp2.mesh.position.set(bx + _spX2 * _sp2.r * _shrink, by + _spY2 * _sp2.r * _shrink, bz + _spZ2 * _sp2.r * _shrink);
    _sp2.mat.opacity = (1.0 - t * 0.6) * 0.9;
    _sp2.mesh.scale.setScalar(0.7 + Math.sin(lc.age * 9.0 + _spi2) * 0.3);
  }

  /* 外殻ハロー2 */
  lc.halo2.position.set(bx, by, bz);
  lc.halo2Mat.opacity = (1.0 - t) * 0.32;
  lc.halo2.scale.setScalar(2.0 + Math.sin(lc.age * 7.0) * 0.35);

  /* 軌跡ライン: 先頭位置をリングバッファ先頭に積む */
  lc.trail.visible = true;
  var maxTr = 30;
  var tc = Math.min(lc.trailCount + 1, maxTr);
  lc.trailCount = tc;
  for (var tj = tc - 1; tj > 0; tj--) {
    lc.trailBuf[tj*3+0] = lc.trailBuf[(tj-1)*3+0];
    lc.trailBuf[tj*3+1] = lc.trailBuf[(tj-1)*3+1];
    lc.trailBuf[tj*3+2] = lc.trailBuf[(tj-1)*3+2];
  }
  lc.trailBuf[0] = bx;
  lc.trailBuf[1] = by;
  lc.trailBuf[2] = bz;
  lc.trailGeo.attributes.position.needsUpdate = true;
  lc.trailGeo.setDrawRange(0, tc);
  lc.trailMat.opacity = 0.65 * (1.0 - t * 0.4);
}

/* ================================================================
   捕獲失敗エフェクト
   ビビビを弾き返すような光のしぶき + 白フラッシュ
================================================================ */
function _triggerCaptureFailure(lc) {
  var itc = lc.itc;

  /* ビーム＆ライト解放 */
  if (lc.tetherEntry) { _releaseTether(lc.tetherEntry);   lc.tetherEntry = null; }
  if (lc.lightEntry)  { _releaseBeamLight(lc.lightEntry); lc.lightEntry  = null; }
  _disposeCaptureOrbs(lc);

  /* 生物を元に戻す */
  itc.locked = false;
  itc.alive  = true;
  if (itc.mesh) {
    itc.mesh.visible = true;
    itc.mesh.scale.setScalar(lc.origScale);
    /* 弾き返しの瞬間ジャンプ */
    itc.mesh.position.set(
      itc.pos.x + (Math.random()-0.5) * 0.22,
      itc.pos.y + (Math.random()-0.5) * 0.12,
      itc.pos.z + (Math.random()-0.5) * 0.22
    );
  }
  /* エミッシブを元に戻す */
  for (var ri = 0; ri < lc.mats.length; ri++) {
    var oe = lc.origEmissive[ri];
    if (oe) {
      lc.mats[ri].emissive.setRGB(oe.r, oe.g, oe.b);
      lc.mats[ri].emissiveIntensity = oe.intensity;
    } else {
      lc.mats[ri].emissiveIntensity = 0;
    }
  }

  stopBeamSound();

  /* ── 白フラッシュ ── */
  for (var fi = 0; fi < _flashLightPool.length; fi++) {
    if (!_flashLightPool[fi].inUse) {
      var fp = _flashLightPool[fi];
      fp.light.position.copy(itc.pos);
      fp.light.intensity = 24.0;
      fp.light.color.set(0xffffff);
      fp.light.visible = true;
      fp.inUse = true; fp.age = 0; fp.duration = 0.35;
      break;
    }
  }

  /* ── 光のしぶきスパーク（外向きに弾ける）── */
  var sparks = [];
  var numSparks = 10 + Math.floor(Math.random() * 7);
  var sparkColors = [0xffffff, 0x88ddff, 0xffee88, 0x44ccff, 0xffaaff];
  for (var si = 0; si < numSparks; si++) {
    var theta = Math.random() * Math.PI * 2;
    var phi   = (Math.random() - 0.5) * Math.PI;
    var speed = 3.0 + Math.random() * 4.5;
    var vel = new THREE.Vector3(
      Math.cos(theta) * Math.cos(phi) * speed,
      Math.sin(phi) * speed + 0.8,
      Math.sin(theta) * Math.cos(phi) * speed
    );
    /* スパーク線（先端2点のライン）*/
    var spBuf = new Float32Array(6);
    spBuf[0] = itc.pos.x; spBuf[1] = itc.pos.y; spBuf[2] = itc.pos.z;
    spBuf[3] = itc.pos.x; spBuf[4] = itc.pos.y; spBuf[5] = itc.pos.z;
    var spGeo  = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
    var spMat  = new THREE.LineBasicMaterial({
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      transparent: true, opacity: 1.0
    });
    var spLine = new THREE.Line(spGeo, spMat);
    spLine.frustumCulled = false;
    scene.add(spLine);
    sparks.push({
      line: spLine, geo: spGeo, mat: spMat,
      vel: vel,
      px: itc.pos.x, py: itc.pos.y, pz: itc.pos.z,
      len: 0.06 + Math.random() * 0.12,
      age: 0
    });
  }

  _capFailEffects.push({ sparks: sparks, duration: 0.7, age: 0 });
}

/* ── 失敗しぶきエフェクトの毎フレーム更新 ── */
function _updateCapFailEffects(dt) {
  for (var ei = _capFailEffects.length - 1; ei >= 0; ei--) {
    var ef = _capFailEffects[ei];
    ef.age += dt;
    var t = ef.age / ef.duration;

    for (var si = 0; si < ef.sparks.length; si++) {
      var sp = ef.sparks[si];
      sp.age += dt;

      /* 物理: 重力 + ドラッグ */
      sp.vel.y -= 5.5 * dt;
      sp.vel.x *= Math.pow(0.88, dt * 60);
      sp.vel.z *= Math.pow(0.88, dt * 60);

      sp.px += sp.vel.x * dt;
      sp.py += sp.vel.y * dt;
      sp.pz += sp.vel.z * dt;

      /* 尾（速度逆方向に伸びる）*/
      var spd = Math.sqrt(sp.vel.x*sp.vel.x + sp.vel.y*sp.vel.y + sp.vel.z*sp.vel.z) || 1;
      var tailX = sp.px - (sp.vel.x / spd) * sp.len;
      var tailY = sp.py - (sp.vel.y / spd) * sp.len;
      var tailZ = sp.pz - (sp.vel.z / spd) * sp.len;

      var arr = sp.geo.attributes.position.array;
      arr[0] = sp.px; arr[1] = sp.py; arr[2] = sp.pz;
      arr[3] = tailX; arr[4] = tailY; arr[5] = tailZ;
      sp.geo.attributes.position.needsUpdate = true;

      sp.mat.opacity = Math.max(0, 1.0 - t * 1.5);
    }

    /* 期限切れ → リソース解放 */
    if (ef.age >= ef.duration) {
      for (var ci = 0; ci < ef.sparks.length; ci++) {
        var csp = ef.sparks[ci];
        scene.remove(csp.line);
        try { csp.geo.dispose(); csp.mat.dispose(); } catch(e) {}
      }
      _capFailEffects.splice(ei, 1);
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

/* ----------------------------------------------------------
   Flash light pool update
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
