"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunctionDefinition = exports.append = exports.escapeVarName = exports.isMutatingBlock = exports.getInputTargetBlock = exports.countOptionals = exports.visibleParams = exports.getFunctionName = exports.getLoopVariableField = exports.printScope = exports.forEachStatementInput = exports.forEachChildExpression = void 0;
const Blockly = require("blockly");
function forEachChildExpression(block, cb, recursive = false) {
    block.inputList.filter(i => i.type === Blockly.inputs.inputTypes.VALUE).forEach(i => {
        if (i.connection && i.connection.targetBlock()) {
            cb(i.connection.targetBlock());
            if (recursive) {
                forEachChildExpression(i.connection.targetBlock(), cb, recursive);
            }
        }
    });
}
exports.forEachChildExpression = forEachChildExpression;
function forEachStatementInput(block, cb) {
    block.inputList.filter(i => i.type === Blockly.inputs.inputTypes.STATEMENT).forEach(i => {
        if (i.connection && i.connection.targetBlock()) {
            cb(i.connection.targetBlock());
        }
    });
}
exports.forEachStatementInput = forEachStatementInput;
function printScope(scope, depth = 0) {
    const declared = Object.keys(scope.declaredVars).map(k => `${k}(${scope.declaredVars[k].id})`).join(",");
    const referenced = scope.referencedVars.join(", ");
    pxt.log(`${mkIndent(depth)}SCOPE: ${scope.firstStatement ? scope.firstStatement.type : "TOP-LEVEL"}`);
    if (declared.length) {
        pxt.log(`${mkIndent(depth)}DECS: ${declared}`);
    }
    // pxt.log(`${mkIndent(depth)}REFS: ${referenced}`)
    scope.children.forEach(s => printScope(s, depth + 1));
}
exports.printScope = printScope;
function mkIndent(depth) {
    let res = "";
    for (let i = 0; i < depth; i++) {
        res += "    ";
    }
    return res;
}
function getLoopVariableField(e, b) {
    return (b.type == "pxt_controls_for" || b.type == "pxt_controls_for_of") ?
        getInputTargetBlock(e, b, "VAR") : b;
}
exports.getLoopVariableField = getLoopVariableField;
function getFunctionName(functionBlock) {
    return functionBlock.getField("function_name").getText();
}
exports.getFunctionName = getFunctionName;
function visibleParams({ comp }, optionalCount) {
    const res = [];
    if (comp.thisParameter) {
        res.push(comp.thisParameter);
    }
    comp.parameters.forEach(p => {
        if (p.isOptional && optionalCount > 0) {
            res.push(p);
            --optionalCount;
        }
        else if (!p.isOptional) {
            res.push(p);
        }
    });
    return res;
}
exports.visibleParams = visibleParams;
function countOptionals(b, func) {
    if (func.attrs.compileHiddenArguments) {
        return func.comp.parameters.reduce((prev, block) => {
            if (block.isOptional)
                prev++;
            return prev;
        }, 0);
    }
    if (b.mutationToDom) {
        const el = b.mutationToDom();
        if (el.hasAttribute("_expanded")) {
            const val = parseInt(el.getAttribute("_expanded"));
            return isNaN(val) ? 0 : Math.max(val, 0);
        }
    }
    return 0;
}
exports.countOptionals = countOptionals;
function getInputTargetBlock(e, b, n) {
    var _a;
    const res = b.getInputTargetBlock(n);
    if (!res) {
        return (_a = e.placeholders[b.id]) === null || _a === void 0 ? void 0 : _a[n];
    }
    else {
        return res;
    }
}
exports.getInputTargetBlock = getInputTargetBlock;
function isMutatingBlock(b) {
    return !!b.mutation;
}
exports.isMutatingBlock = isMutatingBlock;
// convert to javascript friendly name
function escapeVarName(name, e, isFunction = false) {
    if (!name)
        return '_';
    if (isFunction) {
        if (e.renames.oldToNewFunctions[name]) {
            return e.renames.oldToNewFunctions[name];
        }
    }
    else if (e.renames.oldToNew[name]) {
        return e.renames.oldToNew[name];
    }
    let n = ts.pxtc.escapeIdentifier(name);
    if (e.renames.takenNames[n]) {
        let i = 2;
        while (e.renames.takenNames[n + i]) {
            i++;
        }
        n += i;
    }
    if (isFunction) {
        e.renames.oldToNewFunctions[name] = n;
        e.renames.takenNames[n] = true;
    }
    else {
        e.renames.oldToNew[name] = n;
    }
    return n;
}
exports.escapeVarName = escapeVarName;
function append(a1, a2) {
    a1.push.apply(a1, a2);
}
exports.append = append;
function isFunctionDefinition(b) {
    return b.type === "procedures_defnoreturn" || b.type === "function_definition";
}
exports.isFunctionDefinition = isFunctionDefinition;
