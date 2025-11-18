"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonFlyoutInflater = void 0;
const Blockly = require("blockly");
const flyoutButton_1 = require("./flyoutButton");
const BUTTON_TYPE = "button";
class ButtonFlyoutInflater extends Blockly.ButtonFlyoutInflater {
    static register() {
        Blockly.registry.register(Blockly.registry.Type.FLYOUT_INFLATER, BUTTON_TYPE, ButtonFlyoutInflater, true);
    }
    load(state, flyout) {
        const modifiedState = state;
        const button = new flyoutButton_1.FlyoutButton(flyout.getWorkspace(), flyout.targetWorkspace, modifiedState, false);
        if (modifiedState.id) {
            // This id is used to manage focus after dialog interactions.
            button.getSvgRoot().setAttribute("id", modifiedState.id);
        }
        button.show();
        return new Blockly.FlyoutItem(button, BUTTON_TYPE);
    }
}
exports.ButtonFlyoutInflater = ButtonFlyoutInflater;
