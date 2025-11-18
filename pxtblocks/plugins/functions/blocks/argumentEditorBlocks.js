"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
const constants_1 = require("../constants");
const ARGUMENT_EDITOR_MIXIN = {
    typeName_: "",
    getTypeName() {
        return this.typeName_;
    },
    removeFieldCallback(field) {
        const parent = this.getParent();
        if (parent === null || parent === void 0 ? void 0 : parent.removeFieldCallback) {
            parent.removeFieldCallback(field);
        }
    },
};
Blockly.Blocks[constants_1.ARGUMENT_EDITOR_BOOLEAN_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_EDITOR_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_editor",
                    name: "TEXT",
                    text: "bool",
                },
            ],
            extensions: ["output_boolean", "text_field_color"],
        });
        this.typeName_ = "boolean";
    } });
Blockly.Blocks[constants_1.ARGUMENT_EDITOR_STRING_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_EDITOR_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_editor",
                    name: "TEXT",
                    text: "text",
                },
            ],
            extensions: ["output_string", "text_field_color"],
        });
        this.typeName_ = "string";
    } });
Blockly.Blocks[constants_1.ARGUMENT_EDITOR_NUMBER_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_EDITOR_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_editor",
                    name: "TEXT",
                    text: "num",
                },
            ],
            extensions: ["output_number", "text_field_color"],
        });
        this.typeName_ = "number";
    } });
Blockly.Blocks[constants_1.ARGUMENT_EDITOR_ARRAY_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_EDITOR_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_editor",
                    name: "TEXT",
                    text: "list",
                },
            ],
            extensions: ["output_array", "text_field_color"],
        });
        this.typeName_ = "Array";
    } });
Blockly.Blocks[constants_1.ARGUMENT_EDITOR_CUSTOM_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_EDITOR_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_editor",
                    name: "TEXT",
                    text: "arg",
                },
            ],
            outputShape: new Blockly.zelos.ConstantProvider().SHAPES.ROUND,
            extensions: ["text_field_color"],
        });
        this.typeName_ = "any";
    }, mutationToDom() {
        const container = Blockly.utils.xml.createElement("mutation");
        container.setAttribute("typename", this.typeName_);
        return container;
    },
    domToMutation(xmlElement) {
        this.typeName_ = xmlElement.getAttribute("typename");
        this.setOutput(true, this.typeName_);
    } });
