"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBlockIdByLine = exports.findBlockIdByPosition = void 0;
function findBlockIdByPosition(sourceMap, loc) {
    if (!loc)
        return undefined;
    let bestChunk;
    let bestChunkLength;
    // look for smallest chunk containing the block
    for (let i = 0; i < sourceMap.length; ++i) {
        let chunk = sourceMap[i];
        if (chunk.startPos <= loc.start
            && chunk.endPos >= loc.start + loc.length
            && (!bestChunk || bestChunkLength > chunk.endPos - chunk.startPos)) {
            bestChunk = chunk;
            bestChunkLength = chunk.endPos - chunk.startPos;
        }
    }
    if (bestChunk) {
        return bestChunk.id;
    }
    return undefined;
}
exports.findBlockIdByPosition = findBlockIdByPosition;
function findBlockIdByLine(sourceMap, loc) {
    if (!loc)
        return undefined;
    let bestChunk;
    let bestChunkLength;
    // look for smallest chunk containing the block
    for (let i = 0; i < sourceMap.length; ++i) {
        let chunk = sourceMap[i];
        if (chunk.startLine <= loc.start
            && chunk.endLine > loc.start + loc.length
            && (!bestChunk || bestChunkLength > chunk.endLine - chunk.startLine)) {
            bestChunk = chunk;
            bestChunkLength = chunk.endLine - chunk.startLine;
        }
    }
    if (bestChunk) {
        return bestChunk.id;
    }
    return undefined;
}
exports.findBlockIdByLine = findBlockIdByLine;
