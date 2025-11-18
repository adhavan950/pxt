"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleHighLow = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleHighLow extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("HIGH"), lf("LOW"), opt_validator);
    }
}
exports.FieldToggleHighLow = FieldToggleHighLow;
