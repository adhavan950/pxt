"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFunctionMutation = void 0;
const Blockly = require("blockly");
const commonFunctionMixin_1 = require("../commonFunctionMixin");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const fieldAutocapitalizeTextInput_1 = require("../fields/fieldAutocapitalizeTextInput");
const functionManager_1 = require("../functionManager");
const msg_1 = require("../msg");
const FUNCTION_DECLARATION_MIXIN = Object.assign(Object.assign({}, commonFunctionMixin_1.COMMON_FUNCTION_MIXIN), { populateArgument_: function (arg, connectionMap, input) {
        const argumentEditor = this.createArgumentEditor_(arg.type, arg.name);
        // Attach the block.
        input.connection.connect(argumentEditor.outputConnection);
    }, addFunctionLabel_: function (text) {
        const nameField = new fieldAutocapitalizeTextInput_1.FieldAutocapitalizeTextInput(text || "", undefined, {
            spellcheck: false,
            disableAutocapitalize: true,
        });
        this.appendDummyInput("function_name").appendField(nameField, "function_name");
    }, updateFunctionLabel_: function (text) {
        Blockly.Events.disable();
        this.getField("function_name").setValue(text);
        Blockly.Events.enable();
    }, createArgumentEditor_: function (argumentType, displayName) {
        Blockly.Events.disable();
        let newBlock;
        try {
            let blockType = "";
            switch (argumentType) {
                case "boolean":
                    blockType = constants_1.ARGUMENT_EDITOR_BOOLEAN_BLOCK_TYPE;
                    break;
                case "number":
                    blockType = constants_1.ARGUMENT_EDITOR_NUMBER_BLOCK_TYPE;
                    break;
                case "string":
                    blockType = constants_1.ARGUMENT_EDITOR_STRING_BLOCK_TYPE;
                    break;
                case "Array":
                    blockType = constants_1.ARGUMENT_EDITOR_ARRAY_BLOCK_TYPE;
                    break;
                default:
                    blockType = constants_1.ARGUMENT_EDITOR_CUSTOM_BLOCK_TYPE;
            }
            if (blockType == constants_1.ARGUMENT_EDITOR_CUSTOM_BLOCK_TYPE) {
                newBlock = (0, utils_1.createCustomArgumentEditor)(argumentType, this.workspace);
            }
            else {
                newBlock = this.workspace.newBlock(blockType);
            }
            newBlock.setFieldValue(displayName, "TEXT");
            newBlock.setShadow(true);
            if (!this.isInsertionMarker() && newBlock instanceof Blockly.BlockSvg) {
                newBlock.initSvg();
                newBlock.queueRender();
            }
        }
        finally {
            Blockly.Events.enable();
        }
        return newBlock;
    }, async focusLastEditorAsync_() {
        // The argument editor block might still be rendering.
        // Wait for the render queue to finish so that the centerOnBlock
        // function is able to correctly position the editor scroll.
        await Blockly.renderManagement.finishQueuedRenders();
        if (this.inputList.length > 0) {
            let newInput = this.inputList[this.inputList.length - 2];
            if (newInput.type == Blockly.inputs.inputTypes.DUMMY) {
                const workspace = this.workspace;
                if (workspace instanceof Blockly.WorkspaceSvg) {
                    workspace.centerOnBlock(this.id, true);
                }
                newInput.fieldRow[0].showEditor();
            }
            else if (newInput.type == Blockly.inputs.inputTypes.VALUE) {
                // Inspect the argument editor.
                const target = newInput.connection.targetBlock();
                const workspace = target.workspace;
                if (workspace instanceof Blockly.WorkspaceSvg) {
                    workspace.centerOnBlock(target.id, true);
                }
                target.getField("TEXT").showEditor();
            }
        }
    },
    removeFieldCallback(field) {
        let inputNameToRemove = null;
        for (let n = 0; n < this.inputList.length; n++) {
            if (inputNameToRemove) {
                break;
            }
            let input = this.inputList[n];
            if (input.connection) {
                let target = input.connection.targetBlock();
                if (!target) {
                    continue;
                }
                if (target.getField(field.name) === field) {
                    inputNameToRemove = input.name;
                }
            }
            else {
                for (let j = 0; j < input.fieldRow.length; j++) {
                    if (input.fieldRow[j] == field) {
                        inputNameToRemove = input.name;
                    }
                }
            }
        }
        if (inputNameToRemove) {
            Blockly.WidgetDiv.hide();
            this.removeInput(inputNameToRemove);
            this.updateFunctionSignature();
            this.updateDisplay_();
        }
    },
    addParam_(typeName, defaultName) {
        Blockly.WidgetDiv.hide();
        const argName = (0, utils_1.findUniqueParamName)(defaultName, this.arguments_.map((a) => a.name));
        this.arguments_.push({
            id: Blockly.utils.idGenerator.genUid(),
            name: argName,
            type: typeName,
        });
        this.updateDisplay_();
        /* await */ this.focusLastEditorAsync_();
    },
    addBooleanExternal() {
        this.addParam_("boolean", Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_BOOLEAN_ARG_NAME]);
    },
    addStringExternal() {
        this.addParam_("string", Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_STRING_ARG_NAME]);
    },
    addNumberExternal() {
        this.addParam_("number", Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_NUMBER_ARG_NAME]);
    },
    addArrayExternal() {
        this.addParam_("Array", Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_ARRAY_ARG_NAME]);
    },
    addCustomExternal(typeName) {
        this.addParam_(typeName, functionManager_1.FunctionManager.getInstance().getArgumentNameForType(typeName));
    },
    updateFunctionSignature() {
        this.arguments_ = [];
        // Start iterating at 1 to skip the function label
        for (let i = 1; i < this.inputList.length; i++) {
            const input = this.inputList[i];
            switch (input.type) {
                case Blockly.inputs.inputTypes.STATEMENT:
                    // Nothing to save
                    break;
                case Blockly.inputs.inputTypes.DUMMY:
                    // This is the function name text input. Previously stored in the text
                    // attribute (now deprecated), so we check both text and value
                    this.name_ = input.fieldRow[0].getValue() || input.fieldRow[0].getText();
                    break;
                case Blockly.inputs.inputTypes.VALUE:
                    // Inspect the argument editor to add the argument to our mutation.
                    const target = input.connection.targetBlock();
                    this.arguments_.push({
                        id: input.name,
                        name: target.getFieldValue("TEXT"),
                        type: target.getTypeName(),
                    });
                    break;
                default:
                    pxt.warn("Unexpected input type on a function mutator root: " + input.type);
            }
        }
    } });
function newFunctionMutation(destWs) {
    // Ensure the default function name is unique.
    const defaultName = (0, utils_1.findLegalName)(Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_FUNCTION_NAME], destWs);
    const mutation = Blockly.utils.xml.createElement("mutation");
    mutation.setAttribute("name", defaultName);
    mutation.setAttribute("functionid", Blockly.utils.idGenerator.genUid());
    return mutation;
}
exports.newFunctionMutation = newFunctionMutation;
Blockly.Blocks[constants_1.FUNCTION_DECLARATION_BLOCK_TYPE] = Object.assign(Object.assign({}, FUNCTION_DECLARATION_MIXIN), { init: function () {
        this.jsonInit({
            style: {
                hat: "cap",
            },
        });
        this.name_ = "";
        this.arguments_ = [];
        this.functionId_ = "";
        this.createAllInputs_();
        this.setColour(Blockly.Msg[msg_1.MsgKey.PROCEDURES_HUE]);
        this.setStatements_(true);
        this.setDeletable(false);
        this.setMovable(false);
        this.contextMenu = false;
        this.setInputsInline(true);
    } });
