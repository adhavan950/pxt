"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMathRoundBlock = exports.initMathOpBlock = exports.initMath = void 0;
const Blockly = require("blockly");
const help_1 = require("../help");
const constants_1 = require("../constants");
const composableMutations_1 = require("../composableMutations");
const field_dropdown_1 = require("../fields/field_dropdown");
function initMath(blockInfo) {
    // math_op2
    const mathOp2Id = "math_op2";
    const mathOp2qName = "Math.min"; // TODO: implement logic so that this changes based on which is used (min or max)
    const mathOp2Def = pxt.blocks.getBlockDefinition(mathOp2Id);
    const mathOp2Tooltips = mathOp2Def.tooltip;
    Blockly.Blocks[mathOp2Id] = {
        init: function () {
            this.jsonInit({
                "message0": lf("%1 of %2 and %3"),
                "args0": [
                    {
                        "type": "field_dropdown",
                        "name": "op",
                        "options": [
                            [lf("{id:op}min"), "min"],
                            [lf("{id:op}max"), "max"]
                        ]
                    },
                    {
                        "type": "input_value",
                        "name": "x",
                        "check": "Number"
                    },
                    {
                        "type": "input_value",
                        "name": "y",
                        "check": "Number"
                    }
                ],
                "inputsInline": true,
                "output": "Number",
                "outputShape": constants_1.provider.SHAPES.ROUND,
                "colour": pxt.toolbox.getNamespaceColor('math')
            });
            (0, help_1.setHelpResources)(this, mathOp2Id, mathOp2Def.name, function (block) {
                return mathOp2Tooltips[block.getFieldValue('op')];
            }, mathOp2Def.url, pxt.toolbox.getNamespaceColor(mathOp2Def.category));
        },
        codeCard: (0, help_1.attachCardInfo)(blockInfo, mathOp2qName)
    };
    // math_op3
    const mathOp3Id = "math_op3";
    const mathOp3Def = pxt.blocks.getBlockDefinition(mathOp3Id);
    const mathOp3qName = "Math.abs";
    Blockly.Blocks[mathOp3Id] = {
        init: function () {
            this.jsonInit({
                "message0": mathOp3Def.block["message0"],
                "args0": [
                    {
                        "type": "input_value",
                        "name": "x",
                        "check": "Number"
                    }
                ],
                "inputsInline": true,
                "output": "Number",
                "outputShape": constants_1.provider.SHAPES.ROUND,
                "colour": pxt.toolbox.getNamespaceColor('math')
            });
            (0, help_1.setBuiltinHelpInfo)(this, mathOp3Id);
        },
        codeCard: (0, help_1.attachCardInfo)(blockInfo, mathOp3qName)
    };
    // builtin math_number, math_integer, math_whole_number, math_number_minmax
    //XXX Integer validation needed.
    const numberBlocks = ['math_number', 'math_integer', 'math_whole_number', 'math_number_minmax'];
    numberBlocks.forEach(num_id => {
        const mInfo = pxt.blocks.getBlockDefinition(num_id);
        (0, help_1.installHelpResources)(num_id, mInfo.name, mInfo.tooltip, mInfo.url, "#fff", "#fff", "#fff");
    });
    // builtin math_arithmetic
    const msg = Blockly.Msg;
    const mathArithmeticId = "math_arithmetic";
    const mathArithmeticDef = pxt.blocks.getBlockDefinition(mathArithmeticId);
    const mathArithmeticTooltips = mathArithmeticDef.tooltip;
    msg.MATH_ADDITION_SYMBOL = mathArithmeticDef.block["MATH_ADDITION_SYMBOL"];
    msg.MATH_SUBTRACTION_SYMBOL = mathArithmeticDef.block["MATH_SUBTRACTION_SYMBOL"];
    msg.MATH_MULTIPLICATION_SYMBOL = mathArithmeticDef.block["MATH_MULTIPLICATION_SYMBOL"];
    msg.MATH_DIVISION_SYMBOL = mathArithmeticDef.block["MATH_DIVISION_SYMBOL"];
    msg.MATH_POWER_SYMBOL = mathArithmeticDef.block["MATH_POWER_SYMBOL"];
    (0, help_1.installHelpResources)(mathArithmeticId, mathArithmeticDef.name, function (block) {
        return mathArithmeticTooltips[block.getFieldValue('OP')];
    }, mathArithmeticDef.url, pxt.toolbox.getNamespaceColor(mathArithmeticDef.category));
    // builtin math_modulo
    const mathModuloId = "math_modulo";
    const mathModuloDef = pxt.blocks.getBlockDefinition(mathModuloId);
    msg.MATH_MODULO_TITLE = mathModuloDef.block["MATH_MODULO_TITLE"];
    (0, help_1.installBuiltinHelpInfo)(mathModuloId);
    initMathOpBlock();
    initMathRoundBlock();
}
exports.initMath = initMath;
function initMathOpBlock() {
    const allOperations = pxt.blocks.MATH_FUNCTIONS.unary.concat(pxt.blocks.MATH_FUNCTIONS.binary).concat(pxt.blocks.MATH_FUNCTIONS.infix);
    const mathOpId = "math_js_op";
    const mathOpDef = pxt.blocks.getBlockDefinition(mathOpId);
    Blockly.Blocks[mathOpId] = {
        init: function () {
            const b = this;
            b.setPreviousStatement(false);
            b.setNextStatement(false);
            b.setOutput(true, "Number");
            b.setOutputShape(constants_1.provider.SHAPES.ROUND);
            b.setInputsInline(true);
            const ddi = b.appendDummyInput("op_dropdown");
            ddi.appendField(new field_dropdown_1.FieldDropdown(allOperations.map(op => [mathOpDef.block[op], op]), (op) => onOperatorSelect(b, op)), "OP");
            addArgInput(b, false);
            // Because the shape of inputs changes, we need a mutation. Technically the op tells us
            // how many inputs we should have but we can't read its value at init time
            (0, composableMutations_1.appendMutation)(b, {
                mutationToDom: mutation => {
                    let infix;
                    for (let i = 0; i < b.inputList.length; i++) {
                        const input = b.inputList[i];
                        if (input.name === "op_dropdown") {
                            infix = false;
                            break;
                        }
                        else if (input.name === "ARG0") {
                            infix = true;
                            break;
                        }
                    }
                    mutation.setAttribute("op-type", (b.getInput("ARG1") ? (infix ? "infix" : "binary") : "unary").toString());
                    return mutation;
                },
                domToMutation: saved => {
                    if (saved.hasAttribute("op-type")) {
                        const type = saved.getAttribute("op-type");
                        if (type != "unary") {
                            addArgInput(b, true);
                        }
                        changeInputOrder(b, type === "infix");
                    }
                }
            });
        }
    };
    (0, help_1.installHelpResources)(mathOpId, mathOpDef.name, function (block) {
        return mathOpDef.tooltip[block.getFieldValue("OP")];
    }, mathOpDef.url, pxt.toolbox.getNamespaceColor(mathOpDef.category));
    function onOperatorSelect(b, op) {
        if (isUnaryOp(op)) {
            b.removeInput("ARG1", true);
        }
        else if (!b.getInput("ARG1")) {
            addArgInput(b, true);
        }
        changeInputOrder(b, isInfixOp(op));
        return op;
    }
    function addArgInput(b, second) {
        const i = b.appendValueInput("ARG" + (second ? 1 : 0));
        i.setCheck("Number");
        if (second) {
            i.connection.setShadowDom(numberShadowDom());
            i.connection.respawnShadow_();
        }
    }
    function changeInputOrder(b, infix) {
        let hasTwoArgs = !!b.getInput("ARG1");
        if (infix) {
            if (hasTwoArgs) {
                b.moveInputBefore("op_dropdown", "ARG1");
            }
            b.moveInputBefore("ARG0", "op_dropdown");
        }
        else {
            if (hasTwoArgs) {
                b.moveInputBefore("ARG0", "ARG1");
            }
            b.moveInputBefore("op_dropdown", "ARG0");
        }
    }
}
exports.initMathOpBlock = initMathOpBlock;
function isUnaryOp(op) {
    return pxt.blocks.MATH_FUNCTIONS.unary.indexOf(op) !== -1;
}
function isInfixOp(op) {
    return pxt.blocks.MATH_FUNCTIONS.infix.indexOf(op) !== -1;
}
let cachedDom;
function numberShadowDom() {
    // <shadow type="math_number"><field name="NUM">0</field></shadow>
    if (!cachedDom) {
        cachedDom = document.createElement("shadow");
        cachedDom.setAttribute("type", "math_number");
        const field = document.createElement("field");
        field.setAttribute("name", "NUM");
        field.textContent = "0";
        cachedDom.appendChild(field);
    }
    return cachedDom;
}
function initMathRoundBlock() {
    const allOperations = pxt.blocks.ROUNDING_FUNCTIONS;
    const mathRoundId = "math_js_round";
    const mathRoundDef = pxt.blocks.getBlockDefinition(mathRoundId);
    Blockly.Blocks[mathRoundId] = {
        init: function () {
            const b = this;
            b.setPreviousStatement(false);
            b.setNextStatement(false);
            b.setOutput(true, "Number");
            b.setOutputShape(constants_1.provider.SHAPES.ROUND);
            b.setInputsInline(true);
            const ddi = b.appendDummyInput("round_dropdown");
            ddi.appendField(new field_dropdown_1.FieldDropdown(allOperations.map(op => [mathRoundDef.block[op], op])), "OP");
            addArgInput(b);
        }
    };
    (0, help_1.installHelpResources)(mathRoundId, mathRoundDef.name, function (block) {
        return mathRoundDef.tooltip[block.getFieldValue("OP")];
    }, mathRoundDef.url, pxt.toolbox.getNamespaceColor(mathRoundDef.category));
    function addArgInput(b) {
        const i = b.appendValueInput("ARG0");
        i.setCheck("Number");
    }
}
exports.initMathRoundBlock = initMathRoundBlock;
