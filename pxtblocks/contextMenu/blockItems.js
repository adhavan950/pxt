"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBlockitems = exports.BlockContextWeight = void 0;
/// <reference path="../../built/pxtlib.d.ts" />
const Blockly = require("blockly");
const external_1 = require("../external");
// Lower weight is higher in context menu
var BlockContextWeight;
(function (BlockContextWeight) {
    BlockContextWeight[BlockContextWeight["Duplicate"] = 10] = "Duplicate";
    BlockContextWeight[BlockContextWeight["Copy"] = 15] = "Copy";
    BlockContextWeight[BlockContextWeight["AddComment"] = 20] = "AddComment";
    BlockContextWeight[BlockContextWeight["ExpandCollapse"] = 30] = "ExpandCollapse";
    BlockContextWeight[BlockContextWeight["DeleteBlock"] = 40] = "DeleteBlock";
    BlockContextWeight[BlockContextWeight["Help"] = 50] = "Help";
})(BlockContextWeight = exports.BlockContextWeight || (exports.BlockContextWeight = {}));
function registerBlockitems() {
    // Unregister the builtin options that we don't use
    Blockly.ContextMenuRegistry.registry.unregister("blockDuplicate");
    Blockly.ContextMenuRegistry.registry.unregister("blockCollapseExpand");
    Blockly.ContextMenuRegistry.registry.unregister("blockHelp");
    Blockly.ContextMenuRegistry.registry.unregister("blockInline");
    registerDuplicate();
    registerCollapseExpandBlock();
    registerHelp();
    // Fix the weights of the builtin options we do use
    // Defensiveness due to action changes in the keyboard navigation plugin.
    // Needs revisiting when actions are final.
    const blockDelete = Blockly.ContextMenuRegistry.registry.getItem("blockDelete");
    if (blockDelete) {
        blockDelete.weight = BlockContextWeight.DeleteBlock;
    }
    const blockComment = Blockly.ContextMenuRegistry.registry.getItem("blockComment");
    if (blockComment) {
        blockComment.weight = BlockContextWeight.AddComment;
    }
}
exports.registerBlockitems = registerBlockitems;
/**
 * This differs from the builtin collapse/expand in that we
 * only allow it on top level event blocks
 */
function registerCollapseExpandBlock() {
    const expandOption = {
        displayText(scope) {
            if (scope.block.isCollapsed()) {
                return pxt.U.lf("Expand Block");
            }
            else {
                return pxt.U.lf("Collapse Block");
            }
        },
        preconditionFn(scope) {
            const block = scope.block;
            const isTopBlock = block.workspace.getTopBlocks(false).some(b => b === block);
            const isEventBlock = isTopBlock && block.statementInputCount > 0 && !block.previousConnection;
            if (!isEventBlock || block.isInFlyout || !block.isMovable() || !block.workspace.options.collapse) {
                return "hidden";
            }
            return "enabled";
        },
        callback(scope) {
            if (!scope.block)
                return;
            pxt.tickEvent("blocks.context.expandCollapseBlock", undefined, { interactiveConsent: true });
            scope.block.setCollapsed(!scope.block.isCollapsed());
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'pxtExpandCollapseBlock',
        weight: BlockContextWeight.ExpandCollapse,
    };
    Blockly.ContextMenuRegistry.registry.register(expandOption);
}
/**
 * Same as the builtin help but calls our external openHelpUrl instead
 */
function registerHelp() {
    const helpOption = {
        displayText() {
            return pxt.U.lf("Help");
        },
        preconditionFn(scope) {
            const block = scope.block;
            const url = typeof block.helpUrl === 'function'
                ? block.helpUrl()
                : block.helpUrl;
            if (url) {
                return 'enabled';
            }
            return 'hidden';
        },
        callback(scope) {
            if (!scope.block)
                return;
            const block = scope.block;
            const url = typeof block.helpUrl === "function" ? block.helpUrl() : block.helpUrl;
            if (url)
                (0, external_1.openHelpUrl)(url);
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'pxtHelpBlock',
        weight: BlockContextWeight.Help,
    };
    Blockly.ContextMenuRegistry.registry.register(helpOption);
}
function registerDuplicate() {
    const duplicateOption = {
        displayText() {
            return lf("Duplicate");
        },
        preconditionFn(scope) {
            const block = scope.block;
            if (!block.isInFlyout && block.isDeletable() && block.isMovable()) {
                if (block.isDuplicatable()) {
                    return 'enabled';
                }
                return 'disabled';
            }
            return 'hidden';
        },
        callback(scope) {
            if (!scope.block)
                return;
            let duplicateOnDrag = false;
            if (scope.block.duplicateOnDrag_) {
                scope.block.duplicateOnDrag_ = false;
                duplicateOnDrag = true;
            }
            const data = scope.block.toCopyData();
            if (duplicateOnDrag) {
                scope.block.duplicateOnDrag_ = true;
            }
            if (!data)
                return;
            Blockly.clipboard.paste(data, scope.block.workspace);
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'blockDuplicate',
        weight: BlockContextWeight.Duplicate,
    };
    Blockly.ContextMenuRegistry.registry.register(duplicateOption);
}
