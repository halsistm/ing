'use strict';
/* ================================================================
   ui.js  —  常時表示アクションUI + 情報オーバーレイ
   ロード順: room.js の後（全ファイルの最後）
   ================================================================

   【統合手順】
   1. index.html 最後の <script> に追加
   2. loop.js の animate() 末尾に
        updateActionUI(dt);
      を追加（毎フレーム捕獲%を更新するため）

   【変更点まとめ】
   - #shoot-btn（既存の条件付き捕獲ボタン）を完全非表示に
   - #zukan-btn のイベントを乗っ取り → 情報オーバーレイを開く
   - 捕獲ボタン・武器発射ボタンを常時表示
   - 図鑑は情報オーバーレイ内のボタンから引き続き開ける
================================================================ */

/* ================================================================
   0. 既存要素の無効化
================================================================ */

/* #shoot-btn を完全に隠して再表示させない */
(function _patchExistingUI() {
  /* CSS で強制非表示 */
  var style = document.createElement('style');
  style.textContent = [
    '#shoot-btn { display:none !important; }',
    /* 元ボタンの .visible / .glowing クラスを無効化 */
    '#shoot-btn.visible { display:none !important; }'
  ].join('\n');
  document.head.appendChild(style);

  /* classList の toggle を monkey-patch して shoot-btn への操作を空振りにする */
  var _origToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(cls, force) {
    if (this._el === null) {
      /* 初回: 対象要素を特定 */
      try { this._el = this; } catch(e) {}
    }
    /* shootBtnEl の classList 操作をスキップ */
    if (shootBtnEl && this === shootBtnEl.classList) {
      /* shootBtnEl への toggle は実際のDOM操作を行わず、引数に応じた値を返す */
      /* force が指定されていない場合は false（非表示維持）を返す */
      return (force !== undefined) ? !!force : false;
    }
    return _origToggle.apply(this, arguments);
  };
})();

/* ================================================================
   1. 定数 / 状態
================================================================ */
var _ui = {
  captureChance:    0.05,   /* 現フレームの捕獲率 (0-1) */
  bestTarget:       null,   /* 照準内の最良ターゲット */
  infoOpen:         false,
  captureFeedback:  '',
  captureFbTimer:   0.0,
  captureFbSuccess: false
};

/* ================================================================
   2. 常時表示アクションバー（モバイル）
      FIRE ボタン + CAPTURE ボタン（右下固定）
================================================================ */
var _fireBtn    = null;
var _captureBtn = null;
var _capturePctEl = null;
var _ammoDispEl = null;

(function _buildActionBar() {
  if (!isMobile) return;   /* PC はクリック + キーボードで操作 */

  /* ── FIRE ボタン（右下・上段）── */
  var fb = document.createElement('div');
  fb.id  = 'ui-fire-btn';
  fb.style.cssText = [
    'position:fixed;bottom:220px;right:16px;',
    'width:64px;height:64px;border-radius:12px;',
    'background:rgba(20,18,14,0.84);',
    'border:1.5px solid rgba(255,180,40,0.45);',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:3px;z-index:300;user-select:none;-webkit-user-select:none;',
    'cursor:pointer;'
  ].join('');
  fb.innerHTML = [
    '<div style="font-size:20px;line-height:1;color:rgba(255,200,80,0.9);">▶</div>',
    '<div style="font-family:monospace;font-size:8px;',
    'color:rgba(255,180,60,0.65);letter-spacing:0.12em;">FIRE</div>'
  ].join('');
  fb.addEventListener('touchstart', function(e) {
    e.preventDefault();
    fb.style.background = 'rgba(40,30,5,0.95)';
    if (typeof fireWeapon === 'function') fireWeapon();
  }, { passive: false });
  fb.addEventListener('touchend', function(e) {
    e.preventDefault();
    fb.style.background = 'rgba(20,18,14,0.84)';
  }, { passive: false });
  document.body.appendChild(fb);
  _fireBtn = fb;

  /* ── CAPTURE ボタン（右下・下段）── */
  var cb = document.createElement('div');
  cb.id  = 'ui-capture-btn';
  cb.style.cssText = [
    'position:fixed;bottom:130px;right:16px;',
    'width:64px;height:64px;border-radius:50%;',
    'background:rgba(14,18,22,0.84);',
    'border:2px solid rgba(80,180,255,0.38);',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:2px;z-index:300;user-select:none;-webkit-user-select:none;',
    'cursor:pointer;transition:border-color 0.2s,background 0.15s;'
  ].join('');

  /* % 非表示 - ● の色変化で捕獲可否を示す */
  var pct = document.createElement('div');
  pct.style.cssText = 'font-size:22px;line-height:1;color:rgba(100,200,255,0.65);';
  pct.textContent = '●';
  _capturePctEl = pct;

  var lbl = document.createElement('div');
  lbl.style.cssText = [
    'font-family:monospace;font-size:7px;',
    'color:rgba(100,180,255,0.40);letter-spacing:0.14em;'
  ].join('');
  lbl.textContent = 'CAP';

  cb.appendChild(pct);
  cb.appendChild(lbl);
  cb.addEventListener('touchstart', function(e) {
    e.preventDefault();
    cb.style.background = 'rgba(0,20,40,0.95)';
    doCaptureAttempt();
  }, { passive: false });
  cb.addEventListener('touchend', function(e) {
    e.preventDefault();
    cb.style.background = 'rgba(14,18,22,0.84)';
  }, { passive: false });
  document.body.appendChild(cb);
  _captureBtn = cb;

  /* ── 弾数表示（CAPTUREボタン下）── */
  var am = document.createElement('div');
  am.id  = 'ui-ammo-disp';
  am.style.cssText = [
    'position:fixed;bottom:102px;right:16px;',
    'width:64px;text-align:center;',
    'font-family:monospace;font-size:11px;font-weight:bold;',
    'color:rgba(255,200,80,0.75);letter-spacing:0.08em;',
    'pointer-events:none;z-index:300;',
    'text-shadow:0 0 6px rgba(0,0,0,0.9);'
  ].join('');
  am.textContent = '';
  document.body.appendChild(am);
  _ammoDispEl = am;
})();

/* PC 向け: テンキー / スペースで捕獲 */
if (!isMobile) {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'f' || e.key === 'F' || e.code === 'Space') {
      doCaptureAttempt();
    }
  });
}

/* ================================================================
   3. フィードバック表示（捕獲成功/失敗）
================================================================ */
var _fbEl = null;
(function() {
  var el = document.createElement('div');
  el.id  = 'ui-capture-fb';
  el.style.cssText = [
    'position:fixed;top:38%;left:50%;',
    'transform:translate(-50%,-50%);',
    'font-family:monospace;font-size:15px;letter-spacing:0.14em;',
    'pointer-events:none;z-index:400;',
    'opacity:0;transition:opacity 0.2s;',
    'text-shadow:0 0 12px currentColor;'
  ].join('');
  document.body.appendChild(el);
  _fbEl = el;
})();

function _showCaptureFeedback(msg, success) {
  if (!_fbEl) return;
  _fbEl.textContent  = msg;
  _fbEl.style.color  = success ? 'rgba(80,255,160,0.95)' : 'rgba(255,80,80,0.85)';
  _fbEl.style.opacity = '1';
  _ui.captureFbTimer  = 1.6;
}

/* ================================================================
   4. 捕獲実行（HP連動確率 → _lockCreature 呼び出し）
================================================================ */
var _uiCaptureV3 = new THREE.Vector3();

function doCaptureAttempt() {
  if (typeof _lockedCreatures !== 'undefined' && _lockedCreatures.length > 0) {
    _showCaptureFeedback('捕獲中...', false);
    return;
  }
  if (typeof _gameOver !== 'undefined' && _gameOver) return;

  /* 照準内の最良ターゲットを探す（room.js の fireBeam と同ロジック）*/
  var best = null, bestDist = Infinity;
  if (typeof roomInteractables === 'undefined') return;

  for (var i = 0; i < roomInteractables.length; i++) {
    var itc = roomInteractables[i];
    if (itc.type !== 'creature' || !itc.alive || itc.locked) continue;
    if (!itc.pos) continue;
    _uiCaptureV3.copy(itc.pos).project(camera);
    var sd = Math.sqrt(_uiCaptureV3.x * _uiCaptureV3.x + _uiCaptureV3.y * _uiCaptureV3.y);
    var d  = itc.pos.distanceTo(camera.position);
    var dynSd = Math.min(itc.sdLimit, itc.bodyH / Math.max(1.5, d));
    if (sd < dynSd && _uiCaptureV3.z < 1.0 && d < itc.shootRange && d < bestDist) {
      best = itc;
      bestDist = d;
    }
  }

  if (!best) {
    _showCaptureFeedback('対象なし', false);
    return;
  }

  /* HP連動確率 */
  var chance = typeof getCaptureChance === 'function'
    ? getCaptureChance(best)
    : 0.05;

  if (Math.random() < chance) {
    /* 成功: 既存の _lockCreature → _finishCapture フローへ */
    if (typeof _lockCreature === 'function') {
      _lockCreature(best);
    }
    _showCaptureFeedback(
      '捕獲成功！ ' + Math.round(chance * 100) + '%',
      true
    );
  } else {
    _showCaptureFeedback(
      '失敗... ' + Math.round(chance * 100) + '%',
      false
    );
  }
}

/* ================================================================
   5. 情報オーバーレイ（図鑑ボタン → repurpose）
================================================================ */
var _infoOverlay   = null;
var _infoAmmoEl    = null;
var _infoEnemyEl   = null;
var _infoEnemyHPEl = null;
var _infoEnemyPctEl = null;

(function _buildInfoOverlay() {
  /* ── オーバーレイ本体 ── */
  var ov = document.createElement('div');
  ov.id  = 'ui-info-overlay';
  ov.style.cssText = [
    'position:fixed;inset:0;',
    'background:rgba(0,0,0,0.88);',
    'display:flex;flex-direction:column;',
    'align-items:center;justify-content:center;',
    'z-index:800;pointer-events:auto;',
    'opacity:0;pointer-events:none;',
    'transition:opacity 0.25s;',
    'font-family:monospace;color:rgba(255,255,255,0.85);'
  ].join('');
  document.body.appendChild(ov);
  _infoOverlay = ov;

  /* ── カード本体 ── */
  var card = document.createElement('div');
  card.style.cssText = [
    'width:min(360px,92vw);',
    'background:rgba(8,8,12,0.96);',
    'border:1px solid rgba(255,255,255,0.14);',
    'border-radius:6px;overflow:hidden;'
  ].join('');
  ov.appendChild(card);

  /* ── ヘッダー ── */
  var header = _row([
    _txt('装備・情報', 11, 'rgba(255,255,200,0.7)', '0.14em'),
    _closeBtn()
  ], 'space-between', '12px 16px');
  header.style.borderBottom = '1px solid rgba(255,255,255,0.10)';
  card.appendChild(header);

  /* ── 装備 ── */
  var wpnSec = _section('装備');
  card.appendChild(wpnSec);

  var ammoRow = document.createElement('div');
  ammoRow.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 16px;';

  var wpnNameEl = document.createElement('div');
  wpnNameEl.style.cssText = 'flex:1;font-size:12px;color:rgba(255,255,180,0.95);';
  wpnNameEl.textContent = '拳銃';

  _infoAmmoEl = document.createElement('div');
  _infoAmmoEl.style.cssText = 'font-size:11px;letter-spacing:0.08em;color:rgba(255,255,200,0.55);';
  _infoAmmoEl.textContent = '─';

  ammoRow.appendChild(wpnNameEl);
  ammoRow.appendChild(_infoAmmoEl);
  wpnSec.appendChild(ammoRow);

  /* ── 近くの敵 ── */
  var enemySec = _section('近くの敵');
  card.appendChild(enemySec);

  var enemyWrap = document.createElement('div');
  enemyWrap.style.cssText = 'padding:10px 16px;';

  var enemyNm = document.createElement('div');
  enemyNm.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;';
  enemyNm.textContent = '─';
  _infoEnemyEl = enemyNm;

  var hpRow = document.createElement('div');
  hpRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';

  var hpBarBg = document.createElement('div');
  hpBarBg.style.cssText = [
    'flex:1;height:7px;',
    'background:rgba(255,255,255,0.10);',
    'border-radius:3px;overflow:hidden;'
  ].join('');
  var hpBar = document.createElement('div');
  hpBar.style.cssText = [
    'height:100%;width:100%;border-radius:3px;',
    'background:linear-gradient(90deg,#22FF66,#88FF44);',
    'transition:width 0.15s,background 0.25s;'
  ].join('');
  hpBarBg.appendChild(hpBar);
  _infoEnemyHPEl = hpBar;

  var hpPct = document.createElement('div');
  hpPct.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.55);min-width:38px;text-align:right;';
  hpPct.textContent = '─';
  hpRow.appendChild(hpBarBg);
  hpRow.appendChild(hpPct);

  var capRow = _row([
    _txt('捕獲率', 11, 'rgba(100,200,255,0.65)', '0.08em'),
    _txt('─', 16, 'rgba(100,220,255,0.9)', '0.05em', 'bold')
  ], 'space-between', '0');
  var capPctEl = capRow.children[1];
  _infoEnemyPctEl  = { hp: hpPct, pct: capPctEl, bar: hpBar };

  enemyWrap.appendChild(enemyNm);
  enemyWrap.appendChild(hpRow);
  enemyWrap.appendChild(capRow);
  enemySec.appendChild(enemyWrap);

  /* ── 図鑑ボタン（フッター）── */
  var footer = document.createElement('div');
  footer.style.cssText = [
    'padding:12px 16px;',
    'border-top:1px solid rgba(255,255,255,0.08);',
    'display:flex;justify-content:flex-end;'
  ].join('');
  var zukanLink = document.createElement('div');
  zukanLink.style.cssText = [
    'font-size:11px;letter-spacing:0.14em;',
    'color:rgba(255,255,255,0.35);cursor:pointer;',
    'padding:4px 8px;border:1px solid rgba(255,255,255,0.12);',
    'border-radius:3px;'
  ].join('');
  zukanLink.textContent = '図鑑を開く ▶';
  zukanLink.addEventListener('click', function() {
    closeInfoOverlay();
    if (typeof openCollection === 'function') openCollection();
  });
  zukanLink.addEventListener('touchend', function(e) {
    e.preventDefault();
    closeInfoOverlay();
    if (typeof openCollection === 'function') openCollection();
  }, { passive: false });
  footer.appendChild(zukanLink);
  card.appendChild(footer);

  /* オーバーレイ外クリックで閉じる */
  ov.addEventListener('click', function(e) {
    if (e.target === ov) closeInfoOverlay();
  });
  ov.addEventListener('touchend', function(e) {
    if (e.target === ov) { e.preventDefault(); closeInfoOverlay(); }
  }, { passive: false });
})();

/* ── DOM生成ヘルパー ── */
function _txt(t, sz, col, ls, fw) {
  var d = document.createElement('div');
  d.textContent = t;
  d.style.cssText = [
    'font-size:' + sz + 'px;',
    'color:' + col + ';',
    'letter-spacing:' + (ls || '0') + ';',
    fw ? 'font-weight:' + fw + ';' : ''
  ].join('');
  return d;
}
function _row(children, justify, padding) {
  var d = document.createElement('div');
  d.style.cssText = [
    'display:flex;align-items:center;',
    'justify-content:' + (justify || 'flex-start') + ';',
    'padding:' + (padding || '0') + ';'
  ].join('');
  children.forEach(function(c) { d.appendChild(c); });
  return d;
}
function _section(title) {
  var wrap = document.createElement('div');
  wrap.style.cssText = 'border-top:1px solid rgba(255,255,255,0.08);';
  var hd = document.createElement('div');
  hd.style.cssText = [
    'padding:7px 16px 4px;',
    'font-size:9px;letter-spacing:0.18em;',
    'color:rgba(255,255,255,0.30);'
  ].join('');
  hd.textContent = title.toUpperCase();
  wrap.appendChild(hd);
  return wrap;
}
function _closeBtn() {
  var b = document.createElement('div');
  b.textContent = '× 閉じる';
  b.style.cssText = [
    'font-size:10px;color:rgba(255,255,255,0.35);cursor:pointer;',
    'padding:4px 8px;letter-spacing:0.12em;'
  ].join('');
  b.addEventListener('click',    function() { closeInfoOverlay(); });
  b.addEventListener('touchend', function(e) { e.preventDefault(); closeInfoOverlay(); }, { passive: false });
  return b;
}

/* ── 弾薬表示更新 ── */
function _renderAmmo() {
  if (!_infoAmmoEl || typeof playerWeapons === 'undefined') return;
  var pw = playerWeapons[0];
  if (pw) {
    _infoAmmoEl.textContent = pw.ammo + ' / ' + pw.reserveAmmo;
    _infoAmmoEl.style.color = pw.ammo === 0
      ? 'rgba(255,60,60,0.8)'
      : 'rgba(255,255,200,0.55)';
  } else {
    _infoAmmoEl.textContent = '─';
  }
}

/* ── 近くの敵情報の更新 ── */
function _renderEnemyInfo() {
  var best = _ui.bestTarget;
  if (!_infoEnemyPctEl) return;

  if (!best || !best.alive) {
    _infoEnemyEl.textContent = '範囲内に敵なし';
    _infoEnemyHPEl.style.width = '100%';
    _infoEnemyHPEl.style.background = 'rgba(255,255,255,0.18)';
    _infoEnemyPctEl.hp.textContent  = '─';
    _infoEnemyPctEl.pct.textContent = '─';
    _infoEnemyPctEl.pct.style.color = 'rgba(100,200,255,0.6)';
    return;
  }

  if (!best._hpInitialized && typeof initCreatureHP === 'function') {
    initCreatureHP(best);
  }

  var hpRatio = best.maxHp > 0 ? best.currentHp / best.maxHp : 1.0;
  var chance  = typeof getCaptureChance === 'function'
    ? getCaptureChance(best) : 0.05;
  var capPct  = Math.round(chance * 100);

  /* 生物名 */
  var crName = '不明の生物';
  if (best.data && best.data.creatureId !== undefined) {
    var def = typeof CREATURE_DATA !== 'undefined' ? CREATURE_DATA[best.data.creatureId] : null;
    if (def) crName = def.name;
  }
  _infoEnemyEl.textContent = crName;

  /* HPバー */
  var r = Math.round(255 * (1.0 - hpRatio));
  var g = Math.round(200 * hpRatio);
  _infoEnemyHPEl.style.width = (hpRatio * 100).toFixed(1) + '%';
  _infoEnemyHPEl.style.background =
    'linear-gradient(90deg,rgb(' + r + ',' + g + ',30),rgb(' + Math.round(r * 0.5) + ',' + g + ',60))';
  _infoEnemyPctEl.hp.textContent = 'HP ' + Math.round(hpRatio * 100) + '%';

  /* 捕獲率 */
  _infoEnemyPctEl.pct.textContent = capPct + '%';
  _infoEnemyPctEl.pct.style.color = capPct >= 60
    ? 'rgba(80,255,160,0.95)'
    : capPct >= 30
      ? 'rgba(255,220,80,0.9)'
      : 'rgba(100,200,255,0.8)';
}

/* ================================================================
   6. 図鑑ボタンを乗っ取る
================================================================ */
function openInfoOverlay() {
  if (!_infoOverlay) return;
  _renderAmmo();
  _renderEnemyInfo();
  _ui.infoOpen = true;
  _infoOverlay.style.opacity = '1';
  _infoOverlay.style.pointerEvents = 'auto';
}

function closeInfoOverlay() {
  if (!_infoOverlay) return;
  _ui.infoOpen = false;
  _infoOverlay.style.opacity = '0';
  _infoOverlay.style.pointerEvents = 'none';
}

(function _repurposeZukanBtn() {
  /* zukanBtn は collection.js で getElementById('zukan-btn') 済み */
  if (typeof zukanBtn === 'undefined' || !zukanBtn) return;

  /* capture:true で既存の bubble リスナーより先に発火し
     stopImmediatePropagation で collection.js の openCollection を止める */
  zukanBtn.addEventListener('click', function(e) {
    e.stopImmediatePropagation();
    if (_ui.infoOpen) closeInfoOverlay();
    else openInfoOverlay();
  }, true);
  zukanBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (_ui.infoOpen) closeInfoOverlay();
    else openInfoOverlay();
  }, { passive: false, capture: true });

  /* PC Zキーも再マップ */
  /* ※ player.js でも Z → openCollection があるが、
        openInfoOverlay を上書きしたいので keydown の order に注意 */
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'z' || e.key === 'Z') && !_ui.infoOpen) {
      openInfoOverlay();
      e.stopImmediatePropagation();
    } else if ((e.key === 'z' || e.key === 'Z') && _ui.infoOpen) {
      closeInfoOverlay();
      e.stopImmediatePropagation();
    }
  }, true);   /* capture phase で先取り */

  /* Escape でも閉じる */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _ui.infoOpen) {
      closeInfoOverlay();
    }
  });
})();

/* ================================================================
   7. 捕獲率のリアルタイム更新
      loop.js の animate() から updateActionUI(dt) を呼ぶ
================================================================ */
var _uiScanV3 = new THREE.Vector3();

function updateActionUI(dt) {
  /* ── フィードバックフェードアウト ── */
  if (_ui.captureFbTimer > 0.0) {
    _ui.captureFbTimer -= dt;
    if (_ui.captureFbTimer <= 0.0 && _fbEl) _fbEl.style.opacity = '0';
  }

  /* ── 最良ターゲットを毎フレームスキャン ── */
  var best = null, bestDist = Infinity;
  if (typeof roomInteractables !== 'undefined') {
    for (var i = 0; i < roomInteractables.length; i++) {
      var itc = roomInteractables[i];
      if (itc.type !== 'creature' || !itc.alive || itc.locked) continue;
      if (!itc.pos) continue;
      var d = itc.pos.distanceTo(camera.position);
      /* 広め判定（画面中央±半径 / 射程距離内）*/
      if (d > itc.shootRange * 1.1) continue;
      _uiScanV3.copy(itc.pos).project(camera);
      var sd = Math.sqrt(_uiScanV3.x * _uiScanV3.x + _uiScanV3.y * _uiScanV3.y);
      if (sd < 0.95 && _uiScanV3.z < 1.0 && d < bestDist) {
        best = itc; bestDist = d;
      }
    }
  }
  _ui.bestTarget = best;

  /* ── 捕獲率 → ボタン表示更新 ── */
  var chance = 0.05;
  if (best) {
    if (!best._hpInitialized && typeof initCreatureHP === 'function') {
      initCreatureHP(best);
    }
    chance = typeof getCaptureChance === 'function'
      ? getCaptureChance(best) : 0.05;
  }
  _ui.captureChance = chance;
  var capPct = Math.round(chance * 100);

  /* ● の色だけ変化させる（テキストは変えない）*/
  if (_captureBtn) {
    var isHigh = capPct >= 60;
    var isMed  = capPct >= 30;
    var _dot = isHigh ? 'rgba(80,255,160,0.90)' : isMed ? 'rgba(255,200,60,0.85)' : 'rgba(100,190,255,0.55)';
    _captureBtn.style.borderColor = isHigh ? 'rgba(80,255,160,0.55)' : isMed ? 'rgba(255,200,60,0.45)' : 'rgba(80,180,255,0.28)';
    if (_capturePctEl) _capturePctEl.style.color = _dot;
    /* 高確率時にグロー */
    _captureBtn.style.boxShadow = isHigh
      ? '0 0 18px rgba(80,255,160,0.30)'
      : isMed
        ? '0 0 12px rgba(255,200,40,0.20)'
        : 'none';
  }

  /* ── 情報オーバーレイが開いている場合はリアルタイム更新 ── */
  if (_ui.infoOpen) {
    _renderAmmo();
    _renderEnemyInfo();
  }

  /* ── 弾数表示更新 ── */
  if (_ammoDispEl && typeof playerWeapons !== 'undefined') {
    var _pw = playerWeapons[0];
    if (_pw) {
      _ammoDispEl.textContent = _pw.ammo + ' / ' + _pw.reserveAmmo;
      _ammoDispEl.style.color = _pw.ammo === 0
        ? 'rgba(255,80,80,0.85)'
        : _pw.ammo <= 2
          ? 'rgba(255,180,60,0.85)'
          : 'rgba(255,200,80,0.72)';
    } else {
      _ammoDispEl.textContent = '';
    }
  }
}
