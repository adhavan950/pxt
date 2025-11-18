"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monkeyPatchGrid = void 0;
const Blockly = require("blockly");
function monkeyPatchGrid() {
    var _a, _b;
    const options = (_a = pxt.appTarget.appTheme.blocklyOptions) === null || _a === void 0 ? void 0 : _a.grid;
    if (!((_b = options === null || options === void 0 ? void 0 : options.image) === null || _b === void 0 ? void 0 : _b.path))
        return;
    const gridPatternIds = [];
    Blockly.Grid.createDom = function (rnd, gridOptions, defs, injectionDiv) {
        const id = "blocklyGridPattern" + rnd;
        const gridPattern = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.PATTERN, {
            id,
            patternUnits: "userSpaceOnUse",
            width: options.image.width,
            height: options.image.height
        }, defs);
        gridPatternIds.push(id);
        const image = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.IMAGE, {
            width: options.image.width,
            height: options.image.height,
            opacity: options.image.opacity
        }, gridPattern);
        image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", options.image.path);
        if (injectionDiv) {
            injectionDiv.style.setProperty('--blocklyGridPattern', `url(#${gridPattern.id})`);
        }
        return gridPattern;
    };
    const oldGridUpdate = Blockly.Grid.prototype.update;
    Blockly.Grid.prototype.update = function (scale) {
        oldGridUpdate.call(this, scale);
        const patternsToRemove = [];
        for (const patternId of gridPatternIds) {
            const imagePattern = document.getElementById(patternId);
            if (!imagePattern) {
                patternsToRemove.push(patternId);
                continue;
            }
            imagePattern.setAttribute("width", options.image.width);
            imagePattern.setAttribute("height", options.image.height);
            imagePattern.setAttribute('patternTransform', 'scale(' + scale + ')');
        }
        for (const patternId of patternsToRemove) {
            gridPatternIds.splice(gridPatternIds.indexOf(patternId), 1);
        }
    };
}
exports.monkeyPatchGrid = monkeyPatchGrid;
