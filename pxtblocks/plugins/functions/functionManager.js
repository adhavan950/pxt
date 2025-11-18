"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionManager = void 0;
const Blockly = require("blockly");
const msg_1 = require("./msg");
class FunctionManager {
    constructor() {
        this.typeIcons = {};
        this.typeArgumentNames = {};
    }
    static getInstance() {
        return FunctionManager.instance;
    }
    getIconForType(typeName) {
        return this.typeIcons[typeName];
    }
    setIconForType(typeName, icon) {
        this.typeIcons[typeName] = icon;
    }
    setArgumentNameForType(typeName, name) {
        this.typeArgumentNames[typeName] = name;
    }
    getArgumentNameForType(typeName) {
        if (this.typeArgumentNames[typeName]) {
            return this.typeArgumentNames[typeName];
        }
        return Blockly.Msg[msg_1.MsgKey.FUNCTIONS_DEFAULT_CUSTOM_ARG_NAME];
    }
    setEditFunctionExternal(impl) {
        this._editFunctionExternal = impl;
    }
    editFunctionExternal(mutation, cb) {
        if (this._editFunctionExternal) {
            this._editFunctionExternal(mutation, cb);
        }
        else {
            pxt.warn('External function editor must be overriden: Blockly.Functions.editFunctionExternalHandler', mutation, cb);
        }
    }
}
exports.FunctionManager = FunctionManager;
FunctionManager.instance = new FunctionManager();
