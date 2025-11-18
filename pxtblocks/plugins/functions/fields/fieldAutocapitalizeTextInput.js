"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldAutocapitalizeTextInput = void 0;
const Blockly = require("blockly");
class FieldAutocapitalizeTextInput extends Blockly.FieldTextInput {
    constructor(value, validator, config) {
        super(value, validator, config);
        this.disableAutocapitalize = false;
    }
    setAutocapitalize(autocapitalize) {
        this.disableAutocapitalize = !autocapitalize;
        if (this.htmlInput_) {
            if (this.disableAutocapitalize) {
                this.htmlInput_.setAttribute("autocapitalize", "none");
            }
            else {
                this.htmlInput_.removeAttribute("autocapitalize");
            }
        }
    }
    configure_(config) {
        super.configure_(config);
        if (config.disableAutocapitalize !== undefined) {
            this.disableAutocapitalize = config.disableAutocapitalize;
        }
    }
    widgetCreate_() {
        const input = super.widgetCreate_();
        if (this.disableAutocapitalize) {
            input.setAttribute("autocapitalize", "none");
        }
        return input;
    }
}
exports.FieldAutocapitalizeTextInput = FieldAutocapitalizeTextInput;
Blockly.fieldRegistry.register("field_autocapitalize_text_input", FieldAutocapitalizeTextInput);
