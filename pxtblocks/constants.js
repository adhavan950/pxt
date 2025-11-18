"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalInputWithFieldPrefix = exports.optionalDummyInputPrefix = exports.provider = void 0;
const Blockly = require("blockly");
exports.provider = new Blockly.zelos.ConstantProvider();
exports.optionalDummyInputPrefix = "0_optional_dummy";
exports.optionalInputWithFieldPrefix = "0_optional_field";
