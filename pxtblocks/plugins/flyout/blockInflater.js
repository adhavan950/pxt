"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFlyoutRecyclableBlockInflater = exports.HIDDEN_CLASS_NAME = void 0;
const Blockly = require("blockly");
exports.HIDDEN_CLASS_NAME = "pxtFlyoutHidden";
class MultiFlyoutRecyclableBlockInflater extends Blockly.BlockFlyoutInflater {
    constructor() {
        super(...arguments);
        this.keyToBlock = new Map();
        this.blockToKey = new Map();
    }
    static register() {
        Blockly.registry.register(Blockly.registry.Type.FLYOUT_INFLATER, "block", MultiFlyoutRecyclableBlockInflater, true);
    }
    isBlockRecycleable(block) {
        switch (block.type) {
            case "variables_get":
            case "variables_set":
            case "variables_change":
                return false;
        }
        return true;
    }
    createBlock(blockDefinition, workspace) {
        const key = getKeyForBlock(blockDefinition);
        if (!key) {
            return super.createBlock(blockDefinition, workspace);
        }
        let block;
        if (this.keyToBlock.has(key)) {
            block = this.keyToBlock.get(key);
            this.keyToBlock.delete(key);
        }
        block = block !== null && block !== void 0 ? block : super.createBlock(blockDefinition, workspace);
        this.blockToKey.set(block, key);
        block.removeClass(exports.HIDDEN_CLASS_NAME);
        block.setDisabledReason(false, exports.HIDDEN_CLASS_NAME);
        return block;
    }
    disposeItem(item) {
        const element = item.getElement();
        if (element instanceof Blockly.BlockSvg) {
            if (this.blockToKey.has(element)) {
                if (this.isBlockRecycleable(element)) {
                    this.recycleBlock(element);
                    return;
                }
                this.blockToKey.delete(element);
            }
        }
        super.disposeItem(item);
    }
    clearCache() {
        this.blockToKey = new Map();
        this.keyToBlock = new Map();
    }
    recycleBlock(block) {
        const xy = block.getRelativeToSurfaceXY();
        block.moveBy(-xy.x, -xy.y);
        block.addClass(exports.HIDDEN_CLASS_NAME);
        block.setDisabledReason(true, exports.HIDDEN_CLASS_NAME);
        const key = this.blockToKey.get(block);
        this.keyToBlock.set(key, block);
        this.removeListeners(block.id);
    }
}
exports.MultiFlyoutRecyclableBlockInflater = MultiFlyoutRecyclableBlockInflater;
function getKeyForBlock(blockDefinition) {
    // all of pxt's flyouts use blockxml
    if (blockDefinition.blockxml) {
        if (typeof blockDefinition.blockxml === "string") {
            return blockDefinition.blockxml;
        }
        else {
            return Blockly.Xml.domToText(blockDefinition.blockxml);
        }
    }
    return blockDefinition.type;
}
Blockly.Css.register(`
.${exports.HIDDEN_CLASS_NAME} {
    display: none;
}
`);
