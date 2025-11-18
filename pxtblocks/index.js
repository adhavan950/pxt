"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.external = exports.contextMenu = void 0;
__exportStar(require("./plugins/arrays"), exports);
__exportStar(require("./plugins/functions"), exports);
__exportStar(require("./plugins/logic"), exports);
__exportStar(require("./plugins/math"), exports);
__exportStar(require("./plugins/text"), exports);
__exportStar(require("./plugins/renderer"), exports);
__exportStar(require("./plugins/flyout"), exports);
__exportStar(require("./plugins/newVariableField"), exports);
__exportStar(require("./plugins/comments"), exports);
__exportStar(require("./compiler/compiler"), exports);
__exportStar(require("./compiler/environment"), exports);
__exportStar(require("./loader"), exports);
__exportStar(require("./layout"), exports);
__exportStar(require("./render"), exports);
__exportStar(require("./toolbox"), exports);
__exportStar(require("./fields"), exports);
__exportStar(require("./sourceMap"), exports);
__exportStar(require("./importer"), exports);
__exportStar(require("./diff"), exports);
__exportStar(require("./legacyMutations"), exports);
__exportStar(require("./blockDragger"), exports);
__exportStar(require("./workspaceSearch"), exports);
__exportStar(require("./monkeyPatches"), exports);
__exportStar(require("./getBlockText"), exports);
const contextMenu = require("./contextMenu");
exports.contextMenu = contextMenu;
const external = require("./external");
exports.external = external;
__exportStar(require("./breakpointIcon"), exports);
