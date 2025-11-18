"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldStyledLabel = void 0;
const Blockly = require("blockly");
class FieldStyledLabel extends Blockly.FieldLabel {
    constructor(value, options, opt_validator) {
        super(value, getClass(options));
        this.isFieldCustom_ = true;
    }
    getFieldDescription() {
        return this.getText();
    }
}
exports.FieldStyledLabel = FieldStyledLabel;
function getClass(options) {
    if (options) {
        if (options.bold && options.italics) {
            return 'blocklyBoldItalicizedText';
        }
        else if (options.bold) {
            return 'blocklyBoldText';
        }
        else if (options.italics) {
            return 'blocklyItalicizedText';
        }
    }
    return undefined;
}
