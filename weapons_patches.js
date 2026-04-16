/* =============================================================
   weapons_patches.js  —  weapons.js のバグ修正パッチ
   ロード順: weapons.js の直後

   修正内容:
   BUG-C: spawnWeaponsInRoom で floorItems の geometry/material が
          dispose されない GPU VRAM リーク修正。
          部屋移動のたびに GPU メモリが増加し続ける問題を解消する。
============================================================= */

(function () {
  var _origSpawn = window.spawnWeaponsInRoom;

  window.spawnWeaponsInRoom = function spawnWeaponsInRoom(room) {
    /* ▼ BUG-C FIX: 旧 floorItems の GPU リソースを dispose してから除去 */
    if (typeof floorItems !== 'undefined') {
      var _slots = ['mesh', 'glow', 'beam', 'ring'];
      for (var _fi = 0; _fi < floorItems.length; _fi++) {
        var _item = floorItems[_fi];
        if (!_item) continue;
        for (var _si = 0; _si < _slots.length; _si++) {
          var _obj = _item[_slots[_si]];
          if (!_obj) continue;
          _obj.traverse(function (_child) {
            if (_child.geometry) {
              try { _child.geometry.dispose(); } catch (e) {}
            }
            if (_child.material) {
              var _mats = Array.isArray(_child.material)
                ? _child.material
                : [_child.material];
              for (var _mi = 0; _mi < _mats.length; _mi++) {
                if (_mats[_mi]) {
                  /* テクスチャスロットも解放 */
                  var _texSlots = ['map', 'roughnessMap', 'normalMap',
                                   'emissiveMap', 'metalnessMap'];
                  for (var _ti = 0; _ti < _texSlots.length; _ti++) {
                    if (_mats[_mi][_texSlots[_ti]]) {
                      try { _mats[_mi][_texSlots[_ti]].dispose(); } catch (e) {}
                    }
                  }
                  try { _mats[_mi].dispose(); } catch (e) {}
                }
              }
            }
          });
        }
      }
    }

    /* オリジナルの処理（scene.remove / floorItems = [] など）を実行 */
    if (typeof _origSpawn === 'function') _origSpawn(room);
  };
})();

console.log('[weapons_patches] BUG-C: floorItems dispose 修正を適用しました');
