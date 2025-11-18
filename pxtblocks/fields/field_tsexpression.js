"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTsExpression = void 0;
const Blockly = require("blockly");
class FieldTsExpression extends Blockly.FieldTextInput {
    constructor() {
        super(...arguments);
        this.isFieldCustom_ = true;
        this.pythonMode = false;
    }
    /**
     * Same as parent, but adds a different class to text when disabled
     */
    updateEditable() {
        const group = this.fieldGroup_;
        const block = this.getSourceBlock();
        if (!this.EDITABLE || !group || !block) {
            return;
        }
        if (this.enabled_ && block.isEditable()) {
            pxt.BrowserUtils.addClass(group, 'blocklyEditableText');
            pxt.BrowserUtils.removeClass(group, 'blocklyGreyExpressionBlockText');
        }
        else {
            pxt.BrowserUtils.addClass(group, 'blocklyGreyExpressionBlockText');
            pxt.BrowserUtils.removeClass(group, 'blocklyEditableText');
        }
    }
    setPythonEnabled(enabled) {
        if (enabled === this.pythonMode)
            return;
        this.pythonMode = enabled;
        this.forceRerender();
    }
    getText() {
        return this.pythonMode ? pxt.Util.lf("<python code>") : this.getValue();
    }
    getFieldDescription() {
        return this.pythonMode ? pxt.Util.lf("<python code>") : pxt.Util.lf("<typescript code>");
    }
    applyColour() {
        var _a;
        if (this.sourceBlock_ && ((_a = this.getConstants()) === null || _a === void 0 ? void 0 : _a.FULL_BLOCK_FIELDS)) {
            if (this.borderRect_) {
                this.borderRect_.setAttribute('stroke', this.sourceBlock_.style.colourPrimary);
                this.borderRect_.setAttribute('fill', this.sourceBlock_.style.colourPrimary);
            }
        }
    }
}
exports.FieldTsExpression = FieldTsExpression;
