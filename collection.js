/* ----------------------------------------------------------
   Collection / 捕獲図鑑 system
---------------------------------------------------------- */
var COLLECTION_KEY = 'gallery_collection_v1';
var capturedCollection = {}; // { [id]: count }

function loadCollection() {
  try {
    var raw = localStorage.getItem(COLLECTION_KEY);
    if (raw) capturedCollection = JSON.parse(raw);
  } catch(e) { capturedCollection = {}; }
}

function saveCollection() {
  try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(capturedCollection)); } catch(e) {}
}

function updateCollection(id) {
  capturedCollection[id] = (capturedCollection[id] || 0) + 1;
  saveCollection();
  refreshCollectionUI(id);
}

function getTotalCaptured() {
  return Object.keys(capturedCollection).length;
}

loadCollection();

/* ---- 捕獲通知 ---- */
var captureNotifyEl = document.getElementById('capture-notify');
var captureNameEl   = document.getElementById('capture-name');
var captureSubEl    = document.getElementById('capture-sub');
var captureNotifyTimer = null;

function showCaptureNotification(id) {
  var def = CREATURE_DATA[id];
  if (!def) return;
  var isNew = capturedCollection[id] <= 1;
  captureNameEl.textContent = def.name;
  captureSubEl.textContent  = (isNew ? '── 新種捕獲 ──' : '── 再捕獲 × ' + capturedCollection[id] + ' ──');
  captureNotifyEl.classList.add('visible');
  if (captureNotifyTimer) clearTimeout(captureNotifyTimer);
  captureNotifyTimer = setTimeout(function() {
    captureNotifyEl.classList.remove('visible');
  }, 2400);
}

/* ---- フェードアウト捕獲アニメ ---- */
var fadingCreatures = [];

function startFadeCapture(mesh) {
  fadingCreatures.push({ mesh: mesh, age: 0, duration: 0.7 });
}

function updateFadingCreatures(dt) {
  for (var i = fadingCreatures.length - 1; i >= 0; i--) {
    var fc = fadingCreatures[i];
    fc.age += dt;
    var t = Math.min(1, fc.age / fc.duration);
    // Scale down + float up
    var s = 1.0 - t * t;
    fc.mesh.scale.set(s, s, s);
    fc.mesh.position.y += dt * 0.9 * (1 - t * 0.5);
    // Fade all materials
    fc.mesh.traverse(function(child) {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = Math.max(0, 1 - t * 1.6);
      }
    });
    if (t >= 1) {
      if (fc.mesh.parent) fc.mesh.parent.remove(fc.mesh);
      else scene.remove(fc.mesh);
      fadingCreatures.splice(i, 1);
    }
  }
}

/* ---- 図鑑UI ---- */
var collectionOverlay = document.getElementById('collection-overlay');
var collectionGrid    = document.getElementById('collection-grid');
var collectionCount   = document.getElementById('collection-count');
var zukanBtn          = document.getElementById('zukan-btn');
var collectionClose   = document.getElementById('collection-close');
var collectionOpen    = false;

function buildCollectionGrid() {
  collectionGrid.innerHTML = '';
  var total = getTotalCaptured();
  collectionCount.textContent = total + ' / ' + CREATURE_DATA.length + ' 発見済み';

  CREATURE_DATA.forEach(function(def) {
    var card = document.createElement('div');
    card.className = 'cr-card' + (capturedCollection[def.id] ? ' captured' : '');
    card.id = 'crcard-' + def.id;

    var isCaptured = !!capturedCollection[def.id];
    var count = capturedCollection[def.id] || 0;
    var ec = ELEMENT_COLORS[def.element] || ELEMENT_COLORS['無'];
    var dc = DANGER_COLORS[def.danger] || '#888888';

    // Top row: danger + id
    var topDiv = document.createElement('div');
    topDiv.className = 'cr-card-top';
    var dangSpan = document.createElement('span');
    dangSpan.className = 'cr-danger';
    dangSpan.style.color = dc; dangSpan.style.borderColor = dc + '88';
    dangSpan.textContent = isCaptured ? ('危険度 ' + def.danger) : '? ? ?';
    var idSpan = document.createElement('span');
    idSpan.className = 'cr-id';
    idSpan.textContent = '#' + String(def.id).padStart(3,'0');
    topDiv.appendChild(dangSpan); topDiv.appendChild(idSpan);
    card.appendChild(topDiv);

    // count badge (captured only)
    if (isCaptured && count > 1) {
      var countSpan = document.createElement('span');
      countSpan.className = 'cr-count';
      countSpan.textContent = '× ' + count;
      card.appendChild(countSpan);
    }

    // Icon canvas
    var iconCanvas = document.createElement('canvas');
    iconCanvas.className = 'cr-icon';
    iconCanvas.width = 64; iconCanvas.height = 64;
    if (isCaptured) {
      drawCreatureIcon(iconCanvas, def.visualType, def.element);
    } else {
      // Unknown silhouette
      var ctx2 = iconCanvas.getContext('2d');
      ctx2.fillStyle = 'rgba(255,255,255,0.05)';
      ctx2.beginPath(); ctx2.arc(32, 32, 22, 0, Math.PI * 2); ctx2.fill();
      ctx2.fillStyle = 'rgba(255,255,255,0.08)';
      ctx2.font = '22px sans-serif'; ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
      ctx2.fillText('?', 32, 32);
    }
    card.appendChild(iconCanvas);

    // Name
    var nameEl = document.createElement('span');
    if (isCaptured) {
      nameEl.className = 'cr-name';
      nameEl.textContent = def.name;
      nameEl.style.color = ec.text;
    } else {
      nameEl.className = 'cr-name-unknown';
      nameEl.textContent = '未捕獲';
    }
    card.appendChild(nameEl);

    if (isCaptured && def.names) {
      var skEl = document.createElement('span');
      skEl.className = 'cr-sanskrit';
      skEl.textContent = def.names;
      card.appendChild(skEl);
    }

    if (isCaptured) {
      // Badges
      var badgeDiv = document.createElement('div');
      badgeDiv.className = 'cr-badges';
      [def.type, def.element + '属性'].forEach(function(b) {
        var bsp = document.createElement('span');
        bsp.className = 'cr-badge';
        bsp.style.borderColor = ec.border + '55';
        bsp.style.color = ec.text + 'bb';
        bsp.textContent = b;
        badgeDiv.appendChild(bsp);
      });
      card.appendChild(badgeDiv);
      // Caption
      var capEl = document.createElement('div');
      capEl.className = 'cr-caption';
      capEl.textContent = def.caption;
      card.appendChild(capEl);
    } else {
      var unkBadge = document.createElement('span');
      unkBadge.className = 'cr-unknown-badge';
      unkBadge.textContent = '情報なし';
      card.appendChild(unkBadge);
    }

    collectionGrid.appendChild(card);
    // ---- tap to detail ----
    (function(arrayIdx) {
      var _touchStartY = 0;
      var _touchStartX = 0;
      card.addEventListener('touchstart', function(e) {
        _touchStartY = e.changedTouches[0].clientY;
        _touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      card.addEventListener('click', function() { openCardDetail(arrayIdx); });
      card.addEventListener('touchend', function(e) {
        var dy = Math.abs(e.changedTouches[0].clientY - _touchStartY);
        var dx = Math.abs(e.changedTouches[0].clientX - _touchStartX);
        if (dy > 10 || dx > 10) return; // スクロール中は無視
        e.preventDefault();
        openCardDetail(arrayIdx);
      }, { passive: false });
    })(CREATURE_DATA.indexOf(def));
  });
}

function refreshCollectionUI(newId) {
  collectionCount.textContent = getTotalCaptured() + ' / ' + CREATURE_DATA.length + ' 発見済み';
  var card = document.getElementById('crcard-' + newId);
  if (card) {
    // Rebuild this card
    var def = CREATURE_DATA[newId];
    var isCaptured = !!capturedCollection[newId];
    var count = capturedCollection[newId] || 0;
    var ec = ELEMENT_COLORS[def.element] || ELEMENT_COLORS['無'];
    var dc = DANGER_COLORS[def.danger] || '#888888';

    card.className = 'cr-card captured new-capture';
    setTimeout(function() { card.classList.remove('new-capture'); }, 900);
    card.innerHTML = '';

    var topDiv = document.createElement('div');
    topDiv.className = 'cr-card-top';
    var dangSpan = document.createElement('span');
    dangSpan.className = 'cr-danger';
    dangSpan.style.color = dc; dangSpan.style.borderColor = dc + '88';
    dangSpan.textContent = '危険度 ' + def.danger;
    var idSpan = document.createElement('span');
    idSpan.className = 'cr-id';
    idSpan.textContent = '#' + String(def.id).padStart(3,'0');
    topDiv.appendChild(dangSpan); topDiv.appendChild(idSpan);
    card.appendChild(topDiv);

    if (count > 1) {
      var cSp = document.createElement('span');
      cSp.className = 'cr-count';
      cSp.textContent = '× ' + count;
      card.appendChild(cSp);
    }

    var ic = document.createElement('canvas');
    ic.className = 'cr-icon'; ic.width = 64; ic.height = 64;
    drawCreatureIcon(ic, def.visualType, def.element);
    card.appendChild(ic);

    var nm = document.createElement('span');
    nm.className = 'cr-name'; nm.style.color = ec.text;
    nm.textContent = def.name;
    card.appendChild(nm);

    if (def.names) {
      var skEl2 = document.createElement('span');
      skEl2.className = 'cr-sanskrit';
      skEl2.textContent = def.names;
      card.appendChild(skEl2);
    }

    var bd = document.createElement('div'); bd.className = 'cr-badges';
    [def.type, def.element + '属性'].forEach(function(b) {
      var bsp2 = document.createElement('span');
      bsp2.className = 'cr-badge';
      bsp2.style.borderColor = ec.border + '55';
      bsp2.style.color = ec.text + 'bb';
      bsp2.textContent = b;
      bd.appendChild(bsp2);
    });
    card.appendChild(bd);

    var cp = document.createElement('div');
    cp.className = 'cr-caption';
    cp.textContent = def.caption;
    card.appendChild(cp);
  }
}

function openCollection() {
  buildCollectionGrid();
  collectionOverlay.classList.add('open');
  collectionOpen = true;
  if (document.pointerLockElement) document.exitPointerLock();
}

function closeCollection() {
  collectionOverlay.classList.remove('open');
  collectionOpen = false;
}

/* ----------------------------------------------------------
   Card detail modal
---------------------------------------------------------- */
var cardDetailEl      = document.getElementById('card-detail');
var cdDangerEl        = document.getElementById('card-detail-danger');
var cdIdEl            = document.getElementById('card-detail-id');
var cdCountEl         = document.getElementById('card-detail-count');
var cdCanvas          = document.getElementById('card-detail-canvas');
var cdNameEl          = document.getElementById('card-detail-name');
var cdSanskritEl      = document.getElementById('card-detail-sanskrit');
var cdBadgesEl        = document.getElementById('card-detail-badges');
var cdCaptionEl       = document.getElementById('card-detail-caption');
var cdUnknownEl       = document.getElementById('card-detail-unknown');
var cdDotsEl          = document.getElementById('card-detail-dots');
var cdCloseBtn        = document.getElementById('card-detail-close');
var cdPrevBtn         = document.getElementById('card-detail-prev');
var cdNextBtn         = document.getElementById('card-detail-next');
var cdCounterEl       = document.getElementById('card-detail-counter');
var currentCardIndex  = 0;
var cardDetailOpen    = false;

function renderCardDetail(idx) {
  var def = CREATURE_DATA[idx];
  if (!def) return;
  currentCardIndex = idx;
  var isCaptured = !!capturedCollection[def.id];
  var count = capturedCollection[def.id] || 0;
  var ec = ELEMENT_COLORS[def.element] || ELEMENT_COLORS['無'];
  var dc = DANGER_COLORS[def.danger] || '#888888';

  // Danger + id
  cdDangerEl.textContent = isCaptured ? ('危険度 ' + def.danger) : '? ? ?';
  cdDangerEl.style.color = dc;
  cdDangerEl.style.borderColor = dc + '88';
  cdIdEl.textContent = '#' + String(def.id).padStart(3, '0');

  // Count
  cdCountEl.textContent = (isCaptured && count > 1) ? ('× ' + count + ' 捕獲') : '';

  // Canvas icon
  cdCanvas.width = 120; cdCanvas.height = 120;
  if (isCaptured) {
    drawCreatureIcon(cdCanvas, def.visualType, def.element);
  } else {
    var ctx2 = cdCanvas.getContext('2d');
    ctx2.clearRect(0, 0, 120, 120);
    ctx2.fillStyle = 'rgba(255,255,255,0.05)';
    ctx2.beginPath(); ctx2.arc(60, 60, 44, 0, Math.PI * 2); ctx2.fill();
    ctx2.fillStyle = 'rgba(255,255,255,0.1)';
    ctx2.font = '44px sans-serif'; ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
    ctx2.fillText('?', 60, 60);
  }

  // Name
  if (isCaptured) {
    cdNameEl.textContent = def.name;
    cdNameEl.style.color = ec.text;
  } else {
    cdNameEl.textContent = '未捕獲';
    cdNameEl.style.color = 'rgba(255,255,255,0.14)';
  }

  // Sanskrit/sub-name
  cdSanskritEl.textContent = (isCaptured && def.names) ? def.names : '';

  // Badges
  cdBadgesEl.innerHTML = '';
  if (isCaptured) {
    [def.type, def.element + '属性'].forEach(function(b) {
      var bsp = document.createElement('span');
      bsp.className = 'cd-badge';
      bsp.style.borderColor = ec.border + '55';
      bsp.style.color = ec.text + 'bb';
      bsp.textContent = b;
      cdBadgesEl.appendChild(bsp);
    });
  }

  // Caption
  cdCaptionEl.textContent = isCaptured ? (def.caption || '') : '';
  cdUnknownEl.textContent = isCaptured ? '' : '情報なし';

  // Counter
  cdCounterEl.textContent = (idx + 1) + ' / ' + CREATURE_DATA.length;

  // Dots (show up to 9 dots around current)
  cdDotsEl.innerHTML = '';
  var total = CREATURE_DATA.length;
  var dotCount = Math.min(total, 9);
  var start = Math.max(0, Math.min(idx - 4, total - dotCount));
  for (var di = start; di < start + dotCount; di++) {
    var dot = document.createElement('div');
    dot.className = 'cd-dot' + (di === idx ? ' active' : '');
    cdDotsEl.appendChild(dot);
  }
}

function openCardDetail(defId) {
  // defId is def.id (= index in CREATURE_DATA)
  renderCardDetail(defId);
  cardDetailEl.classList.add('open');
  cardDetailOpen = true;
  playSoundZukan();
}

function closeCardDetail() {
  cardDetailEl.classList.remove('open');
  cardDetailOpen = false;
  playSoundZukan();
}

function cardDetailNav(dir) {
  var next = currentCardIndex + dir;
  if (next < 0) next = CREATURE_DATA.length - 1;
  if (next >= CREATURE_DATA.length) next = 0;
  renderCardDetail(next);
  playSoundZukan();
}

cdCloseBtn.addEventListener('click', closeCardDetail);
cdCloseBtn.addEventListener('touchend', function(e){ e.preventDefault(); closeCardDetail(); }, {passive:false});
cdPrevBtn.addEventListener('click', function(){ cardDetailNav(-1); });
cdPrevBtn.addEventListener('touchend', function(e){ e.preventDefault(); cardDetailNav(-1); }, {passive:false});
cdNextBtn.addEventListener('click', function(){ cardDetailNav(1); });
cdNextBtn.addEventListener('touchend', function(e){ e.preventDefault(); cardDetailNav(1); }, {passive:false});

// Swipe support
var _cdSwipeX = null;
var _cdSwipeStartX = null;
cardDetailEl.addEventListener('touchstart', function(e) {
  if (e.target === cdPrevBtn || e.target === cdNextBtn || e.target === cdCloseBtn) return;
  _cdSwipeStartX = e.changedTouches[0].clientX;
  _cdSwipeX = _cdSwipeStartX;
}, { passive: true });
cardDetailEl.addEventListener('touchmove', function(e) {
  if (_cdSwipeStartX === null) return;
  _cdSwipeX = e.changedTouches[0].clientX;
}, { passive: true });
cardDetailEl.addEventListener('touchend', function(e) {
  if (_cdSwipeStartX === null) return;
  var dx = _cdSwipeX - _cdSwipeStartX;
  if (Math.abs(dx) > 40) {
    cardDetailNav(dx < 0 ? 1 : -1);
  }
  _cdSwipeStartX = null; _cdSwipeX = null;
}, { passive: true });

// Keyboard: arrow keys when detail is open
document.addEventListener('keydown', function(e) {
  if (!cardDetailOpen) return;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); cardDetailNav(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); cardDetailNav(1); }
  if (e.key === 'Escape')     { closeCardDetail(); }
}, true);

function _handleZukanBtn() {
  _resumeAudioCtx();
  playSoundZukan();
  if (collectionOpen) closeCollection();
  else openCollection();
}
zukanBtn.addEventListener('click', _handleZukanBtn);
zukanBtn.addEventListener('touchend', function(e) {
  e.preventDefault();
  _handleZukanBtn();
}, { passive: false });
collectionClose.addEventListener('click', closeCollection);
collectionClose.addEventListener('touchend', function(e){ e.preventDefault(); closeCollection(); }, {passive:false});
