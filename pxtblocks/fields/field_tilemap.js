"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTilemap = void 0;
const field_asset_1 = require("./field_asset");
class FieldTilemap extends field_asset_1.FieldAssetEditor {
    getInitText() {
        return this.initText;
    }
    getTileset() {
        var _a;
        return (_a = this.asset) === null || _a === void 0 ? void 0 : _a.data.tileset;
    }
    getAssetType() {
        return "tilemap" /* pxt.AssetType.Tilemap */;
    }
    createNewAsset(newText = "") {
        var _a;
        if (newText) {
            // backticks are escaped inside markdown content
            newText = newText.replace(/&#96;/g, "`");
        }
        const project = pxt.react.getTilemapProject();
        const existing = pxt.lookupProjectAssetByTSReference(newText, project);
        if (existing)
            return existing;
        if ((_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.isInFlyout)
            return undefined;
        const tilemap = pxt.sprite.decodeTilemap(newText, "typescript", project) || project.blankTilemap(this.params.tileWidth, this.params.initWidth, this.params.initHeight);
        let newAsset;
        // Ignore invalid bitmaps
        if (checkTilemap(tilemap)) {
            this.initText = newText;
            this.isGreyBlock = false;
            const [name] = project.createNewTilemapFromData(tilemap);
            newAsset = project.getTilemap(name);
        }
        else if (newText.trim()) {
            this.isGreyBlock = true;
            this.valueText = newText;
        }
        return newAsset;
    }
    onEditorClose(newValue) {
        pxt.sprite.updateTilemapReferencesFromResult(pxt.react.getTilemapProject(), newValue);
    }
    getValueText() {
        if (this.isGreyBlock)
            return pxt.Util.htmlUnescape(this.valueText);
        if (this.asset) {
            return pxt.getTSReferenceForAsset(this.asset);
        }
        if (this.initText) {
            return this.getInitText();
        }
        return this.valueText || "";
    }
    parseFieldOptions(opts) {
        return parseFieldOptions(opts);
    }
}
exports.FieldTilemap = FieldTilemap;
function parseFieldOptions(opts) {
    const parsed = {
        initWidth: 16,
        initHeight: 16,
        disableResize: false,
        tileWidth: 16,
        lightMode: false
    };
    if (!opts) {
        return parsed;
    }
    parsed.lightMode = opts.lightMode;
    if (opts.filter) {
        parsed.filter = opts.filter;
    }
    if (opts.tileWidth) {
        if (typeof opts.tileWidth === "number") {
            switch (opts.tileWidth) {
                case 4:
                    parsed.tileWidth = 4;
                    break;
                case 8:
                    parsed.tileWidth = 8;
                    break;
                case 16:
                    parsed.tileWidth = 16;
                    break;
                case 32:
                    parsed.tileWidth = 32;
                    break;
            }
        }
        else {
            const tw = opts.tileWidth.trim().toLowerCase();
            switch (tw) {
                case "4":
                case "four":
                    parsed.tileWidth = 4;
                    break;
                case "8":
                case "eight":
                    parsed.tileWidth = 8;
                    break;
                case "16":
                case "sixteen":
                    parsed.tileWidth = 16;
                    break;
                case "32":
                case "thirtytwo":
                    parsed.tileWidth = 32;
                    break;
            }
        }
    }
    parsed.initWidth = withDefault(opts.initWidth, parsed.initWidth);
    parsed.initHeight = withDefault(opts.initHeight, parsed.initHeight);
    return parsed;
    function withDefault(raw, def) {
        const res = parseInt(raw);
        if (isNaN(res)) {
            return def;
        }
        return res;
    }
}
function checkTilemap(tilemap) {
    if (!tilemap || !tilemap.tilemap || !tilemap.tilemap.width || !tilemap.tilemap.height)
        return false;
    if (!tilemap.layers || tilemap.layers.width !== tilemap.tilemap.width || tilemap.layers.height !== tilemap.tilemap.height)
        return false;
    if (!tilemap.tileset)
        return false;
    return true;
}
