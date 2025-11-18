"use strict";
/// <reference path="../built/pxtlib.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshHeader = void 0;
function freshHeader(name, modTime) {
    let header = {
        target: pxt.appTarget.id,
        targetVersion: pxt.appTarget.versions.target,
        name: name,
        meta: {},
        editor: pxt.JAVASCRIPT_PROJECT_NAME,
        pubId: "",
        pubCurrent: false,
        _rev: null,
        id: pxt.U.guidGen(),
        recentUse: modTime,
        modificationTime: modTime,
        cloudUserId: null,
        cloudCurrent: false,
        cloudVersion: null,
        cloudLastSyncTime: 0,
        isDeleted: false,
    };
    return header;
}
exports.freshHeader = freshHeader;
