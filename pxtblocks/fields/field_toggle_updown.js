"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleUpDown = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleUpDown extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("UP"), lf("DOWN"), opt_validator);
    }
}
exports.FieldToggleUpDown = FieldToggleUpDown;
