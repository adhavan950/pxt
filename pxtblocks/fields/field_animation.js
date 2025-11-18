"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldAnimationEditor = void 0;
var svg = pxt.svgUtil;
const field_asset_1 = require("./field_asset");
const field_utils_1 = require("./field_utils");
// 32 is specifically chosen so that we can scale the images for the default
// sprite sizes without getting browser anti-aliasing
const PREVIEW_WIDTH = 32;
const X_PADDING = 5;
const Y_PADDING = 1;
const BG_PADDING = 4;
const BG_WIDTH = BG_PADDING * 2 + PREVIEW_WIDTH;
const ICON_WIDTH = 30;
const TOTAL_HEIGHT = Y_PADDING * 2 + BG_PADDING * 2 + PREVIEW_WIDTH;
const TOTAL_WIDTH = X_PADDING * 2 + BG_PADDING * 2 + PREVIEW_WIDTH + ICON_WIDTH;
class FieldAnimationEditor extends field_asset_1.FieldAssetEditor {
    constructor() {
        super(...arguments);
        this.onMouseEnter = () => {
            if (this.animateRef || !this.asset)
                return;
            const assetInterval = this.getParentInterval() || this.asset.interval;
            const interval = assetInterval > 50 ? assetInterval : 50;
            let index = 0;
            this.animateRef = setInterval(() => {
                if (this.preview && this.frames[index])
                    this.preview.src(this.frames[index]);
                index = (index + 1) % this.frames.length;
            }, interval);
        };
        this.onMouseLeave = () => {
            if (this.animateRef)
                clearInterval(this.animateRef);
            this.animateRef = undefined;
            if (this.preview && this.frames[0]) {
                this.preview.src(this.frames[0]);
            }
        };
    }
    initView() {
        // Register mouseover events for animating preview
        this.sourceBlock_.getSvgRoot().addEventListener("mouseenter", this.onMouseEnter);
        this.sourceBlock_.getSvgRoot().addEventListener("mouseleave", this.onMouseLeave);
    }
    showEditor_() {
        // Read parent interval
        if (this.asset) {
            this.asset.interval = this.getParentInterval() || this.asset.interval;
        }
        super.showEditor_();
    }
    render_() {
        super.render_();
        this.size_.height = TOTAL_HEIGHT;
        this.size_.width = TOTAL_WIDTH;
    }
    getAssetType() {
        return "animation" /* pxt.AssetType.Animation */;
    }
    createNewAsset(text) {
        const project = pxt.react.getTilemapProject();
        if (text) {
            const existing = pxt.lookupProjectAssetByTSReference(text, project);
            if (existing)
                return existing;
            const frames = parseImageArrayString(text, this.params.taggedTemplate);
            if (frames && frames.length) {
                const id = this.temporaryAssetId();
                const newAnimation = {
                    internalID: -1,
                    id,
                    type: "animation" /* pxt.AssetType.Animation */,
                    frames,
                    interval: this.getParentInterval(),
                    meta: {},
                };
                return newAnimation;
            }
            const asset = project.lookupAssetByName("animation" /* pxt.AssetType.Animation */, text.trim());
            if (asset)
                return asset;
        }
        const id = this.temporaryAssetId();
        const bitmap = new pxt.sprite.Bitmap(this.params.initWidth, this.params.initHeight).data();
        const newAnimation = {
            internalID: -1,
            id,
            type: "animation" /* pxt.AssetType.Animation */,
            frames: [bitmap],
            interval: 500,
            meta: {},
        };
        return newAnimation;
    }
    onEditorClose(newValue) {
        this.setParentInterval(newValue.interval);
    }
    getValueText() {
        if (!this.asset)
            return this.valueText || "[]";
        if (this.isTemporaryAsset()) {
            return "[" + this.asset.frames.map(frame => pxt.sprite.bitmapToImageLiteral(pxt.sprite.Bitmap.fromData(frame), "typescript" /* pxt.editor.FileType.TypeScript */, this.params.taggedTemplate)).join(",") + "]";
        }
        return pxt.getTSReferenceForAsset(this.asset);
    }
    redrawPreview() {
        if (!this.fieldGroup_)
            return;
        pxsim.U.clear(this.fieldGroup_);
        const bg = new svg.Rect()
            .at(X_PADDING + ICON_WIDTH, Y_PADDING)
            .size(BG_WIDTH, BG_WIDTH)
            .corner(4)
            .setClass("blocklyAnimationField");
        this.fieldGroup_.appendChild(bg.el);
        const icon = new svg.Text("\uf008")
            .at(X_PADDING, 5 + (TOTAL_HEIGHT >> 1))
            .setClass("semanticIcon");
        this.fieldGroup_.appendChild(icon.el);
        if (this.asset) {
            this.frames = this.asset.frames.map(frame => (0, field_utils_1.bitmapToImageURI)(pxt.sprite.Bitmap.fromData(frame), PREVIEW_WIDTH, this.lightMode));
            this.preview = new svg.Image()
                .src(this.frames[0])
                .at(X_PADDING + BG_PADDING + ICON_WIDTH, Y_PADDING + BG_PADDING)
                .size(PREVIEW_WIDTH, PREVIEW_WIDTH);
            this.fieldGroup_.appendChild(this.preview.el);
        }
    }
    getParentIntervalBlock() {
        const s = this.sourceBlock_;
        if (s.getParent()) {
            const p = s.getParent();
            for (const input of p.inputList) {
                if (input.name === "frameInterval") {
                    return input.connection.targetBlock();
                }
            }
        }
        return undefined;
    }
    setParentInterval(interval) {
        const target = this.getParentIntervalBlock();
        if (target) {
            const fieldName = getFieldName(target);
            if (fieldName) {
                target.setFieldValue(String(interval), fieldName);
            }
        }
    }
    getParentInterval() {
        const target = this.getParentIntervalBlock();
        if (target) {
            const fieldName = getFieldName(target);
            if (fieldName) {
                return Number(target.getFieldValue(fieldName));
            }
        }
        return 100;
    }
    parseFieldOptions(opts) {
        return parseFieldOptions(opts);
    }
}
exports.FieldAnimationEditor = FieldAnimationEditor;
function parseFieldOptions(opts) {
    const parsed = {
        initWidth: 16,
        initHeight: 16,
        disableResize: false,
        lightMode: false
    };
    if (!opts) {
        return parsed;
    }
    parsed.lightMode = opts.lightMode;
    if (opts.filter) {
        parsed.filter = opts.filter;
    }
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
function parseImageArrayString(str, templateLiteral) {
    if (str.indexOf("[") === -1)
        return null;
    str = str.replace(/[\[\]]/mg, "");
    return str.split(",").map(s => pxt.sprite.imageLiteralToBitmap(s, templateLiteral).data()).filter(b => b.height && b.width);
}
function isNumberType(type) {
    return type === "math_number" || type === "math_integer" || type === "math_whole_number";
}
function getFieldName(target) {
    if (target.type === "math_number_minmax") {
        return "SLIDER";
    }
    else if (isNumberType(target.type)) {
        return "NUM";
    }
    else if (target.type === "timePicker") {
        return "ms";
    }
    return null;
}
