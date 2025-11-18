"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVariables = exports.CREATE_VAR_BTN_ID = void 0;
const Blockly = require("blockly");
const toolbox_1 = require("../toolbox");
const help_1 = require("../help");
exports.CREATE_VAR_BTN_ID = 'create-variable-btn';
function initVariables() {
    let varname = lf("{id:var}item");
    Blockly.Variables.flyoutCategory = flyoutCategory;
    Blockly.Variables.flyoutCategoryBlocks = function (workspace) {
        let variableModelList = workspace.getVariableMap().getVariablesOfType('');
        let xmlList = [];
        if (variableModelList.length > 0) {
            let mostRecentVariable = variableModelList[variableModelList.length - 1];
            variableModelList.sort(Blockly.Variables.compareByName);
            // variables getters first
            for (let i = 0; i < variableModelList.length; i++) {
                const variable = variableModelList[i];
                if (Blockly.Blocks['variables_get']) {
                    const block = (0, toolbox_1.mkVariableFieldBlock)("variables_get", variable.getId(), variable.getType(), variable.getName(), false);
                    block.setAttribute("gap", "8");
                    xmlList.push(block);
                }
            }
            xmlList[xmlList.length - 1].setAttribute('gap', '24');
            if (Blockly.Blocks['variables_change'] || Blockly.Blocks['variables_set']) {
                xmlList.unshift((0, toolbox_1.createFlyoutGroupLabel)(lf("Your Variables")));
            }
            if (Blockly.Blocks['variables_change']) {
                let gap = Blockly.Blocks['variables_get'] ? 20 : 8;
                const block = (0, toolbox_1.mkVariableFieldBlock)("variables_change", mostRecentVariable.getId(), mostRecentVariable.getType(), mostRecentVariable.getName(), false);
                block.setAttribute("gap", gap + "");
                {
                    let value = Blockly.utils.xml.createElement('value');
                    value.setAttribute('name', 'VALUE');
                    let shadow = Blockly.utils.xml.createElement('shadow');
                    shadow.setAttribute("type", "math_number");
                    value.appendChild(shadow);
                    let field = Blockly.utils.xml.createElement('field');
                    field.setAttribute('name', 'NUM');
                    field.appendChild(document.createTextNode("1"));
                    shadow.appendChild(field);
                    block.appendChild(value);
                }
                xmlList.unshift(block);
            }
            if (Blockly.Blocks['variables_set']) {
                let gap = Blockly.Blocks['variables_change'] ? 8 : 24;
                const block = (0, toolbox_1.mkVariableFieldBlock)("variables_set", mostRecentVariable.getId(), mostRecentVariable.getType(), mostRecentVariable.getName(), false);
                block.setAttribute("gap", gap + "");
                {
                    let value = Blockly.utils.xml.createElement('value');
                    value.setAttribute('name', 'VALUE');
                    let shadow = Blockly.utils.xml.createElement('shadow');
                    shadow.setAttribute("type", "math_number");
                    value.appendChild(shadow);
                    let field = Blockly.utils.xml.createElement('field');
                    field.setAttribute('name', 'NUM');
                    field.appendChild(document.createTextNode("0"));
                    shadow.appendChild(field);
                    block.appendChild(value);
                }
                xmlList.unshift(block);
            }
        }
        return xmlList;
    };
    // builtin variables_get
    const msg = Blockly.Msg;
    const variablesGetId = "variables_get";
    const variablesGetDef = pxt.blocks.getBlockDefinition(variablesGetId);
    msg.VARIABLES_GET_CREATE_SET = variablesGetDef.block["VARIABLES_GET_CREATE_SET"];
    Blockly.Blocks[variablesGetId] = {
        init: function () {
            this.jsonInit({
                "type": "variables_get",
                "message0": "%1",
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR",
                        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
                        "variableTypes": [""],
                    },
                ],
                "output": null,
                "style": "variable_blocks",
                "helpUrl": "%{BKY_VARIABLES_GET_HELPURL}",
                "tooltip": "%{BKY_VARIABLES_GET_TOOLTIP}",
                "extensions": ["contextMenu_variableSetterGetter"],
            });
            (0, help_1.setBuiltinHelpInfo)(this, variablesGetId);
        }
    };
    const variablesReporterGetId = "variables_get_reporter";
    (0, help_1.installBuiltinHelpInfo)(variablesReporterGetId);
    // Dropdown menu of variables_get
    msg.RENAME_VARIABLE = lf("Rename variable...");
    msg.DELETE_VARIABLE = lf("Delete the \"%1\" variable");
    msg.DELETE_VARIABLE_CONFIRMATION = lf("Delete %1 uses of the \"%2\" variable?");
    msg.NEW_VARIABLE_DROPDOWN = lf("New variable...");
    // builtin variables_set
    const variablesSetId = "variables_set";
    const variablesSetDef = pxt.blocks.getBlockDefinition(variablesSetId);
    msg.VARIABLES_SET = variablesSetDef.block["VARIABLES_SET"];
    msg.VARIABLES_DEFAULT_NAME = varname;
    msg.VARIABLES_SET_CREATE_GET = lf("Create 'get %1'");
    Blockly.Blocks[variablesSetId] = {
        init: function () {
            this.jsonInit({
                "type": "variables_set",
                "message0": "%{BKY_VARIABLES_SET}",
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR",
                        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
                        "variableTypes": [""],
                    },
                    {
                        "type": "input_value",
                        "name": "VALUE",
                    },
                ],
                "previousStatement": null,
                "nextStatement": null,
                "style": "variable_blocks",
                "tooltip": "%{BKY_VARIABLES_SET_TOOLTIP}",
                "helpUrl": "%{BKY_VARIABLES_SET_HELPURL}",
                "extensions": ["contextMenu_variableSetterGetter"],
            });
            (0, help_1.setBuiltinHelpInfo)(this, variablesSetId);
        }
    };
    // pxt variables_change
    const variablesChangeId = "variables_change";
    const variablesChangeDef = pxt.blocks.getBlockDefinition(variablesChangeId);
    Blockly.Blocks[variablesChangeId] = {
        init: function () {
            this.jsonInit({
                "message0": variablesChangeDef.block["message0"],
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR",
                        "variable": varname,
                        "variableTypes": [""]
                    },
                    {
                        "type": "input_value",
                        "name": "VALUE",
                        "check": "Number"
                    }
                ],
                "inputsInline": true,
                "previousStatement": null,
                "nextStatement": null,
                "colour": pxt.toolbox.getNamespaceColor('variables')
            });
            (0, help_1.setBuiltinHelpInfo)(this, variablesChangeId);
        },
        /**
         * Add menu option to create getter block for this variable
         * @param {!Array} options List of menu options to add to.
         * @this Blockly.Block
         */
        customContextMenu: function (options) {
            var _a, _b;
            if (!((_b = (_a = this.workspace) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.readOnly) && !this.isInFlyout) {
                let option = {
                    enabled: this.workspace.remainingCapacity() > 0
                };
                let name = this.getField("VAR").getText();
                option.text = lf("Create 'get {0}'", name);
                let xmlField = Blockly.utils.xml.createElement('field');
                xmlField.textContent = name;
                xmlField.setAttribute('name', 'VAR');
                let xmlBlock = Blockly.utils.xml.createElement('block');
                xmlBlock.setAttribute('type', "variables_get");
                xmlBlock.appendChild(xmlField);
                option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                options.push(option);
            }
        }
    };
    // New variable dialog
    msg.NEW_VARIABLE_TITLE = lf("New variable name:");
    // Rename variable dialog
    msg.RENAME_VARIABLE_TITLE = lf("Rename all '%1' variables to:");
}
exports.initVariables = initVariables;
function flyoutCategory(workspace, useXml) {
    let xmlList = [];
    if (!pxt.appTarget.appTheme.hideFlyoutHeadings) {
        // Add the Heading label
        const headingLabel = (0, toolbox_1.createFlyoutHeadingLabel)(lf("Variables"), pxt.toolbox.getNamespaceColor('variables'), pxt.toolbox.getNamespaceIcon('variables'));
        xmlList.push(headingLabel);
    }
    const button = document.createElement('button');
    button.setAttribute('text', lf("Make a Variable..."));
    button.setAttribute('callbackKey', 'CREATE_VARIABLE');
    // This id is used to re-focus the create variable button after the dialog is closed.
    button.setAttribute('id', exports.CREATE_VAR_BTN_ID);
    workspace.registerButtonCallback('CREATE_VARIABLE', function (button) {
        Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
    });
    xmlList.push(button);
    const blockList = Blockly.Variables.flyoutCategoryBlocks(workspace);
    xmlList = xmlList.concat(blockList);
    return xmlList;
}
;
