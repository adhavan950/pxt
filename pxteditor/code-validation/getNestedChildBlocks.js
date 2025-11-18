"use strict";
/// <reference path="../../localtypings/validatorPlan.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedChildBlocks = void 0;
// returns the directly nested children of a block
// for blocks with a mouth, it returns the blocks inside the mouth and its inputs, if any
// for something like pick random, it would return the two number blocks
function getNestedChildBlocks(parentBlock) {
    const descendants = parentBlock.getDescendants(true);
    const nestedChildren = descendants.filter((block) => block.isEnabled() && block.getSurroundParent() === parentBlock);
    return nestedChildren;
}
exports.getNestedChildBlocks = getNestedChildBlocks;
