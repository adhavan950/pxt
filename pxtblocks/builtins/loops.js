"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLoops = void 0;
const Blockly = require("blockly");
const help_1 = require("../help");
const duplicateOnDrag_1 = require("../plugins/duplicateOnDrag");
function initLoops() {
    const msg = Blockly.Msg;
    // controls_repeat_ext
    const controlsRepeatExtId = "controls_repeat_ext";
    const controlsRepeatExtDef = pxt.blocks.getBlockDefinition(controlsRepeatExtId);
    msg.CONTROLS_REPEAT_TITLE = controlsRepeatExtDef.block["CONTROLS_REPEAT_TITLE"];
    msg.CONTROLS_REPEAT_INPUT_DO = controlsRepeatExtDef.block["CONTROLS_REPEAT_INPUT_DO"];
    (0, help_1.installBuiltinHelpInfo)(controlsRepeatExtId);
    // device_while
    const deviceWhileId = "device_while";
    const deviceWhileDef = pxt.blocks.getBlockDefinition(deviceWhileId);
    Blockly.Blocks[deviceWhileId] = {
        init: function () {
            this.jsonInit({
                "message0": deviceWhileDef.block["message0"],
                "args0": [
                    {
                        "type": "input_value",
                        "name": "COND",
                        "check": "Boolean"
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.getNamespaceColor('loops')
            });
            this.appendStatementInput("DO")
                .appendField(deviceWhileDef.block["appendField"]);
            (0, help_1.setBuiltinHelpInfo)(this, deviceWhileId);
        }
    };
    // pxt_controls_for
    const pxtControlsForId = "pxt_controls_for";
    const pxtControlsForDef = pxt.blocks.getBlockDefinition(pxtControlsForId);
    Blockly.Blocks[pxtControlsForId] = {
        /**
         * Block for 'for' loop.
         * @this Blockly.Block
         */
        init: function () {
            this.jsonInit({
                "message0": pxtControlsForDef.block["message0"],
                "args0": [
                    {
                        "type": "input_value",
                        "name": "VAR",
                        "variable": pxtControlsForDef.block["variable"],
                        "check": "Variable"
                    },
                    {
                        "type": "input_value",
                        "name": "TO",
                        "check": "Number"
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.getNamespaceColor('loops'),
                "inputsInline": true
            });
            this.appendStatementInput('DO')
                .appendField(pxtControlsForDef.block["appendField"]);
            let thisBlock = this;
            (0, help_1.setHelpResources)(this, pxtControlsForId, pxtControlsForDef.name, function () {
                return pxt.U.rlf(pxtControlsForDef.tooltip, thisBlock.getInputTargetBlock('VAR') ? thisBlock.getInputTargetBlock('VAR').getField('VAR').getText() : '');
            }, pxtControlsForDef.url, String(pxt.toolbox.getNamespaceColor('loops')));
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<string>} List of variable names.
         * @this Blockly.Block
         */
        getVars: function () {
            return [this.getField('VAR').getText()];
        },
        /**
         * Notification that a variable is renaming.
         * If the name matches one of this block's variables, rename it.
         * @param {string} oldName Previous name of variable.
         * @param {string} newName Renamed variable.
         * @this Blockly.Block
         */
        renameVar: function (oldName, newName) {
            const varField = this.getField('VAR');
            if (Blockly.Names.equals(oldName, varField.getText())) {
                varField.setValue(newName);
            }
        }
    };
    (0, duplicateOnDrag_1.setDuplicateOnDrag)(pxtControlsForId, "VAR");
    // controls_simple_for
    const controlsSimpleForId = "controls_simple_for";
    const controlsSimpleForDef = pxt.blocks.getBlockDefinition(controlsSimpleForId);
    Blockly.Blocks[controlsSimpleForId] = {
        /**
         * Block for 'for' loop.
         * @this Blockly.Block
         */
        init: function () {
            this.jsonInit({
                "message0": controlsSimpleForDef.block["message0"],
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR",
                        "variable": controlsSimpleForDef.block["variable"],
                        "variableTypes": [""],
                        // Please note that most multilingual characters
                        // cannot be used as variable name at this point.
                        // Translate or decide the default variable name
                        // with care.
                    },
                    {
                        "type": "input_value",
                        "name": "TO",
                        "check": "Number"
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.getNamespaceColor('loops'),
                "inputsInline": true
            });
            this.appendStatementInput('DO')
                .appendField(controlsSimpleForDef.block["appendField"]);
            let thisBlock = this;
            (0, help_1.setHelpResources)(this, controlsSimpleForId, controlsSimpleForDef.name, function () {
                return pxt.U.rlf(controlsSimpleForDef.tooltip, thisBlock.getField('VAR').getText());
            }, controlsSimpleForDef.url, String(pxt.toolbox.getNamespaceColor('loops')));
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<string>} List of variable names.
         * @this Blockly.Block
         */
        getVars: function () {
            return [this.getField('VAR').getText()];
        },
        /**
         * Notification that a variable is renaming.
         * If the name matches one of this block's variables, rename it.
         * @param {string} oldName Previous name of variable.
         * @param {string} newName Renamed variable.
         * @this Blockly.Block
         */
        renameVar: function (oldName, newName) {
            const varField = this.getField('VAR');
            if (Blockly.Names.equals(oldName, varField.getText())) {
                varField.setValue(newName);
            }
        },
        /**
         * Add menu option to create getter block for loop variable.
         * @param {!Array} options List of menu options to add to.
         * @this Blockly.Block
         */
        customContextMenu: function (options) {
            var _a, _b;
            if (!this.isCollapsed() && !((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly)) {
                let option = { enabled: true };
                let name = this.getField('VAR').getText();
                option.text = lf("Create 'get {0}'", name);
                let xmlField = Blockly.utils.xml.createElement('field');
                xmlField.textContent = name;
                xmlField.setAttribute('name', 'VAR');
                let xmlBlock = Blockly.utils.xml.createElement('block');
                xmlBlock.setAttribute('type', 'variables_get');
                xmlBlock.appendChild(xmlField);
                option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                options.push(option);
            }
        }
    };
    // break statement
    const breakBlockDef = pxt.blocks.getBlockDefinition(ts.pxtc.TS_BREAK_TYPE);
    Blockly.Blocks[pxtc.TS_BREAK_TYPE] = {
        init: function () {
            const color = pxt.toolbox.getNamespaceColor('loops');
            this.jsonInit({
                "message0": breakBlockDef.block["message0"],
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": color
            });
            (0, help_1.setHelpResources)(this, ts.pxtc.TS_BREAK_TYPE, breakBlockDef.name, breakBlockDef.tooltip, breakBlockDef.url, color, undefined /*colourSecondary*/, undefined /*colourTertiary*/, false /*undeletable*/);
        }
    };
    // continue statement
    const continueBlockDef = pxt.blocks.getBlockDefinition(ts.pxtc.TS_CONTINUE_TYPE);
    Blockly.Blocks[pxtc.TS_CONTINUE_TYPE] = {
        init: function () {
            const color = pxt.toolbox.getNamespaceColor('loops');
            this.jsonInit({
                "message0": continueBlockDef.block["message0"],
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": color
            });
            (0, help_1.setHelpResources)(this, ts.pxtc.TS_CONTINUE_TYPE, continueBlockDef.name, continueBlockDef.tooltip, continueBlockDef.url, color, undefined /*colourSecondary*/, undefined /*colourTertiary*/, false /*undeletable*/);
        }
    };
    const collapsedColor = "#cccccc";
    Blockly.Blocks[pxtc.COLLAPSED_BLOCK] = {
        init: function () {
            this.jsonInit({
                "message0": "...",
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": collapsedColor
            });
            (0, help_1.setHelpResources)(this, ts.pxtc.COLLAPSED_BLOCK, "...", lf("a few blocks"), undefined, collapsedColor, undefined /*colourSecondary*/, undefined /*colourTertiary*/, false /*undeletable*/);
        }
    };
    // pxt_controls_for_of
    const pxtControlsForOfId = "pxt_controls_for_of";
    const pxtControlsForOfDef = pxt.blocks.getBlockDefinition(pxtControlsForOfId);
    Blockly.Blocks[pxtControlsForOfId] = {
        init: function () {
            this.jsonInit({
                "message0": pxtControlsForOfDef.block["message0"],
                "args0": [
                    {
                        "type": "input_value",
                        "name": "VAR",
                        "variable": pxtControlsForOfDef.block["variable"],
                        "check": "Variable"
                    },
                    {
                        "type": "input_value",
                        "name": "LIST",
                        "check": ["Array", "String"]
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.blockColors['loops'],
                "inputsInline": true
            });
            this.appendStatementInput('DO')
                .appendField(pxtControlsForOfDef.block["appendField"]);
            let thisBlock = this;
            (0, help_1.setHelpResources)(this, pxtControlsForOfId, pxtControlsForOfDef.name, function () {
                return pxt.Util.rlf(pxtControlsForOfDef.tooltip, thisBlock.getInputTargetBlock('VAR') ? thisBlock.getInputTargetBlock('VAR').getField('VAR').getText() : '');
            }, pxtControlsForOfDef.url, String(pxt.toolbox.getNamespaceColor('loops')));
        }
    };
    (0, duplicateOnDrag_1.setDuplicateOnDrag)(pxtControlsForOfId, "VAR");
    // controls_for_of
    const controlsForOfId = "controls_for_of";
    const controlsForOfDef = pxt.blocks.getBlockDefinition(controlsForOfId);
    Blockly.Blocks[controlsForOfId] = {
        init: function () {
            this.jsonInit({
                "message0": controlsForOfDef.block["message0"],
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR",
                        "variable": controlsForOfDef.block["variable"],
                        "variableTypes": [""],
                        // Please note that most multilingual characters
                        // cannot be used as variable name at this point.
                        // Translate or decide the default variable name
                        // with care.
                    },
                    {
                        "type": "input_value",
                        "name": "LIST",
                        "check": "Array"
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.blockColors['loops'],
                "inputsInline": true
            });
            this.appendStatementInput('DO')
                .appendField(controlsForOfDef.block["appendField"]);
            let thisBlock = this;
            (0, help_1.setHelpResources)(this, controlsForOfId, controlsForOfDef.name, function () {
                return pxt.Util.rlf(controlsForOfDef.tooltip, thisBlock.getField('VAR').getText());
            }, controlsForOfDef.url, String(pxt.toolbox.getNamespaceColor('loops')));
        }
    };
}
exports.initLoops = initLoops;
