"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAccessibleBlocksCopyPasteContextMenu = exports.initCopyPaste = void 0;
const Blockly = require("blockly");
const external_1 = require("./external");
const blockItems_1 = require("./contextMenu/blockItems");
const workspaceItems_1 = require("./contextMenu/workspaceItems");
const duplicateOnDrag_1 = require("./plugins/duplicateOnDrag");
let oldCopy;
let oldCut;
let oldPaste;
function initCopyPaste(accessibleBlocksEnabled, forceRefresh = false) {
    if (!(0, external_1.getCopyPasteHandlers)())
        return;
    if (oldCopy && !forceRefresh)
        return;
    const shortcuts = Blockly.ShortcutRegistry.registry.getRegistry();
    oldCopy = oldCopy || Object.assign({}, shortcuts[Blockly.ShortcutItems.names.COPY]);
    oldCut = oldCut || Object.assign({}, shortcuts[Blockly.ShortcutItems.names.CUT]);
    oldPaste = oldPaste || Object.assign({}, shortcuts[Blockly.ShortcutItems.names.PASTE]);
    Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.COPY);
    Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.CUT);
    Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.PASTE);
    registerCopy();
    registerCut();
    registerPaste();
    if (!accessibleBlocksEnabled) {
        registerCopyContextMenu();
        registerPasteContextMenu();
    }
}
exports.initCopyPaste = initCopyPaste;
function initAccessibleBlocksCopyPasteContextMenu() {
    overridePasteContextMenuItem();
    overrideCutContextMenuItem();
}
exports.initAccessibleBlocksCopyPasteContextMenu = initAccessibleBlocksCopyPasteContextMenu;
function overridePasteContextMenuItem() {
    const oldPasteOption = Blockly.ContextMenuRegistry.registry.getItem("blockPasteFromContextMenu");
    if ("separator" in oldPasteOption) {
        throw new Error(`RegistryItem ${oldPasteOption.id} is not of type ActionRegistryItem`);
    }
    ;
    const pasteOption = Object.assign(Object.assign({}, oldPasteOption), { preconditionFn: pasteContextMenuPreconditionFn });
    Blockly.ContextMenuRegistry.registry.unregister("blockPasteFromContextMenu");
    Blockly.ContextMenuRegistry.registry.register(pasteOption);
}
function overrideCutContextMenuItem() {
    const oldCutOption = Blockly.ContextMenuRegistry.registry.getItem("blockCutFromContextMenu");
    if ("separator" in oldCutOption) {
        throw new Error(`RegistryItem ${oldCutOption.id} is not of type ActionRegistryItem`);
    }
    ;
    const cutOption = Object.assign(Object.assign({}, oldCutOption), { preconditionFn: (scope) => {
            const focused = scope.focusedNode;
            if (!focused || !Blockly.isCopyable(focused))
                return "hidden";
            const workspace = focused.workspace;
            if (focused.workspace.isFlyout)
                return "hidden";
            if (!(workspace instanceof Blockly.WorkspaceSvg))
                return 'hidden';
            if (oldCut.preconditionFn(workspace, scope)) {
                return 'enabled';
            }
            return "hidden";
        } });
    Blockly.ContextMenuRegistry.registry.unregister("blockCutFromContextMenu");
    Blockly.ContextMenuRegistry.registry.register(cutOption);
}
function registerCopy() {
    const copyShortcut = {
        name: Blockly.ShortcutItems.names.COPY,
        preconditionFn(workspace, scope) {
            return runCopyPreconditionFunction(workspace, scope, oldCopy.preconditionFn);
        },
        callback: copy,
        keyCodes: oldCopy.keyCodes,
    };
    Blockly.ShortcutRegistry.registry.register(copyShortcut);
}
function registerCut() {
    const cutShortcut = {
        name: Blockly.ShortcutItems.names.CUT,
        preconditionFn(workspace, scope) {
            return runCopyPreconditionFunction(workspace, scope, oldCut.preconditionFn);
        },
        callback(workspace, e, shortcut, scope) {
            var _a;
            const handler = (_a = (0, external_1.getCopyPasteHandlers)()) === null || _a === void 0 ? void 0 : _a.cut;
            if (handler) {
                return handler(workspace, e, shortcut, scope);
            }
            return oldCut.callback(workspace, e, shortcut, scope);
        },
        keyCodes: oldCut.keyCodes,
    };
    Blockly.ShortcutRegistry.registry.register(cutShortcut);
}
function registerPaste() {
    const pasteShortcut = {
        name: Blockly.ShortcutItems.names.PASTE,
        preconditionFn(workspace, _scope) {
            // Override the paste precondition in core as it now checks
            // it's own clipboard for copy data.
            return (!workspace.isReadOnly() &&
                !workspace.isDragging() &&
                !Blockly.getFocusManager().ephemeralFocusTaken());
        },
        callback: paste,
        keyCodes: oldPaste.keyCodes,
    };
    Blockly.ShortcutRegistry.registry.register(pasteShortcut);
}
function registerCopyContextMenu() {
    const copyOption = {
        displayText: () => lf("Copy"),
        preconditionFn: (scope) => {
            const block = scope.block;
            if (block.isInFlyout || !block.isMovable() || !block.isEditable()) {
                return "hidden";
            }
            const handlers = (0, external_1.getCopyPasteHandlers)();
            if (handlers) {
                return handlers.copyPrecondition(scope);
            }
            return "enabled";
        },
        callback: function (scope, e) {
            const block = scope.block;
            if (!block)
                return;
            block.select();
            copy(block.workspace, e, undefined, scope);
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        weight: blockItems_1.BlockContextWeight.Copy,
        id: "makecode-copy-block"
    };
    const copyCommentOption = {
        displayText: () => lf("Copy"),
        preconditionFn: (scope) => {
            const comment = scope.comment;
            if (!comment.isMovable() || !comment.isEditable()) {
                return "hidden";
            }
            const handlers = (0, external_1.getCopyPasteHandlers)();
            if (handlers) {
                return handlers.copyPrecondition(scope);
            }
            return "enabled";
        },
        callback: function (scope, e) {
            const comment = scope.comment;
            if (!comment)
                return;
            comment.select();
            copy(comment.workspace, e, undefined, scope);
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.COMMENT,
        weight: blockItems_1.BlockContextWeight.Copy,
        id: "makecode-copy-comment"
    };
    if (Blockly.ContextMenuRegistry.registry.getItem(copyOption.id)) {
        Blockly.ContextMenuRegistry.registry.unregister(copyOption.id);
    }
    if (Blockly.ContextMenuRegistry.registry.getItem(copyCommentOption.id)) {
        Blockly.ContextMenuRegistry.registry.unregister(copyCommentOption.id);
    }
    Blockly.ContextMenuRegistry.registry.register(copyOption);
    Blockly.ContextMenuRegistry.registry.register(copyCommentOption);
}
function registerPasteContextMenu() {
    const pasteOption = {
        displayText: () => lf("Paste"),
        preconditionFn: pasteContextMenuPreconditionFn,
        callback: function (scope, e) {
            const workspace = scope.workspace;
            if (!workspace)
                return;
            paste(workspace, e, undefined, scope);
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        weight: workspaceItems_1.WorkspaceContextWeight.Paste,
        id: "makecode-paste"
    };
    if (Blockly.ContextMenuRegistry.registry.getItem(pasteOption.id)) {
        Blockly.ContextMenuRegistry.registry.unregister(pasteOption.id);
    }
    Blockly.ContextMenuRegistry.registry.register(pasteOption);
}
const pasteContextMenuPreconditionFn = (scope) => {
    var _a;
    if (pxt.shell.isReadOnly() || ((_a = scope.workspace) === null || _a === void 0 ? void 0 : _a.options.readOnly)) {
        return "hidden";
    }
    const handlers = (0, external_1.getCopyPasteHandlers)();
    if (handlers) {
        return handlers.pastePrecondition(scope);
    }
    return "enabled";
};
const copy = (workspace, e, shortcut, scope) => {
    var _a;
    const handler = (_a = (0, external_1.getCopyPasteHandlers)()) === null || _a === void 0 ? void 0 : _a.copy;
    if (handler) {
        return handler(workspace, e, shortcut, scope);
    }
    return oldCopy.callback(workspace, e, shortcut, scope);
};
const paste = (workspace, e, shortcut, scope) => {
    var _a;
    const handler = (_a = (0, external_1.getCopyPasteHandlers)()) === null || _a === void 0 ? void 0 : _a.paste;
    if (handler) {
        return handler(workspace, e, shortcut, scope);
    }
    return oldPaste.callback(workspace, e, shortcut, scope);
};
/**
 * This is hack to get around the fact that Blockly's isCopyable logic doesn't
 * allow blocks that are not deletable to be copied. Our duplicateOnDrag blocks
 * are not deletable, but we still want to allow them to be copied.
 */
function runCopyPreconditionFunction(workspace, scope, func) {
    const toCopy = Blockly.getFocusManager().getFocusedNode();
    if (toCopy instanceof Blockly.BlockSvg) {
        if ((0, duplicateOnDrag_1.shouldDuplicateOnDrag)(toCopy)) {
            toCopy.setDeletable(true);
        }
    }
    const result = func(workspace, scope);
    (0, duplicateOnDrag_1.updateDuplicateOnDragState)(toCopy);
    return result;
}
