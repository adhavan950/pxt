"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleYesNo = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleYesNo extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("Yes"), lf("No"), opt_validator);
    }
}
exports.FieldToggleYesNo = FieldToggleYesNo;
