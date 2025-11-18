"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextValue = exports.FieldUserEnum = void 0;
const Blockly = require("blockly");
const external_1 = require("../external");
const field_dropdown_1 = require("./field_dropdown");
class FieldUserEnum extends field_dropdown_1.FieldDropdown {
    constructor(opts) {
        super(createMenuGenerator(opts));
        this.opts = opts;
    }
    init() {
        super.init();
        this.initVariables();
    }
    onItemSelected_(menu, menuItem) {
        const value = menuItem.getValue();
        if (value === "CREATE") {
            promptAndCreateEnum(this.sourceBlock_.workspace, this.opts, lf("New {0}:", this.opts.memberName), newName => newName && this.setValue(newName));
        }
        else {
            super.onItemSelected_(menu, menuItem);
        }
    }
    doClassValidation_(value) {
        var _a;
        // update cached option list when adding a new kind
        if (((_a = this.opts) === null || _a === void 0 ? void 0 : _a.initialMembers) && !this.opts.initialMembers.find(el => el == value))
            this.getOptions();
        return super.doClassValidation_(value);
    }
    initVariables() {
        if (this.sourceBlock_ && this.sourceBlock_.workspace) {
            const ws = this.sourceBlock_.workspace;
            const existing = getMembersForEnum(ws, this.opts.name);
            this.opts.initialMembers.forEach(memberName => {
                if (!existing.some(([name, value]) => name === memberName)) {
                    createNewEnumMember(ws, this.opts, memberName);
                }
            });
            if (this.getValue() === "CREATE") {
                const newValue = getVariableNameForMember(ws, this.opts.name, this.opts.initialMembers[0]);
                if (newValue) {
                    this.setValue(newValue);
                }
            }
        }
    }
}
exports.FieldUserEnum = FieldUserEnum;
function createMenuGenerator(opts) {
    return function () {
        const res = [];
        if (this.sourceBlock_ && this.sourceBlock_.workspace) {
            const options = this.sourceBlock_.workspace.getVariableMap().getVariablesOfType(opts.name);
            options.forEach(model => {
                // The format of the name is 10mem where "10" is the value and "mem" is the enum member
                const withoutValue = model.getName().replace(/^\d+/, "");
                res.push([withoutValue, model.getName()]);
            });
        }
        else {
            // Can't create variables from within the flyout, so we just have to fake it
            opts.initialMembers.forEach((e) => res.push([e, e]));
        }
        res.push([lf("Add a new {0}...", opts.memberName), "CREATE"]);
        return res;
    };
}
function promptAndCreateEnum(ws, opts, message, cb) {
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
                Blockly.dialog.alert(lf("Names must start with a letter and can only contain letters, numbers, '$', and '_'."), () => promptAndCreateEnum(ws, opts, message, cb));
                return;
            }
            const existing = getMembersForEnum(ws, opts.name);
            for (let i = 0; i < existing.length; i++) {
                const [name, value] = existing[i];
                if (name === response) {
                    Blockly.dialog.alert(lf("A {0} named '{1}' already exists.", opts.memberName, response), () => promptAndCreateEnum(ws, opts, message, cb));
                    return;
                }
            }
            cb(createNewEnumMember(ws, opts, response));
        }
    }, { placeholder: opts.promptHint });
}
function parseName(model) {
    const match = /^(\d+)([^0-9].*)$/.exec(model.getName());
    if (match) {
        return [match[2], parseInt(match[1])];
    }
    return [model.getName(), -1];
}
function getMembersForEnum(ws, enumName) {
    const existing = ws.getVariableMap().getVariablesOfType(enumName);
    if (existing && existing.length) {
        return existing.map(parseName);
    }
    else {
        return [];
    }
}
function getNextValue(members, opts) {
    const existing = members.map(([name, value]) => value);
    if (opts.isBitMask) {
        for (let i = 0; i < existing.length; i++) {
            let current = 1 << i;
            if (existing.indexOf(current) < 0) {
                return current;
            }
        }
        return 1 << existing.length;
    }
    else if (opts.isHash) {
        return 0; // overriden when compiled
    }
    else {
        const start = opts.firstValue || 0;
        for (let i = 0; i < existing.length; i++) {
            if (existing.indexOf(start + i) < 0) {
                return start + i;
            }
        }
        return start + existing.length;
    }
}
exports.getNextValue = getNextValue;
function createNewEnumMember(ws, opts, newName) {
    const ex = getMembersForEnum(ws, opts.name);
    const val = getNextValue(ex, opts);
    const variableName = val + newName;
    Blockly.Variables.getOrCreateVariablePackage(ws, null, variableName, opts.name);
    return variableName;
}
function getVariableNameForMember(ws, enumName, memberName) {
    const existing = ws.getVariableMap().getVariablesOfType(enumName);
    if (existing && existing.length) {
        for (let i = 0; i < existing.length; i++) {
            const [name,] = parseName(existing[i]);
            if (name === memberName) {
                return existing[i].getName();
            }
        }
    }
    return undefined;
}
