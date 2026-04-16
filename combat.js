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

  if (typeof triggerKillEffect === 'function') triggerKillEffect();
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

  if (playerHp <= 0) _triggerGameOver();
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
    var meleeRange = bh2 * 0.42;

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
    if (typeof _lockedCreatures !== 'undefined') {
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
