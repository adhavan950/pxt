"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldBase = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
class FieldBase extends Blockly.Field {
    constructor(text, params, validator) {
        super(text, validator);
        this.SERIALIZABLE = true;
        this.options = params;
        if (text && !this.valueText)
            this.valueText = text;
    }
    static enqueueInit(field) {
        FieldBase.pendingInit.push(field);
        if (!this.pendingTimeout) {
            FieldBase.pendingTimeout = setTimeout(() => FieldBase.flushInitQueue());
        }
    }
    static flushInitQueue() {
        for (const field of FieldBase.pendingInit) {
            field.onLoadedIntoWorkspace();
        }
        FieldBase.pendingTimeout = undefined;
        FieldBase.pendingInit = [];
    }
    init() {
        super.init();
        this.onInit();
        // This hack makes sure we run this code only after domToBlock
        // has finished running and this field has its actual value set
        FieldBase.enqueueInit(this);
    }
    dispose() {
        this.onDispose();
    }
    getValue() {
        return this.valueText;
    }
    doValueUpdate_(newValue) {
        if (newValue === null)
            return;
        this.valueText = this.loaded ? this.onValueChanged(newValue) : newValue;
    }
    getDisplayText_() {
        return this.valueText;
    }
    onLoadedIntoWorkspace() {
        if (this.loaded)
            return;
        this.loaded = true;
        this.valueText = this.onValueChanged(this.valueText);
    }
    /**
     * Returns a human-readable description of the field's current value.
     */
    getFieldDescription() {
        return this.getDisplayText_();
    }
    getAnchorDimensions() {
        const boundingBox = this.getScaledBBox();
        if (this.sourceBlock_.RTL) {
            boundingBox.right += FieldBase.CHECKMARK_OVERHANG;
        }
        else {
            boundingBox.left -= FieldBase.CHECKMARK_OVERHANG;
        }
        return boundingBox;
    }
    ;
    isInitialized() {
        return !!this.fieldGroup_;
    }
    getBlockData() {
        return (0, field_utils_1.getBlockDataForField)(this.sourceBlock_, this.name);
    }
    setBlockData(value) {
        (0, field_utils_1.setBlockDataForField)(this.sourceBlock_, this.name, value);
    }
    getSiblingBlock(inputName, useGrandparent = false) {
        const block = useGrandparent ? this.sourceBlock_.getParent() : this.sourceBlock_;
        if (!block || !block.inputList)
            return undefined;
        for (const input of block.inputList) {
            if (input.name === inputName) {
                return input.connection.targetBlock();
            }
        }
        return undefined;
    }
    getSiblingField(fieldName, useGrandparent = false) {
        const block = useGrandparent ? this.sourceBlock_.getParent() : this.sourceBlock_;
        if (!block)
            return undefined;
        return block.getField(fieldName);
    }
}
exports.FieldBase = FieldBase;
// todo: this was removed in blockly v12
FieldBase.CHECKMARK_OVERHANG = 25;
FieldBase.pendingInit = [];
