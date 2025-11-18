"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSpeed = void 0;
const math_1 = require("../plugins/math");
class FieldSpeed extends math_1.FieldSlider {
    /**
     * Class for a color wheel field.
     * @param {number|string} value The initial content of the field.
     * @param {Function=} opt_validator An optional function that is called
     *     to validate any constraints on what the user entered.  Takes the new
     *     text as an argument and returns either the accepted text, a replacement
     *     text, or null to abort the change.
     * @extends {Blockly.FieldNumber}
     * @constructor
     */
    constructor(value_, params, opt_validator) {
        super(String(value_), '-100', '100', '1', '10', 'Speed', opt_validator);
        this.isFieldCustom_ = true;
        this.params = params;
        if (this.params['min'])
            this.min_ = parseFloat(this.params.min);
        if (this.params['max'])
            this.max_ = parseFloat(this.params.max);
        if (this.params['label'])
            this.labelText_ = this.params.label;
        if (!this.params.format)
            this.params.format = "{0}%";
    }
    createLabelDom_(labelText) {
        const labelContainer = document.createElement('div');
        this.speedSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pxsim.svg.hydrate(this.speedSVG, {
            viewBox: "0 0 200 100",
            width: "170"
        });
        labelContainer.appendChild(this.speedSVG);
        const outerCircle = pxsim.svg.child(this.speedSVG, "circle", {
            'stroke-dasharray': '565.48', 'stroke-dashoffset': '0',
            'cx': 100, 'cy': 100, 'r': '90', 'style': `fill:transparent; transition: stroke-dashoffset 0.1s linear;`,
            'stroke': '#a8aaa8', 'stroke-width': '1rem'
        });
        this.circleBar = pxsim.svg.child(this.speedSVG, "circle", {
            'stroke-dasharray': '565.48', 'stroke-dashoffset': '0',
            'cx': 100, 'cy': 100, 'r': '90', 'style': `fill:transparent; transition: stroke-dashoffset 0.1s linear;`,
            'stroke': '#f12a21', 'stroke-width': '1rem'
        });
        this.reporter = pxsim.svg.child(this.speedSVG, "text", {
            'x': 100, 'y': 80,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            'style': `font-size: ${Math.max(14, 50 - 5 * (this.params.format.length - 4))}px`,
            'class': 'sim-text inverted number'
        });
        // labelContainer.setAttribute('class', 'blocklyFieldSliderLabel');
        const readout = document.createElement('span');
        readout.setAttribute('class', 'blocklyFieldSliderReadout');
        // const label = document.createElement('span');
        // label.setAttribute('class', 'blocklyFieldSliderLabelText');
        // label.innerHTML = labelText;
        // labelContainer.appendChild(label);
        // labelContainer.appendChild(readout);
        return [labelContainer, readout];
    }
    ;
    setReadout(value) {
        this.updateSpeed(typeof value === "string" ? parseFloat(value) : value);
        // Update reporter
        if (this.params && this.reporter) {
            this.reporter.textContent = ts.pxtc.U.rlf(this.params.format, value);
        }
    }
    updateSpeed(speed) {
        if (!this.circleBar)
            return;
        let sign = this.sign(speed);
        speed = (Math.abs(speed) / 100 * 50) + 50;
        if (sign == -1)
            speed = 50 - speed;
        let c = Math.PI * (90 * 2);
        let pct = ((100 - speed) / 100) * c;
        this.circleBar.setAttribute('stroke-dashoffset', `${pct}`);
    }
    // A re-implementation of Math.sign (since IE11 doesn't support it)
    sign(num) {
        return num ? num < 0 ? -1 : 1 : 0;
    }
}
exports.FieldSpeed = FieldSpeed;
