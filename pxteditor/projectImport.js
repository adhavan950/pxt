"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProjectAsync = exports.saveProjectAsync = void 0;
let _db;
const PROJECT_TABLE = "projects";
const KEYPATH = "importId";
async function saveProjectAsync(project) {
    const toStore = {
        importId: pxt.U.guidGen(),
        project
    };
    const db = await initAsync();
    await db.deleteAllAsync(PROJECT_TABLE);
    await db.setAsync(PROJECT_TABLE, toStore);
    return toStore.importId;
}
exports.saveProjectAsync = saveProjectAsync;
async function removeProjectAsync(importId) {
    const db = await initAsync();
    const stored = await db.getAsync(PROJECT_TABLE, importId);
    await db.deleteAllAsync(PROJECT_TABLE);
    return stored === null || stored === void 0 ? void 0 : stored.project;
}
exports.removeProjectAsync = removeProjectAsync;
async function initAsync() {
    if (_db) {
        return _db;
    }
    const dbName = pxt.appTarget.id + "-import";
    const version = 1;
    _db = new pxt.BrowserUtils.IDBWrapper(dbName, version, (_, request) => {
        const db = request.result;
        db.createObjectStore(PROJECT_TABLE, { keyPath: KEYPATH });
    });
    await _db.openAsync();
    return _db;
}
