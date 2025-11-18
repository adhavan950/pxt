"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocklyTilemapChange = exports.FieldAssetEditor = void 0;
const Blockly = require("blockly");
var svg = pxt.svgUtil;
const field_base_1 = require("./field_base");
const field_utils_1 = require("./field_utils");
// 32 is specifically chosen so that we can scale the images for the default
// sprite sizes without getting browser anti-aliasing
const PREVIEW_WIDTH = 32;
const X_PADDING = 5;
const Y_PADDING = 1;
const BG_PADDING = 4;
const BG_WIDTH = BG_PADDING * 2 + PREVIEW_WIDTH;
const TOTAL_HEIGHT = Y_PADDING * 2 + BG_PADDING * 2 + PREVIEW_WIDTH;
const TOTAL_WIDTH = X_PADDING * 2 + BG_PADDING * 2 + PREVIEW_WIDTH;
class FieldAssetEditor extends field_base_1.FieldBase {
    constructor(text, params, validator) {
        super(text, params, validator);
        this.pendingEdit = false;
        this.isEmpty = false;
        this.assetChangeListener = () => {
            if (this.pendingEdit)
                return;
            const id = this.getBlockData();
            if (id) {
                this.asset = pxt.react.getTilemapProject().lookupAsset(this.getAssetType(), id);
            }
            this.redrawPreview();
        };
        this.lightMode = params.lightMode;
        this.params = this.parseFieldOptions(params);
        this.blocksInfo = params.blocksInfo;
    }
    onInit() {
        this.redrawPreview();
    }
    onValueChanged(newValue) {
        this.parseValueText(newValue);
        this.redrawPreview();
        return this.getValueText();
    }
    saveState(_doFullSerialization) {
        if (this.asset && !this.isTemporaryAsset()) {
            return (0, field_utils_1.getAssetSaveState)(this.asset);
        }
        else {
            return super.saveState(_doFullSerialization);
        }
    }
    loadState(state) {
        if (typeof state === "string") {
            super.loadState(state);
            return;
        }
        const asset = (0, field_utils_1.loadAssetFromSaveState)(state);
        super.loadState(pxt.getTSReferenceForAsset(asset));
        this.asset = asset;
        this.setBlockData(this.asset.id);
    }
    showEditor_() {
        if (this.isGreyBlock)
            return;
        const params = Object.assign({}, this.params);
        params.blocksInfo = this.blocksInfo;
        let editorKind;
        switch (this.asset.type) {
            case "tile" /* pxt.AssetType.Tile */:
            case "image" /* pxt.AssetType.Image */:
                editorKind = "image-editor";
                params.temporaryAssets = (0, field_utils_1.getTemporaryAssets)(this.sourceBlock_.workspace, "image" /* pxt.AssetType.Image */);
                break;
            case "animation" /* pxt.AssetType.Animation */:
                editorKind = "animation-editor";
                params.temporaryAssets = (0, field_utils_1.getTemporaryAssets)(this.sourceBlock_.workspace, "image" /* pxt.AssetType.Image */)
                    .concat((0, field_utils_1.getTemporaryAssets)(this.sourceBlock_.workspace, "animation" /* pxt.AssetType.Animation */));
                break;
            case "tilemap" /* pxt.AssetType.Tilemap */:
                editorKind = "tilemap-editor";
                const project = pxt.react.getTilemapProject();
                pxt.sprite.addMissingTilemapTilesAndReferences(project, this.asset);
                for (const tile of (0, field_utils_1.getTilesReferencedByTilesets)(this.sourceBlock_.workspace)) {
                    if (this.asset.data.projectReferences.indexOf(tile.id) === -1) {
                        this.asset.data.projectReferences.push(tile.id);
                    }
                }
                break;
            case "song" /* pxt.AssetType.Song */:
                editorKind = "music-editor";
                params.temporaryAssets = (0, field_utils_1.getTemporaryAssets)(this.sourceBlock_.workspace, "song" /* pxt.AssetType.Song */);
                (0, field_utils_1.setMelodyEditorOpen)(this.sourceBlock_, true);
                break;
        }
        if (this.isFullscreen()) {
            this.showEditorFullscreen(editorKind, params);
        }
        else {
            this.showEditorInWidgetDiv(editorKind, params);
        }
    }
    getFieldDescription() {
        var _a, _b;
        return ((_b = (_a = this.asset) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.displayName) || this.getAssetType().toString();
    }
    showEditorFullscreen(editorKind, params) {
        const fv = pxt.react.getFieldEditorView(editorKind, this.asset, params);
        if (this.undoRedoState) {
            fv.restorePersistentData(this.undoRedoState);
        }
        pxt.react.getTilemapProject().pushUndo();
        fv.onHide(() => {
            this.onFieldEditorHide(fv);
        });
        fv.show();
    }
    showEditorInWidgetDiv(editorKind, params) {
        let bbox;
        // This is due to the changes in https://github.com/microsoft/pxt-blockly/pull/289
        // which caused the widgetdiv to jump around if any fields underneath changed size
        let widgetOwner = {
            getScaledBBox: () => bbox
        };
        Blockly.WidgetDiv.show(widgetOwner, this.sourceBlock_.RTL, () => {
            if (document.activeElement && document.activeElement.tagName === "INPUT")
                document.activeElement.blur();
            fv.hide();
            widgetDiv.classList.remove("sound-effect-editor-widget");
            widgetDiv.style.transform = "";
            widgetDiv.style.position = "";
            widgetDiv.style.left = "";
            widgetDiv.style.top = "";
            widgetDiv.style.width = "";
            widgetDiv.style.height = "";
            widgetDiv.style.opacity = "";
            widgetDiv.style.transition = "";
            widgetDiv.style.alignItems = "";
            this.onFieldEditorHide(fv);
        });
        const widgetDiv = Blockly.WidgetDiv.getDiv();
        const fv = pxt.react.getFieldEditorView(editorKind, this.asset, params, widgetDiv);
        const block = this.sourceBlock_;
        const bounds = block.getBoundingRectangle();
        const coord = (0, field_utils_1.workspaceToScreenCoordinates)(block.workspace, new Blockly.utils.Coordinate(bounds.right, bounds.top));
        const animationDistance = 20;
        const left = coord.x - 400;
        const top = coord.y + 60 - animationDistance;
        widgetDiv.style.opacity = "0";
        widgetDiv.classList.add("sound-effect-editor-widget");
        widgetDiv.style.position = "absolute";
        widgetDiv.style.left = left + "px";
        widgetDiv.style.top = top + "px";
        widgetDiv.style.width = "50rem";
        widgetDiv.style.height = "34.25rem";
        widgetDiv.style.display = "flex";
        widgetDiv.style.alignItems = "center";
        widgetDiv.style.transition = "transform 0.25s ease 0s, opacity 0.25s ease 0s";
        widgetDiv.style.borderRadius = "";
        fv.onHide(() => {
            Blockly.WidgetDiv.hideIfOwner(widgetOwner);
        });
        fv.show();
        const divBounds = widgetDiv.getBoundingClientRect();
        const injectDivBounds = block.workspace.getInjectionDiv().getBoundingClientRect();
        if (divBounds.height > injectDivBounds.height) {
            widgetDiv.style.height = "";
            widgetDiv.style.top = `calc(1rem - ${animationDistance}px)`;
            widgetDiv.style.bottom = `calc(1rem + ${animationDistance}px)`;
        }
        else {
            if (divBounds.bottom > injectDivBounds.bottom || divBounds.top < injectDivBounds.top) {
                // This editor is pretty tall, so just center vertically on the inject div
                widgetDiv.style.top = (injectDivBounds.top + (injectDivBounds.height / 2) - (divBounds.height / 2)) - animationDistance + "px";
            }
        }
        const toolboxWidth = block.workspace.getToolbox().getWidth();
        const workspaceLeft = injectDivBounds.left + toolboxWidth;
        if (divBounds.width > injectDivBounds.width - toolboxWidth) {
            widgetDiv.style.width = "";
            widgetDiv.style.left = "1rem";
            widgetDiv.style.right = "1rem";
        }
        else {
            // Check to see if we are bleeding off the right side of the canvas
            if (divBounds.left + divBounds.width >= injectDivBounds.right) {
                // If so, try and place to the left of the block instead of the right
                const blockLeft = (0, field_utils_1.workspaceToScreenCoordinates)(block.workspace, new Blockly.utils.Coordinate(bounds.left, bounds.top));
                if (blockLeft.x - divBounds.width - 20 > workspaceLeft) {
                    widgetDiv.style.left = (blockLeft.x - divBounds.width - 20) + "px";
                }
                else {
                    // As a last resort, just center on the inject div
                    widgetDiv.style.left = (workspaceLeft + ((injectDivBounds.width - toolboxWidth) / 2) - divBounds.width / 2) + "px";
                }
            }
            else if (divBounds.left < injectDivBounds.left) {
                widgetDiv.style.left = workspaceLeft + "px";
            }
        }
        const finalDimensions = widgetDiv.getBoundingClientRect();
        bbox = new Blockly.utils.Rect(finalDimensions.top, finalDimensions.bottom, finalDimensions.left, finalDimensions.right);
        requestAnimationFrame(() => {
            widgetDiv.style.opacity = "1";
            widgetDiv.style.transform = `translateY(${animationDistance}px)`;
        });
    }
    onFieldEditorHide(fv) {
        var _a;
        let result = fv.getResult();
        const project = pxt.react.getTilemapProject();
        if (this.asset.type === "song" /* pxt.AssetType.Song */) {
            (0, field_utils_1.setMelodyEditorOpen)(this.sourceBlock_, false);
        }
        if (result) {
            const old = this.getValue();
            if (pxt.assetEquals(this.asset, result))
                return;
            result = pxt.patchTemporaryAsset(this.asset, result, project);
            const oldId = isTemporaryAsset(this.asset) ? null : this.asset.id;
            const newId = isTemporaryAsset(result) ? null : result.id;
            this.pendingEdit = true;
            if ((_a = result.meta) === null || _a === void 0 ? void 0 : _a.displayName)
                this.disposeOfTemporaryAsset();
            this.asset = result;
            const lastRevision = project.revision();
            this.onEditorClose(this.asset);
            this.updateAssetListener();
            this.updateAssetMeta();
            this.redrawPreview();
            this.undoRedoState = fv.getPersistentData();
            if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
                const event = new BlocklyTilemapChange(this.sourceBlock_, 'field', this.name, old, this.getValue(), lastRevision, project.revision());
                if (oldId !== newId) {
                    event.oldAssetId = oldId;
                    event.newAssetId = newId;
                }
                Blockly.Events.fire(event);
            }
            this.pendingEdit = false;
        }
    }
    render_() {
        if (this.isGreyBlock && !this.textElement_) {
            this.createTextElement_();
        }
        super.render_();
        if (!this.isGreyBlock) {
            this.size_.height = TOTAL_HEIGHT;
            this.size_.width = TOTAL_WIDTH;
        }
    }
    getDisplayText_() {
        // This is only used when isGreyBlock is true
        if (this.isGreyBlock) {
            const text = pxt.Util.htmlUnescape(this.valueText);
            return text.substr(0, text.indexOf("(")) + "(...)";
        }
        return "";
    }
    updateEditable() {
        if (this.isGreyBlock && this.fieldGroup_) {
            const group = this.fieldGroup_;
            Blockly.utils.dom.removeClass(group, 'blocklyNonEditableText');
            Blockly.utils.dom.removeClass(group, 'blocklyEditableText');
            group.style.cursor = '';
        }
        else {
            super.updateEditable();
        }
    }
    getValue() {
        if (this.isGreyBlock)
            return pxt.Util.htmlUnescape(this.valueText);
        return this.getValueText();
    }
    onDispose() {
        var _a;
        if (((_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.workspace) && !this.sourceBlock_.workspace.rendered) {
            this.disposeOfTemporaryAsset();
        }
        pxt.react.getTilemapProject().removeChangeListener(this.getAssetType(), this.assetChangeListener);
    }
    disposeOfTemporaryAsset() {
        if (this.isTemporaryAsset()) {
            pxt.react.getTilemapProject().removeAsset(this.asset);
            this.setBlockData(null);
            this.asset = undefined;
        }
    }
    clearTemporaryAssetData() {
        if (this.isTemporaryAsset()) {
            this.setBlockData(null);
        }
    }
    isTemporaryAsset() {
        return isTemporaryAsset(this.asset);
    }
    getAsset() {
        return this.asset;
    }
    updateAsset(asset) {
        this.asset = asset;
        this.setValue(this.getValue());
    }
    onEditorClose(newValue) {
        // Subclass
    }
    redrawPreview() {
        if (!this.fieldGroup_)
            return;
        pxsim.U.clear(this.fieldGroup_);
        if (this.isGreyBlock) {
            this.createTextElement_();
            this.render_();
            this.updateEditable();
            return;
        }
        const bg = new svg.Rect()
            .at(X_PADDING, Y_PADDING)
            .size(BG_WIDTH, BG_WIDTH)
            .setClass("blocklySpriteField")
            .stroke("#898989", 1)
            .corner(4);
        this.fieldGroup_.appendChild(bg.el);
        if (this.asset) {
            let dataURI;
            switch (this.asset.type) {
                case "image" /* pxt.AssetType.Image */:
                case "tile" /* pxt.AssetType.Tile */:
                    dataURI = (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(this.asset.bitmap), PREVIEW_WIDTH, this.lightMode);
                    break;
                case "animation" /* pxt.AssetType.Animation */:
                    dataURI = (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(this.asset.frames[0]), PREVIEW_WIDTH, this.lightMode);
                    break;
                case "tilemap" /* pxt.AssetType.Tilemap */:
                    dataURI = (0, field_utils_1.tilemapToImageURI)(this.asset.data, PREVIEW_WIDTH, this.lightMode);
                    break;
                case "song" /* pxt.AssetType.Song */:
                    dataURI = (0, field_utils_1.songToDataURI)(this.asset.song, 60, 20, this.lightMode);
                    break;
            }
            if (dataURI) {
                const img = new svg.Image()
                    .src(dataURI)
                    .at(X_PADDING + BG_PADDING, Y_PADDING + BG_PADDING)
                    .size(PREVIEW_WIDTH, PREVIEW_WIDTH);
                this.fieldGroup_.appendChild(img.el);
            }
        }
    }
    parseValueText(newText) {
        newText = pxt.Util.htmlUnescape(newText);
        if (this.sourceBlock_) {
            const project = pxt.react.getTilemapProject();
            const id = this.getBlockData();
            const existing = project.lookupAsset(this.getAssetType(), id);
            if (existing && !(newText && this.isEmpty)) {
                this.asset = existing;
            }
            else {
                this.setBlockData(null);
                if (this.asset) {
                    if (this.sourceBlock_ && this.asset.meta.blockIDs) {
                        this.asset.meta.blockIDs = this.asset.meta.blockIDs.filter(id => id !== this.sourceBlock_.id);
                        if (!this.isTemporaryAsset()) {
                            project.updateAsset(this.asset);
                        }
                    }
                }
                this.isEmpty = !newText;
                this.asset = this.createNewAsset(newText);
            }
            this.updateAssetMeta();
            this.updateAssetListener();
        }
    }
    parseFieldOptions(opts) {
        const parsed = {
            initWidth: 16,
            initHeight: 16,
            disableResize: false,
            lightMode: false
        };
        if (!opts) {
            return parsed;
        }
        if (opts.disableResize) {
            parsed.disableResize = opts.disableResize.toLowerCase() === "true" || opts.disableResize === "1";
        }
        parsed.initWidth = withDefault(opts.initWidth, parsed.initWidth);
        parsed.initHeight = withDefault(opts.initHeight, parsed.initHeight);
        parsed.lightMode = opts.lightMode;
        return parsed;
        function withDefault(raw, def) {
            const res = parseInt(raw);
            if (isNaN(res)) {
                return def;
            }
            return res;
        }
    }
    updateAssetMeta() {
        if (!this.asset)
            return;
        if (!this.asset.meta) {
            this.asset.meta = {};
        }
        if (!this.asset.meta.blockIDs) {
            this.asset.meta.blockIDs = [];
        }
        if (this.sourceBlock_) {
            if (this.asset.meta.blockIDs.indexOf(this.sourceBlock_.id) === -1) {
                const blockIDs = this.asset.meta.blockIDs;
                if (blockIDs.length && this.isTemporaryAsset() && blockIDs.some(id => this.sourceBlock_.workspace.getBlockById(id))) {
                    // This temporary asset is already used, so we should clone a copy for ourselves
                    this.asset = pxt.cloneAsset(this.asset);
                    this.asset.meta.blockIDs = [];
                }
                this.asset.meta.blockIDs.push(this.sourceBlock_.id);
            }
            this.setBlockData(this.isTemporaryAsset() ? null : this.asset.id);
        }
        if (!this.isTemporaryAsset()) {
            pxt.react.getTilemapProject().updateAsset(this.asset);
        }
        else {
            this.asset.meta.temporaryInfo = {
                blockId: this.sourceBlock_.id,
                fieldName: this.name
            };
        }
    }
    updateAssetListener() {
        pxt.react.getTilemapProject().removeChangeListener(this.getAssetType(), this.assetChangeListener);
        if (this.asset && !this.isTemporaryAsset()) {
            pxt.react.getTilemapProject().addChangeListener(this.asset, this.assetChangeListener);
        }
    }
    isFullscreen() {
        return true;
    }
    temporaryAssetId() {
        return this.sourceBlock_.id + "_" + this.name;
    }
}
exports.FieldAssetEditor = FieldAssetEditor;
function isTemporaryAsset(asset) {
    return asset && !asset.meta.displayName;
}
class BlocklyTilemapChange extends Blockly.Events.BlockChange {
    constructor(block, element, name, oldValue, newValue, oldRevision, newRevision) {
        super(block, element, name, oldValue, newValue);
        this.oldRevision = oldRevision;
        this.newRevision = newRevision;
        this.fieldName = name;
    }
    isNull() {
        return this.oldRevision === this.newRevision && super.isNull();
    }
    run(forward) {
        if (this.newAssetId || this.oldAssetId) {
            const block = this.getEventWorkspace_().getBlockById(this.blockId);
            if (forward) {
                (0, field_utils_1.setBlockDataForField)(block, this.fieldName, this.newAssetId);
            }
            else {
                (0, field_utils_1.setBlockDataForField)(block, this.fieldName, this.oldAssetId);
            }
        }
        if (forward) {
            pxt.react.getTilemapProject().redo();
            super.run(forward);
        }
        else {
            pxt.react.getTilemapProject().undo();
            super.run(forward);
        }
        const ws = this.getEventWorkspace_();
        // Fire an event to force a recompile, but make sure it doesn't end up on the undo stack
        const ev = new BlocklyTilemapChange(ws.getBlockById(this.blockId), 'tilemap-revision', "revision", null, pxt.react.getTilemapProject().revision(), 0, 0);
        ev.recordUndo = false;
        Blockly.Events.fire(ev);
    }
}
exports.BlocklyTilemapChange = BlocklyTilemapChange;
