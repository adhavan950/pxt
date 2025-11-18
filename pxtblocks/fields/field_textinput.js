"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTextInput = void 0;
const Blockly = require("blockly");
class FieldTextInput extends Blockly.FieldTextInput {
    constructor(value, options, opt_validator) {
        super(value, opt_validator);
        this.isFieldCustom_ = true;
    }
    getFieldDescription() {
        return this.getValue();
    }
}
exports.FieldTextInput = FieldTextInput;
