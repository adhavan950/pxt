"use strict";
/// <reference path="../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateToolboxBlock = exports.addMutation = exports.MutatorTypes = void 0;
const Blockly = require("blockly");
const util_1 = require("./compiler/util");
const compiler_1 = require("./compiler/compiler");
const loader_1 = require("./loader");
const fieldVariable_1 = require("./plugins/newVariableField/fieldVariable");
var MutatorTypes;
(function (MutatorTypes) {
    MutatorTypes.ObjectDestructuringMutator = "objectdestructuring";
    MutatorTypes.RestParameterMutator = "restparameter";
    MutatorTypes.DefaultInstanceMutator = "defaultinstance";
})(MutatorTypes = exports.MutatorTypes || (exports.MutatorTypes = {}));
function addMutation(b, info, mutationType) {
    let m;
    switch (mutationType) {
        case MutatorTypes.ObjectDestructuringMutator:
            if (!info.parameters || info.parameters.length < 1) {
                pxt.error("Destructuring mutations require at least one parameter");
            }
            else {
                let found = false;
                for (const param of info.parameters) {
                    if (param.type.indexOf("=>") !== -1) {
                        if (!param.properties || param.properties.length === 0) {
                            pxt.error("Destructuring mutations only supported for functions with an event parameter that has multiple properties");
                            return;
                        }
                        found = true;
                    }
                }
                if (!found) {
                    pxt.error("Destructuring mutations must have an event parameter");
                    return;
                }
            }
            m = new DestructuringMutator(b, info);
            break;
        case MutatorTypes.RestParameterMutator:
            m = new ArrayMutator(b, info);
            break;
        case MutatorTypes.DefaultInstanceMutator:
            m = new DefaultInstanceMutator(b, info);
            break;
        default:
            pxt.warn("Ignoring unknown mutation type: " + mutationType);
            return;
    }
    b.mutationToDom = m.mutationToDom.bind(m);
    b.domToMutation = m.domToMutation.bind(m);
    b.compose = m.compose.bind(m);
    b.decompose = m.decompose.bind(m);
    b.mutation = m;
}
exports.addMutation = addMutation;
function mutateToolboxBlock(block, mutationType, mutation) {
    const mutationElement = document.createElement("mutation");
    switch (mutationType) {
        case MutatorTypes.ObjectDestructuringMutator:
            mutationElement.setAttribute(DestructuringMutator.propertiesAttributeName, mutation);
            break;
        case MutatorTypes.RestParameterMutator:
            mutationElement.setAttribute(ArrayMutator.countAttributeName, mutation);
            break;
        case MutatorTypes.DefaultInstanceMutator:
            mutationElement.setAttribute(DefaultInstanceMutator.attributeName, mutation);
        default:
            pxt.warn("Ignoring unknown mutation type: " + mutationType);
            return;
    }
    block.appendChild(mutationElement);
}
exports.mutateToolboxBlock = mutateToolboxBlock;
class MutatorHelper {
    constructor(b, info) {
        this.info = info;
        this.block = b;
        this.topBlockType = this.block.type + "_mutator";
        const subBlocks = this.getSubBlockNames();
        this.initializeMutatorTopBlock();
        this.initializeMutatorSubBlocks(subBlocks);
        const mutatorToolboxTypes = subBlocks.map(s => s.type);
        this.block.setMutator(new Blockly.icons.MutatorIcon(mutatorToolboxTypes, b));
    }
    // Should be set to modify a block after a mutator dialog is updated
    compose(topBlock) {
        const allBlocks = topBlock.getDescendants(false).map(subBlock => {
            return {
                type: subBlock.type,
                name: subBlock.inputList[0].name
            };
        });
        // Toss the top block
        allBlocks.shift();
        this.updateBlock(allBlocks);
    }
    // Should be set to initialize the workspace inside a mutator dialog and return the top block
    decompose(workspace) {
        // Initialize flyout workspace's top block and add sub-blocks based on visible parameters
        const topBlock = workspace.newBlock(this.topBlockType);
        topBlock.initSvg();
        for (const input of topBlock.inputList) {
            if (input.name === MutatorHelper.mutatorStatmentInput) {
                let currentConnection = input.connection;
                this.getVisibleBlockTypes().forEach(sub => {
                    const subBlock = workspace.newBlock(sub);
                    subBlock.initSvg();
                    currentConnection.connect(subBlock.previousConnection);
                    currentConnection = subBlock.nextConnection;
                });
                break;
            }
        }
        return topBlock;
    }
    compileMutation(e, comments) {
        return undefined;
    }
    getDeclaredVariables() {
        return undefined;
    }
    isDeclaredByMutation(varName) {
        return false;
    }
    initializeMutatorSubBlock(sub, parameter, colour) {
        sub.appendDummyInput(parameter)
            .appendField(parameter);
        sub.setColour(colour);
        sub.setNextStatement(true);
        sub.setPreviousStatement(true);
    }
    initializeMutatorTopBlock() {
        const topBlockTitle = this.info.attributes.mutateText;
        const colour = this.block.getColour();
        Blockly.Blocks[this.topBlockType] = Blockly.Blocks[this.topBlockType] || {
            init: function () {
                const top = this;
                top.appendDummyInput()
                    .appendField(topBlockTitle);
                top.setColour(colour);
                top.appendStatementInput(MutatorHelper.mutatorStatmentInput);
            }
        };
    }
    initializeMutatorSubBlocks(subBlocks) {
        const colour = this.block.getColour();
        const initializer = this.initializeMutatorSubBlock.bind(this);
        subBlocks.forEach(blockName => {
            Blockly.Blocks[blockName.type] = Blockly.Blocks[blockName.type] || {
                init: function () { initializer(this, blockName.name, colour); }
            };
        });
    }
}
MutatorHelper.mutatorStatmentInput = "PROPERTIES";
MutatorHelper.mutatedVariableInputName = "properties";
class DestructuringMutator extends MutatorHelper {
    constructor(b, info) {
        super(b, info);
        this.currentlyVisible = [];
        this.parameterRenames = {};
        this.prefix = this.info.attributes.mutatePrefix;
        this.block.appendDummyInput(MutatorHelper.mutatedVariableInputName);
        this.block.appendStatementInput("HANDLER")
            .setCheck("null");
    }
    getMutationType() {
        return MutatorTypes.ObjectDestructuringMutator;
    }
    compileMutation(e, comments) {
        if (!this.info.attributes.mutatePropertyEnum && !this.parameters.length) {
            return undefined;
        }
        const declarationString = this.parameters.map(param => {
            const varField = this.block.getField(param);
            const declaredName = varField && varField.getText();
            const escapedParam = (0, util_1.escapeVarName)(param, e);
            if (declaredName !== param) {
                this.parameterRenames[param] = declaredName;
                return `${param}: ${(0, util_1.escapeVarName)(declaredName, e)}`;
            }
            return escapedParam;
        }).join(", ");
        const functionString = `function ({ ${declarationString} })`;
        if (this.info.attributes.mutatePropertyEnum) {
            return pxt.blocks.mkText(` [${this.parameters.map(p => `${this.info.attributes.mutatePropertyEnum}.${p}`).join(", ")}],${functionString}`);
        }
        else {
            return pxt.blocks.mkText(functionString);
        }
    }
    getDeclaredVariables() {
        const result = {};
        this.parameters.forEach(param => {
            result[this.getVarFieldValue(param)] = this.parameterTypes[param];
        });
        return result;
    }
    isDeclaredByMutation(varName) {
        return this.parameters.some(param => this.getVarFieldValue(param) === varName);
    }
    mutationToDom() {
        // Save the parameters that are currently visible to the DOM along with their names
        const mutation = document.createElement("mutation");
        const attr = this.parameters.map(param => {
            const varName = this.getVarFieldValue(param);
            if (varName !== param) {
                this.parameterRenames[param] = pxt.Util.htmlEscape(varName);
            }
            return pxt.Util.htmlEscape(param);
        }).join(",");
        mutation.setAttribute(DestructuringMutator.propertiesAttributeName, attr);
        for (const parameter in this.parameterRenames) {
            if (parameter === this.parameterRenames[parameter]) {
                delete this.parameterRenames[parameter];
            }
        }
        mutation.setAttribute(DestructuringMutator.renameAttributeName, JSON.stringify(this.parameterRenames));
        return mutation;
    }
    domToMutation(xmlElement) {
        // Restore visible parameters based on saved DOM
        const savedParameters = xmlElement.getAttribute(DestructuringMutator.propertiesAttributeName);
        if (savedParameters) {
            const split = savedParameters.split(",");
            const properties = [];
            if (this.paramIndex === undefined) {
                this.paramIndex = this.getParameterIndex();
            }
            split.forEach(saved => {
                // Parse the old way of storing renames to maintain backwards compatibility
                const parts = saved.split(":");
                if (this.info.parameters[this.paramIndex].properties.some(p => p.name === parts[0])) {
                    properties.push({
                        property: parts[0],
                        newName: parts[1]
                    });
                }
            });
            this.parameterRenames = undefined;
            if (xmlElement.hasAttribute(DestructuringMutator.renameAttributeName)) {
                try {
                    this.parameterRenames = JSON.parse(xmlElement.getAttribute(DestructuringMutator.renameAttributeName));
                }
                catch (e) {
                    pxt.warn("Ignoring invalid rename map in saved block mutation");
                }
            }
            this.parameterRenames = this.parameterRenames || {};
            // Create the fields for each property with default variable names
            this.parameters = [];
            properties.forEach(prop => {
                this.parameters.push(prop.property);
                if (prop.newName && prop.newName !== prop.property) {
                    this.parameterRenames[prop.property] = prop.newName;
                }
            });
            this.updateVisibleProperties();
            // Override any names that the user has changed
            properties.filter(p => !!p.newName).forEach(p => this.setVarFieldValue(p.property, p.newName));
        }
    }
    getVarFieldValue(fieldName) {
        const varField = this.block.getField(fieldName);
        return varField && varField.getText();
    }
    setVarFieldValue(fieldName, newValue) {
        const varField = this.block.getField(fieldName);
        if (this.block.getField(fieldName)) {
            (0, loader_1.setVarFieldValue)(this.block, fieldName, newValue);
        }
    }
    updateBlock(subBlocks) {
        this.parameters = [];
        // Ignore duplicate blocks
        subBlocks.forEach(p => {
            if (this.parameters.indexOf(p.name) === -1) {
                this.parameters.push(p.name);
            }
        });
        this.updateVisibleProperties();
    }
    getSubBlockNames() {
        this.parameters = [];
        this.parameterTypes = {};
        if (this.paramIndex === undefined) {
            this.paramIndex = this.getParameterIndex();
        }
        return this.info.parameters[this.paramIndex].properties.map(property => {
            // Used when compiling the destructured arguments
            this.parameterTypes[property.name] = property.type;
            return {
                type: this.propertyId(property.name),
                name: property.name
            };
        });
    }
    getVisibleBlockTypes() {
        return this.currentlyVisible.map(p => this.propertyId(p));
    }
    updateVisibleProperties() {
        if (pxt.Util.listsEqual(this.currentlyVisible, this.parameters)) {
            return;
        }
        const dummyInput = this.block.inputList.find(i => i.name === MutatorHelper.mutatedVariableInputName);
        if (this.prefix && this.currentlyVisible.length === 0) {
            dummyInput.appendField(this.prefix, DestructuringMutator.prefixLabel);
        }
        this.currentlyVisible.forEach(param => {
            if (this.parameters.indexOf(param) === -1) {
                const name = this.getVarFieldValue(param);
                // Persist renames
                if (name !== param) {
                    this.parameterRenames[param] = name;
                }
                dummyInput.removeField(param);
            }
        });
        this.parameters.forEach(param => {
            if (this.currentlyVisible.indexOf(param) === -1) {
                const fieldValue = this.parameterRenames[param] || param;
                dummyInput.appendField(new fieldVariable_1.FieldVariable(fieldValue), param);
            }
        });
        if (this.prefix && this.parameters.length === 0) {
            dummyInput.removeField(DestructuringMutator.prefixLabel);
        }
        this.currentlyVisible = this.parameters;
    }
    propertyId(property) {
        return this.block.type + "_" + property;
    }
    getParameterIndex() {
        for (let i = 0; i < this.info.parameters.length; i++) {
            if (this.info.parameters[i].type.indexOf("=>") !== -1) {
                return i;
            }
        }
        return undefined;
    }
}
DestructuringMutator.propertiesAttributeName = "callbackproperties";
DestructuringMutator.renameAttributeName = "renamemap";
// Avoid clashes by starting labels with a number
DestructuringMutator.prefixLabel = "0prefix_label_";
class ArrayMutator extends MutatorHelper {
    constructor() {
        super(...arguments);
        this.count = 0;
    }
    getMutationType() {
        return MutatorTypes.RestParameterMutator;
    }
    compileMutation(e, comments) {
        const values = [];
        this.forEachInput(block => values.push((0, compiler_1.compileExpression)(e, block, comments)));
        return pxt.blocks.mkGroup(values);
    }
    mutationToDom() {
        const mutation = document.createElement("mutation");
        mutation.setAttribute(ArrayMutator.countAttributeName, this.count.toString());
        return mutation;
    }
    domToMutation(xmlElement) {
        const attribute = xmlElement.getAttribute(ArrayMutator.countAttributeName);
        if (attribute) {
            try {
                this.count = parseInt(attribute);
            }
            catch (e) {
                return;
            }
            for (let i = 0; i < this.count; i++) {
                this.addNumberField(false, i);
            }
        }
    }
    updateBlock(subBlocks) {
        if (subBlocks) {
            const diff = Math.abs(this.count - subBlocks.length);
            if (this.count < subBlocks.length) {
                for (let i = 0; i < diff; i++)
                    this.addNumberField(true, this.count);
            }
            else if (this.count > subBlocks.length) {
                for (let i = 0; i < diff; i++)
                    this.removeNumberField();
            }
        }
    }
    getSubBlockNames() {
        return [{
                name: "Value",
                type: ArrayMutator.entryTypeName
            }];
    }
    getVisibleBlockTypes() {
        const result = [];
        this.forEachInput(() => result.push(ArrayMutator.entryTypeName));
        return result;
    }
    addNumberField(isNewField, index) {
        const input = this.block.appendValueInput(ArrayMutator.valueInputPrefix + index).setCheck("Number");
        if (isNewField) {
            const valueBlock = this.block.workspace.newBlock("math_number");
            valueBlock.initSvg();
            valueBlock.setShadow(true);
            input.connection.connect(valueBlock.outputConnection);
            this.block.workspace.render();
            this.count++;
        }
    }
    removeNumberField() {
        if (this.count > 0) {
            this.block.removeInput(ArrayMutator.valueInputPrefix + (this.count - 1));
        }
        this.count--;
    }
    forEachInput(cb) {
        for (let i = 0; i < this.count; i++) {
            cb(this.block.getInputTargetBlock(ArrayMutator.valueInputPrefix + i), i);
        }
    }
}
ArrayMutator.countAttributeName = "count";
ArrayMutator.entryTypeName = "entry";
ArrayMutator.valueInputPrefix = "value_input_";
class DefaultInstanceMutator extends MutatorHelper {
    constructor() {
        super(...arguments);
        this.showing = false;
    }
    getMutationType() {
        return MutatorTypes.DefaultInstanceMutator;
    }
    compileMutation(e, comments) {
        if (this.showing) {
            const target = this.block.getInputTargetBlock(DefaultInstanceMutator.instanceInputName);
            if (target) {
                return (0, compiler_1.compileExpression)(e, target, comments);
            }
        }
        return undefined;
    }
    mutationToDom() {
        const mutation = document.createElement("mutation");
        mutation.setAttribute(DefaultInstanceMutator.attributeName, this.showing ? "true" : "false");
        return mutation;
    }
    domToMutation(xmlElement) {
        const attribute = xmlElement.getAttribute(DefaultInstanceMutator.attributeName);
        if (attribute) {
            this.updateShape(attribute === "true");
        }
        else {
            this.updateShape(false);
        }
    }
    updateBlock(subBlocks) {
        this.updateShape(!!(subBlocks && subBlocks.length));
    }
    getSubBlockNames() {
        return [{
                name: "Instance",
                type: DefaultInstanceMutator.instanceSubBlockType
            }];
    }
    getVisibleBlockTypes() {
        const result = [];
        if (this.showing) {
            result.push(DefaultInstanceMutator.instanceSubBlockType);
        }
        return result;
    }
    updateShape(show) {
        if (this.showing !== show) {
            if (show && !this.block.getInputTargetBlock(DefaultInstanceMutator.instanceInputName)) {
                this.block.appendValueInput(DefaultInstanceMutator.instanceInputName);
            }
            else {
                this.block.removeInput(DefaultInstanceMutator.instanceInputName);
            }
            this.showing = show;
        }
    }
}
DefaultInstanceMutator.attributeName = "showing";
DefaultInstanceMutator.instanceInputName = "__instance__";
DefaultInstanceMutator.instanceSubBlockType = "instance";
