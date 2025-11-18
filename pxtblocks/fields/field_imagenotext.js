"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldImageNoText = void 0;
const Blockly = require("blockly");
/**
 * An image field on the block that does not have a text label.
 * These do not produce text for display strings, but may have a visual element (like an expand button).
 */
class FieldImageNoText extends Blockly.FieldImage {
    constructor(src, width, height, alt, onClick, flipRtl, config) {
        super(src, width, height, alt, onClick, flipRtl, config);
        this.isFieldCustom_ = true;
    }
    getFieldDescription() {
        return undefined;
    }
    showEditor_() {
        super.showEditor_();
        const sourceBlock = this.getSourceBlock();
        if (sourceBlock instanceof Blockly.BlockSvg) {
            Blockly.getFocusManager().focusNode(this.getSourceBlock());
        }
    }
}
exports.FieldImageNoText = FieldImageNoText;
