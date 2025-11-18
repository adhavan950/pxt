"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpecificBlockCommentsExist = void 0;
// validates that all of a specific block type have comments
// returns the blocks that do not have comments for a tutorial validation scenario
function validateSpecificBlockCommentsExist({ usedBlocks, blockType }) {
    const allSpecifcBlocks = usedBlocks.filter((block) => block.type === blockType);
    const uncommentedBlocks = allSpecifcBlocks.filter((block) => !block.getCommentText());
    const passed = allSpecifcBlocks.length === 0 ? false : uncommentedBlocks.length === 0;
    return { uncommentedBlocks, passed };
}
exports.validateSpecificBlockCommentsExist = validateSpecificBlockCommentsExist;
