"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingFlyout = void 0;
const Blockly = require("blockly");
const blockInflater_1 = require("./blockInflater");
class CachingFlyout extends Blockly.VerticalFlyout {
    constructor() {
        super(...arguments);
        this.forceOpen = false;
    }
    clearBlockCache() {
        const inflater = this.getInflaterForType("block");
        if (inflater instanceof blockInflater_1.MultiFlyoutRecyclableBlockInflater) {
            inflater.clearCache();
        }
    }
    getFlyoutElement() {
        return this.svgGroup_;
    }
    setForceOpen(forceOpen) {
        this.forceOpen = forceOpen;
    }
}
exports.CachingFlyout = CachingFlyout;
