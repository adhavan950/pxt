"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMusicEditor = void 0;
var svg = pxt.svgUtil;
const field_asset_1 = require("./field_asset");
const field_utils_1 = require("./field_utils");
const PREVIEW_HEIGHT = 32;
const X_PADDING = 5;
const Y_PADDING = 1;
const BG_PADDING = 4;
const BG_HEIGHT = BG_PADDING * 2 + PREVIEW_HEIGHT;
const TOTAL_HEIGHT = Y_PADDING * 2 + BG_PADDING * 2 + PREVIEW_HEIGHT;
class FieldMusicEditor extends field_asset_1.FieldAssetEditor {
    getAssetType() {
        return "song" /* pxt.AssetType.Song */;
    }
    createNewAsset(text) {
        const project = pxt.react.getTilemapProject();
        if (text) {
            const asset = pxt.lookupProjectAssetByTSReference(text, project);
            if (asset)
                return asset;
        }
        if (this.getBlockData()) {
            return project.lookupAsset("song" /* pxt.AssetType.Song */, this.getBlockData());
        }
        let song;
        if (text) {
            const match = /^\s*hex\s*`([a-fA-F0-9]+)`\s*(?:;?)\s*$/.exec(text);
            if (match) {
                song = pxt.assets.music.decodeSongFromHex(match[1]);
            }
        }
        else {
            song = pxt.assets.music.getEmptySong(2);
        }
        if (!song) {
            this.isGreyBlock = true;
            this.valueText = text;
            return undefined;
        }
        else {
            // Restore all of the unused tracks
            pxt.assets.music.inflateSong(song);
        }
        const newAsset = {
            internalID: -1,
            id: this.temporaryAssetId(),
            type: "song" /* pxt.AssetType.Song */,
            meta: {},
            song
        };
        return newAsset;
    }
    render_() {
        super.render_();
        if (!this.isGreyBlock) {
            this.size_.height = TOTAL_HEIGHT;
            this.size_.width = X_PADDING * 2 + BG_PADDING * 2 + this.previewWidth();
        }
    }
    getValueText() {
        if (this.asset && !this.isTemporaryAsset()) {
            return pxt.getTSReferenceForAsset(this.asset);
        }
        return this.asset ? `hex\`${pxt.assets.music.encodeSongToHex(this.asset.song)}\`` : (this.valueText || "");
    }
    parseFieldOptions(opts) {
        return {};
    }
    redrawPreview() {
        var _a;
        if (!this.fieldGroup_)
            return;
        pxsim.U.clear(this.fieldGroup_);
        if (this.isGreyBlock) {
            super.redrawPreview();
            return;
        }
        const totalWidth = X_PADDING * 2 + BG_PADDING * 2 + this.previewWidth();
        const bg = new svg.Rect()
            .at(X_PADDING, Y_PADDING)
            .size(BG_PADDING * 2 + this.previewWidth(), BG_HEIGHT)
            .setClass("blocklySpriteField")
            .stroke("#898989", 1)
            .corner(4);
        this.fieldGroup_.appendChild(bg.el);
        if (this.asset) {
            const dataURI = (0, field_utils_1.songToDataURI)(this.asset.song, this.previewWidth(), PREVIEW_HEIGHT, this.lightMode);
            if (dataURI) {
                const img = new svg.Image()
                    .src(dataURI)
                    .at(X_PADDING + BG_PADDING, Y_PADDING + BG_PADDING)
                    .size(this.previewWidth(), PREVIEW_HEIGHT);
                this.fieldGroup_.appendChild(img.el);
            }
        }
        if (((_a = this.size_) === null || _a === void 0 ? void 0 : _a.width) != totalWidth) {
            this.forceRerender();
        }
    }
    previewWidth() {
        const measures = this.asset ? this.asset.song.measures : 2;
        return measures * PREVIEW_HEIGHT;
    }
}
exports.FieldMusicEditor = FieldMusicEditor;
