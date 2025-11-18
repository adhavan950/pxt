"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlockFieldValueExists = void 0;
// validates that one or more blocks comments are in the project
// returns the blocks that have comments for teacher tool scenario
function validateBlockFieldValueExists({ usedBlocks, fieldType, fieldValue, specifiedBlock }) {
    const enabledSpecifiedBlocks = usedBlocks.filter((block) => block.isEnabled() && block.type === specifiedBlock);
    const successfulBlocks = enabledSpecifiedBlocks.filter((block) => {
        var _a;
        if (fieldType === "VAR") {
            return ((_a = block.getVarModels()) === null || _a === void 0 ? void 0 : _a[0].getName()) === fieldValue;
        }
        else {
            return block.getFieldValue(fieldType) === fieldValue;
        }
    });
    return { successfulBlocks, passed: successfulBlocks.length > 0 };
}
exports.validateBlockFieldValueExists = validateBlockFieldValueExists;
