"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
const commonFunctionMixin_1 = require("../commonFunctionMixin");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const fieldAutocapitalizeTextInput_1 = require("../fields/fieldAutocapitalizeTextInput");
const msg_1 = require("../msg");
const functionManager_1 = require("../functionManager");
const svgs_1 = require("../svgs");
const duplicateOnDrag_1 = require("../../duplicateOnDrag");
const field_imagenotext_1 = require("../../../fields/field_imagenotext");
const FUNCTION_DEFINITION_MIXIN = Object.assign(Object.assign({}, commonFunctionMixin_1.COMMON_FUNCTION_MIXIN), { populateArgument_: function (arg, connectionMap, input) {
        let oldBlock = null;
        if (connectionMap === null || connectionMap === void 0 ? void 0 : connectionMap[arg.id]) {
            const saveInfo = connectionMap[arg.id];
            oldBlock = saveInfo.block;
        }
        let argumentReporter;
        // Decide which block to attach.
        if (connectionMap && oldBlock && !oldBlock.isDisposed()) {
            // Update the text if needed. The old argument reporter is the same type,
            // and on the same input, but the argument's display name may have changed.
            argumentReporter = oldBlock;
            argumentReporter.setFieldValue(arg.name, "VALUE");
            delete connectionMap[input.name];
        }
        else {
            argumentReporter = this.createArgumentReporter_(arg);
        }
        // Attach the block.
        input.connection.connect(argumentReporter.outputConnection);
    }, afterWorkspaceLoad: function () {
        for (const input of this.inputList) {
            if (input.type !== Blockly.inputs.inputTypes.VALUE)
                continue;
            const argument = this.arguments_.find(a => a.id === input.name);
            if (!argument)
                continue;
            let target = input.connection.targetBlock();
            if (!target) {
                this.populateArgument_(argument, null, input);
                target = input.connection.targetBlock();
            }
            target.setFieldValue(argument.name, "VALUE");
            if (target.isShadow()) {
                target.setShadow(false);
            }
            input.setShadowDom(null);
        }
    }, addFunctionLabel_: function (text) {
        const nameField = new fieldAutocapitalizeTextInput_1.FieldAutocapitalizeTextInput(text || "", utils_1.rename, {
            spellcheck: false,
            disableAutocapitalize: true,
        });
        this.appendDummyInput("function_name").appendField(nameField, "function_name");
    }, updateFunctionLabel_: function (text) {
        Blockly.Events.disable();
        this.getField("function_name").setValue(text);
        Blockly.Events.enable();
    }, createArgumentReporter_: function (arg) {
        let blockType = "";
        switch (arg.type) {
            case "boolean":
                blockType = constants_1.ARGUMENT_REPORTER_BOOLEAN_BLOCK_TYPE;
                break;
            case "number":
                blockType = constants_1.ARGUMENT_REPORTER_NUMBER_BLOCK_TYPE;
                break;
            case "string":
                blockType = constants_1.ARGUMENT_REPORTER_STRING_BLOCK_TYPE;
                break;
            case "Array":
                blockType = constants_1.ARGUMENT_REPORTER_ARRAY_BLOCK_TYPE;
                break;
            default:
                blockType = constants_1.ARGUMENT_REPORTER_CUSTOM_BLOCK_TYPE;
        }
        Blockly.Events.disable();
        let newBlock;
        try {
            if (blockType == constants_1.ARGUMENT_REPORTER_CUSTOM_BLOCK_TYPE) {
                newBlock = (0, utils_1.createCustomArgumentReporter)(arg.type, this.workspace);
            }
            else {
                newBlock = this.workspace.newBlock(blockType);
            }
            newBlock.setFieldValue(arg.name, "VALUE");
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
    }, customContextMenu: function (menuOptions) {
        var _a, _b;
        if (this.isInFlyout || ((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly))
            return;
        menuOptions.push(this.makeEditOption());
        menuOptions.push(this.makeCallOption());
    }, makeEditOption: function () {
        var _a, _b;
        return {
            enabled: !((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly),
            text: Blockly.Msg.FUNCTIONS_EDIT_OPTION,
            callback: () => {
                editFunctionCallback(this);
            }
        };
    }, makeCallOption: function () {
        var _a, _b;
        const functionName = this.getName();
        const mutation = Blockly.utils.xml.createElement("mutation");
        mutation.setAttribute("name", functionName);
        const callBlock = Blockly.utils.xml.createElement("block");
        callBlock.appendChild(mutation);
        callBlock.setAttribute("type", constants_1.FUNCTION_CALL_BLOCK_TYPE);
        return {
            enabled: this.workspace.remainingCapacity() > 0 && !((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly),
            text: Blockly.Msg.FUNCTIONS_CREATE_CALL_OPTION.replace("%1", functionName),
            callback: Blockly.ContextMenu.callbackFactory(this, callBlock),
        };
    } });
Blockly.Blocks[constants_1.FUNCTION_DEFINITION_BLOCK_TYPE] = Object.assign(Object.assign({}, FUNCTION_DEFINITION_MIXIN), { init: function () {
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
        this.setTooltip(Blockly.Msg[msg_1.MsgKey.PROCEDURES_DEFNORETURN_TOOLTIP]);
        this.setHelpUrl(Blockly.Msg[msg_1.MsgKey.PROCEDURES_DEFNORETURN_HELPURL]);
        this.setStatements_(true);
        this.setInputsInline(true);
        if (this.workspace.options.collapse) {
            const image = svgs_1.COLLAPSE_IMAGE_DATAURI;
            this.appendDummyInput("function_collapse").appendField(new field_imagenotext_1.FieldImageNoText(image, 24, 24, "", () => {
                this.setCollapsed(true);
            }, false));
        }
    } });
(0, duplicateOnDrag_1.setDuplicateOnDrag)(constants_1.FUNCTION_DEFINITION_BLOCK_TYPE);
function editFunctionCallback(block) {
    // Edit can come from either the function definition or a function call.
    // Normalize by setting the block to the definition block for the function.
    if (block.type == constants_1.FUNCTION_CALL_BLOCK_TYPE || block.type == constants_1.FUNCTION_CALL_OUTPUT_BLOCK_TYPE) {
        // This is a call block, find the definition block corresponding to the
        // name. Make sure to search the correct workspace, call block can be in flyout.
        const workspaceToSearch = block.workspace;
        block = (0, utils_1.getDefinition)(block.getName(), workspaceToSearch);
    }
    // "block" now refers to the function definition block, it is safe to proceed.
    Blockly.hideChaff();
    if (Blockly.getSelected()) {
        Blockly.getSelected().unselect();
    }
    functionManager_1.FunctionManager.getInstance().editFunctionExternal(block.mutationToDom(), mutation => {
        if (mutation) {
            (0, utils_1.mutateCallersAndDefinition)(block.getName(), block.workspace, mutation);
            block.updateDisplay_();
        }
        setTimeout(() => {
            if (block.afterWorkspaceLoad) {
                block.afterWorkspaceLoad();
            }
        });
    });
}
