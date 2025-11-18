"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlockCommentsExist = void 0;
// validates that one or more blocks comments are in the project
// returns the blocks that have comments for teacher tool scenario
function validateBlockCommentsExist({ usedBlocks, numRequired }) {
    const commentedBlocks = usedBlocks.filter((block) => !!block.getCommentText());
    return { commentedBlocks, passed: commentedBlocks.length >= numRequired };
}
exports.validateBlockCommentsExist = validateBlockCommentsExist;
