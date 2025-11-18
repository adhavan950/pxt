"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldAutoComplete = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
const field_textdropdown_1 = require("./field_textdropdown");
const text_1 = require("../plugins/text");
class FieldAutoComplete extends field_textdropdown_1.FieldTextDropdown {
    constructor(text, options, opt_validator) {
        super(text, options, opt_validator);
        this.isFieldCustom_ = true;
        this.key = options.key;
        this.isTextValid_ = true;
    }
    isOptionListDynamic() {
        return true;
    }
    getDisplayText_() {
        return this.parsedValue || "";
    }
    getFieldDescription() {
        return this.getDisplayText_();
    }
    doValueUpdate_(newValue) {
        this.isDirty_ = true;
        if (newValue === null)
            return;
        if (/['"`].*['"`]/.test(newValue)) {
            this.parsedValue = JSON.parse(newValue);
        }
        else {
            this.parsedValue = newValue;
        }
        this.value_ = this.parsedValue;
    }
    getValue() {
        if (this.parsedValue) {
            return this.parsedValue;
        }
        else
            return '';
    }
    getOptions() {
        var _a;
        const workspace = (_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.workspace;
        if (!workspace)
            return [];
        const res = [];
        const fields = (0, field_utils_1.getAllFields)(workspace, field => field instanceof FieldAutoComplete && field.getKey() === this.key);
        const options = fields.map(field => field.ref.getDisplayText_());
        for (const option of options) {
            if (!option.trim() || res.some(tuple => tuple[0] === option))
                continue;
            res.push([option, option]);
        }
        res.sort((a, b) => a[0].localeCompare(b[0]));
        return res;
    }
    showDropdown_() {
        const options = this.getOptions();
        if (options.length)
            super.showDropdown_();
    }
    getKey() {
        if (this.key)
            return this.key;
        if (this.sourceBlock_)
            return this.sourceBlock_.type;
        return undefined;
    }
    // Copied from field_string in pxt-blockly
    initView() {
        // Add quotes around the string
        // Positioned on updatSize, after text size is calculated.
        this.quoteSize_ = 16;
        this.quoteWidth_ = 8;
        this.quoteLeftX_ = 0;
        this.quoteRightX_ = 0;
        this.quoteY_ = 10;
        if (this.quoteLeft_)
            this.quoteLeft_.parentNode.removeChild(this.quoteLeft_);
        this.quoteLeft_ = Blockly.utils.dom.createSvgElement('text', {
            'font-size': this.quoteSize_ + 'px',
            'class': 'field-text-quote'
        }, this.fieldGroup_);
        super.initView();
        if (this.quoteRight_)
            this.quoteRight_.parentNode.removeChild(this.quoteRight_);
        this.quoteRight_ = Blockly.utils.dom.createSvgElement('text', {
            'font-size': this.quoteSize_ + 'px',
            'class': 'field-text-quote'
        }, this.fieldGroup_);
        this.quoteLeft_.appendChild(document.createTextNode('"'));
        this.quoteRight_.appendChild(document.createTextNode('"'));
    }
    // Copied from field_string in pxt-blockly
    updateSize_() {
        super.updateSize_();
        const sWidth = Math.max(this.size_.width, 1);
        const xPadding = 3;
        let addedWidth = this.positionLeft(sWidth + xPadding);
        this.textElement_.setAttribute('x', addedWidth.toString());
        addedWidth += this.positionRight(addedWidth + sWidth + xPadding);
        this.size_.width = sWidth + addedWidth;
    }
    // Copied from field_string in pxt-blockly
    positionRight(x) {
        if (!this.quoteRight_) {
            return 0;
        }
        let addedWidth = 0;
        if (this.sourceBlock_.RTL) {
            this.quoteRightX_ = text_1.FieldString.quotePadding;
            addedWidth = this.quoteWidth_ + text_1.FieldString.quotePadding;
        }
        else {
            this.quoteRightX_ = x + text_1.FieldString.quotePadding;
            addedWidth = this.quoteWidth_ + text_1.FieldString.quotePadding;
        }
        this.quoteRight_.setAttribute('transform', 'translate(' + this.quoteRightX_ + ',' + this.quoteY_ + ')');
        return addedWidth;
    }
    // Copied from field_string in pxt-blockly
    positionLeft(x) {
        if (!this.quoteLeft_) {
            return 0;
        }
        let addedWidth = 0;
        if (this.sourceBlock_.RTL) {
            this.quoteLeftX_ = x + this.quoteWidth_ + text_1.FieldString.quotePadding * 2;
            addedWidth = this.quoteWidth_ + text_1.FieldString.quotePadding;
        }
        else {
            this.quoteLeftX_ = 0;
            addedWidth = this.quoteWidth_ + text_1.FieldString.quotePadding;
        }
        this.quoteLeft_.setAttribute('transform', 'translate(' + this.quoteLeftX_ + ',' + this.quoteY_ + ')');
        return addedWidth;
    }
    createSVGArrow() {
        // This creates the little arrow for dropdown fields. Intentionally
        // do nothing
    }
}
exports.FieldAutoComplete = FieldAutoComplete;
