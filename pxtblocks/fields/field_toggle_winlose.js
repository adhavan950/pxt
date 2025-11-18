"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldToggleWinLose = void 0;
const field_toggle_1 = require("./field_toggle");
class FieldToggleWinLose extends field_toggle_1.BaseFieldToggle {
    constructor(state, params, opt_validator) {
        super(state, params, lf("WIN"), lf("LOSE"), opt_validator);
    }
}
exports.FieldToggleWinLose = FieldToggleWinLose;
