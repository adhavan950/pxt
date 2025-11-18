"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMonkeyPatches = void 0;
const blockSvg_1 = require("./blockSvg");
const gesture_1 = require("./gesture");
const grid_1 = require("./grid");
const shortcut_registry_1 = require("./shortcut_registry");
function applyMonkeyPatches() {
    (0, blockSvg_1.monkeyPatchBlockSvg)();
    (0, grid_1.monkeyPatchGrid)();
    (0, gesture_1.monkeyPatchGesture)();
    (0, shortcut_registry_1.monkeyPatchAddKeyMapping)();
}
exports.applyMonkeyPatches = applyMonkeyPatches;
