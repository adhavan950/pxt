"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
// Get rid of bumping behavior
Blockly.Extensions.unregister("logic_compare");
Blockly.Extensions.register("logic_compare", function () { });
