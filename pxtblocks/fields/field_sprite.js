"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSpriteEditor = void 0;
const field_asset_1 = require("./field_asset");
class FieldSpriteEditor extends field_asset_1.FieldAssetEditor {
    getAssetType() {
        return "image" /* pxt.AssetType.Image */;
    }
    createNewAsset(text) {
        const project = pxt.react.getTilemapProject();
        if (text) {
            const asset = pxt.lookupProjectAssetByTSReference(text, project);
            if (asset)
                return asset;
        }
        if (this.getBlockData()) {
            return project.lookupAsset("image" /* pxt.AssetType.Image */, this.getBlockData());
        }
        const bmp = text ? pxt.sprite.imageLiteralToBitmap(text, this.params.taggedTemplate) : new pxt.sprite.Bitmap(this.params.initWidth, this.params.initHeight);
        let data;
        if (!bmp) {
            // check for qualified name
            data = qNameToBitmapData(text);
            if (!data) {
                this.isGreyBlock = true;
                this.valueText = text;
                return undefined;
            }
            else {
                this.qName = text;
            }
        }
        if (!data)
            data = bmp.data();
        const newAsset = {
            internalID: -1,
            id: this.temporaryAssetId(),
            type: "image" /* pxt.AssetType.Image */,
            jresData: pxt.sprite.base64EncodeBitmap(data),
            meta: {},
            bitmap: data
        };
        return newAsset;
    }
    getValueText() {
        if (!this.asset)
            return this.valueText || "";
        if (this.asset && !this.isTemporaryAsset()) {
            return pxt.getTSReferenceForAsset(this.asset);
        }
        else if (this.qName) {
            // check if image has been edited
            const data = qNameToBitmapData(this.qName);
            if (data && pxt.sprite.bitmapEquals(data, this.asset.bitmap)) {
                return this.qName;
            }
        }
        return pxt.sprite.bitmapToImageLiteral(this.asset && pxt.sprite.Bitmap.fromData(this.asset.bitmap), "typescript" /* pxt.editor.FileType.TypeScript */, this.params.taggedTemplate);
    }
    parseFieldOptions(opts) {
        return parseFieldOptions(opts);
    }
}
exports.FieldSpriteEditor = FieldSpriteEditor;
function parseFieldOptions(opts) {
    // NOTE: This implementation is duplicated in pxtcompiler/emitter/service.ts
    // TODO: Refactor to share implementation.
    const parsed = {
        initColor: 1,
        initWidth: 16,
        initHeight: 16,
        disableResize: false,
        lightMode: false,
    };
    if (!opts) {
        return parsed;
    }
    parsed.lightMode = opts.lightMode;
    if (opts.sizes) {
        const pairs = opts.sizes.split(";");
        const sizes = [];
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split(",");
            if (pair.length !== 2) {
                continue;
            }
            let width = parseInt(pair[0]);
            let height = parseInt(pair[1]);
            if (isNaN(width) || isNaN(height)) {
                continue;
            }
            const screenSize = pxt.appTarget.runtime && pxt.appTarget.runtime.screenSize;
            if (width < 0 && screenSize)
                width = screenSize.width;
            if (height < 0 && screenSize)
                height = screenSize.height;
            sizes.push([width, height]);
        }
        if (sizes.length > 0) {
            parsed.initWidth = sizes[0][0];
            parsed.initHeight = sizes[0][1];
        }
    }
    if (opts.filter) {
        parsed.filter = opts.filter;
    }
    if (opts.disableResize) {
        parsed.disableResize = opts.disableResize.toLowerCase() === "true" || opts.disableResize === "1";
    }
    parsed.initColor = withDefault(opts.initColor, parsed.initColor);
    parsed.initWidth = withDefault(opts.initWidth, parsed.initWidth);
    parsed.initHeight = withDefault(opts.initHeight, parsed.initHeight);
    parsed.taggedTemplate = opts.taggedTemplate;
    return parsed;
    function withDefault(raw, def) {
        const res = parseInt(raw);
        if (isNaN(res)) {
            return def;
        }
        return res;
    }
}
function qNameToBitmapData(qName) {
    const project = pxt.react.getTilemapProject();
    const images = project.getGalleryAssets("image" /* pxt.AssetType.Image */).filter(asset => asset.id === qName);
    const img = images.length && images[0];
    if (img) {
        return img.bitmap;
    }
    return undefined;
}
