"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleOnOff = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleOnOff extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("ON"), lf("OFF"), opt_validator);
    }
}
exports.FieldToggleOnOff = FieldToggleOnOff;
