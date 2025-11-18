"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlocksExist = void 0;
function validateBlocksExist({ usedBlocks, requiredBlockCounts }) {
    let missingBlocks = [];
    let disabledBlocks = [];
    let insufficientBlocks = [];
    let successfulBlocks = {};
    const userBlocksEnabledByType = usedBlocks === null || usedBlocks === void 0 ? void 0 : usedBlocks.reduce((acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + (block.isEnabled() ? 1 : 0);
        return acc;
    }, {});
    for (const [requiredBlockId, requiredCount] of Object.entries(requiredBlockCounts || {})) {
        const countForBlock = userBlocksEnabledByType[requiredBlockId];
        const passedBlocks = usedBlocks.filter((block) => block.isEnabled() && block.type === requiredBlockId);
        if (passedBlocks.length > 0) {
            successfulBlocks[requiredBlockId] = passedBlocks;
        }
        if (countForBlock === undefined) {
            // user did not use a specific block
            missingBlocks.push(requiredBlockId);
        }
        else if (!countForBlock) {
            // all instances of block are disabled
            disabledBlocks.push(requiredBlockId);
        }
        else if (countForBlock < requiredCount) {
            // instances of block exists, but not enough.
            insufficientBlocks.push(requiredBlockId);
        }
    }
    const passed = missingBlocks.length === 0 &&
        disabledBlocks.length === 0 &&
        insufficientBlocks.length === 0;
    return {
        missingBlocks,
        disabledBlocks,
        insufficientBlocks,
        successfulBlocks,
        passed
    };
}
exports.validateBlocksExist = validateBlocksExist;
