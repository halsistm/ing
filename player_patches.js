/* =============================================================
   player_patches.js  —  player.js のバグ修正パッチ
   ロード順: player.js の直後

   修正内容:
   BUG-D: PC クリックのエイム判定が静的 sdLimit を使用していた問題を修正。
          fireBeam() や crosshair 表示と同じ動的計算式
          Math.min(it.sdLimit, it.bodyH / Math.max(1.5, d))
          に統一し、大型生物近距離での誤検知を解消する。

   実装方法:
   player.js の click ハンドラより前に発火する capture フェーズ
   リスナーを追加。pointerLocked かつ武器未装備の場合のみ横取りし、
   正しいエイム計算で fireBeam() を呼ぶ。
============================================================= */

(function () {
  /* canvas 変数は player.js でグローバルに宣言されているが、
     このスクリプト実行時点で確実に存在するよう id からも取得する */
  var _canvas = window.canvas || document.getElementById('canvas');
  if (!_canvas) {
    console.warn('[player_patches] canvas not found, BUG-D patch skipped');
    return;
  }

  _canvas.addEventListener('click', function (e) {
    /* ポインターロック未取得 → 元のハンドラにロック要求を任せる */
    if (!window.pointerLocked) return;

    /* 武器装備中 → 元のハンドラに fireWeapon() を任せる */
    var hasWeapon = typeof window.playerWeapons !== 'undefined'
      && typeof window.activeWeaponSlot !== 'undefined'
      && window.playerWeapons[window.activeWeaponSlot] !== null;
    if (hasWeapon) return;

    /* ▼ BUG-D FIX: 動的エイム判定（crosshair 表示と同式）
       元のハンドラは静的 it.sdLimit を使うため stopImmediatePropagation で遮断し
       こちらの正確な判定に差し替える */
    e.stopImmediatePropagation();

    if (typeof roomInteractables === 'undefined' || typeof camera === 'undefined') return;

    var camPos = camera.position;
    for (var _i = 0; _i < roomInteractables.length; _i++) {
      var _it = roomInteractables[_i];
      if (_it.type !== 'creature' || !_it.alive) continue;

      var _cp = _it.pos.clone().project(camera);
      var _sd = Math.sqrt(_cp.x * _cp.x + _cp.y * _cp.y);
      var _d  = camPos.distanceTo(_it.pos);

      /* crosshair 表示と同じ動的計算 */
      var _dynSd = Math.min(_it.sdLimit, (_it.bodyH || 1.0) / Math.max(1.5, _d));

      if (_sd < _dynSd && _cp.z < 1.0 && _d < (_it.shootRange || 18.0)) {
        if (typeof fireBeam === 'function') fireBeam();
        break;
      }
    }
  }, true /* capture phase: player.js のバブルハンドラより先に発火 */);
})();

console.log('[player_patches] BUG-D: 動的エイム判定修正を適用しました');
