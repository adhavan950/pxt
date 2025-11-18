"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTileset = void 0;
const field_images_1 = require("./field_images");
const field_utils_1 = require("./field_utils");
const PREVIEW_SIDE_LENGTH = 32;
class FieldTileset extends field_images_1.FieldImages {
    constructor(text, options, validator) {
        super(text, options, validator);
        this.isFieldCustom_ = true;
        this.menuGenerator_ = () => {
            var _a, _b;
            if (((_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.workspace) && (0, field_utils_1.needsTilemapUpgrade)((_b = this.sourceBlock_) === null || _b === void 0 ? void 0 : _b.workspace)) {
                return [constructTransparentTile()];
            }
            return FieldTileset.getReferencedTiles(this.sourceBlock_.workspace);
        };
        this.assetChangeListener = () => {
            this.doValueUpdate_(this.getValue());
            this.forceRerender();
        };
        this.blocksInfo = options.blocksInfo;
    }
    static getReferencedTiles(workspace) {
        const project = pxt.react.getTilemapProject();
        const paletteKey = pxt.appTarget.runtime.palette ? pxt.appTarget.runtime.palette.join("") : undefined;
        if (paletteKey !== FieldTileset.cachedPalette) {
            this.bitmapCache.clear();
            this.cachedPalette = paletteKey;
            this.cachedRevision = -1;
        }
        if (FieldTileset.cachedRevision !== project.revision()) {
            FieldTileset.cachedRevision = project.revision();
            const references = (0, field_utils_1.getAllReferencedTiles)(workspace);
            const supportedTileWidths = [16, 4, 8, 32];
            for (const width of supportedTileWidths) {
                const projectTiles = project.getProjectTiles(width, width === 16);
                if (!projectTiles)
                    continue;
                for (const tile of projectTiles.tiles) {
                    if (!references.find(t => t.id === tile.id)) {
                        references.push(tile);
                    }
                }
            }
            let weights = {};
            references.sort((a, b) => {
                if (a.id === b.id)
                    return 0;
                if (a.bitmap.width !== b.bitmap.width) {
                    return a.bitmap.width - b.bitmap.width;
                }
                if (a.isProjectTile !== b.isProjectTile) {
                    if (a.isProjectTile)
                        return -1;
                    else
                        return 1;
                }
                return (weights[a.id] || (weights[a.id] = tileWeight(a.id))) -
                    (weights[b.id] || (weights[b.id] = tileWeight(b.id)));
            });
            FieldTileset.referencedTiles = references.map(tile => [{
                    src: FieldTileset.getTileImage(tile),
                    width: PREVIEW_SIDE_LENGTH,
                    height: PREVIEW_SIDE_LENGTH,
                    alt: displayName(tile) || tile.id
                }, tile.id, tile]);
        }
        return FieldTileset.referencedTiles;
    }
    static getTileImage(t) {
        const key = pxt.U.toHex(t.bitmap.data) + "-" + t.bitmap.width + "-" + t.bitmap.height;
        if (!this.bitmapCache.has(key)) {
            if (tileWeight(t.id) <= 2) {
                this.bitmapCache.set(key, mkTransparentTileImage(t.bitmap.width));
            }
            else {
                this.bitmapCache.set(key, (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(t.bitmap), PREVIEW_SIDE_LENGTH, false));
            }
        }
        return this.bitmapCache.get(key);
    }
    initView() {
        super.initView();
        if (this.sourceBlock_ && this.sourceBlock_.isInFlyout) {
            this.setValue(this.getOptions()[0][1]);
        }
    }
    getValue() {
        const project = pxt.react.getTilemapProject();
        if (this.selectedOption_) {
            let tile = this.selectedOption_[2];
            tile = project.lookupAsset(tile.type, tile.id);
            if (!tile) {
                // This shouldn't happen
                return super.getValue();
            }
            return pxt.getTSReferenceForAsset(tile);
        }
        const v = super.getValue();
        if (typeof v === "string") {
            if (v.indexOf(".") !== -1) {
                // Possibly a qualified name like myTiles.tile1
                const tile = project.lookupAsset("tile" /* pxt.AssetType.Tile */, v);
                if (tile) {
                    return pxt.getTSReferenceForAsset(tile);
                }
            }
            // If not a qualified name, it's either an image literal or an asset reference like assets.tile`name`
            if (v.indexOf(`\``) === -1) {
                // If the user decompiled from JavaScript, the decompiler strips out the "img" part
                // so we need to add it back
                return `img\`${v}\``;
            }
        }
        return v;
    }
    getText() {
        const v = this.getValue();
        if (typeof v === "string" && v.indexOf("`") !== -1) {
            return v;
        }
        return super.getText();
    }
    render_() {
        if (this.value_ && this.selectedOption_) {
            if (this.selectedOption_[1] !== this.value_) {
                const tile = pxt.react.getTilemapProject().resolveTile(this.value_);
                if (tile) {
                    this.selectedOption_ = [{
                            src: (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(tile.bitmap), PREVIEW_SIDE_LENGTH, false),
                            width: PREVIEW_SIDE_LENGTH,
                            height: PREVIEW_SIDE_LENGTH,
                            alt: displayName(tile) || tile.id
                        }, this.value_, tile];
                }
            }
        }
        super.render_();
    }
    doValueUpdate_(newValue) {
        let calledSuper = false;
        const options = this.getOptions(true);
        // This text can be one of four things:
        // 1. The JavaScript expression (assets.tile`name`)
        // 2. The tile id (qualified name)
        // 3. The tile display name
        // 4. Something invalid (like an image literal or undefined)
        if (newValue) {
            // If it's an expression, pull out the id
            const match = pxt.parseAssetTSReference(newValue);
            if (match) {
                newValue = match.name;
            }
            newValue = newValue.trim();
            for (const option of options) {
                if (newValue === option[2].id || newValue === option[2].meta.displayName || newValue === pxt.getShortIDForAsset(option[2])) {
                    this.selectedOption_ = option;
                    this.value_ = this.getValue();
                    this.updateAssetListener();
                    super.doValueUpdate_(option[1]);
                    calledSuper = true;
                    return;
                }
            }
            if (!calledSuper) {
                super.doValueUpdate_(newValue);
            }
            this.selectedOption_ = null;
            this.updateAssetListener();
        }
    }
    doClassValidation_(newValue) {
        const options = this.getOptions(true);
        if (!options.some(([_, id]) => id === newValue)) {
            if (newValue) {
                const project = pxt.react.getTilemapProject();
                const match = /^\s*assets\s*\.\s*tile\s*`([^`]*)`\s*$/.exec(newValue);
                let tile;
                if (match) {
                    tile = project.lookupAssetByName("tile" /* pxt.AssetType.Tile */, match[1]);
                }
                else if (newValue.startsWith(pxt.sprite.TILE_NAMESPACE)) {
                    tile = project.lookupAsset("tile" /* pxt.AssetType.Tile */, newValue.trim());
                }
                else {
                    tile = project.lookupAssetByName("tile" /* pxt.AssetType.Tile */, newValue.trim());
                }
                if (tile) {
                    this.localTile = tile;
                    return pxt.getTSReferenceForAsset(tile, false);
                }
            }
            if (this.sourceBlock_) {
                pxt.warn(`Trying to set tile reference to nonexistent tile. Block type: ${this.sourceBlock_.type}, Field name: ${this.name}, Value: ${newValue}`);
            }
            return null;
        }
        this.localTile = undefined;
        return newValue;
    }
    getOptions(opt_useCache) {
        if (typeof this.menuGenerator_ !== 'function') {
            this.transparent = constructTransparentTile();
            const res = [this.transparent];
            if (this.localTile) {
                res.push([
                    {
                        src: (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(this.localTile.bitmap), PREVIEW_SIDE_LENGTH, false),
                        width: PREVIEW_SIDE_LENGTH,
                        height: PREVIEW_SIDE_LENGTH,
                        alt: displayName(this.localTile) || this.localTile.id
                    },
                    this.localTile.id,
                    this.localTile
                ]);
            }
            return res;
        }
        return this.menuGenerator_.call(this);
    }
    dispose() {
        super.dispose();
        pxt.react.getTilemapProject().removeChangeListener("tile" /* pxt.AssetType.Tile */, this.assetChangeListener);
    }
    updateAssetListener() {
        const project = pxt.react.getTilemapProject();
        project.removeChangeListener("tile" /* pxt.AssetType.Tile */, this.assetChangeListener);
        if (this.selectedOption_) {
            project.addChangeListener(this.selectedOption_[2], this.assetChangeListener);
        }
    }
    saveState(_doFullSerialization) {
        var _a;
        let asset = this.localTile || ((_a = this.selectedOption_) === null || _a === void 0 ? void 0 : _a[2]);
        const project = pxt.react.getTilemapProject();
        if (!asset) {
            const value = this.getValue();
            const parsedTsReference = pxt.parseAssetTSReference(value);
            if (parsedTsReference) {
                asset = project.lookupAssetByName("tile" /* pxt.AssetType.Tile */, parsedTsReference.name);
            }
            if (!asset) {
                asset = project.lookupAsset("tile" /* pxt.AssetType.Tile */, value);
            }
        }
        if (asset === null || asset === void 0 ? void 0 : asset.isProjectTile) {
            return (0, field_utils_1.getAssetSaveState)(asset);
        }
        return super.saveState(_doFullSerialization);
    }
    loadState(state) {
        if (typeof state === "string") {
            super.loadState(state);
            return;
        }
        const asset = (0, field_utils_1.loadAssetFromSaveState)(state);
        this.localTile = asset;
        super.loadState(pxt.getTSReferenceForAsset(asset));
    }
    getFieldDescription() {
        return lf("tile");
    }
}
exports.FieldTileset = FieldTileset;
FieldTileset.cachedRevision = -1;
FieldTileset.bitmapCache = new Map();
function constructTransparentTile() {
    const tile = pxt.react.getTilemapProject().getTransparency(16);
    return [{
            src: mkTransparentTileImage(16),
            width: PREVIEW_SIDE_LENGTH,
            height: PREVIEW_SIDE_LENGTH,
            alt: pxt.U.lf("transparency")
        }, tile.id, tile];
}
function mkTransparentTileImage(sideLength) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = sideLength;
    canvas.height = sideLength;
    context.fillStyle = "#aeaeae";
    context.fillRect(0, 0, sideLength, sideLength);
    context.fillStyle = "#dedede";
    for (let x = 0; x < sideLength; x += 4) {
        for (let y = 0; y < sideLength; y += 4) {
            if (((x + y) >> 2) & 1)
                context.fillRect(x, y, 4, 4);
        }
    }
    return canvas.toDataURL();
}
function tileWeight(id) {
    switch (id) {
        case "myTiles.transparency16":
            return 1;
        case "myTiles.transparency4":
        case "myTiles.transparency8":
        case "myTiles.transparency32":
            return 2;
        default:
            if (id.startsWith("myTiles.tile")) {
                const num = parseInt(id.slice(12));
                if (!Number.isNaN(num))
                    return num + 2;
            }
            return 9999999999;
    }
}
function displayName(tile) {
    return tile.meta.displayName || pxt.getShortIDForAsset(tile);
}
