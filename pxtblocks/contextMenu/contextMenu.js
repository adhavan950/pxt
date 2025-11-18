"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWorkspaceContextMenu = exports.initContextMenu = void 0;
/// <reference path="../../built/pxtlib.d.ts" />
const Blockly = require("blockly");
const workspaceItems_1 = require("./workspaceItems");
const external_1 = require("../external");
const blockItems_1 = require("./blockItems");
let shortcutsInitialized = false;
function initContextMenu() {
    const msg = Blockly.Msg;
    // FIXME (riknoll): Not all of these are still used
    msg.DUPLICATE_BLOCK = lf("{id:block}Duplicate");
    msg.DUPLICATE_COMMENT = lf("Duplicate Comment");
    msg.REMOVE_COMMENT = lf("Remove Comment");
    msg.ADD_COMMENT = lf("Add Comment");
    msg.EXTERNAL_INPUTS = lf("External Inputs");
    msg.INLINE_INPUTS = lf("Inline Inputs");
    msg.EXPAND_BLOCK = lf("Expand Block");
    msg.COLLAPSE_BLOCK = lf("Collapse Block");
    msg.ENABLE_BLOCK = lf("Enable Block");
    msg.DISABLE_BLOCK = lf("Disable Block");
    msg.DELETE_BLOCK = lf("Delete Block");
    msg.DELETE_X_BLOCKS = lf("Delete Blocks");
    msg.DELETE_ALL_BLOCKS = lf("Delete All Blocks");
    msg.HELP = lf("Help");
    if (shortcutsInitialized)
        return;
    shortcutsInitialized = true;
    (0, workspaceItems_1.registerWorkspaceItems)();
    (0, blockItems_1.registerBlockitems)();
}
exports.initContextMenu = initContextMenu;
function setupWorkspaceContextMenu(workspace) {
    try {
        Blockly.ContextMenuItems.registerCommentOptions();
    }
    catch (e) {
        // will throw if already registered. ignore
    }
    workspace.configureContextMenu = (options, e) => {
        (0, external_1.onWorkspaceContextMenu)(workspace, options);
    };
}
exports.setupWorkspaceContextMenu = setupWorkspaceContextMenu;
