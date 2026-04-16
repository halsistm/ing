/* ----------------------------------------------------------
   Device detection
---------------------------------------------------------- */
var isMobile  = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
var stickZone = document.getElementById('stick-zone');
var lookRight = document.getElementById('look-right');
var pcHint    = document.getElementById('pc-hint');

if (isMobile) {
  stickZone.style.display = 'block';
  lookRight.style.display = 'block';
  pcHint.style.display    = 'none';
}

/* NEXT ROOM button */
function _handleNextRoom() {
  if (transitioning) return;
  enterDoor({ seed: Math.floor(Math.random() * 99991) + 1 });
}
document.getElementById('next-room-btn').addEventListener('click', _handleNextRoom);
document.getElementById('next-room-btn').addEventListener('touchend', function(e) {
  e.preventDefault();
  _handleNextRoom();
}, { passive: false });

/* ----------------------------------------------------------
   PC: Pointer Lock + WASD
---------------------------------------------------------- */
var pointerLocked = false;
var keys = { w: false, a: false, s: false, d: false };

if (!isMobile) {
  canvas.addEventListener('click', function () {
    if (pointerLocked) {
      /* 武器を持っている場合は武器発射、持っていない場合は捕獲ビーム */
      var hasWeapon = typeof playerWeapons !== 'undefined'
        && typeof activeWeaponSlot !== 'undefined'
        && playerWeapons[activeWeaponSlot] !== null;
      if (hasWeapon) {
        if (typeof fireWeapon === 'function') fireWeapon();
      } else {
        var aimed = false;
        for (var i = 0; i < roomInteractables.length; i++) {
          var it = roomInteractables[i];
          if (it.type !== 'creature' || !it.alive) continue;
          var cp = it.pos.clone().project(camera);
          var sd = Math.sqrt(cp.x * cp.x + cp.y * cp.y);
          if (sd < it.sdLimit && cp.z < 1.0 && camera.position.distanceTo(it.pos) < it.shootRange) {
            aimed = true; break;
          }
        }
        if (aimed) fireBeam();
      }
    } else {
      canvas.requestPointerLock();
    }
  });
  document.addEventListener('pointerlockchange', function () {
    pointerLocked = document.pointerLockElement === canvas;
    canvas.classList.toggle('locked', pointerLocked);
    if (pointerLocked) pcHint.classList.add('hidden');
    else               pcHint.classList.remove('hidden');
  });
  document.addEventListener('mousemove', function (e) {
    if (!pointerLocked) return;
    yaw   -= e.movementX * 0.0022;
    pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch - e.movementY * 0.0022));
  });
  document.addEventListener('mouseleave', function () {
    if (pointerLocked) document.exitPointerLock();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'w' || e.key === 'ArrowUp')    keys.w = true;
    if (e.key === 's' || e.key === 'ArrowDown')   keys.s = true;
    if (e.key === 'a' || e.key === 'ArrowLeft')   keys.a = true;
    if (e.key === 'd' || e.key === 'ArrowRight')  keys.d = true;
    if (e.key === 'Escape') {
      if (cardDetailOpen) { closeCardDetail(); return; }
      if (collectionOpen) { closeCollection(); return; }
      document.exitPointerLock();
    }
    // N key: next room without breaking pointer lock
    if (e.key === 'n' || e.key === 'N') {
      if (transitioning) return;
      var fakeSeed = Math.floor(Math.random() * 99991) + 1;
      enterDoor({ seed: fakeSeed });
    }
    // Tab: toggle cursor mode (release/re-acquire pointer lock)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (pointerLocked) { document.exitPointerLock(); }
      else               { canvas.requestPointerLock(); }
    }
    if (e.key === 'z' || e.key === 'Z') {
      if (collectionOpen) closeCollection();
      else openCollection();
    }
  });
  document.addEventListener('keyup', function (e) {
    if (e.key === 'w' || e.key === 'ArrowUp')    keys.w = false;
    if (e.key === 's' || e.key === 'ArrowDown')   keys.s = false;
    if (e.key === 'a' || e.key === 'ArrowLeft')   keys.a = false;
    if (e.key === 'd' || e.key === 'ArrowRight')  keys.d = false;
  });
}

/* ----------------------------------------------------------
   Mobile: Virtual stick (left) + look drag (right)
---------------------------------------------------------- */
var stickRing = document.getElementById('stick-ring');
var stickKnob = document.getElementById('stick-knob');
var joyX = 0, joyY = 0;
var stickTouchId = null, stickOriginX, stickOriginY;
var STICK_MAX = 40;

if (isMobile) {
  stickZone.addEventListener('touchstart', function (e) {
    var t = e.changedTouches[0];
    stickTouchId = t.identifier;
    stickOriginX = t.clientX; stickOriginY = t.clientY;
    var zr = stickZone.getBoundingClientRect();
    stickRing.style.left   = (t.clientX - zr.left - 54) + 'px';
    stickRing.style.bottom = (zr.bottom - t.clientY - 54) + 'px';
    stickRing.style.top    = 'auto';
    e.preventDefault();
  }, { passive: false });

  stickZone.addEventListener('touchmove', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier !== stickTouchId) continue;
      var dx = t.clientX - stickOriginX;
      var dy = t.clientY - stickOriginY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > STICK_MAX) { dx = dx / dist * STICK_MAX; dy = dy / dist * STICK_MAX; }
      joyX =  dx / STICK_MAX;
      joyY = -dy / STICK_MAX;
      stickKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
    }
    e.preventDefault();
  }, { passive: false });

  function resetStick(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier !== stickTouchId) continue;
      joyX = joyY = 0; stickTouchId = null;
      stickKnob.style.transform = 'translate(-50%, -50%)';
    }
  }
  stickZone.addEventListener('touchend',    resetStick, { passive: true });
  stickZone.addEventListener('touchcancel', resetStick, { passive: true });

  var lookTouchId = null, lookLastX, lookLastY;
  lookRight.addEventListener('touchstart', function (e) {
    var t = e.changedTouches[0];
    lookTouchId = t.identifier; lookLastX = t.clientX; lookLastY = t.clientY;
  }, { passive: true });
  lookRight.addEventListener('touchmove', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier !== lookTouchId) continue;
      yaw   -= (t.clientX - lookLastX) * 0.005;
      pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch - (t.clientY - lookLastY) * 0.005));
      lookLastX = t.clientX; lookLastY = t.clientY;
    }
  }, { passive: true });
  lookRight.addEventListener('touchend', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId) lookTouchId = null;
    }
  }, { passive: true });
}