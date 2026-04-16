/* ----------------------------------------------------------
   Render loop
---------------------------------------------------------- */
var clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);

  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  var fwd = 0, str = 0;
  if (!isMobile) {
    fwd = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    str = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
  } else {
    fwd = joyY; str = joyX;
  }

  var moving = (fwd !== 0 || str !== 0);
  if (moving) {
    moveHoldTime += dt;
    var runRatio = Math.max(0, Math.min(1, (moveHoldTime - RUN_THRESHOLD) / 1.2));
    currentSpeed = SPEED_WALK + (SPEED_RUN - SPEED_WALK) * runRatio;
    if (runRatio > 0.05) { speedIndicatorEl.classList.add('running'); }
    camera.position.x += (-Math.sin(yaw) * fwd + Math.cos(yaw) * str) * currentSpeed;
    camera.position.z += (-Math.cos(yaw) * fwd - Math.sin(yaw) * str) * currentSpeed;
    var bobSpeed = 7.8 + runRatio * 6.0;
    var bobAmp   = 0.04 + runRatio * 0.055;
    walkPhase += dt * bobSpeed;
    camera.position.y = _floorY + 1.72 + Math.sin(walkPhase) * bobAmp;
    // Footstep sound: trigger once per step cycle
    var stepInterval = runRatio > 0.05 ? 0.28 : 0.42;
    _lastFootstepFloor += dt;
    if (_lastFootstepFloor >= stepInterval) {
      _lastFootstepFloor = 0;
      playSoundFootstep(runRatio > 0.05);
    }
  } else {
    moveHoldTime = 0;
    currentSpeed = SPEED_WALK;
    speedIndicatorEl.classList.remove('running');
    _lastFootstepFloor = 0;
    walkPhase += dt * 1.8;
    camera.position.y += (_floorY + 1.72 + Math.sin(walkPhase) * 0.006 - camera.position.y) * 0.07;
  }

  /* ── 階段昇降: 立ち位置の床面高さを計算 ── */
  var _targetFloorY = 0;
  if (currentRoom && currentRoom.stairData) {
    var _sd = currentRoom.stairData;
    var _cx = camera.position.x, _cz = camera.position.z;
    for (var _si = 0; _si < _sd.length; _si++) {
      var _st = _sd[_si];
      // カメラのワールドXZを階段のローカル座標に変換
      var _dx = _cx - _st.wx, _dz = _cz - _st.wz;
      var _cosR = Math.cos(_st.rotY), _sinR = Math.sin(_st.rotY);
      var _lx = _cosR * _dx + _sinR * _dz;
      var _lz = -_sinR * _dx + _cosR * _dz;
      // 横幅チェック
      if (_lx < -_st.halfW - 0.15 || _lx > _st.halfW + 0.15) continue;
      // 奥行きチェック（z=0が1段目手前, z=-steps*stepD が最上段）
      var _maxDepth = -(_st.steps - 1) * _st.stepD;
      if (_lz > _st.stepD * 0.5 || _lz < _maxDepth - _st.stepD) continue;
      // 何段目にいるか
      var _stepIdx = Math.max(0, Math.min(_st.steps - 1, Math.floor(-_lz / _st.stepD)));
      var _h = _stepIdx * _st.stepH;
      if (_h > _targetFloorY) _targetFloorY = _h;
    }
  }
  // 床面高さをスムーズに追従（昇り遅め・降り速め）
  var _lerpRate = _targetFloorY > _floorY ? 6.0 : 10.0;
  _floorY += (_targetFloorY - _floorY) * Math.min(1, _lerpRate * dt);

  /* wall clamp (disabled mid-transition so player can pass through) */
  if (currentRoom && !transitioning) {
    var hw2 = currentRoom.hw, hd2 = currentRoom.hd;
    camera.position.x = Math.max(-hw2 + 0.3, Math.min(hw2 - 0.3, camera.position.x));
    camera.position.z = Math.max(-hd2 + 0.3, Math.min(hd2 - 0.3, camera.position.z));

    // ── 大型オブジェクト押し返し（ソリッド系のみ）──
    var _cols = currentRoom.collidables;
    if (_cols) {
      for (var _ci = 0; _ci < _cols.length; _ci++) {
        var _col = _cols[_ci];
        var _cdx = camera.position.x - _col.x;
        var _cdz = camera.position.z - _col.z;
        var _cDist2 = _cdx*_cdx + _cdz*_cdz;
        var _cMin = _col.r + 0.35; // プレイヤー半径0.35m
        if (_cDist2 < _cMin * _cMin && _cDist2 > 0.0001) {
          var _cD = Math.sqrt(_cDist2);
          var _push = (_cMin - _cD) / _cD;
          camera.position.x += _cdx * _push;
          camera.position.z += _cdz * _push;
        }
      }
    }

    // ── 生物ソフト斥力（吸い込み中は無効）──
    if (_lockedCreatures.length === 0) {
      for (var _ri = 0; _ri < roomInteractables.length; _ri++) {
        var _itc = roomInteractables[_ri];
        if (_itc.type !== 'creature' || !_itc.alive || _itc.locked) continue;
        var _rdx = camera.position.x - _itc.pos.x;
        var _rdz = camera.position.z - _itc.pos.z;
        var _rDist2 = _rdx*_rdx + _rdz*_rdz;
        var _rMin = 0.9;
        if (_rDist2 < _rMin * _rMin && _rDist2 > 0.0001) {
          var _rD = Math.sqrt(_rDist2);
          var _rPush = (_rMin - _rD) / _rD * 0.45;
          camera.position.x += _rdx * _rPush;
          camera.position.z += _rdz * _rPush;
        }
      }
    }

    checkDoors();
    checkDoorHint();
  }

  // VHS two-pass render（全ゲームロジック更新後に描画）
  updateInteractables(dt);
  updateWaterSurfaces(dt);
  updateFadingCreatures(dt);
  updateFlashLightPool(dt);
  updateEffects(dt);   // ← render より前に置く
  updateCombat(dt);
  updateWeapons(dt);
  updateActionUI(dt);
  
  vhsTime += dt;
  vhsMaterial.uniforms.time.value = vhsTime;
  renderer.setRenderTarget(vhsTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  vhsMaterial.uniforms.tDiffuse.value = vhsTarget.texture;
  renderer.render(vhsScene, vhsCamera);
}