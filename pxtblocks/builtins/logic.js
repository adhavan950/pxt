"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogic = void 0;
const Blockly = require("blockly");
const help_1 = require("../help");
function initLogic() {
    const msg = Blockly.Msg;
    // builtin controls_if
    const controlsIfId = "controls_if";
    const controlsIfDef = pxt.blocks.getBlockDefinition(controlsIfId);
    const controlsIfTooltips = controlsIfDef.tooltip;
    msg.CONTROLS_IF_MSG_IF = controlsIfDef.block["CONTROLS_IF_MSG_IF"];
    msg.CONTROLS_IF_MSG_THEN = controlsIfDef.block["CONTROLS_IF_MSG_THEN"];
    msg.CONTROLS_IF_MSG_ELSE = controlsIfDef.block["CONTROLS_IF_MSG_ELSE"];
    msg.CONTROLS_IF_MSG_ELSEIF = controlsIfDef.block["CONTROLS_IF_MSG_ELSEIF"];
    msg.CONTROLS_IF_TOOLTIP_1 = controlsIfTooltips["CONTROLS_IF_TOOLTIP_1"];
    msg.CONTROLS_IF_TOOLTIP_2 = controlsIfTooltips["CONTROLS_IF_TOOLTIP_2"];
    msg.CONTROLS_IF_TOOLTIP_3 = controlsIfTooltips["CONTROLS_IF_TOOLTIP_3"];
    msg.CONTROLS_IF_TOOLTIP_4 = controlsIfTooltips["CONTROLS_IF_TOOLTIP_4"];
    (0, help_1.installBuiltinHelpInfo)(controlsIfId);
    // builtin logic_compare
    const logicCompareId = "logic_compare";
    const logicCompareDef = pxt.blocks.getBlockDefinition(logicCompareId);
    const logicCompareTooltips = logicCompareDef.tooltip;
    msg.LOGIC_COMPARE_TOOLTIP_EQ = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_EQ"];
    msg.LOGIC_COMPARE_TOOLTIP_NEQ = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_NEQ"];
    msg.LOGIC_COMPARE_TOOLTIP_LT = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_LT"];
    msg.LOGIC_COMPARE_TOOLTIP_LTE = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_LTE"];
    msg.LOGIC_COMPARE_TOOLTIP_GT = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_GT"];
    msg.LOGIC_COMPARE_TOOLTIP_GTE = logicCompareTooltips["LOGIC_COMPARE_TOOLTIP_GTE"];
    (0, help_1.installBuiltinHelpInfo)(logicCompareId);
    // builtin logic_operation
    const logicOperationId = "logic_operation";
    const logicOperationDef = pxt.blocks.getBlockDefinition(logicOperationId);
    const logicOperationTooltips = logicOperationDef.tooltip;
    msg.LOGIC_OPERATION_AND = logicOperationDef.block["LOGIC_OPERATION_AND"];
    msg.LOGIC_OPERATION_OR = logicOperationDef.block["LOGIC_OPERATION_OR"];
    msg.LOGIC_OPERATION_TOOLTIP_AND = logicOperationTooltips["LOGIC_OPERATION_TOOLTIP_AND"];
    msg.LOGIC_OPERATION_TOOLTIP_OR = logicOperationTooltips["LOGIC_OPERATION_TOOLTIP_OR"];
    (0, help_1.installBuiltinHelpInfo)(logicOperationId);
    // builtin logic_negate
    const logicNegateId = "logic_negate";
    const logicNegateDef = pxt.blocks.getBlockDefinition(logicNegateId);
    msg.LOGIC_NEGATE_TITLE = logicNegateDef.block["LOGIC_NEGATE_TITLE"];
    (0, help_1.installBuiltinHelpInfo)(logicNegateId);
    // builtin logic_boolean
    const logicBooleanId = "logic_boolean";
    const logicBooleanDef = pxt.blocks.getBlockDefinition(logicBooleanId);
    msg.LOGIC_BOOLEAN_TRUE = logicBooleanDef.block["LOGIC_BOOLEAN_TRUE"];
    msg.LOGIC_BOOLEAN_FALSE = logicBooleanDef.block["LOGIC_BOOLEAN_FALSE"];
    (0, help_1.installBuiltinHelpInfo)(logicBooleanId);
}
exports.initLogic = initLogic;
