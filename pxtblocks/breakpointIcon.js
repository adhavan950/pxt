"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakpointIcon = void 0;
const Blockly = require("blockly");
class BreakpointIcon extends Blockly.icons.Icon {
    constructor(sourceBlock, onStateChange) {
        super(sourceBlock);
        this.onStateChange = onStateChange;
        this.isSet_ = false;
    }
    getType() {
        return BreakpointIcon.type;
    }
    initView(pointerdownListener) {
        super.initView(pointerdownListener);
        if (this.breakpointSvg)
            return;
        // Red/Grey filled circle, for Set/Unset breakpoint respectively.
        this.breakpointSvg = Blockly.utils.dom.createSvgElement('circle', {
            'class': 'blocklyBreakpointSymbol',
            'stroke': 'white',
            'stroke-width': 2,
            'cx': 7,
            'cy': 11.5,
            'r': 8,
        }, this.svgRoot);
        this.updateColor();
    }
    getSize() {
        return new Blockly.utils.Size(25, 25);
    }
    onClick() {
        this.isSet_ = !this.isSet_;
        this.updateColor();
        this.onStateChange(this.sourceBlock, this.isSet_);
    }
    isEnabled() {
        return this.isSet_;
    }
    setEnabled(enabled) {
        this.isSet_ = enabled;
        this.updateColor();
    }
    updateColor() {
        if (!this.breakpointSvg)
            return;
        this.breakpointSvg.setAttribute("fill", this.isSet_ ? "#FF0000" : "#CCCCCC");
    }
}
exports.BreakpointIcon = BreakpointIcon;
BreakpointIcon.type = new Blockly.icons.IconType("breakpoint");
