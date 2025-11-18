"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelFlyoutInflater = void 0;
const Blockly = require("blockly");
const flyoutButton_1 = require("./flyoutButton");
const LABEL_TYPE = "label";
class LabelFlyoutInflater extends Blockly.LabelFlyoutInflater {
    static register() {
        Blockly.registry.register(Blockly.registry.Type.FLYOUT_INFLATER, LABEL_TYPE, LabelFlyoutInflater, true);
    }
    load(state, flyout) {
        const label = new flyoutButton_1.FlyoutButton(flyout.getWorkspace(), flyout.targetWorkspace, state, true);
        label.show();
        return new Blockly.FlyoutItem(label, LABEL_TYPE);
    }
}
exports.LabelFlyoutInflater = LabelFlyoutInflater;
