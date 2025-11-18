"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBooleanType = exports.isStringType = exports.defaultValueForType = exports.getEscapedCBParameters = exports.isFunctionRecursive = exports.getDeclaredVariables = exports.lookup = exports.getConcreteType = exports.attachPlaceholderIf = exports.returnType = exports.find = exports.mkPoint = exports.infer = void 0;
const environment_1 = require("./environment");
const util_1 = require("./util");
const functions_1 = require("../plugins/functions");
const compiler_1 = require("./compiler");
const loader_1 = require("../loader");
function infer(allBlocks, e, w) {
    if (allBlocks)
        allBlocks.filter(b => b.isEnabled()).forEach((b) => {
            try {
                switch (b.type) {
                    case "math_op2":
                        unionParam(e, b, "x", ground(pNumber.type));
                        unionParam(e, b, "y", ground(pNumber.type));
                        break;
                    case "math_op3":
                        unionParam(e, b, "x", ground(pNumber.type));
                        break;
                    case "math_arithmetic":
                    case "logic_compare":
                        switch (b.getFieldValue("OP")) {
                            case "ADD":
                            case "MINUS":
                            case "MULTIPLY":
                            case "DIVIDE":
                            case "LT":
                            case "LTE":
                            case "GT":
                            case "GTE":
                            case "POWER":
                                unionParam(e, b, "A", ground(pNumber.type));
                                unionParam(e, b, "B", ground(pNumber.type));
                                break;
                            case "AND":
                            case "OR":
                                attachPlaceholderIf(e, b, "A", pBoolean.type);
                                attachPlaceholderIf(e, b, "B", pBoolean.type);
                                break;
                            case "EQ":
                            case "NEQ":
                                attachPlaceholderIf(e, b, "A");
                                attachPlaceholderIf(e, b, "B");
                                let p1 = returnType(e, (0, util_1.getInputTargetBlock)(e, b, "A"));
                                let p2 = returnType(e, (0, util_1.getInputTargetBlock)(e, b, "B"));
                                try {
                                    union(p1, p2);
                                }
                                catch (e) {
                                    // TypeScript should catch this error and bubble it up
                                }
                                break;
                        }
                        break;
                    case "logic_operation":
                        attachPlaceholderIf(e, b, "A", pBoolean.type);
                        attachPlaceholderIf(e, b, "B", pBoolean.type);
                        break;
                    case "logic_negate":
                        attachPlaceholderIf(e, b, "BOOL", pBoolean.type);
                        break;
                    case "controls_if":
                        for (let i = 0; i <= b.elseifCount_; ++i)
                            attachPlaceholderIf(e, b, "IF" + i, pBoolean.type);
                        break;
                    case "pxt_controls_for":
                    case "controls_simple_for":
                        unionParam(e, b, "TO", ground(pNumber.type));
                        break;
                    case "pxt_controls_for_of":
                    case "controls_for_of":
                        const listArgument = (0, util_1.getInputTargetBlock)(e, b, "LIST");
                        if (listArgument && listArgument.type !== "placeholder") {
                            const listTp = returnType(e, listArgument);
                            const elementTp = lookup(e, b, (0, util_1.getLoopVariableField)(e, b).getField("VAR").getText()).type;
                            genericLink(listTp, elementTp);
                        }
                        else {
                            e.diagnostics.push({
                                blockId: b.id,
                                message: lf("The 'for of' block must have a list input")
                            });
                        }
                        break;
                    case "variables_set":
                    case "variables_change":
                        let p1 = lookup(e, b, b.getField("VAR").getText()).type;
                        attachPlaceholderIf(e, b, "VALUE");
                        let rhs = (0, util_1.getInputTargetBlock)(e, b, "VALUE");
                        if (rhs) {
                            // Get the inheritance chain for this type and check to see if the existing
                            // type shows up in it somewhere
                            let tr = returnTypeWithInheritance(e, rhs);
                            const t1 = find(p1);
                            if (t1.type && tr.slice(1).some(p => p.type === t1.type)) {
                                // If it does, we want to take the most narrow type (which will always be in 0)
                                p1.link = find(tr[0]);
                            }
                            else {
                                try {
                                    union(p1, tr[0]);
                                }
                                catch (e) {
                                    // TypeScript should catch this error and bubble it up
                                }
                            }
                        }
                        break;
                    case "controls_repeat_ext":
                        unionParam(e, b, "TIMES", ground(pNumber.type));
                        break;
                    case "device_while":
                        attachPlaceholderIf(e, b, "COND", pBoolean.type);
                        break;
                    case "lists_index_get":
                        unionParam(e, b, "LIST", ground("Array"));
                        unionParam(e, b, "INDEX", ground(pNumber.type));
                        const listType = returnType(e, (0, util_1.getInputTargetBlock)(e, b, "LIST"));
                        const ret = returnType(e, b);
                        genericLink(listType, ret);
                        break;
                    case "lists_index_set":
                        unionParam(e, b, "LIST", ground("Array"));
                        attachPlaceholderIf(e, b, "VALUE");
                        handleGenericType(b, "LIST");
                        unionParam(e, b, "INDEX", ground(pNumber.type));
                        break;
                    case 'function_definition':
                        getReturnTypeOfFunction(e, b.getField("function_name").getText());
                        break;
                    case 'function_call':
                    case 'function_call_output':
                        b.getArguments().forEach(arg => {
                            unionParam(e, b, arg.id, ground(arg.type));
                        });
                        break;
                    case pxtc.TS_RETURN_STATEMENT_TYPE:
                        attachPlaceholderIf(e, b, "RETURN_VALUE");
                        break;
                    case pxtc.PAUSE_UNTIL_TYPE:
                        unionParam(e, b, "PREDICATE", pBoolean);
                        break;
                    default:
                        if (b.type in e.stdCallTable) {
                            const call = e.stdCallTable[b.type];
                            if (call.attrs.shim === "ENUM_GET" || call.attrs.shim === "KIND_GET")
                                return;
                            (0, util_1.visibleParams)(call, (0, util_1.countOptionals)(b, call)).forEach((p, i) => {
                                var _a;
                                const isInstance = call.isExtensionMethod && i === 0;
                                if (p.definitionName && !b.getFieldValue(p.definitionName)) {
                                    let i = b.inputList.find((i) => i.name == p.definitionName);
                                    const check = (_a = i === null || i === void 0 ? void 0 : i.connection) === null || _a === void 0 ? void 0 : _a.getCheck();
                                    if (check) {
                                        if (isInstance && connectionCheck(i) === "Array") {
                                            let gen = handleGenericType(b, p.definitionName);
                                            if (gen) {
                                                return;
                                            }
                                        }
                                        // All of our injected blocks have single output checks, but the builtin
                                        // blockly ones like string.length and array.length might have multiple
                                        for (let j = 0; j < check.length; j++) {
                                            try {
                                                let t = check[j];
                                                unionParam(e, b, p.definitionName, ground(t));
                                                break;
                                            }
                                            catch (e) {
                                                // Ignore type checking errors in the blocks...
                                            }
                                        }
                                    }
                                }
                            });
                        }
                }
            }
            catch (err) {
                const be = err.block || b;
                be.setWarningText(err + "", compiler_1.PXT_WARNING_ID);
                e.errors.push(be);
            }
        });
    // Last pass: if some variable has no type (because it was never used or
    // assigned to), just unify it with int...
    e.allVariables.forEach((v) => {
        if (getConcreteType(v.type).type == null) {
            if (!v.isFunctionParameter) {
                union(v.type, ground(v.type.isArrayType ? "number[]" : pNumber.type));
            }
            else if (v.type.isArrayType) {
                v.type.type = "any[]";
            }
        }
    });
    function connectionCheck(i) {
        var _a, _b;
        const check = (_b = (_a = i.connection) === null || _a === void 0 ? void 0 : _a.getCheck()) === null || _b === void 0 ? void 0 : _b[0];
        return i.name ? (check ? check : "T") : undefined;
    }
    function handleGenericType(b, name) {
        let genericArgs = b.inputList.filter((input) => connectionCheck(input) === "T");
        if (genericArgs.length) {
            const gen = (0, util_1.getInputTargetBlock)(e, b, genericArgs[0].name);
            if (gen) {
                const arg = returnType(e, gen);
                const arrayType = arg.type ? ground(returnType(e, gen).type + "[]") : ground(null);
                genericLink(arrayType, arg);
                unionParam(e, b, name, arrayType);
                return true;
            }
        }
        return false;
    }
}
exports.infer = infer;
function union(p1, p2) {
    let _p1 = find(p1);
    let _p2 = find(p2);
    assert(_p1.link == null && _p2.link == null);
    if (_p1 == _p2) {
        return;
    }
    else if (isPrimitiveType(_p1)) {
        unify(p1.type, p2.type);
        return;
    }
    else if (isPrimitiveType(_p2)) {
        unify(p1.type, p2.type);
        p1.type = null;
        p1.link = _p2;
        _p1.link = _p2;
        _p1.isArrayType = _p2.isArrayType;
        return;
    }
    else if (_p1.childType && _p2.childType) {
        const ct = _p1.childType;
        _p1.childType = null;
        union(ct, _p2.childType);
    }
    else if (_p1.childType && !_p2.childType) {
        _p2.childType = _p1.childType;
    }
    if (_p1.parentType && _p2.parentType) {
        const pt = _p1.parentType;
        _p1.parentType = null;
        union(pt, _p2.parentType);
    }
    else if (_p1.parentType && !_p2.parentType && !_p2.type) {
        _p2.parentType = _p1.parentType;
    }
    let t = unify(_p1.type, _p2.type);
    p1.link = _p2;
    _p1.link = _p2;
    _p1.isArrayType = _p2.isArrayType;
    p1.type = null;
    p2.type = t;
}
// Unify the *return* type of the parameter [n] of block [b] with point [p].
function unionParam(e, b, n, p) {
    attachPlaceholderIf(e, b, n);
    try {
        union(returnType(e, (0, util_1.getInputTargetBlock)(e, b, n)), p);
    }
    catch (e) {
        // TypeScript should catch this error and bubble it up
    }
}
// Ground types.
function mkPoint(t, isArrayType = false) {
    return new environment_1.Point(null, t, null, null, isArrayType);
}
exports.mkPoint = mkPoint;
const pNumber = mkPoint("number");
const pBoolean = mkPoint("boolean");
const pString = mkPoint("string");
const pUnit = mkPoint("void");
function ground(t) {
    if (!t)
        return mkPoint(t);
    switch (t.toLowerCase()) {
        case "number": return pNumber;
        case "boolean": return pBoolean;
        case "string": return pString;
        case "void": return pUnit;
        default:
            // Unification variable.
            return mkPoint(t);
    }
}
function find(p) {
    if (p.link)
        return find(p.link);
    return p;
}
exports.find = find;
function isPrimitiveType(point) {
    return point === pNumber || point === pBoolean || point === pString || point === pUnit;
}
///////////////////////////////////////////////////////////////////////////////
// Type inference
//
// Expressions are now directly compiled as a tree. This requires knowing, for
// each property ref, the right value for its [parent] property.
///////////////////////////////////////////////////////////////////////////////
// Infers the expected type of an expression by looking at the untranslated
// block and figuring out, from the look of it, what type of expression it
// holds.
function returnType(e, b) {
    var _a, _b;
    assert(b != null);
    if (isPlaceholderBlock(b)) {
        if (!b.p)
            b.p = mkPoint(null);
        return find(b.p);
    }
    if (b.type == "variables_get")
        return find(lookup(e, b, b.getField("VAR").getText()).type);
    if (b.type == "function_call_output") {
        return getReturnTypeOfFunctionCall(e, b);
    }
    if (!b.outputConnection) {
        return ground(pUnit.type);
    }
    const check = ((_b = (_a = b.outputConnection) === null || _a === void 0 ? void 0 : _a.getCheck()) === null || _b === void 0 ? void 0 : _b[0]) || "T";
    if (check === "Array") {
        const fullCheck = b.outputConnection.getCheck();
        if (fullCheck.length > 1) {
            // HACK: The real type is stored as the second check
            return ground(fullCheck[1]);
        }
        // lists_create_with and argument_reporter_array both hit this.
        // For lists_create_with, we can safely infer the type from the
        // first input that has a return type.
        // For argument_reporter_array just return any[] for now
        let tp;
        if (b.type == "lists_create_with") {
            if (b.inputList && b.inputList.length) {
                for (const input of b.inputList) {
                    if (input.connection && input.connection.targetBlock()) {
                        let t = find(returnType(e, input.connection.targetBlock()));
                        if (t) {
                            if (t.parentType) {
                                return t.parentType;
                            }
                            tp = t.type ? ground(t.type + "[]") : mkPoint(null);
                            genericLink(tp, t);
                            break;
                        }
                    }
                }
            }
        }
        else if (b.type == "argument_reporter_array") {
            if (!tp) {
                tp = lookup(e, b, b.getFieldValue("VALUE")).type;
            }
        }
        if (tp)
            tp.isArrayType = true;
        return tp || mkPoint(null, true);
    }
    else if (check === "T") {
        const func = e.stdCallTable[b.type];
        const isArrayGet = b.type === "lists_index_get";
        if (isArrayGet || func && func.comp.thisParameter) {
            let parentInput;
            if (isArrayGet) {
                parentInput = b.inputList.find(i => i.name === "LIST");
            }
            else {
                parentInput = b.inputList.find(i => i.name === func.comp.thisParameter.definitionName);
            }
            if (parentInput.connection && parentInput.connection.targetBlock()) {
                const parentType = returnType(e, parentInput.connection.targetBlock());
                if (parentType.childType) {
                    return parentType.childType;
                }
                const p = isArrayType(parentType.type) && parentType.type !== "Array" ? mkPoint(parentType.type.substr(0, parentType.type.length - 2)) : mkPoint(null);
                genericLink(parentType, p);
                return p;
            }
        }
        return mkPoint(null);
    }
    return ground(check);
}
exports.returnType = returnType;
function returnTypeWithInheritance(e, b) {
    var _a;
    const check = (_a = b.outputConnection) === null || _a === void 0 ? void 0 : _a.getCheck();
    if (!(check === null || check === void 0 ? void 0 : check.length) || check[0] === "Array" || check[0] === "T") {
        return [returnType(e, b)];
    }
    return check.map(t => ground(t));
}
function getReturnTypeOfFunction(e, name) {
    if (!e.userFunctionReturnValues[name]) {
        const definition = (0, functions_1.getDefinition)(name, e.workspace);
        let res = mkPoint("void");
        if (isFunctionRecursive(e, definition, true)) {
            res = mkPoint("any");
        }
        else {
            const returnTypes = [];
            for (const child of definition.getDescendants(false)) {
                if (child.type === "function_return") {
                    attachPlaceholderIf(e, child, "RETURN_VALUE");
                    returnTypes.push(returnType(e, (0, util_1.getInputTargetBlock)(e, child, "RETURN_VALUE")));
                }
            }
            if (returnTypes.length) {
                try {
                    const unified = mkPoint(null);
                    for (const point of returnTypes) {
                        union(unified, point);
                    }
                    res = unified;
                }
                catch (err) {
                    e.diagnostics.push({
                        blockId: definition.id,
                        message: pxt.Util.lf("Function '{0}' has an invalid return type", name)
                    });
                    res = mkPoint("any");
                }
            }
        }
        e.userFunctionReturnValues[name] = res;
    }
    return e.userFunctionReturnValues[name];
}
function getReturnTypeOfFunctionCall(e, call) {
    const name = call.getField("function_name").getText();
    return getReturnTypeOfFunction(e, name);
}
// Basic type unification routine; easy, because there's no structural types.
// FIXME: Generics are not supported
function unify(t1, t2) {
    if (t1 == null || t1 === "Array" && isArrayType(t2))
        return t2;
    else if (t2 == null || t2 === "Array" && isArrayType(t1))
        return t1;
    else if (t1 == t2)
        return t1;
    else
        throw new Error("cannot mix " + t1 + " with " + t2);
}
function isArrayType(type) {
    return type && (type.indexOf("[]") !== -1 || type == "Array");
}
function mkPlaceholderBlock(e, parent, type) {
    // XXX define a proper placeholder block type
    return {
        type: "placeholder",
        p: mkPoint(type || null),
        workspace: e.workspace,
        parentBlock_: parent,
        getParent: () => parent
    };
}
function attachPlaceholderIf(e, b, n, type) {
    // Ugly hack to keep track of the type we want there.
    const target = b.getInputTargetBlock(n);
    if (!target) {
        if (!e.placeholders[b.id]) {
            e.placeholders[b.id] = {};
        }
        if (!e.placeholders[b.id][n]) {
            e.placeholders[b.id][n] = mkPlaceholderBlock(e, b, type);
        }
    }
    else if (target.type === pxtc.TS_OUTPUT_TYPE && !(target.p)) {
        target.p = mkPoint(null);
    }
}
exports.attachPlaceholderIf = attachPlaceholderIf;
function genericLink(parent, child) {
    const p = find(parent);
    const c = find(child);
    if (p.childType) {
        union(p.childType, c);
    }
    else if (!p.type) {
        p.childType = c;
    }
    if (c.parentType) {
        union(c.parentType, p);
    }
    else if (!c.type) {
        c.parentType = p;
    }
    if (isArrayType(p.type))
        p.isArrayType = true;
}
function getConcreteType(point, found = []) {
    const t = find(point);
    if (found.indexOf(t) === -1) {
        found.push(t);
        if (!t.type || t.type === "Array") {
            if (t.parentType) {
                const parent = getConcreteType(t.parentType, found);
                if (parent.type && parent.type !== "Array") {
                    if (isArrayType(parent.type)) {
                        t.type = parent.type.substr(0, parent.type.length - 2);
                    }
                    else {
                        t.type = parent.type;
                    }
                    return t;
                }
            }
            if (t.childType) {
                const child = getConcreteType(t.childType, found);
                if (child.type) {
                    t.type = child.type + "[]";
                    return t;
                }
            }
        }
    }
    return t;
}
exports.getConcreteType = getConcreteType;
function lookup(e, b, name) {
    return getVarInfo(name, e.idToScope[b.id]);
}
exports.lookup = lookup;
function getVarInfo(name, scope) {
    if (scope && scope.declaredVars[name]) {
        return scope.declaredVars[name];
    }
    else if (scope && scope.parent) {
        return getVarInfo(name, scope.parent);
    }
    else {
        return null;
    }
}
function getDeclaredVariables(block, e) {
    switch (block.type) {
        case 'pxt_controls_for':
        case 'controls_simple_for':
            return [{
                    name: (0, util_1.getLoopVariableField)(e, block).getField("VAR").getText(),
                    type: pNumber
                }];
        case 'pxt_controls_for_of':
        case 'controls_for_of':
            return [{
                    name: (0, util_1.getLoopVariableField)(e, block).getField("VAR").getText(),
                    type: mkPoint(null)
                }];
        case 'function_definition':
            return block.getArguments().filter(arg => arg.type === "Array")
                .map(arg => {
                const point = mkPoint(null);
                point.isArrayType = true;
                return {
                    name: arg.name,
                    type: point,
                    isFunctionParameter: true
                };
            });
        default:
            break;
    }
    if ((0, util_1.isMutatingBlock)(block)) {
        const declarations = block.mutation.getDeclaredVariables();
        if (declarations) {
            return Object.keys(declarations).map(varName => ({
                name: varName,
                type: mkPoint(declarations[varName])
            }));
        }
    }
    let stdFunc = e.stdCallTable[block.type];
    if (stdFunc && stdFunc.comp.handlerArgs.length) {
        return getCBParameters(block, stdFunc, e);
    }
    return [];
}
exports.getDeclaredVariables = getDeclaredVariables;
// @param strict - if true, only return true if there is a return statement
// somewhere in the call graph that returns a call to this function. If false,
// return true if the function is called as an expression anywhere in the call
// graph
function isFunctionRecursive(e, b, strict) {
    const functionName = (0, util_1.getFunctionName)(b);
    const visited = {};
    return checkForCallRecursive(b);
    function checkForCallRecursive(functionDefinition) {
        let calls;
        if (strict) {
            calls = functionDefinition.getDescendants(false)
                .filter(child => child.type == "function_return")
                .map(returnStatement => (0, util_1.getInputTargetBlock)(e, returnStatement, "RETURN_VALUE"))
                .filter(returnValue => returnValue && returnValue.type === "function_call_output");
        }
        else {
            calls = functionDefinition.getDescendants(false).filter(child => child.type == "function_call_output");
        }
        for (const call of calls) {
            const callName = (0, util_1.getFunctionName)(call);
            if (callName === functionName)
                return true;
            if (visited[callName])
                continue;
            visited[callName] = true;
            if (checkForCallRecursive((0, functions_1.getDefinition)(callName, call.workspace))) {
                return true;
            }
        }
        return false;
    }
}
exports.isFunctionRecursive = isFunctionRecursive;
function getEscapedCBParameters(b, stdfun, e) {
    return getCBParameters(b, stdfun, e).map(binding => lookup(e, b, binding.name).escapedName);
}
exports.getEscapedCBParameters = getEscapedCBParameters;
function getCBParameters(b, stdfun, e) {
    let handlerArgs = [];
    if (stdfun.attrs.draggableParameters) {
        for (let i = 0; i < stdfun.comp.handlerArgs.length; i++) {
            const arg = stdfun.comp.handlerArgs[i];
            let varName;
            const varBlock = (0, util_1.getInputTargetBlock)(e, b, loader_1.DRAGGABLE_PARAM_INPUT_PREFIX + arg.name);
            if (stdfun.attrs.draggableParameters === "reporter") {
                varName = varBlock && varBlock.getFieldValue("VALUE");
            }
            else {
                varName = varBlock && varBlock.getField("VAR").getText();
            }
            if (varName !== null && varName !== undefined) {
                handlerArgs.push({
                    name: varName,
                    type: mkPoint(arg.type)
                });
            }
            else {
                break;
            }
        }
    }
    else {
        for (let i = 0; i < stdfun.comp.handlerArgs.length; i++) {
            const arg = stdfun.comp.handlerArgs[i];
            const varField = b.getField("HANDLER_" + arg.name);
            const varName = varField && varField.getText();
            if (varName !== null) {
                handlerArgs.push({
                    name: varName,
                    type: mkPoint(arg.type)
                });
            }
            else {
                break;
            }
        }
    }
    return handlerArgs;
}
function isPlaceholderBlock(b) {
    return b.type == "placeholder" || b.type === pxtc.TS_OUTPUT_TYPE;
}
// Internal error (in our code). Compilation shouldn't proceed.
function assert(x) {
    if (!x)
        throw new Error("Assertion failure");
}
function defaultValueForType(t) {
    if (t.type == null) {
        union(t, ground(pNumber.type));
        t = find(t);
    }
    if (isArrayType(t.type) || t.isArrayType) {
        return pxt.blocks.mkText("[]");
    }
    switch (t.type) {
        case "boolean":
            return pxt.blocks.H.mkBooleanLiteral(false);
        case "number":
            return pxt.blocks.H.mkNumberLiteral(0);
        case "string":
            return pxt.blocks.H.mkStringLiteral("");
        default:
            return pxt.blocks.mkText("null");
    }
}
exports.defaultValueForType = defaultValueForType;
function isStringType(type) {
    return type === pString;
}
exports.isStringType = isStringType;
function isBooleanType(type) {
    return type === pBoolean;
}
exports.isBooleanType = isBooleanType;
