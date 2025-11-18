"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOnStart = void 0;
const Blockly = require("blockly");
const fields_1 = require("../fields");
const help_1 = require("../help");
function initOnStart() {
    // on_start
    const onStartDef = pxt.blocks.getBlockDefinition(ts.pxtc.ON_START_TYPE);
    Blockly.Blocks[ts.pxtc.ON_START_TYPE] = {
        init: function () {
            var _a;
            let colorOverride = (_a = pxt.appTarget.runtime) === null || _a === void 0 ? void 0 : _a.onStartColor;
            if (colorOverride) {
                colorOverride = pxt.toolbox.getAccessibleBackground(colorOverride);
            }
            this.jsonInit({
                "message0": onStartDef.block["message0"],
                "args0": [
                    {
                        "type": "input_dummy"
                    },
                    {
                        "type": "input_statement",
                        "name": "HANDLER"
                    }
                ],
                "colour": colorOverride || pxt.toolbox.getNamespaceColor('loops')
            });
            (0, help_1.setHelpResources)(this, ts.pxtc.ON_START_TYPE, onStartDef.name, onStartDef.tooltip, onStartDef.url, colorOverride || pxt.toolbox.getNamespaceColor('loops'), undefined, undefined, pxt.appTarget.runtime ? pxt.appTarget.runtime.onStartUnDeletable : false);
        }
    };
    Blockly.Blocks[pxtc.TS_STATEMENT_TYPE] = {
        init: function () {
            let that = this;
            that.setColour("#717171");
            that.setPreviousStatement(true);
            that.setNextStatement(true);
            that.setInputsInline(false);
            let pythonMode;
            let lines;
            that.domToMutation = (element) => {
                const n = parseInt(element.getAttribute("numlines"));
                that.declaredVariables = element.getAttribute("declaredvars");
                lines = [];
                for (let i = 0; i < n; i++) {
                    const line = element.getAttribute("line" + i);
                    lines.push(line);
                }
                // Add the initial TS inputs
                that.setPythonEnabled(false);
            };
            that.mutationToDom = () => {
                let mutation = document.createElement("mutation");
                if (lines) {
                    lines.forEach((line, index) => mutation.setAttribute("line" + index, line));
                    mutation.setAttribute("numlines", lines.length.toString());
                }
                if (that.declaredVariables) {
                    mutation.setAttribute("declaredvars", this.declaredVariables);
                }
                return mutation;
            };
            // Consumed by the webapp
            that.setPythonEnabled = (enabled) => {
                if (pythonMode === enabled)
                    return;
                // Remove all inputs
                while (that.inputList.length) {
                    that.removeInput(that.inputList[0].name);
                }
                pythonMode = enabled;
                if (enabled) {
                    // This field must be named LINE0 because otherwise Blockly will crash
                    // when trying to make an insertion marker. All insertion marker blocks
                    // need to have the same fields as the real block, and this field will
                    // always be created by domToMutation regardless of TS or Python mode
                    that.appendDummyInput().appendField(pxt.Util.lf("<python code>"), "LINE0");
                    that.setTooltip(lf("A Python statement that could not be converted to blocks"));
                }
                else {
                    lines.forEach((line, index) => {
                        that.appendDummyInput().appendField(line, "LINE" + index);
                    });
                    that.setTooltip(lf("A JavaScript statement that could not be converted to blocks"));
                }
            };
            // Consumed by BlocklyCompiler
            that.getLines = () => lines;
            that.setEditable(false);
            (0, help_1.setHelpResources)(this, pxtc.TS_STATEMENT_TYPE, lf("JavaScript statement"), lf("A JavaScript statement that could not be converted to blocks"), '/blocks/javascript-blocks', '#717171');
        }
    };
    Blockly.Blocks[pxtc.TS_OUTPUT_TYPE] = {
        init: function () {
            let that = this;
            that.setColour("#717171");
            that.setPreviousStatement(false);
            that.setNextStatement(false);
            that.setOutput(true);
            that.setEditable(false);
            that.appendDummyInput().appendField(new fields_1.FieldTsExpression(""), "EXPRESSION");
            that.setPythonEnabled = (enabled) => {
                that.getField("EXPRESSION").setPythonEnabled(enabled);
                if (enabled) {
                    that.setTooltip(lf("A Python expression that could not be converted to blocks"));
                }
                else {
                    that.setTooltip(lf("A JavaScript expression that could not be converted to blocks"));
                }
            };
            (0, help_1.setHelpResources)(that, pxtc.TS_OUTPUT_TYPE, lf("JavaScript expression"), lf("A JavaScript expression that could not be converted to blocks"), '/blocks/javascript-blocks', "#717171");
        }
    };
    if (pxt.appTarget.runtime && pxt.appTarget.runtime.pauseUntilBlock) {
        const blockOptions = pxt.appTarget.runtime.pauseUntilBlock;
        const blockDef = pxt.blocks.getBlockDefinition(ts.pxtc.PAUSE_UNTIL_TYPE);
        Blockly.Blocks[pxtc.PAUSE_UNTIL_TYPE] = {
            init: function () {
                const color = blockOptions.color || pxt.toolbox.getNamespaceColor('loops');
                this.jsonInit({
                    "message0": blockDef.block["message0"],
                    "args0": [
                        {
                            "type": "input_value",
                            "name": "PREDICATE",
                            "check": "Boolean"
                        }
                    ],
                    "inputsInline": true,
                    "previousStatement": null,
                    "nextStatement": null,
                    "colour": color
                });
                (0, help_1.setHelpResources)(this, ts.pxtc.PAUSE_UNTIL_TYPE, blockDef.name, blockDef.tooltip, blockDef.url, color, undefined /*colourSecondary*/, undefined /*colourTertiary*/, false /*undeletable*/);
            }
        };
    }
}
exports.initOnStart = initOnStart;
