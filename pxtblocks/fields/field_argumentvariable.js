"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldArgumentVariable = void 0;
const Blockly = require("blockly");
/**
 * Subclass of FieldVariable to filter out the "delete" option when
 * variables are part of a function argument (or else the whole function
 * gets deleted).
*/
class FieldArgumentVariable extends Blockly.FieldVariable {
    constructor(varName) {
        super(varName);
        this.menuGenerator_ = this.generateMenu;
    }
    generateMenu() {
        const options = Blockly.FieldVariable.dropdownCreate.call(this);
        return options.filter((opt) => opt[1] != Blockly.DELETE_VARIABLE_ID);
    }
}
exports.FieldArgumentVariable = FieldArgumentVariable;
