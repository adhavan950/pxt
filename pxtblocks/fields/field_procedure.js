"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldProcedure = void 0;
const field_dropdown_1 = require("./field_dropdown");
class FieldProcedure extends field_dropdown_1.FieldDropdown {
    constructor(funcname, opt_validator) {
        super(createMenuGenerator(), opt_validator);
        this.setValue(funcname || '');
    }
    getOptions(useCache) {
        return this.menuGenerator_();
    }
    doClassValidation_(newValue) {
        if (newValue === undefined) {
            return null;
        }
        return newValue;
    }
    doValueUpdate_(newValue) {
        this.rawValue = newValue;
        super.doValueUpdate_(newValue);
    }
    init() {
        if (this.fieldGroup_) {
            // Dropdown has already been initialized once.
            return;
        }
        super.init.call(this);
    }
    ;
    setSourceBlock(block) {
        pxt.Util.assert(!block.isShadow(), 'Procedure fields are not allowed to exist on shadow blocks.');
        super.setSourceBlock.call(this, block);
    }
    ;
}
exports.FieldProcedure = FieldProcedure;
function createMenuGenerator() {
    return function () {
        let functionList = [];
        if (this.sourceBlock_ && this.sourceBlock_.workspace) {
            let blocks = this.sourceBlock_.workspace.getAllBlocks(false);
            // Iterate through every block and check the name.
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].getProcedureDef) {
                    let procName = blocks[i].getProcedureDef();
                    functionList.push(procName[0]);
                }
            }
        }
        // Ensure that the currently selected variable is an option.
        let name = this.getValue();
        if (name && functionList.indexOf(name) == -1) {
            functionList.push(name);
        }
        // case insensitive compare
        functionList.sort((a, b) => {
            const lowA = a.toLowerCase();
            const lowB = b.toLowerCase();
            if (lowA === lowB)
                return 0;
            if (lowA > lowB)
                return 1;
            return -1;
        });
        if (!functionList.length) {
            // Add temporary list item so the dropdown doesn't break
            functionList.push("Temp");
        }
        if (this.rawValue && functionList.indexOf(this.rawValue) === -1) {
            functionList.push(this.rawValue);
        }
        // Variables are not language-specific, use the name as both the user-facing
        // text and the internal representation.
        let options = [];
        for (let i = 0; i < functionList.length; i++) {
            options[i] = [functionList[i], functionList[i]];
        }
        return options;
    };
}
