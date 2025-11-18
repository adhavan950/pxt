"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monkeyPatchBlockSvg = void 0;
const Blockly = require("blockly");
const field_imagenotext_1 = require("../fields/field_imagenotext");
const constants_1 = require("../plugins/renderer/constants");
function monkeyPatchBlockSvg() {
    const oldSetCollapsed = Blockly.BlockSvg.prototype.setCollapsed;
    Blockly.BlockSvg.prototype.setCollapsed = function (collapsed) {
        if (collapsed === this.isCollapsed())
            return;
        oldSetCollapsed.call(this, collapsed);
        if (this.isCollapsed()) {
            const input = this.getInput(Blockly.constants.COLLAPSED_INPUT_NAME);
            const image = constants_1.ConstantProvider.EXPAND_IMAGE_DATAURI;
            if (image) {
                input.appendField(new field_imagenotext_1.FieldImageNoText(image, 24, 24, "", () => {
                    this.setCollapsed(false);
                }, false));
            }
        }
    };
}
exports.monkeyPatchBlockSvg = monkeyPatchBlockSvg;
