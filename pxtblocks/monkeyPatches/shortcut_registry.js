"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monkeyPatchAddKeyMapping = void 0;
const Blockly = require("blockly");
/**
 * There are some scenarios where we attempt to add the same key mapping to the same key multiple times.
 * This ensures that doing so will no-op instead of adding duplicate entries, which don't get cleaned up properly.
 */
function monkeyPatchAddKeyMapping() {
    const existingAdd = Blockly.ShortcutRegistry.prototype.addKeyMapping;
    Blockly.ShortcutRegistry.prototype.addKeyMapping = function (keyCode, shortcutName, allowCollision) {
        if (Blockly.ShortcutRegistry.registry.getShortcutNamesByKeyCode(keyCode.toString()).includes(shortcutName)) {
            // Already have this mapping, no-op
            return;
        }
        existingAdd.call(this, keyCode, shortcutName, allowCollision);
    };
}
exports.monkeyPatchAddKeyMapping = monkeyPatchAddKeyMapping;
