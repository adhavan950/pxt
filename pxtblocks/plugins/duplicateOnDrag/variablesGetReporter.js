"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
const duplicateOnDrag_1 = require("./duplicateOnDrag");
Blockly.Blocks["variables_get_reporter"] = {
    init: function () {
        this.jsonInit({
            "type": "variables_get_reporter",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "VAR",
                    "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
                    "variableTypes": [""],
                }
            ],
            "output": null,
            "colour": "%{BKY_VARIABLES_HUE}",
            "outputShape": new Blockly.zelos.ConstantProvider().SHAPES.ROUND,
            "helpUrl": "%{BKY_VARIABLES_GET_HELPURL}",
            "tooltip": "%{BKY_VARIABLES_GET_TOOLTIP}",
            "extensions": ["contextMenu_variableReporter"]
        });
        (0, duplicateOnDrag_1.updateDuplicateOnDragState)(this);
    }
};
