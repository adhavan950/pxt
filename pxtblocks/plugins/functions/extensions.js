"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
const utils_1 = require("./utils");
const msg_1 = require("./msg");
const svgs_1 = require("./svgs");
const provider = new Blockly.zelos.ConstantProvider();
function outputNumber() {
    this.setInputsInline(true);
    this.setOutputShape(provider.SHAPES.ROUND);
    this.setOutput(true, "Number");
}
function outputString() {
    this.setInputsInline(true);
    this.setOutputShape(provider.SHAPES.ROUND);
    this.setOutput(true, "String");
}
function outputBoolean() {
    this.setInputsInline(true);
    this.setOutputShape(provider.SHAPES.HEXAGONAL);
    this.setOutput(true, "Boolean");
}
function outputArray() {
    this.setInputsInline(true);
    this.setOutputShape(provider.SHAPES.ROUND);
    this.setOutput(true, "Array");
}
function textFieldColor() {
    if (this.workspace instanceof Blockly.WorkspaceSvg) {
        const constants = this.workspace.getRenderer().getConstants();
        this.setColour(constants.FIELD_BORDER_RECT_COLOUR);
    }
    else {
        this.setColour("#fff");
    }
}
function inlineSvgs() {
    this.ADD_IMAGE_DATAURI = svgs_1.ADD_IMAGE_DATAURI;
    this.REMOVE_IMAGE_DATAURI = svgs_1.REMOVE_IMAGE_DATAURI;
}
const contextMenuEditMixin = {
    customContextMenu: function (menuOptions) {
        var _a, _b;
        const gtdOption = {
            enabled: !((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly),
            text: Blockly.Msg[msg_1.MsgKey.FUNCTIONS_GO_TO_DEFINITION_OPTION],
            callback: () => {
                const functionName = this.getField("function_name").getText();
                const definition = (0, utils_1.getDefinition)(functionName, this.workspace);
                if (definition && this.workspace instanceof Blockly.WorkspaceSvg) {
                    this.workspace.centerOnBlock(definition.id, true);
                }
            },
        };
        menuOptions.push(gtdOption);
    },
};
const variableReporterMixin = {
    /**
     * Add menu option to create getter/setter block for this setter/getter.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        if (this.isCollapsed()) {
            return;
        }
        const renameOption = {
            text: Blockly.Msg.RENAME_VARIABLE,
            enabled: !this.workspace.options.readOnly,
            callback: () => {
                const workspace = this.workspace;
                const variable = this.getField('VAR').getVariable();
                Blockly.Variables.renameVariable(workspace, variable);
            }
        };
        options.unshift(renameOption);
        if (!this.isInFlyout) {
            const variablesList = this.workspace.getVariableMap().getVariablesOfType('');
            // FIXME (riknoll): Probably need to make a custom field to make this work again
            // if (variablesList.length > 0) {
            //     const separator = { separator: true };
            //     options.unshift(separator);
            // }
            for (const variable of variablesList) {
                const option = {
                    enabled: !this.workspace.options.readOnly,
                    text: variable.getName(),
                    callback: () => {
                        let variableField = this.getField('VAR');
                        if (!variableField) {
                            pxt.log("Tried to get a variable field on the wrong type of block.");
                        }
                        variableField.setValue(variable.getId());
                    }
                };
                options.unshift(option);
            }
        }
    }
};
// pxt-blockly: Register functions-related extensions
Blockly.Extensions.registerMixin("function_contextmenu_edit", contextMenuEditMixin);
Blockly.Extensions.registerMixin("contextMenu_variableReporter", variableReporterMixin);
Blockly.Extensions.register("output_number", outputNumber);
Blockly.Extensions.register("output_string", outputString);
Blockly.Extensions.register("output_boolean", outputBoolean);
Blockly.Extensions.register("output_array", outputArray);
Blockly.Extensions.register("text_field_color", textFieldColor);
Blockly.Extensions.register("inline-svgs", inlineSvgs);
