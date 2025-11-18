"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spriteEditorDefinition = exports.MonacoSpriteEditor = void 0;
const field_react_1 = require("./field_react");
const monacoFieldEditor_1 = require("./monacoFieldEditor");
const fieldEditorId = "image-editor";
class MonacoSpriteEditor extends field_react_1.MonacoReactFieldEditor {
    textToValue(text) {
        this.isPython = text.indexOf("`") === -1;
        this.template = text.startsWith("bmp") ? "bmp" : "img";
        const match = pxt.parseAssetTSReference(text);
        if (match) {
            const { name: matchedName } = match;
            const name = matchedName.trim();
            const project = pxt.react.getTilemapProject();
            this.isAsset = true;
            const asset = project.lookupAssetByName("image" /* pxt.AssetType.Image */, name);
            if (asset) {
                this.editing = asset;
                return asset;
            }
            else {
                const newAsset = project.createNewImage();
                if (name && !project.isNameTaken("image" /* pxt.AssetType.Image */, name) && pxt.validateAssetName(name)) {
                    newAsset.meta.displayName = name;
                }
                this.editing = newAsset;
                return newAsset;
            }
        }
        this.editing = createFakeAsset(pxt.sprite.imageLiteralToBitmap(text, this.template));
        return this.editing;
    }
    resultToText(result) {
        var _a;
        const project = pxt.react.getTilemapProject();
        project.pushUndo();
        result = pxt.patchTemporaryAsset(this.editing, result, project);
        if ((_a = result.meta) === null || _a === void 0 ? void 0 : _a.displayName) {
            if (this.isAsset || project.lookupAsset(result.type, result.id)) {
                result = project.updateAsset(result);
            }
            else {
                result = project.createNewProjectImage(result.bitmap, result.meta.displayName);
            }
            this.isAsset = true;
            return pxt.getTSReferenceForAsset(result, this.isPython);
        }
        return pxt.sprite.bitmapToImageLiteral(pxt.sprite.Bitmap.fromData(result.bitmap), this.isPython ? "python" : "typescript", this.template);
    }
    getFieldEditorId() {
        return "image-editor";
    }
    getOptions() {
        return {
            initWidth: 16,
            initHeight: 16,
            blocksInfo: this.host.blocksInfo()
        };
    }
}
exports.MonacoSpriteEditor = MonacoSpriteEditor;
function createFakeAsset(bitmap) {
    return {
        type: "image" /* pxt.AssetType.Image */,
        id: "",
        internalID: 0,
        bitmap: bitmap.data(),
        meta: {},
        jresData: ""
    };
}
exports.spriteEditorDefinition = {
    id: fieldEditorId,
    foldMatches: true,
    glyphCssClass: "sprite-editor-glyph sprite-focus-hover",
    heightInPixels: 510,
    matcher: {
        // match both JS and python
        searchString: "(?:img|bmp|assets\\s*\\.\\s*image)\\s*(?:`|\\(\\s*\"\"\")(?:(?:[^(){}:\\[\\]\"';?/,+\\-=*&|^%!`~]|\\n)*)\\s*(?:`|\"\"\"\\s*\\))",
        isRegex: true,
        matchCase: true,
        matchWholeWord: false
    },
    proto: MonacoSpriteEditor
};
(0, monacoFieldEditor_1.registerMonacoFieldEditor)(fieldEditorId, exports.spriteEditorDefinition);
