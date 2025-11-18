"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const Blockly = require("blockly");
const pathObject_1 = require("./pathObject");
const constants_1 = require("./constants");
const info_1 = require("./info");
const drawer_1 = require("./drawer");
class Renderer extends Blockly.zelos.Renderer {
    makePathObject(root, style) {
        return new pathObject_1.PathObject(root, style, this.getConstants());
    }
    makeConstants_() {
        return new constants_1.ConstantProvider();
    }
    makeRenderInfo_(block) {
        return new info_1.RenderInfo(this, block);
    }
    makeDrawer_(block, info) {
        return new drawer_1.Drawer(block, info);
    }
    render(block) {
        if (block.updateBeforeRender) {
            block.updateBeforeRender();
        }
        super.render(block);
    }
}
exports.Renderer = Renderer;
Blockly.blockRendering.register("pxt", Renderer);
