"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldKind = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
const external_1 = require("../external");
const field_dropdown_1 = require("./field_dropdown");
class FieldKind extends field_dropdown_1.FieldDropdown {
    constructor(opts) {
        super(createMenuGenerator(opts));
        this.opts = opts;
    }
    initView() {
        super.initView();
    }
    onItemSelected_(menu, menuItem) {
        const value = menuItem.getValue();
        if (value === "CREATE") {
            promptAndCreateKind(this.sourceBlock_.workspace, this.opts, lf("New {0}:", this.opts.memberName), newName => newName && this.setValue(newName));
        }
        else if (value === "RENAME") {
            const ws = this.sourceBlock_.workspace;
            const toRename = ws.getVariableMap().getVariable(this.value_, kindType(this.opts.name));
            const oldName = toRename.getName();
            if (this.opts.initialMembers.indexOf(oldName) !== -1) {
                Blockly.dialog.alert(lf("The built-in {0} '{1}' cannot be renamed. Try creating a new kind instead!", this.opts.memberName, oldName));
                return;
            }
            promptAndRenameKind(ws, Object.assign(Object.assign({}, this.opts), { toRename }), lf("Rename '{0}':", oldName), newName => {
                // Update the values of all existing field instances
                const allFields = (0, field_utils_1.getAllFields)(ws, field => field instanceof FieldKind
                    && field.getValue() === oldName
                    && field.opts.name === this.opts.name);
                for (const field of allFields) {
                    field.ref.setValue(newName);
                }
            });
        }
        else if (value === "DELETE") {
            const ws = this.sourceBlock_.workspace;
            const toDelete = ws.getVariableMap().getVariable(this.value_, kindType(this.opts.name));
            const varName = toDelete.getName();
            if (this.opts.initialMembers.indexOf(varName) !== -1) {
                Blockly.dialog.alert(lf("The built-in {0} '{1}' cannot be deleted.", this.opts.memberName, varName));
                return;
            }
            const uses = (0, field_utils_1.getAllFields)(ws, field => field instanceof FieldKind
                && field.getValue() === varName
                && field.opts.name === this.opts.name);
            if (uses.length > 1) {
                Blockly.dialog.confirm(lf("Delete {0} uses of the \"{1}\" {2}?", uses.length, varName, this.opts.memberName), response => {
                    if (!response)
                        return;
                    Blockly.Events.setGroup(true);
                    for (const use of uses) {
                        use.block.dispose(true);
                    }
                    ws.getVariableMap().deleteVariable(toDelete);
                    this.setValue(this.opts.initialMembers[0]);
                    Blockly.Events.setGroup(false);
                });
            }
            else {
                ws.getVariableMap().deleteVariable(toDelete);
                this.setValue(this.opts.initialMembers[0]);
            }
        }
        else {
            super.onItemSelected_(menu, menuItem);
        }
    }
    doClassValidation_(value) {
        var _a, _b;
        if (typeof value === "string" && ((_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.workspace)) {
            const existing = getExistingKindMembers(this.sourceBlock_.workspace, this.opts.name);
            if (!existing.some(e => e === value)) {
                createVariableForKind(this.sourceBlock_.workspace, this.opts, value);
            }
        }
        // update cached option list when adding a new kind
        if (((_b = this.opts) === null || _b === void 0 ? void 0 : _b.initialMembers) && !this.opts.initialMembers.find(el => el == value))
            this.getOptions();
        return super.doClassValidation_(value);
    }
    getOptions(opt_useCache) {
        this.initVariables();
        return super.getOptions(opt_useCache);
    }
    initVariables() {
        if (this.sourceBlock_ && this.sourceBlock_.workspace) {
            const ws = this.sourceBlock_.workspace;
            const existing = getExistingKindMembers(ws, this.opts.name);
            this.opts.initialMembers.forEach(memberName => {
                if (existing.indexOf(memberName) === -1) {
                    createVariableForKind(ws, this.opts, memberName);
                }
            });
            if (this.getValue() === "CREATE" || this.getValue() === "RENAME" || this.getValue() === "DELETE") {
                if (this.opts.initialMembers.length) {
                    this.setValue(this.opts.initialMembers[0]);
                }
            }
        }
    }
}
exports.FieldKind = FieldKind;
function createMenuGenerator(opts) {
    return function () {
        const that = this;
        const res = [];
        const sourceBlock = that.getSourceBlock();
        if ((sourceBlock === null || sourceBlock === void 0 ? void 0 : sourceBlock.workspace) && !sourceBlock.isInFlyout) {
            const options = sourceBlock.workspace.getVariableMap().getVariablesOfType(kindType(opts.name));
            options.forEach(model => {
                res.push([model.getName(), model.getName()]);
            });
        }
        else {
            // Can't create variables from within the flyout, so we just have to fake it
            opts.initialMembers.forEach((e) => res.push([e, e]));
        }
        res.push([lf("Add a new {0}...", opts.memberName), "CREATE"]);
        res.push([undefined, "SEPARATOR"]);
        res.push([lf("Rename {0}...", opts.memberName), "RENAME"]);
        res.push([lf("Delete {0}...", opts.memberName), "DELETE"]);
        return res;
    };
}
function promptForName(ws, opts, message, cb, promptFn) {
    (0, external_1.prompt)(message, null, response => {
        if (response) {
            let nameIsValid = false;
            if (pxtc.isIdentifierStart(response.charCodeAt(0), 2)) {
                nameIsValid = true;
                for (let i = 1; i < response.length; i++) {
                    if (!pxtc.isIdentifierPart(response.charCodeAt(i), 2)) {
                        nameIsValid = false;
                    }
                }
            }
            if (!nameIsValid) {
                Blockly.dialog.alert(lf("Names must start with a letter and can only contain letters, numbers, '$', and '_'."), () => promptForName(ws, opts, message, cb, promptFn));
                return;
            }
            if (pxt.blocks.isReservedWord(response) || response === "CREATE" || response === "RENAME" || response === "DELETE") {
                Blockly.dialog.alert(lf("'{0}' is a reserved word and cannot be used.", response), () => promptForName(ws, opts, message, cb, promptFn));
                return;
            }
            const existing = getExistingKindMembers(ws, opts.name);
            for (let i = 0; i < existing.length; i++) {
                const name = existing[i];
                if (name === response) {
                    Blockly.dialog.alert(lf("A {0} named '{1}' already exists.", opts.memberName, response), () => promptForName(ws, opts, message, cb, promptFn));
                    return;
                }
            }
            if (response === opts.createFunctionName) {
                Blockly.dialog.alert(lf("'{0}' is a reserved name.", opts.createFunctionName), () => promptForName(ws, opts, message, cb, promptFn));
            }
            cb(response);
        }
    }, { placeholder: opts.promptHint });
}
function promptAndCreateKind(ws, opts, message, cb) {
    const responseHandler = (response) => {
        cb(createVariableForKind(ws, opts, response));
    };
    promptForName(ws, opts, message, responseHandler, promptAndCreateKind);
}
function promptAndRenameKind(ws, opts, message, cb) {
    const responseHandler = (response) => {
        ws.getVariableMap().renameVariable(opts.toRename, response);
        cb(response);
    };
    promptForName(ws, opts, message, responseHandler, promptAndRenameKind);
}
function getExistingKindMembers(ws, kindName) {
    const existing = ws.getVariableMap().getVariablesOfType(kindType(kindName));
    if (existing && existing.length) {
        return existing.map(m => m.getName());
    }
    else {
        return [];
    }
}
function createVariableForKind(ws, opts, newName) {
    Blockly.Variables.getOrCreateVariablePackage(ws, null, newName, kindType(opts.name));
    return newName;
}
function kindType(name) {
    return "KIND_" + name;
}
