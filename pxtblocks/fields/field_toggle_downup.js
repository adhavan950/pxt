"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleDownUp = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleDownUp extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("DOWN"), lf("UP"), opt_validator);
    }
}
exports.FieldToggleDownUp = FieldToggleDownUp;
