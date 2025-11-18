"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockText = void 0;
const Blockly = require("blockly");
/**
 * Provides a string representation of the text a user would normally see on a block.
 */
function getBlockText(block) {
    const fieldValues = [];
    for (const input of block.inputList) {
        if (!input.isVisible()) {
            continue;
        }
        if (input.fieldRow.length > 0) {
            for (const field of input.fieldRow) {
                if (!field.isVisible()) {
                    continue;
                }
                const text = field.getFieldDescription
                    ? field.getFieldDescription()
                    : field.getText();
                if (text) {
                    fieldValues.push(text);
                }
            }
        }
        // Check if this input has a connected block
        if (input.connection && input.connection.targetBlock() && input.connection.type === Blockly.INPUT_VALUE) {
            const connectedBlock = input.connection.targetBlock();
            const innerBlockText = getBlockText(connectedBlock);
            if (innerBlockText) {
                fieldValues.push(`[${innerBlockText}]`);
            }
        }
    }
    return fieldValues.join(" ");
}
exports.getBlockText = getBlockText;
