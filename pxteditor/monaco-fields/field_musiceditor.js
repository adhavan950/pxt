"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songEditorDefinition = exports.MonacoSongEditor = void 0;
const field_react_1 = require("./field_react");
const monacoFieldEditor_1 = require("./monacoFieldEditor");
const fieldEditorId = "music-editor";
class MonacoSongEditor extends field_react_1.MonacoReactFieldEditor {
    textToValue(text) {
        this.isPython = text.indexOf("`") === -1;
        this.text = text;
        const match = pxt.parseAssetTSReference(text);
        if (match) {
            const { name: matchedName } = match;
            const name = matchedName.trim();
            const project = pxt.react.getTilemapProject();
            this.isAsset = true;
            const asset = project.lookupAssetByName("song" /* pxt.AssetType.Song */, name);
            if (asset) {
                this.editing = asset;
                return asset;
            }
            else {
                const newAsset = project.createNewSong(pxt.assets.music.getEmptySong(2));
                if (name && !project.isNameTaken("song" /* pxt.AssetType.Song */, name) && pxt.validateAssetName(name)) {
                    newAsset.meta.displayName = name;
                }
                this.editing = newAsset;
                return newAsset;
            }
        }
        const hexLiteralMatch = /hex\s*(?:`|\(""")\s*([a-fA-F0-9]*)\s*(?:`|"""\))\s*(?:;?)/m.exec(text);
        if (hexLiteralMatch) {
            const contents = hexLiteralMatch[1].trim();
            if (contents) {
                this.editing = createFakeAsset(pxt.assets.music.decodeSongFromHex(contents));
            }
            else {
                this.editing = createFakeAsset(pxt.assets.music.getEmptySong(2));
            }
            return this.editing;
        }
        return undefined; // never
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
                result = project.createNewSong(result.song, result.meta.displayName);
            }
            this.isAsset = true;
            return pxt.getTSReferenceForAsset(result, this.isPython);
        }
        let hexString = pxt.assets.music.encodeSongToHex(result.song);
        if (this.isPython) {
            hexString = `hex("""${hexString}""")`;
        }
        else {
            hexString = "hex`" + hexString + "`";
        }
        return this.text.replace(/hex\s*(?:`|\(""")\s*([a-fA-F0-9]*)\s*(?:`|"""\))\s*(?:;?)/m, hexString);
    }
    getFieldEditorId() {
        return fieldEditorId;
    }
    getOptions() {
        return {
            blocksInfo: this.host.blocksInfo()
        };
    }
}
exports.MonacoSongEditor = MonacoSongEditor;
function createFakeAsset(song) {
    return {
        type: "song" /* pxt.AssetType.Song */,
        id: "",
        internalID: 0,
        meta: {},
        song
    };
}
exports.songEditorDefinition = {
    id: fieldEditorId,
    foldMatches: true,
    glyphCssClass: "fas fa-music sprite-focus-hover",
    heightInPixels: 510,
    matcher: {
        /**
         * This is horrendous-looking regex matches both the asset reference syntax:
         *     assets.song`name`
         *     assets.song("""name""")
         *
         * and the hex-literal syntax:
         *     music.createSong(hex`01234`
         *     music.create_song(hex("""01234""")
         *
         * For the hex literal matches, it includes the call to music.createSong since
         * hex buffers can also be used for other things
         */
        searchString: "(?:(?:assets\\s*\\.\\s*song)|(?:music\\s*\\.\\s*create(?:S|_s)ong\\s*\\(\\s*hex))\\s*(?:`|\\(\\s*\"\"\")(?:(?:[^(){}:\\[\\]\"';?/,+\\-=*&|^%!`~]|\\n)*)\\s*(?:`|\"\"\"\\s*\\))",
        isRegex: true,
        matchCase: true,
        matchWholeWord: false
    },
    proto: MonacoSongEditor
};
(0, monacoFieldEditor_1.registerMonacoFieldEditor)(fieldEditorId, exports.songEditorDefinition);
