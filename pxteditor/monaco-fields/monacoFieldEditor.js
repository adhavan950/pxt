"use strict";
/// <reference path="../../localtypings/monaco.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonacoFieldEditor = exports.registerMonacoFieldEditor = void 0;
const definitions = {};
function registerMonacoFieldEditor(name, definition) {
    definitions[name] = definition;
}
exports.registerMonacoFieldEditor = registerMonacoFieldEditor;
function getMonacoFieldEditor(name) {
    return definitions[name];
}
exports.getMonacoFieldEditor = getMonacoFieldEditor;
