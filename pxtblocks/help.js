"use strict";
/// <reference path="../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachCardInfo = exports.mkCard = exports.installHelpResources = exports.setHelpResources = exports.installBuiltinHelpInfo = exports.setBuiltinHelpInfo = void 0;
const Blockly = require("blockly");
const xml_1 = require("./xml");
const external_1 = require("./external");
const toolbox_1 = require("./toolbox");
const duplicateOnDrag_1 = require("./plugins/duplicateOnDrag");
function setBuiltinHelpInfo(block, id) {
    const info = pxt.blocks.getBlockDefinition(id);
    setHelpResources(block, id, info.name, info.tooltip, info.url, pxt.toolbox.getNamespaceColor(info.category));
}
exports.setBuiltinHelpInfo = setBuiltinHelpInfo;
function installBuiltinHelpInfo(id) {
    const info = pxt.blocks.getBlockDefinition(id);
    installHelpResources(id, info.name, info.tooltip, info.url, pxt.toolbox.getNamespaceColor(info.category));
}
exports.installBuiltinHelpInfo = installBuiltinHelpInfo;
function setHelpResources(block, id, name, tooltip, url, colour, colourSecondary, colourTertiary, undeletable) {
    if (tooltip && (typeof tooltip === "string" || typeof tooltip === "function"))
        block.setTooltip(tooltip);
    if (url)
        block.setHelpUrl(url);
    if (colour)
        block.setColour(colour);
    if (undeletable)
        block.setDeletable(false);
    (0, duplicateOnDrag_1.setDuplicateOnDragStrategy)(block);
    let tb = document.getElementById('blocklyToolboxDefinition');
    let xml = tb ? (0, xml_1.getFirstChildWithAttr)(tb, "block", "type", id) : undefined;
    block.codeCard = {
        header: name,
        name: name,
        software: 1,
        description: typeof tooltip === "function" ? tooltip(block) : tooltip,
        blocksXml: xml ? (`<xml xmlns="http://www.w3.org/1999/xhtml">` + ((0, xml_1.cleanOuterHTML)(xml) || `<block type="${id}"></block>`) + "</xml>") : undefined,
        url: url
    };
    if (pxt.Util.isTranslationMode()) {
        block.customContextMenu = (options) => {
            const blockd = pxt.blocks.getBlockDefinition(block.type);
            if (blockd && blockd.translationIds) {
                options.push({
                    enabled: true,
                    text: lf("Translate this block"),
                    callback: function () {
                        (0, external_1.promptTranslateBlock)(id, blockd.translationIds);
                    }
                });
            }
        };
    }
}
exports.setHelpResources = setHelpResources;
function installHelpResources(id, name, tooltip, url, colour, colourSecondary, colourTertiary) {
    let block = Blockly.Blocks[id];
    let old = block.init;
    if (!old)
        return;
    block.init = function () {
        old.call(this);
        setHelpResources(this, id, name, tooltip, url, colour, colourSecondary, colourTertiary);
    };
}
exports.installHelpResources = installHelpResources;
function mkCard(fn, blockXml) {
    return {
        name: fn.namespace + '.' + fn.name,
        shortName: fn.name,
        description: fn.attributes.jsDoc,
        url: fn.attributes.help ? 'reference/' + fn.attributes.help.replace(/^\//, '') : undefined,
        blocksXml: `<xml xmlns="http://www.w3.org/1999/xhtml">${(0, xml_1.cleanOuterHTML)(blockXml)}</xml>`,
    };
}
exports.mkCard = mkCard;
function attachCardInfo(blockInfo, qName) {
    const toModify = blockInfo.apis.byQName[qName];
    if (toModify) {
        const comp = pxt.blocks.compileInfo(toModify);
        const xml = (0, toolbox_1.createToolboxBlock)(blockInfo, toModify, comp);
        return mkCard(toModify, xml);
    }
}
exports.attachCardInfo = attachCardInfo;
