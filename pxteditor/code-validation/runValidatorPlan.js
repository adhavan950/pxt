"use strict";
/// <reference path="../../localtypings/validatorPlan.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidatorPlan = void 0;
const validateBlockFieldValueExists_1 = require("./validateBlockFieldValueExists");
const validateBlocksExist_1 = require("./validateBlocksExist");
const validateBlocksInSetExist_1 = require("./validateBlocksInSetExist");
const validateCommentsExist_1 = require("./validateCommentsExist");
const validateSpecificBlockCommentsExist_1 = require("./validateSpecificBlockCommentsExist");
const getNestedChildBlocks_1 = require("./getNestedChildBlocks");
const validateVariableUsage_1 = require("./validateVariableUsage");
function runValidatorPlan(usedBlocks, plan, planLib) {
    const startTime = Date.now();
    let checksSucceeded = 0;
    let successfulBlocks = [];
    for (const check of plan.checks) {
        let checkPassed = false;
        switch (check.validator) {
            case "blocksExist":
                [successfulBlocks, checkPassed] = [...runBlocksExistValidation(usedBlocks, check)];
                break;
            case "blockCommentsExist":
                checkPassed = runValidateBlockCommentsExist(usedBlocks, check);
                break;
            case "specificBlockCommentsExist":
                checkPassed = runValidateSpecificBlockCommentsExist(usedBlocks, check);
                break;
            case "blocksInSetExist":
                [successfulBlocks, checkPassed] = [...runBlocksInSetExistValidation(usedBlocks, check)];
                break;
            case "blockFieldValueExists":
                [successfulBlocks, checkPassed] = [...runBlockFieldValueExistsValidation(usedBlocks, check)];
                break;
            case "variableUsage":
                [successfulBlocks, checkPassed] = [...runVariableUsageValidation(usedBlocks, check)];
                break;
            default:
                pxt.debug(`Unrecognized validator: ${check.validator}`);
                pxt.tickEvent("validation.unrecognized_validator", { validator: check.validator });
                return {
                    executionSuccess: false,
                    executionErrorMsg: lf("Unrecognized evaluation rule")
                };
        }
        if (checkPassed && check.childValidatorPlans) {
            for (const planName of check.childValidatorPlans) {
                let timesPassed = 0;
                for (const parentBlock of successfulBlocks) {
                    const blocksToUse = (0, getNestedChildBlocks_1.getNestedChildBlocks)(parentBlock);
                    const childPlan = planLib.find((plan) => plan.name === planName);
                    const childPassed = runValidatorPlan(blocksToUse, childPlan, planLib);
                    timesPassed += childPassed ? 1 : 0;
                }
                checkPassed = checkPassed && timesPassed > 0;
            }
        }
        checksSucceeded += checkPassed ? 1 : 0;
    }
    const passed = checksSucceeded >= plan.threshold;
    pxt.tickEvent("validation.evaluation_complete", {
        plan: plan.name,
        durationMs: Date.now() - startTime,
        passed: `${passed}`,
    });
    return {
        result: passed,
        executionSuccess: true
    };
}
exports.runValidatorPlan = runValidatorPlan;
function runBlocksExistValidation(usedBlocks, inputs) {
    const requiredBlockCounts = inputs.blockCounts.reduce((acc, info) => {
        acc[info.blockId] = info.count;
        return acc;
    }, {});
    const blockResults = (0, validateBlocksExist_1.validateBlocksExist)({ usedBlocks, requiredBlockCounts });
    let successfulBlocks = [];
    if (blockResults.passed) {
        for (const blockCount of inputs.blockCounts) {
            const blockId = blockCount.blockId;
            successfulBlocks.push(...blockResults.successfulBlocks[blockId]);
        }
    }
    return [successfulBlocks, blockResults.passed];
}
function runValidateBlockCommentsExist(usedBlocks, inputs) {
    const blockResults = (0, validateCommentsExist_1.validateBlockCommentsExist)({ usedBlocks, numRequired: inputs.count });
    return blockResults.passed;
}
function runValidateSpecificBlockCommentsExist(usedBlocks, inputs) {
    const blockResults = (0, validateSpecificBlockCommentsExist_1.validateSpecificBlockCommentsExist)({ usedBlocks, blockType: inputs.blockType });
    return blockResults.passed;
}
function runBlocksInSetExistValidation(usedBlocks, inputs) {
    const blockResults = (0, validateBlocksInSetExist_1.validateBlocksInSetExist)({ usedBlocks, blockIdsToCheck: inputs.blocks, count: inputs.count });
    return [blockResults.successfulBlocks, blockResults.passed];
}
function runBlockFieldValueExistsValidation(usedBlocks, inputs) {
    const blockResults = (0, validateBlockFieldValueExists_1.validateBlockFieldValueExists)({
        usedBlocks,
        fieldType: inputs.fieldType,
        fieldValue: inputs.fieldValue,
        specifiedBlock: inputs.blockType
    });
    return [blockResults.successfulBlocks, blockResults.passed];
}
function runVariableUsageValidation(usedBlocks, inputs) {
    const blockResults = (0, validateVariableUsage_1.validateVariableUsage)({
        usedBlocks,
        count: inputs.count,
        name: inputs.name
    });
    // Flatten the map of passing variable definition blocks
    const passingVarDefinitions = [];
    for (const blocks of blockResults.passingVarDefinitions.values()) {
        passingVarDefinitions.push(...blocks);
    }
    return [passingVarDefinitions, blockResults.passed];
}
