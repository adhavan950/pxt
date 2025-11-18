"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCopyPasteHandlers = exports.setCopyPaste = exports.openWorkspaceSearch = exports.setOpenWorkspaceSearch = exports.prompt = exports.setPrompt = exports.setOnWorkspaceContextMenu = exports.onWorkspaceContextMenu = exports.setOpenHelpUrl = exports.openHelpUrl = exports.setExtensionBlocklyPatch = exports.extensionBlocklyPatch = exports.setPromptTranslateBlock = exports.promptTranslateBlock = void 0;
const Blockly = require("blockly");
let _promptTranslateBlock;
function promptTranslateBlock(blockId, blockTranslationIds) {
    if (_promptTranslateBlock) {
        _promptTranslateBlock(blockId, blockTranslationIds);
    }
}
exports.promptTranslateBlock = promptTranslateBlock;
function setPromptTranslateBlock(impl) {
    _promptTranslateBlock = impl;
}
exports.setPromptTranslateBlock = setPromptTranslateBlock;
/**
 * This callback is populated from the editor extension result.
 * Allows a target to provide version specific blockly updates
 */
let _extensionBlocklyPatch;
function extensionBlocklyPatch(pkgTargetVersion, el) {
    if (_extensionBlocklyPatch) {
        _extensionBlocklyPatch(pkgTargetVersion, el);
    }
}
exports.extensionBlocklyPatch = extensionBlocklyPatch;
function setExtensionBlocklyPatch(impl) {
    _extensionBlocklyPatch = impl;
}
exports.setExtensionBlocklyPatch = setExtensionBlocklyPatch;
let _openHelpUrl;
function openHelpUrl(url) {
    if (_openHelpUrl) {
        _openHelpUrl(url);
    }
    else {
        window.open(url);
    }
}
exports.openHelpUrl = openHelpUrl;
function setOpenHelpUrl(impl) {
    _openHelpUrl = impl;
}
exports.setOpenHelpUrl = setOpenHelpUrl;
let _onWorkspaceContextMenu;
function onWorkspaceContextMenu(workspace, options) {
    if (_onWorkspaceContextMenu) {
        _onWorkspaceContextMenu(workspace, options);
    }
}
exports.onWorkspaceContextMenu = onWorkspaceContextMenu;
function setOnWorkspaceContextMenu(impl) {
    _onWorkspaceContextMenu = impl;
}
exports.setOnWorkspaceContextMenu = setOnWorkspaceContextMenu;
let _prompt;
function setPrompt(impl, setBlocklyAlso) {
    if (setBlocklyAlso) {
        Blockly.dialog.setPrompt(impl);
    }
    _prompt = impl;
}
exports.setPrompt = setPrompt;
function prompt(message, defaultValue, callback, options) {
    if (_prompt) {
        _prompt(message, defaultValue, callback, options);
    }
    else {
        Blockly.dialog.prompt(message, defaultValue, callback);
    }
}
exports.prompt = prompt;
let _openWorkspaceSearch;
function setOpenWorkspaceSearch(impl) {
    _openWorkspaceSearch = impl;
}
exports.setOpenWorkspaceSearch = setOpenWorkspaceSearch;
function openWorkspaceSearch() {
    if (_openWorkspaceSearch) {
        _openWorkspaceSearch();
    }
}
exports.openWorkspaceSearch = openWorkspaceSearch;
let _handleCopy;
let _handleCut;
let _handlePaste;
let _copyPre;
let _pastePre;
function setCopyPaste(copy, cut, paste, copyPrecondition, pastePrecondition) {
    _handleCopy = copy;
    _handleCut = cut;
    _handlePaste = paste;
    _copyPre = copyPrecondition;
    _pastePre = pastePrecondition;
}
exports.setCopyPaste = setCopyPaste;
function getCopyPasteHandlers() {
    if (_handleCopy) {
        return {
            copy: _handleCopy,
            cut: _handleCut,
            paste: _handlePaste,
            copyPrecondition: _copyPre,
            pastePrecondition: _pastePre,
        };
    }
    return null;
}
exports.getCopyPasteHandlers = getCopyPasteHandlers;
