"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initText = void 0;
const Blockly = require("blockly");
const help_1 = require("../help");
const constants_1 = require("../constants");
function initText() {
    // builtin text
    const textInfo = pxt.blocks.getBlockDefinition('text');
    (0, help_1.installHelpResources)('text', textInfo.name, textInfo.tooltip, textInfo.url, "#fff", "#fff", "#fff");
    // builtin text_length66tyyy
    const textLengthId = "text_length";
    const textLengthDef = pxt.blocks.getBlockDefinition(textLengthId);
    Blockly.Msg.TEXT_LENGTH_TITLE = textLengthDef.block["TEXT_LENGTH_TITLE"];
    // We have to override this block definition because the builtin block
    // allows both Strings and Arrays in its input check and that confuses
    // our Blockly compiler
    let block = Blockly.Blocks[textLengthId];
    block.init = function () {
        this.jsonInit({
            "message0": Blockly.Msg.TEXT_LENGTH_TITLE,
            "args0": [
                {
                    "type": "input_value",
                    "name": "VALUE",
                    "check": ['String']
                }
            ],
            "output": 'Number',
            "outputShape": constants_1.provider.SHAPES.ROUND
        });
    };
    (0, help_1.installBuiltinHelpInfo)(textLengthId);
    // builtin text_join
    const textJoinId = "text_join";
    const textJoinDef = pxt.blocks.getBlockDefinition(textJoinId);
    Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH = textJoinDef.block["TEXT_JOIN_TITLE_CREATEWITH"];
    (0, help_1.installBuiltinHelpInfo)(textJoinId);
}
exports.initText = initText;
