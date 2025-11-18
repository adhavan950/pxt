"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathObject = void 0;
const Blockly = require("blockly");
const DOTTED_OUTLINE_HOVER_CLASS = "blockly-dotted-outline-on-hover";
const HOVER_CLASS = "hover";
class PathObject extends Blockly.zelos.PathObject {
    constructor() {
        super(...arguments);
        this.connectionPointIndicators = new WeakMap();
    }
    setPath(pathString) {
        super.setPath(pathString);
        if (this.svgPathHighlighted) {
            this.svgPathHighlighted.setAttribute('d', pathString);
        }
    }
    updateHighlighted(enable) {
        // this.setClass_('blocklySelected', enable);
        if (enable) {
            if (!this.svgPathHighlighted) {
                const constants = this.constants;
                const filterId = this.hasError ? constants.errorOutlineFilterId : constants.highlightOutlineFilterId;
                this.svgPathHighlighted = this.svgPath.cloneNode(true);
                this.svgPathHighlighted.classList.add('pxtRendererHighlight');
                this.svgPathHighlighted.setAttribute('fill', 'none');
                this.svgPathHighlighted.setAttribute('filter', 'url(#' + filterId + ')');
                this.svgRoot.appendChild(this.svgPathHighlighted);
            }
        }
        else {
            if (this.svgPathHighlighted) {
                this.svgRoot.removeChild(this.svgPathHighlighted);
                this.svgPathHighlighted = null;
            }
        }
    }
    updateSelected(enable) {
        if (enable) {
            this.svgPath.classList.remove(HOVER_CLASS);
        }
        super.updateSelected(enable);
    }
    addConnectionHighlight(connection, connectionPath, offset, rtl) {
        const result = super.addConnectionHighlight(connection, connectionPath, offset, rtl);
        // We add a group that our ConnectionPreviewer uses to add the connection preview indicators.
        // We create it here to manage the paint order.
        if (!this.staticConnectionIndicatorParentGroup) {
            this.staticConnectionIndicatorParentGroup = Blockly.utils.dom.createSvgElement("g", {
                class: "blocklyConnectionIndicatorParent"
            }, this.svgRoot);
        }
        else {
            // Move last in paint order.
            this.svgRoot.appendChild(this.staticConnectionIndicatorParentGroup);
        }
        return result;
    }
    removeConnectionHighlight(connection) {
        var _a;
        (_a = this.staticConnectionIndicatorParentGroup) === null || _a === void 0 ? void 0 : _a.remove();
        super.removeConnectionHighlight(connection);
    }
    applyColour(block) {
        super.applyColour(block);
        if (block.outputConnection) {
            let didSetStroke = false;
            const parent = block.getParent();
            if (parent) {
                // On very dark shadow blocks, make the border a little bit brighter
                // to contrast with the parent better
                if (block.isShadow()) {
                    const parentBorder = parent.style.colourTertiary;
                    const rgb = Blockly.utils.colour.hexToRgb(parentBorder);
                    const luminance = calculateLuminance(rgb);
                    if (luminance < 0.15) {
                        this.svgPath.setAttribute('stroke', Blockly.utils.colour.blend("#ffffff", parentBorder, 0.3));
                        didSetStroke = true;
                    }
                }
                else {
                    const parentColor = parent.style.colourPrimary;
                    const childColor = block.style.colourPrimary;
                    // If the parent and child block are the same color, either lighten or darken
                    // the color to help it contrast better
                    if (parentColor === childColor) {
                        const blendFactor = 0.6;
                        const darkerBorder = Blockly.utils.colour.blend("#0000000", childColor, blendFactor);
                        const lighterBorder = Blockly.utils.colour.blend("#ffffff", childColor, blendFactor);
                        if (pxt.contrastRatio(darkerBorder, parentColor) > pxt.contrastRatio(lighterBorder, parentColor)) {
                            this.svgPath.setAttribute('stroke', darkerBorder);
                        }
                        else {
                            this.svgPath.setAttribute('stroke', lighterBorder);
                        }
                        didSetStroke = true;
                    }
                }
            }
            if (!didSetStroke) {
                this.svgPath.setAttribute('stroke', block.style.colourTertiary);
            }
        }
    }
    setHasDottedOutlineOnHover(enabled) {
        this.hasDottedOutlineOnHover = enabled;
        if (enabled) {
            this.svgPath.classList.add(DOTTED_OUTLINE_HOVER_CLASS);
            if (!this.mouseOverData) {
                this.mouseOverData = Blockly.browserEvents.bind(this.svgRoot, "mouseover", this, () => {
                    this.svgPath.classList.add(HOVER_CLASS);
                });
                this.mouseLeaveData = Blockly.browserEvents.bind(this.svgRoot, "mouseleave", this, () => {
                    this.svgPath.classList.remove(HOVER_CLASS);
                });
            }
        }
        else {
            this.svgPath.classList.remove(DOTTED_OUTLINE_HOVER_CLASS);
            if (this.mouseOverData) {
                Blockly.browserEvents.unbind(this.mouseOverData);
                Blockly.browserEvents.unbind(this.mouseLeaveData);
                this.mouseOverData = undefined;
                this.mouseLeaveData = undefined;
            }
            this.svgPath.classList.remove(DOTTED_OUTLINE_HOVER_CLASS);
        }
    }
    setHasError(hasError) {
        this.hasError = hasError;
    }
    isHighlighted() {
        return !!this.svgPathHighlighted;
    }
}
exports.PathObject = PathObject;
PathObject.CONNECTION_INDICATOR_RADIUS = 9;
function calculateLuminance(rgb) {
    return ((0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])) / 255;
}
Blockly.Css.register(`
.blockly-dotted-outline-on-hover {
    transition: stroke .4s;
}
.blockly-dotted-outline-on-hover.hover {
    stroke-dasharray: 2;
    stroke: white;
    stroke-width: 2;
}
.blocklyDisabledPattern>.blocklyPath.pxtRendererHighlight {
    fill: none;
}
`);
