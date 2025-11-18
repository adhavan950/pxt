"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImageProperties = exports.clearDropDownDiv = exports.deleteBlockDataForField = exports.getBlockDataForField = exports.setBlockDataForField = exports.setBlockData = exports.getBlockData = exports.workspaceToScreenCoordinates = exports.setMelodyEditorOpen = exports.FieldEditorOpenEvent = exports.FIELD_EDITOR_OPEN_EVENT_TYPE = exports.loadAssetFromSaveState = exports.getAssetSaveState = exports.getTemporaryAssets = exports.getTilesReferencedByTilesets = exports.getAllReferencedTiles = exports.getAllFields = exports.updateTilemapXml = exports.needsTilemapUpgrade = exports.getAllBlocksWithTilesets = exports.getAllBlocksWithTilemaps = exports.songToDataURI = exports.tilemapToImageURI = exports.bitmapToImageURI = exports.parseColour = exports.svg = void 0;
const Blockly = require("blockly");
const field_tilemap_1 = require("./field_tilemap");
const field_animation_1 = require("./field_animation");
const field_musiceditor_1 = require("./field_musiceditor");
const field_sprite_1 = require("./field_sprite");
const field_tileset_1 = require("./field_tileset");
var svg;
(function (svg) {
    function hasClass(el, cls) {
        return pxt.BrowserUtils.containsClass(el, cls);
    }
    svg.hasClass = hasClass;
    function addClass(el, cls) {
        pxt.BrowserUtils.addClass(el, cls);
    }
    svg.addClass = addClass;
    function removeClass(el, cls) {
        pxt.BrowserUtils.removeClass(el, cls);
    }
    svg.removeClass = removeClass;
})(svg = exports.svg || (exports.svg = {}));
function parseColour(colour) {
    const hue = Number(colour);
    if (!isNaN(hue)) {
        return Blockly.utils.colour.hueToHex(hue);
    }
    else if (typeof colour === "string" && colour.match(/^#[0-9a-fA-F]{6}$/)) {
        return colour;
    }
    else {
        return '#000';
    }
}
exports.parseColour = parseColour;
/**
 * Converts a bitmap into a square image suitable for display. In light mode the preview
 * is drawn with no transparency (alpha is filled with background color)
 */
function bitmapToImageURI(frame, sideLength, lightMode) {
    const colors = pxt.appTarget.runtime.palette.slice(1);
    const canvas = document.createElement("canvas");
    canvas.width = sideLength;
    canvas.height = sideLength;
    // Works well for all of our default sizes, does not work well if the size is not
    // a multiple of 2 or is greater than 32 (i.e. from the decompiler)
    const cellSize = Math.min(sideLength / frame.width, sideLength / frame.height);
    // Center the image if it isn't square
    const xOffset = Math.max(Math.floor((sideLength * (1 - (frame.width / frame.height))) / 2), 0);
    const yOffset = Math.max(Math.floor((sideLength * (1 - (frame.height / frame.width))) / 2), 0);
    let context;
    if (lightMode) {
        context = canvas.getContext("2d", { alpha: false });
        context.fillStyle = "#dedede";
        context.fillRect(0, 0, sideLength, sideLength);
    }
    else {
        context = canvas.getContext("2d");
    }
    for (let c = 0; c < frame.width; c++) {
        for (let r = 0; r < frame.height; r++) {
            const color = frame.get(c, r);
            if (color) {
                context.fillStyle = colors[color - 1];
                context.fillRect(xOffset + c * cellSize, yOffset + r * cellSize, cellSize, cellSize);
            }
            else if (lightMode) {
                context.fillStyle = "#dedede";
                context.fillRect(xOffset + c * cellSize, yOffset + r * cellSize, cellSize, cellSize);
            }
        }
    }
    return canvas.toDataURL();
}
exports.bitmapToImageURI = bitmapToImageURI;
function tilemapToImageURI(data, sideLength, lightMode) {
    const colors = pxt.appTarget.runtime.palette.slice();
    const canvas = document.createElement("canvas");
    canvas.width = sideLength;
    canvas.height = sideLength;
    // Works well for all of our default sizes, does not work well if the size is not
    // a multiple of 2 or is greater than 32 (i.e. from the decompiler)
    const cellSize = Math.min(sideLength / data.tilemap.width, sideLength / data.tilemap.height);
    // Center the image if it isn't square
    const xOffset = Math.max(Math.floor((sideLength * (1 - (data.tilemap.width / data.tilemap.height))) / 2), 0);
    const yOffset = Math.max(Math.floor((sideLength * (1 - (data.tilemap.height / data.tilemap.width))) / 2), 0);
    let context;
    if (lightMode) {
        context = canvas.getContext("2d", { alpha: false });
        context.fillStyle = "#dedede";
        context.fillRect(0, 0, sideLength, sideLength);
    }
    else {
        context = canvas.getContext("2d");
    }
    let tileColors = [];
    for (let c = 0; c < data.tilemap.width; c++) {
        for (let r = 0; r < data.tilemap.height; r++) {
            const tile = data.tilemap.get(c, r);
            if (tile) {
                if (!tileColors[tile]) {
                    const tileInfo = data.tileset.tiles[tile];
                    tileColors[tile] = tileInfo ? pxt.sprite.computeAverageColor(pxt.sprite.Bitmap.fromData(tileInfo.bitmap), colors) : "#dedede";
                }
                context.fillStyle = tileColors[tile];
                context.fillRect(xOffset + c * cellSize, yOffset + r * cellSize, cellSize, cellSize);
            }
            else if (lightMode) {
                context.fillStyle = "#dedede";
                context.fillRect(xOffset + c * cellSize, yOffset + r * cellSize, cellSize, cellSize);
            }
        }
    }
    return canvas.toDataURL();
}
exports.tilemapToImageURI = tilemapToImageURI;
function songToDataURI(song, width, height, lightMode, maxMeasures) {
    const colors = pxt.appTarget.runtime.palette.slice();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let context;
    if (lightMode) {
        context = canvas.getContext("2d", { alpha: false });
        context.fillStyle = "#dedede";
        context.fillRect(0, 0, width, height);
    }
    else {
        context = canvas.getContext("2d");
    }
    const trackColors = [
        5,
        11,
        5,
        4,
        2,
        6,
        14,
        2,
        5,
        1, // explosion
    ];
    maxMeasures = maxMeasures || song.measures;
    const cellWidth = Math.max(Math.floor(width / (song.beatsPerMeasure * maxMeasures * 2)), 1);
    const cellsShown = Math.floor(width / cellWidth);
    const cellHeight = Math.max(Math.floor(height / 12), 1);
    const notesShown = Math.floor(height / cellHeight);
    for (const track of song.tracks) {
        for (const noteEvent of track.notes) {
            const col = Math.floor(noteEvent.startTick / (song.ticksPerBeat / 2));
            if (col > cellsShown)
                break;
            for (const note of noteEvent.notes) {
                const row = 12 - (note.note % 12);
                if (row > notesShown)
                    continue;
                context.fillStyle = colors[trackColors[track.id || song.tracks.indexOf(track)]];
                context.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }
    return canvas.toDataURL();
}
exports.songToDataURI = songToDataURI;
function getAllBlocksWithTilemaps(ws) {
    return getAllFields(ws, f => f instanceof field_tilemap_1.FieldTilemap && !f.isGreyBlock);
}
exports.getAllBlocksWithTilemaps = getAllBlocksWithTilemaps;
function getAllBlocksWithTilesets(ws) {
    return getAllFields(ws, f => f instanceof field_tileset_1.FieldTileset);
}
exports.getAllBlocksWithTilesets = getAllBlocksWithTilesets;
function needsTilemapUpgrade(ws) {
    const allTiles = ws.getVariableMap()
        .getVariablesOfType(pxt.sprite.BLOCKLY_TILESET_TYPE)
        .map(model => pxt.sprite.legacy.blocklyVariableToTile(model.getName()));
    return !!allTiles.length;
}
exports.needsTilemapUpgrade = needsTilemapUpgrade;
function updateTilemapXml(dom, proj) {
    let needsUpgrade = false;
    const upgradedTileMapping = {};
    for (const element of dom.children) {
        if (element.tagName.toLowerCase() === "variables") {
            const toRemove = [];
            for (const variable of element.children) {
                if (variable.getAttribute("type") === pxt.sprite.BLOCKLY_TILESET_TYPE) {
                    needsUpgrade = true;
                    const varName = variable.textContent;
                    const parsed = pxt.sprite.legacy.blocklyVariableToTile(varName);
                    if (!parsed.qualifiedName) {
                        const oldId = "myTiles.tile" + parsed.projectId;
                        const newTile = proj.createNewTile(parsed.data, oldId);
                        upgradedTileMapping[oldId] = newTile;
                    }
                    toRemove.push(variable);
                }
            }
            for (const variable of toRemove) {
                variable.remove();
            }
        }
    }
    if (!needsUpgrade)
        return;
    for (const field of dom.getElementsByTagName("field")) {
        const value = field.textContent;
        const trimmed = value.trim();
        if (upgradedTileMapping[trimmed]) {
            field.textContent = pxt.getTSReferenceForAsset(upgradedTileMapping[trimmed]);
        }
        else if (trimmed.startsWith(`tiles.createTilemap(`)) {
            const legacy = pxt.sprite.legacy.decodeTilemap(value, "typescript");
            const mapping = [];
            const newData = new pxt.sprite.TilemapData(legacy.tilemap, {
                tileWidth: legacy.tileset.tileWidth,
                tiles: legacy.tileset.tiles.map((t, index) => {
                    if (t.projectId != null) {
                        return upgradedTileMapping["myTiles.tile" + t.projectId];
                    }
                    if (!mapping[index]) {
                        mapping[index] = proj.resolveTile(t.qualifiedName);
                    }
                    return mapping[index];
                })
            }, legacy.layers);
            const [id] = proj.createNewTilemapFromData(newData);
            const asset = proj.lookupAsset("tilemap" /* pxt.AssetType.Tilemap */, id);
            field.textContent = pxt.getTSReferenceForAsset(asset);
        }
    }
}
exports.updateTilemapXml = updateTilemapXml;
function getAllFields(ws, predicate) {
    const result = [];
    const top = ws.getTopBlocks(false);
    top.forEach(block => getAllFieldsRecursive(block));
    return result;
    function getAllFieldsRecursive(block) {
        for (const input of block.inputList) {
            for (const field of input.fieldRow) {
                if (predicate(field)) {
                    result.push({ block, field: field.name, ref: field });
                }
            }
            if (input.connection && input.connection.targetBlock()) {
                getAllFieldsRecursive(input.connection.targetBlock());
            }
        }
        if (block.nextConnection && block.nextConnection.targetBlock()) {
            getAllFieldsRecursive(block.nextConnection.targetBlock());
        }
    }
}
exports.getAllFields = getAllFields;
function getAllReferencedTiles(workspace, excludeBlockID) {
    var _a;
    let all = {};
    const allMaps = getAllBlocksWithTilemaps(workspace);
    const project = pxt.react.getTilemapProject();
    for (const map of allMaps) {
        if (map.block.id === excludeBlockID)
            continue;
        for (const tile of ((_a = map.ref.getTileset()) === null || _a === void 0 ? void 0 : _a.tiles) || []) {
            all[tile.id] = project.lookupAsset("tile" /* pxt.AssetType.Tile */, tile.id);
        }
    }
    const projectMaps = project.getAssets("tilemap" /* pxt.AssetType.Tilemap */);
    for (const projectMap of projectMaps) {
        for (const tile of projectMap.data.tileset.tiles) {
            all[tile.id] = project.lookupAsset("tile" /* pxt.AssetType.Tile */, tile.id);
        }
    }
    const allTiles = getAllBlocksWithTilesets(workspace);
    for (const tilesetField of allTiles) {
        const value = tilesetField.ref.getValue();
        const match = /^\s*assets\s*\.\s*tile\s*`([^`]*)`\s*$/.exec(value);
        if (match) {
            const tile = project.lookupAssetByName("tile" /* pxt.AssetType.Tile */, match[1]);
            if (tile && !all[tile.id]) {
                all[tile.id] = tile;
            }
        }
        else if (!all[value]) {
            all[value] = project.resolveTile(value);
        }
    }
    return Object.keys(all).map(key => all[key]).filter(t => !!t);
}
exports.getAllReferencedTiles = getAllReferencedTiles;
function getTilesReferencedByTilesets(workspace) {
    let all = {};
    const project = pxt.react.getTilemapProject();
    const allTiles = getAllBlocksWithTilesets(workspace);
    for (const tilesetField of allTiles) {
        const value = tilesetField.ref.getValue();
        const match = /^\s*assets\s*\.\s*tile\s*`([^`]*)`\s*$/.exec(value);
        if (match) {
            const tile = project.lookupAssetByName("tile" /* pxt.AssetType.Tile */, match[1]);
            if (tile && !all[tile.id]) {
                all[tile.id] = tile;
            }
        }
        else if (!all[value]) {
            all[value] = project.resolveTile(value);
        }
    }
    return Object.keys(all).map(key => all[key]).filter(t => !!t);
}
exports.getTilesReferencedByTilesets = getTilesReferencedByTilesets;
function getTemporaryAssets(workspace, type) {
    switch (type) {
        case "image" /* pxt.AssetType.Image */:
            return getAllFields(workspace, field => field instanceof field_sprite_1.FieldSpriteEditor && field.isTemporaryAsset())
                .map(f => f.ref.getAsset());
        case "animation" /* pxt.AssetType.Animation */:
            return getAllFields(workspace, field => field instanceof field_animation_1.FieldAnimationEditor && field.isTemporaryAsset())
                .map(f => f.ref.getAsset());
        case "song" /* pxt.AssetType.Song */:
            return getAllFields(workspace, field => field instanceof field_musiceditor_1.FieldMusicEditor && field.isTemporaryAsset())
                .map(f => f.ref.getAsset());
        default: return [];
    }
}
exports.getTemporaryAssets = getTemporaryAssets;
function getAssetSaveState(asset) {
    const serialized = {
        version: 1,
        assetType: asset.type,
        assetId: asset.id,
        jres: {}
    };
    const project = pxt.react.getTilemapProject();
    if (asset.type === "tilemap" /* pxt.AssetType.Tilemap */) {
        const jres = project.getProjectTilesetJRes();
        for (const key of Object.keys(jres)) {
            if (key === "*")
                continue;
            const entry = jres[key];
            if (entry.mimeType === pxt.TILEMAP_MIME_TYPE) {
                if (entry.id !== asset.id) {
                    delete jres[key];
                }
            }
            else {
                const id = addDotToNamespace(jres["*"].namespace) + key;
                if (!asset.data.tileset.tiles.some(tile => tile.id === id)) {
                    delete jres[key];
                }
            }
        }
        serialized.jres = jres;
    }
    else {
        const jres = asset.type === "tile" /* pxt.AssetType.Tile */ ?
            project.getProjectTilesetJRes() :
            project.getProjectAssetsJRes();
        serialized.jres["*"] = jres["*"];
        const [key, entry] = findEntryInJres(jres, asset.id);
        serialized.jres[key] = entry;
    }
    return serialized;
}
exports.getAssetSaveState = getAssetSaveState;
function loadAssetFromSaveState(serialized) {
    let newId = serialized.assetId;
    serialized.jres = inflateJRes(serialized.jres);
    const globalProject = pxt.react.getTilemapProject();
    const existing = globalProject.lookupAsset(serialized.assetType, serialized.assetId);
    // if this id is already in the project, we need to check to see
    // if it's the same as what we're loading. if it isn't, we'll need
    // to create new assets
    if (existing) {
        // load the jres into a throwaway project so that we don't pollute
        // the actual one
        const tempProject = new pxt.TilemapProject();
        // if this is a tilemap, we need the gallery populated in case
        // there are gallery tiles in the tileset
        tempProject.loadGallerySnapshot(globalProject.saveGallerySnapshot());
        if (serialized.assetType === "tilemap" || serialized.assetType === "tile") {
            tempProject.loadTilemapJRes(serialized.jres);
        }
        else {
            tempProject.loadAssetsJRes(serialized.jres);
        }
        const tempAsset = tempProject.lookupAsset(serialized.assetType, serialized.assetId);
        if (pxt.assetEquals(tempAsset, existing, true)) {
            return existing;
        }
        else {
            // the asset ids collided! first try to find another asset in the
            // project that has the same value. for example, if the same code
            // is copy/pasted multiple times then we will have already created
            // a new asset for this code
            const valueMatch = globalProject.lookupAssetByValue(tempAsset.type, tempAsset);
            if (valueMatch) {
                return valueMatch;
            }
            // no existing asset, so remap the id in the jres before loading
            // it in the project. in the case of a tilemap, we only need to
            // remap the tilemap id because loadTilemapJRes automatically remaps
            // tile ids and resolves duplicates
            newId = globalProject.generateNewID(serialized.assetType);
            const [key, entry] = findEntryInJres(serialized.jres, serialized.assetId);
            delete serialized.jres[key];
            if (serialized.assetType === "tilemap") {
                // tilemap ids don't have namespaces
                entry.id = newId;
                serialized.jres[newId] = entry;
            }
            else {
                const [namespace, key] = newId.split(".");
                if (addDotToNamespace(namespace) !== addDotToNamespace(serialized.jres["*"].namespace)) {
                    entry.namespace = addDotToNamespace(namespace);
                }
                entry.id = newId;
                serialized.jres[key] = entry;
            }
        }
    }
    if (serialized.assetType === "tilemap" || serialized.assetType === "tile") {
        globalProject.loadTilemapJRes(serialized.jres, true);
    }
    else {
        globalProject.loadAssetsJRes(serialized.jres);
    }
    return globalProject.lookupAsset(serialized.assetType, newId);
}
exports.loadAssetFromSaveState = loadAssetFromSaveState;
exports.FIELD_EDITOR_OPEN_EVENT_TYPE = "field_editor_open";
class FieldEditorOpenEvent extends Blockly.Events.UiBase {
    constructor(block, isOpen) {
        super(block.workspace.id);
        this.type = exports.FIELD_EDITOR_OPEN_EVENT_TYPE;
        this.blockId = block.id;
        this.isOpen = isOpen;
    }
}
exports.FieldEditorOpenEvent = FieldEditorOpenEvent;
function setMelodyEditorOpen(block, isOpen) {
    Blockly.Events.fire(new FieldEditorOpenEvent(block, isOpen));
}
exports.setMelodyEditorOpen = setMelodyEditorOpen;
function workspaceToScreenCoordinates(ws, wsCoordinates) {
    // The position in pixels relative to the origin of the
    // main workspace.
    const scaledWS = wsCoordinates.scale(ws.scale);
    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    const mainOffsetPixels = ws.getOriginOffsetInPixels();
    // The client coordinates offset by the injection div's upper left corner.
    const clientOffsetPixels = Blockly.utils.Coordinate.sum(scaledWS, mainOffsetPixels);
    const injectionDiv = ws.getInjectionDiv();
    // Bounding rect coordinates are in client coordinates, meaning that they
    // are in pixels relative to the upper left corner of the visible browser
    // window.  These coordinates change when you scroll the browser window.
    const boundingRect = injectionDiv.getBoundingClientRect();
    return new Blockly.utils.Coordinate(clientOffsetPixels.x + boundingRect.left, clientOffsetPixels.y + boundingRect.top);
}
exports.workspaceToScreenCoordinates = workspaceToScreenCoordinates;
function getBlockData(block) {
    if (!block.data) {
        return {
            commentRefs: [],
            fieldData: {}
        };
    }
    if (/^(?:\d+;?)+$/.test(block.data)) {
        return {
            commentRefs: block.data.split(";"),
            fieldData: {}
        };
    }
    return JSON.parse(block.data);
}
exports.getBlockData = getBlockData;
function setBlockData(block, data) {
    block.data = JSON.stringify(data);
}
exports.setBlockData = setBlockData;
function setBlockDataForField(block, field, data) {
    const blockData = getBlockData(block);
    blockData.fieldData[field] = data;
    setBlockData(block, blockData);
}
exports.setBlockDataForField = setBlockDataForField;
function getBlockDataForField(block, field) {
    return getBlockData(block).fieldData[field];
}
exports.getBlockDataForField = getBlockDataForField;
function deleteBlockDataForField(block, field) {
    const blockData = getBlockData(block);
    delete blockData.fieldData[field];
    setBlockData(block, blockData);
}
exports.deleteBlockDataForField = deleteBlockDataForField;
function addDotToNamespace(namespace) {
    if (namespace.endsWith(".")) {
        return namespace;
    }
    return namespace + ".";
}
function findEntryInJres(jres, assetId) {
    const defaultNamespace = jres["*"].namespace;
    for (const key of Object.keys(jres)) {
        if (key === "*")
            continue;
        const entry = jres[key];
        let id;
        if (entry.id) {
            if (entry.namespace) {
                id = addDotToNamespace(entry.namespace) + entry.id;
            }
            else {
                id = entry.id;
            }
        }
        else if (entry.namespace) {
            id = addDotToNamespace(entry.namespace) + key;
        }
        else {
            id = addDotToNamespace(defaultNamespace) + key;
        }
        if (id === assetId) {
            return [key, jres[key]];
        }
    }
    // should never happen
    return undefined;
}
// simply replaces the string entries with objects; doesn't do a full inflate like pxt.inflateJRes
function inflateJRes(jres) {
    const meta = jres["*"];
    const result = {
        "*": meta
    };
    for (const key of Object.keys(jres)) {
        if (key === "*")
            continue;
        const entry = jres[key];
        if (typeof entry === "string") {
            result[key] = {
                id: undefined,
                data: entry,
                mimeType: meta.mimeType
            };
        }
        else {
            result[key] = entry;
        }
    }
    return result;
}
function clearDropDownDiv() {
    Blockly.DropDownDiv.clearContent();
    Blockly.DropDownDiv.getContentDiv().style.height = "";
}
exports.clearDropDownDiv = clearDropDownDiv;
/**
 * Returns whether or not an object conforms to the ImageProperties interface.
 *
 * @param obj The object to test.
 * @returns True if the object conforms to ImageProperties, otherwise false.
 */
function isImageProperties(obj) {
    return (obj &&
        typeof obj === 'object' &&
        'src' in obj &&
        typeof obj.src === 'string' &&
        'alt' in obj &&
        typeof obj.alt === 'string' &&
        'width' in obj &&
        typeof obj.width === 'number' &&
        'height' in obj &&
        typeof obj.height === 'number');
}
exports.isImageProperties = isImageProperties;
