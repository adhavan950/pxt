"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCALIZATION_NAME_MUTATION_KEY = void 0;
const Blockly = require("blockly");
const constants_1 = require("../constants");
const msg_1 = require("../msg");
const duplicateOnDrag_1 = require("../../duplicateOnDrag");
exports.LOCALIZATION_NAME_MUTATION_KEY = "localizationname";
const ARGUMENT_REPORTER_MIXIN = {
    typeName_: "",
    localizationName_: "",
    getTypeName() {
        return this.typeName_;
    },
    getLocalizationName() {
        return this.localizationName_ || this.getFieldValue("VALUE");
    },
    mutationToDom() {
        const container = Blockly.utils.xml.createElement("mutation");
        if (this.localizationName_) {
            container.setAttribute(exports.LOCALIZATION_NAME_MUTATION_KEY, this.localizationName_);
        }
        return container;
    },
    domToMutation(xmlElement) {
        if (xmlElement.hasAttribute(exports.LOCALIZATION_NAME_MUTATION_KEY)) {
            this.localizationName_ = xmlElement.getAttribute(exports.LOCALIZATION_NAME_MUTATION_KEY);
        }
    },
};
Blockly.Blocks[constants_1.ARGUMENT_REPORTER_BOOLEAN_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_REPORTER_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_reporter",
                    name: "VALUE",
                    text: "",
                },
            ],
            colour: Blockly.Msg[msg_1.MsgKey.REPORTERS_HUE],
            extensions: ["output_boolean"],
        });
        this.typeName_ = "boolean";
        initArgumentReporter(this);
    } });
Blockly.Blocks[constants_1.ARGUMENT_REPORTER_STRING_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_REPORTER_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_reporter",
                    name: "VALUE",
                    text: "",
                },
            ],
            colour: Blockly.Msg[msg_1.MsgKey.REPORTERS_HUE],
            extensions: ["output_string"],
        });
        this.typeName_ = "string";
        initArgumentReporter(this);
    } });
Blockly.Blocks[constants_1.ARGUMENT_REPORTER_NUMBER_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_REPORTER_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_reporter",
                    name: "VALUE",
                    text: "",
                },
            ],
            colour: Blockly.Msg[msg_1.MsgKey.REPORTERS_HUE],
            extensions: ["output_number"],
        });
        this.typeName_ = "number";
        initArgumentReporter(this);
    } });
Blockly.Blocks[constants_1.ARGUMENT_REPORTER_ARRAY_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_REPORTER_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_reporter",
                    name: "VALUE",
                    text: "",
                },
            ],
            colour: Blockly.Msg[msg_1.MsgKey.REPORTERS_HUE],
            extensions: ["output_array"],
        });
        this.typeName_ = "Array";
        initArgumentReporter(this);
    } });
Blockly.Blocks[constants_1.ARGUMENT_REPORTER_CUSTOM_BLOCK_TYPE] = Object.assign(Object.assign({}, ARGUMENT_REPORTER_MIXIN), { init: function () {
        this.jsonInit({
            message0: " %1",
            args0: [
                {
                    type: "field_argument_reporter",
                    name: "VALUE",
                    text: "",
                },
            ],
            colour: Blockly.Msg[msg_1.MsgKey.REPORTERS_HUE],
            inputsInline: true,
            outputShape: new Blockly.zelos.ConstantProvider().SHAPES.ROUND,
            output: null,
        });
        this.typeName_ = "";
        initArgumentReporter(this);
    }, mutationToDom() {
        const container = ARGUMENT_REPORTER_MIXIN.mutationToDom.call(this);
        container.setAttribute("typename", this.typeName_);
        return container;
    },
    domToMutation(xmlElement) {
        this.typeName_ = xmlElement.getAttribute("typename");
        this.setOutput(true, this.typeName_);
        ARGUMENT_REPORTER_MIXIN.domToMutation.call(this, xmlElement);
    } });
function initArgumentReporter(block) {
    (0, duplicateOnDrag_1.setDuplicateOnDragStrategy)(block);
    (0, duplicateOnDrag_1.updateDuplicateOnDragState)(block);
}
