"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCollapsedInputRow = exports.CollapsedInputRow = void 0;
const Blockly = require("blockly");
class CollapsedInputRow extends Blockly.blockRendering.InputRow {
    constructor(constants) {
        super(constants);
        this.type |= Blockly.blockRendering.Types.INPUT_ROW | Blockly.blockRendering.Types.getType("COLLAPSED_INPUT_ROW");
    }
    measure() {
        this.width = this.minWidth;
        this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
    }
}
exports.CollapsedInputRow = CollapsedInputRow;
function isCollapsedInputRow(row) {
    return !!(row.type & Blockly.blockRendering.Types.getType("COLLAPSED_INPUT_ROW"));
}
exports.isCollapsedInputRow = isCollapsedInputRow;
