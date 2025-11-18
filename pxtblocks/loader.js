"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVarFieldValue = exports.generateIcons = exports.getFixedInstanceDropdownValues = exports.setOutputCheck = exports.getBlocklyCheckForType = exports.initAccessibleBlocksContextMenuItems = exports.initialize = exports.initializeAndInject = exports.cleanBlocks = exports.hasArrowFunction = exports.injectBlocks = exports.blockSymbol = exports.cachedBlockInfo = exports.buildinBlockStatements = exports.builtinBlocks = exports.isTupleType = exports.DRAGGABLE_PARAM_INPUT_PREFIX = exports.initCopyPaste = void 0;
/// <reference path="../built/pxtlib.d.ts" />
const Blockly = require("blockly");
const constants_1 = require("./constants");
const composableMutations_1 = require("./composableMutations");
const legacyMutations_1 = require("./legacyMutations");
const math_1 = require("./builtins/math");
const fields_1 = require("./fields");
const functions_1 = require("./builtins/functions");
const lists_1 = require("./builtins/lists");
const logic_1 = require("./builtins/logic");
const loops_1 = require("./builtins/loops");
const text_1 = require("./builtins/text");
const toolbox_1 = require("./toolbox");
const help_1 = require("./help");
const fields_2 = require("./fields");
const fields_3 = require("./fields");
const fields_4 = require("./fields");
const fields_5 = require("./fields");
const external_1 = require("./external");
const variables_1 = require("./builtins/variables");
const misc_1 = require("./builtins/misc");
const contextMenu_1 = require("./contextMenu");
const codecardRenderer_1 = require("./codecardRenderer");
const field_dropdown_1 = require("./fields/field_dropdown");
const duplicateOnDrag_1 = require("./plugins/duplicateOnDrag");
const copyPaste_1 = require("./copyPaste");
var copyPaste_2 = require("./copyPaste");
Object.defineProperty(exports, "initCopyPaste", { enumerable: true, get: function () { return copyPaste_2.initCopyPaste; } });
const fieldVariable_1 = require("./plugins/newVariableField/fieldVariable");
const functions_2 = require("./plugins/functions");
const utils_1 = require("./plugins/functions/utils");
const util_1 = require("./compiler/util");
const compiler_1 = require("./compiler/compiler");
exports.DRAGGABLE_PARAM_INPUT_PREFIX = "HANDLER_DRAG_PARAM_";
// Matches tuples
function isTupleType(type) {
    const tupleTypeRegex = /^\[(.+)\]$/;
    let parsed = tupleTypeRegex.exec(type);
    if (parsed) {
        // Returns an array containing the types of the tuple
        return parsed[1].split(/,\s*/);
    }
    else {
        // Not a tuple
        return undefined;
    }
}
exports.isTupleType = isTupleType;
// list of built-in blocks, should be touched.
let _builtinBlocks;
function builtinBlocks() {
    if (!_builtinBlocks) {
        _builtinBlocks = {};
        Object.keys(Blockly.Blocks)
            .forEach(k => _builtinBlocks[k] = { block: Blockly.Blocks[k] });
    }
    return _builtinBlocks;
}
exports.builtinBlocks = builtinBlocks;
exports.buildinBlockStatements = {
    "controls_if": true,
    "controls_for": true,
    "pxt_controls_for": true,
    "controls_simple_for": true,
    "controls_repeat_ext": true,
    "pxt_controls_for_of": true,
    "controls_for_of": true,
    "variables_set": true,
    "variables_change": true,
    "device_while": true
};
let cachedBlocks = {};
function blockSymbol(type) {
    let b = cachedBlocks[type];
    return b ? b.fn : undefined;
}
exports.blockSymbol = blockSymbol;
function injectBlocks(blockInfo) {
    exports.cachedBlockInfo = blockInfo;
    (0, duplicateOnDrag_1.setDraggableShadowBlocks)(blockInfo.blocks.filter(fn => fn.attributes.duplicateShadowOnDrag).map(fn => fn.attributes.blockId));
    (0, functions_2.setArgumentReporterLocalizeFunction)((arg, block) => {
        return localizeArgumentReporter(blockInfo, arg, block);
    });
    // inject Blockly with all block definitions
    return blockInfo.blocks
        .map(fn => {
        const comp = pxt.blocks.compileInfo(fn);
        const block = (0, toolbox_1.createToolboxBlock)(blockInfo, fn, comp, false, 2);
        if (fn.attributes.blockBuiltin) {
            pxt.Util.assert(!!builtinBlocks()[fn.attributes.blockId]);
            const builtin = builtinBlocks()[fn.attributes.blockId];
            builtin.symbol = fn;
            builtin.block.codeCard = (0, help_1.mkCard)(fn, block);
        }
        else {
            injectBlockDefinition(blockInfo, fn, comp, block);
        }
        return fn;
    });
}
exports.injectBlocks = injectBlocks;
function injectBlockDefinition(info, fn, comp, blockXml) {
    let id = fn.attributes.blockId;
    if (builtinBlocks()[id]) {
        pxt.reportError("blocks", 'trying to override builtin block', { "details": id });
        return false;
    }
    let hash = JSON.stringify(fn);
    if (cachedBlocks[id] && cachedBlocks[id].hash == hash) {
        return true;
    }
    if (Blockly.Blocks[fn.attributes.blockId]) {
        pxt.error("duplicate block definition: " + id);
        return false;
    }
    let cachedBlock = {
        hash: hash,
        fn: fn,
        block: {
            codeCard: (0, help_1.mkCard)(fn, blockXml),
            init: function () { initBlock(this, info, fn, comp); }
        }
    };
    if (pxt.Util.isTranslationMode()) {
        cachedBlock.block.customContextMenu = (options) => {
            if (fn.attributes.translationId) {
                options.push({
                    enabled: true,
                    text: lf("Translate this block"),
                    callback: function () {
                        (0, external_1.promptTranslateBlock)(id, [fn.attributes.translationId]);
                    }
                });
            }
        };
    }
    cachedBlocks[id] = cachedBlock;
    Blockly.Blocks[id] = cachedBlock.block;
    return true;
}
function newLabel(part) {
    if (part.kind === "image") {
        return iconToFieldImage(part.uri);
    }
    const txt = removeOuterSpace(part.text);
    if (!txt) {
        return undefined;
    }
    if (part.cssClass) {
        return new Blockly.FieldLabel(txt, part.cssClass);
    }
    else if (part.style.length) {
        return new fields_3.FieldStyledLabel(txt, {
            bold: part.style.indexOf("bold") !== -1,
            italics: part.style.indexOf("italics") !== -1,
            blocksInfo: undefined
        });
    }
    else {
        return new Blockly.FieldLabel(txt, undefined);
    }
}
function isSubtype(apis, specific, general) {
    if (specific == general)
        return true;
    let inf = apis.byQName[specific];
    if (inf && inf.extendsTypes)
        return inf.extendsTypes.indexOf(general) >= 0;
    return false;
}
function initBlock(block, info, fn, comp) {
    var _a, _b;
    const ns = (fn.attributes.blockNamespace || fn.namespace).split('.')[0];
    let instance = fn.kind == pxtc.SymbolKind.Method || fn.kind == pxtc.SymbolKind.Property;
    if (typeof fn.isInstance === "boolean" && !((_a = fn.attributes) === null || _a === void 0 ? void 0 : _a.defaultInstance))
        instance = fn.isInstance;
    const nsinfo = info.apis.byQName[ns];
    const color = 
    // blockNamespace overrides color on block
    (fn.attributes.blockNamespace && nsinfo && nsinfo.attributes.color)
        || fn.attributes.color
        || (nsinfo && nsinfo.attributes.color)
        || pxt.toolbox.getNamespaceColor(ns)
        || 255;
    const helpUrl = pxt.blocks.getHelpUrl(fn);
    if (helpUrl)
        block.setHelpUrl(helpUrl);
    (0, duplicateOnDrag_1.setDuplicateOnDragStrategy)(block);
    block.setColour(typeof color === "string" ? pxt.toolbox.getAccessibleBackground(color) : color);
    let blockShape = constants_1.provider.SHAPES.ROUND;
    if (fn.retType == "boolean") {
        blockShape = constants_1.provider.SHAPES.HEXAGONAL;
    }
    block.setOutputShape(blockShape);
    if (fn.attributes.undeletable)
        block.setDeletable(false);
    buildBlockFromDef(fn.attributes._def);
    let hasHandler = false;
    let variableReporterArgs = false;
    if (fn.attributes.mutate) {
        (0, legacyMutations_1.addMutation)(block, fn, fn.attributes.mutate);
    }
    else if (fn.attributes.defaultInstance) {
        (0, legacyMutations_1.addMutation)(block, fn, legacyMutations_1.MutatorTypes.DefaultInstanceMutator);
    }
    else if (fn.attributes._expandedDef && fn.attributes.expandableArgumentMode !== "disabled") {
        const shouldToggle = fn.attributes.expandableArgumentMode === "toggle";
        (0, composableMutations_1.initExpandableBlock)(info, block, fn.attributes._expandedDef, comp, shouldToggle, () => buildBlockFromDef(fn.attributes._expandedDef, true));
    }
    else if (comp.handlerArgs.length) {
        /**
         * We support four modes for handler parameters: variable dropdowns,
         * expandable variable dropdowns with +/- buttons (used for chat commands),
         * draggable variable blocks, and draggable reporter blocks.
         */
        hasHandler = true;
        if (fn.attributes.optionalVariableArgs) {
            if (fn.attributes.draggableParameters === "reporter") {
                // variable reporter args need to be initialized after the statement input
                variableReporterArgs = true;
            }
            else {
                (0, composableMutations_1.initVariableArgsBlock)(block, comp.handlerArgs);
            }
        }
        else if (fn.attributes.draggableParameters) {
            comp.handlerArgs.filter(a => !a.inBlockDef).forEach(arg => {
                const i = block.appendValueInput(exports.DRAGGABLE_PARAM_INPUT_PREFIX + arg.name);
                if (fn.attributes.draggableParameters == "reporter") {
                    i.setCheck(getBlocklyCheckForType(arg.type, info));
                }
                else {
                    i.setCheck("Variable");
                }
            });
            comp.handlerArgs.forEach(arg => {
                (0, duplicateOnDrag_1.setDuplicateOnDrag)(block.type, exports.DRAGGABLE_PARAM_INPUT_PREFIX + arg.name);
            });
        }
        else {
            let i = block.appendDummyInput();
            comp.handlerArgs.filter(a => !a.inBlockDef).forEach(arg => {
                i.appendField(new fieldVariable_1.FieldVariable(arg.name), "HANDLER_" + arg.name);
            });
        }
    }
    // Add mutation to save and restore custom field settings
    (0, composableMutations_1.appendMutation)(block, {
        mutationToDom: (el) => {
            block.inputList.forEach(input => {
                input.fieldRow.forEach((fieldRow) => {
                    if (fieldRow.isFieldCustom_ && fieldRow.saveOptions) {
                        const getOptions = fieldRow.saveOptions();
                        if (getOptions) {
                            el.setAttribute(`customfield`, JSON.stringify(getOptions));
                        }
                    }
                });
            });
            return el;
        },
        domToMutation: (saved) => {
            block.inputList.forEach(input => {
                input.fieldRow.forEach((fieldRow) => {
                    if (fieldRow.isFieldCustom_ && fieldRow.restoreOptions) {
                        const options = JSON.parse(saved.getAttribute(`customfield`));
                        if (options) {
                            fieldRow.restoreOptions(options);
                        }
                    }
                });
            });
        }
    });
    const gridTemplateString = fn.attributes.imageLiteral || fn.attributes.gridLiteral;
    if (gridTemplateString) {
        const columns = (fn.attributes.imageLiteralColumns || 5) * gridTemplateString;
        const rows = fn.attributes.imageLiteralRows || 5;
        const scale = fn.attributes.imageLiteralScale;
        const onColor = fn.attributes.gridLiteralOnColor;
        const offColor = fn.attributes.gridLiteralOffColor;
        let ri = block.appendDummyInput();
        ri.appendField(new fields_2.FieldLedMatrix("", { columns, rows, scale, onColor, offColor }), "LEDS");
    }
    if (fn.attributes.inlineInputMode === "external") {
        block.setInputsInline(false);
    }
    else if (fn.attributes.inlineInputMode === "inline") {
        block.setInputsInline(true);
    }
    else {
        block.setInputsInline(!fn.parameters || (fn.parameters.length < 4 && !gridTemplateString));
    }
    const body = (_b = fn.parameters) === null || _b === void 0 ? void 0 : _b.find(pr => pxtc.parameterTypeIsArrowFunction(pr));
    if (body || hasHandler) {
        block.appendStatementInput("HANDLER")
            .setCheck(null);
        block.setInputsInline(true);
    }
    const hasHandlers = hasArrowFunction(fn);
    const isStatement = !!fn.attributes.handlerStatement || !!fn.attributes.forceStatement || (fn.retType === "void" && !hasHandlers);
    if (!isStatement) {
        setOutputCheck(block, fn.retType, info);
    }
    block.setPreviousStatement(isStatement);
    block.setNextStatement(isStatement);
    if (variableReporterArgs) {
        (0, composableMutations_1.initVariableReporterArgs)(block, comp.handlerArgs, info);
    }
    block.setTooltip(/^__/.test(fn.namespace) ? "" : fn.attributes.jsDoc);
    function buildBlockFromDef(def, expanded = false) {
        let anonIndex = 0;
        let firstParam = !expanded && !!comp.thisParameter;
        const inputs = splitInputs(def);
        const imgConv = new pxt.ImageConverter();
        if (fn.attributes.shim === "ENUM_GET" || fn.attributes.shim === "KIND_GET") {
            if (comp.parameters.length > 1 || comp.thisParameter) {
                pxt.warn(`Enum blocks may only have 1 parameter but ${fn.attributes.blockId} has ${comp.parameters.length}`);
                return;
            }
        }
        const hasInput = (name) => { var _a; return (_a = block.inputList) === null || _a === void 0 ? void 0 : _a.some(i => i.name === name); };
        inputs.forEach(inputParts => {
            const fields = [];
            let inputName;
            let inputCheck;
            let hasParameter = false;
            inputParts.forEach(part => {
                if (part.kind !== "param") {
                    const f = newLabel(part);
                    if (f) {
                        fields.push({ field: f });
                    }
                }
                else if (fn.attributes.shim === "ENUM_GET") {
                    pxt.Util.assert(!!fn.attributes.enumName, "Trying to create an ENUM_GET block without a valid enum name");
                    fields.push({
                        name: "MEMBER",
                        field: new fields_4.FieldUserEnum(info.enumsByName[fn.attributes.enumName])
                    });
                    return;
                }
                else if (fn.attributes.shim === "KIND_GET") {
                    fields.push({
                        name: "MEMBER",
                        field: new fields_1.FieldKind(info.kindsByName[fn.attributes.kindNamespace || fn.attributes.blockNamespace || fn.namespace])
                    });
                    return;
                }
                else {
                    // find argument
                    let pr = getParameterFromDef(part, comp, firstParam);
                    firstParam = false;
                    if (!pr) {
                        pxt.error("block " + fn.attributes.blockId + ": unknown parameter " + part.name + (part.ref ? ` (${part.ref})` : ""));
                        return;
                    }
                    if (isHandlerArg(pr)) {
                        inputName = exports.DRAGGABLE_PARAM_INPUT_PREFIX + pr.name;
                        inputCheck = fn.attributes.draggableParameters === "reporter" ? getBlocklyCheckForType(pr.type, info) : "Variable";
                        return;
                    }
                    let typeInfo = pxt.Util.lookup(info.apis.byQName, pr.type);
                    hasParameter = true;
                    const defName = pr.definitionName;
                    const actName = pr.actualName;
                    let isEnum = typeInfo && typeInfo.kind == pxtc.SymbolKind.Enum;
                    let isFixed = typeInfo && !!typeInfo.attributes.fixedInstances && !pr.shadowBlockId;
                    let isConstantShim = !!fn.attributes.constantShim;
                    let isCombined = pr.type == "@combined@";
                    let customField = pr.fieldEditor;
                    let fieldLabel = defName.charAt(0).toUpperCase() + defName.slice(1);
                    let fieldType = pr.type;
                    if (isEnum || isFixed || isConstantShim || isCombined) {
                        let syms;
                        if (isEnum) {
                            syms = getEnumDropdownValues(info.apis, pr.type);
                        }
                        else if (isFixed) {
                            syms = getFixedInstanceDropdownValues(info.apis, typeInfo.qName);
                        }
                        else if (isCombined) {
                            syms = fn.combinedProperties.map(p => pxt.Util.lookup(info.apis.byQName, p));
                        }
                        else {
                            syms = getConstantDropdownValues(info.apis, fn.qName);
                        }
                        if (syms.length == 0) {
                            pxt.error(`no instances of ${typeInfo.qName} found`);
                        }
                        const dd = syms.map(v => {
                            let k = v.attributes.block || v.attributes.blockId || v.name;
                            let comb = v.attributes.blockCombine;
                            if (v.attributes.jresURL && !v.attributes.iconURL && pxt.Util.startsWith(v.attributes.jresURL, "data:image/x-mkcd-f")) {
                                v.attributes.iconURL = imgConv.convert(v.attributes.jresURL);
                            }
                            if (!!comb)
                                k = k.replace(/@set/, "");
                            return [
                                v.attributes.iconURL || v.attributes.blockImage ? {
                                    src: v.attributes.iconURL || pxt.Util.pathJoin(pxt.webConfig.commitCdnUrl, `blocks/${v.namespace.toLowerCase()}/${v.name.toLowerCase()}.png`),
                                    alt: k,
                                    width: 36,
                                    height: 36,
                                    value: v.name
                                } : k,
                                v.namespace + "." + v.name
                            ];
                        });
                        // if a value is provided, move it first
                        if (pr.defaultValue) {
                            let shadowValueIndex = -1;
                            dd.some((v, i) => {
                                if (v[1] === pr.defaultValue) {
                                    shadowValueIndex = i;
                                    return true;
                                }
                                return false;
                            });
                            if (shadowValueIndex > -1) {
                                const shadowValue = dd.splice(shadowValueIndex, 1)[0];
                                dd.unshift(shadowValue);
                            }
                        }
                        if (customField) {
                            let defl = fn.attributes.paramDefl[actName] || "";
                            const options = {
                                data: dd,
                                colour: color,
                                label: fieldLabel,
                                type: fieldType,
                                blocksInfo: info
                            };
                            pxt.Util.jsonMergeFrom(options, fn.attributes.paramFieldEditorOptions && fn.attributes.paramFieldEditorOptions[actName] || {});
                            fields.push(namedField((0, fields_5.createFieldEditor)(customField, defl, options), defName));
                        }
                        else
                            fields.push(namedField(new field_dropdown_1.FieldDropdown(dd), defName));
                    }
                    else if (customField) {
                        const defl = fn.attributes.paramDefl[pr.actualName] || "";
                        const options = {
                            colour: color,
                            label: fieldLabel,
                            type: fieldType,
                            blocksInfo: info
                        };
                        pxt.Util.jsonMergeFrom(options, fn.attributes.paramFieldEditorOptions && fn.attributes.paramFieldEditorOptions[pr.actualName] || {});
                        fields.push(namedField((0, fields_5.createFieldEditor)(customField, defl, options), pr.definitionName));
                    }
                    else {
                        inputName = defName;
                        if (instance && part.name === "this") {
                            inputCheck = pr.type;
                        }
                        else if (pr.type == "number" && pr.shadowBlockId && pr.shadowBlockId == "value") {
                            inputName = undefined;
                            fields.push(namedField(new Blockly.FieldNumber("0"), defName));
                        }
                        else if (pr.type == "string" && pr.shadowOptions && pr.shadowOptions.toString) {
                            inputCheck = null;
                        }
                        else {
                            inputCheck = getBlocklyCheckForType(pr.type, info);
                        }
                    }
                }
            });
            let input;
            if (inputName) {
                // Don't add duplicate inputs
                if (hasInput(inputName))
                    return;
                input = block.appendValueInput(inputName);
                input.setAlign(Blockly.inputs.Align.LEFT);
            }
            else if (expanded) {
                const prefix = hasParameter ? constants_1.optionalInputWithFieldPrefix : constants_1.optionalDummyInputPrefix;
                inputName = prefix + (anonIndex++);
                // Don't add duplicate inputs
                if (hasInput(inputName))
                    return;
                input = block.appendDummyInput(inputName);
            }
            else {
                input = block.appendDummyInput();
            }
            if (inputCheck) {
                input.setCheck(inputCheck);
            }
            fields.forEach(f => input.appendField(f.field, f.name));
        });
        imgConv.logTime();
    }
}
function getParameterFromDef(part, comp, isThis = false) {
    if (part.ref) {
        const result = (part.name === "this") ? comp.thisParameter : comp.actualNameToParam[part.name];
        if (!result) {
            let ha;
            comp.handlerArgs.forEach(arg => {
                if (arg.name === part.name)
                    ha = arg;
            });
            if (ha)
                return ha;
        }
        return result;
    }
    else {
        return isThis ? comp.thisParameter : comp.definitionNameToParam[part.name];
    }
}
function isHandlerArg(arg) {
    return !arg.definitionName;
}
function hasArrowFunction(fn) {
    var _a;
    return !!((_a = fn.parameters) === null || _a === void 0 ? void 0 : _a.some(pr => pxtc.parameterTypeIsArrowFunction(pr)));
}
exports.hasArrowFunction = hasArrowFunction;
function cleanBlocks() {
    pxt.debug('removing all custom blocks');
    for (const b in cachedBlocks)
        removeBlock(cachedBlocks[b].fn);
}
exports.cleanBlocks = cleanBlocks;
/**
 * Used by pxtrunner to initialize blocks in the docs
 */
function initializeAndInject(blockInfo) {
    init(blockInfo);
    (0, contextMenu_1.initContextMenu)();
    (0, copyPaste_1.initCopyPaste)(false);
    injectBlocks(blockInfo);
}
exports.initializeAndInject = initializeAndInject;
/**
 * Used by main app to initialize blockly blocks.
 * Blocks are injected separately by called injectBlocks
 */
function initialize(blockInfo) {
    init(blockInfo);
    initJresIcons(blockInfo);
}
exports.initialize = initialize;
let blocklyInitialized = false;
function init(blockInfo) {
    if (blocklyInitialized)
        return;
    blocklyInitialized = true;
    (0, fields_5.initFieldEditors)();
    (0, misc_1.initOnStart)();
    (0, math_1.initMath)(blockInfo);
    (0, variables_1.initVariables)();
    (0, functions_1.initFunctions)();
    (0, lists_1.initLists)();
    (0, loops_1.initLoops)();
    (0, logic_1.initLogic)();
    (0, text_1.initText)();
    initComments();
    initTooltip();
    // in safari on ios, Blockly isn't always great at clearing touch
    // identifiers. for most browsers this doesn't matter because the
    // pointer id stored in the pointerevent is reused. however, ios
    // generates a unique pointerid for each event, so the editor will
    // stop processing events entirely if it isn't cleared properly
    if (pxt.BrowserUtils.isSafari() && pxt.BrowserUtils.isIOS()) {
        document.addEventListener("pointerup", ev => {
            setTimeout(() => {
                if (Blockly.Touch.checkTouchIdentifier(ev)) {
                    Blockly.Touch.clearTouchIdentifier();
                }
            });
        });
    }
}
function initAccessibleBlocksContextMenuItems() {
    (0, copyPaste_1.initAccessibleBlocksCopyPasteContextMenu)();
}
exports.initAccessibleBlocksContextMenuItems = initAccessibleBlocksContextMenuItems;
/**
 * Converts a TypeScript type into an array of type checks for Blockly inputs/outputs. Use
 * with block.setOutput() and input.setCheck().
 *
 * @returns An array of checks if the type is valid, undefined if there are no valid checks
 *      (e.g. type is void), and null if all checks should be accepted (e.g. type is generic)
 */
function getBlocklyCheckForType(type, info) {
    const types = type.split(/\s*\|\s*/);
    const output = [];
    for (const subtype of types) {
        switch (subtype) {
            // Blockly capitalizes primitive types for its builtin math/string/logic blocks
            case "number":
                output.push("Number");
                break;
            case "string":
                output.push("String");
                break;
            case "boolean":
                output.push("Boolean");
                break;
            case "T":
            // The type is generic, so accept any checks. This is mostly used with functions that
            // get values from arrays. This could be improved if we ever add proper type
            // inference for generic types
            case "any":
                return null;
            case "void":
                return undefined;
            default:
                // We add "Array" to the front for array types so that they can be connected
                // to the blocks that accept any array (e.g. length, push, pop, etc)
                if ((0, toolbox_1.isArrayType)(subtype)) {
                    if (types.length > 1) {
                        // type inference will potentially break non-trivial arrays in intersections
                        // until we have better type handling in blocks,
                        // so escape and allow any block to be dropped in.
                        return null;
                    }
                    else {
                        output.push("Array");
                    }
                }
                // Blockly has no concept of inheritance, so we need to add all
                // super classes to the check array
                const si_r = info.apis.byQName[subtype];
                if (si_r && si_r.extendsTypes && 0 < si_r.extendsTypes.length) {
                    output.push(...si_r.extendsTypes);
                }
                else {
                    output.push(subtype);
                }
        }
    }
    return output;
}
exports.getBlocklyCheckForType = getBlocklyCheckForType;
function setOutputCheck(block, retType, info) {
    const check = getBlocklyCheckForType(retType, info);
    if (check || check === null) {
        block.setOutput(true, check);
    }
}
exports.setOutputCheck = setOutputCheck;
function initComments() {
    Blockly.Msg.WORKSPACE_COMMENT_DEFAULT_TEXT = '';
}
function initTooltip() {
    const renderTip = (el) => {
        var _a;
        if ((_a = el.hasDisabledReason) === null || _a === void 0 ? void 0 : _a.call(el, compiler_1.AUTO_DISABLED_REASON))
            return lf("This block is disabled and will not run. Attach this block to an event to enable it.");
        let tip = el.tooltip;
        while (typeof tip === "function") {
            tip = tip(el);
        }
        return tip;
    };
    Blockly.Tooltip.setCustomTooltip((contentDiv, anchor) => {
        const codecard = anchor.codeCard;
        if (codecard) {
            const cardEl = (0, codecardRenderer_1.renderCodeCard)({
                header: renderTip(anchor)
            });
            contentDiv.appendChild(cardEl);
        }
        else {
            let tip = renderTip(anchor);
            tip = Blockly.utils.string.wrap(tip, Blockly.Tooltip.LIMIT);
            // Create new text, line by line.
            let lines = tip.split('\n');
            for (let i = 0; i < lines.length; i++) {
                let div = document.createElement('div');
                div.appendChild(document.createTextNode(lines[i]));
                contentDiv.appendChild(div);
            }
        }
    });
}
function removeBlock(fn) {
    delete Blockly.Blocks[fn.attributes.blockId];
    delete cachedBlocks[fn.attributes.blockId];
}
let jresIconCache = {};
function iconToFieldImage(id) {
    let url = jresIconCache[id];
    if (!url) {
        pxt.log(`missing jres icon ${id}`);
        return undefined;
    }
    return new Blockly.FieldImage(url, 40, 40, '', null, pxt.Util.isUserLanguageRtl());
}
function initJresIcons(blockInfo) {
    jresIconCache = {}; // clear previous cache
    const jres = blockInfo.apis.jres;
    if (!jres)
        return;
    Object.keys(jres).forEach((jresId) => {
        const jresObject = jres[jresId];
        if (jresObject && jresObject.icon)
            jresIconCache[jresId] = jresObject.icon;
    });
}
function splitInputs(def) {
    const res = [];
    let current = [];
    def.parts.forEach(part => {
        switch (part.kind) {
            case "break":
                newInput();
                break;
            case "param":
                current.push(part);
                newInput();
                break;
            case "image":
            case "label":
                current.push(part);
                break;
        }
    });
    newInput();
    return res;
    function newInput() {
        if (current.length) {
            res.push(current);
            current = [];
        }
    }
}
function namedField(field, name) {
    return { field, name };
}
function getEnumDropdownValues(apis, enumName) {
    return pxt.Util.values(apis.byQName).filter(sym => sym.namespace === enumName && !sym.attributes.blockHidden);
}
function getFixedInstanceDropdownValues(apis, qName) {
    const symbols = pxt.Util.values(apis.byQName).filter(sym => sym.kind === pxtc.SymbolKind.Variable
        && sym.attributes.fixedInstance
        && isSubtype(apis, sym.retType, qName))
        .sort((l, r) => (r.attributes.weight || 50) - (l.attributes.weight || 50));
    return symbols;
}
exports.getFixedInstanceDropdownValues = getFixedInstanceDropdownValues;
function generateIcons(instanceSymbols) {
    const imgConv = new pxt.ImageConverter();
    instanceSymbols.forEach(v => {
        if (v.attributes.jresURL && !v.attributes.iconURL && pxt.Util.startsWith(v.attributes.jresURL, "data:image/x-mkcd-f")) {
            v.attributes.iconURL = imgConv.convert(v.attributes.jresURL);
        }
    });
}
exports.generateIcons = generateIcons;
function getConstantDropdownValues(apis, qName) {
    return pxt.Util.values(apis.byQName).filter(sym => sym.attributes.blockIdentity === qName);
}
// Trims off a single space from beginning and end (if present)
function removeOuterSpace(str) {
    if (str === " ") {
        return "";
    }
    else if (str.length > 1) {
        const startSpace = str.charAt(0) == " ";
        const endSpace = str.charAt(str.length - 1) == " ";
        if (startSpace || endSpace) {
            return str.substring(startSpace ? 1 : 0, endSpace ? str.length - 1 : str.length);
        }
    }
    return str;
}
/**
 * Blockly variable fields can't be set directly; you either have to use the
 * variable ID or set the value of the model and not the field
 */
function setVarFieldValue(block, fieldName, newName) {
    const varField = block.getField(fieldName);
    // Check for an existing model with this name; otherwise we'll create
    // a second variable with the same name and it will show up twice in the UI
    const vars = block.workspace.getVariableMap().getAllVariables();
    let foundIt = false;
    if (vars && vars.length) {
        for (let v = 0; v < vars.length; v++) {
            const model = vars[v];
            if (model.getName() === newName) {
                varField.setValue(model.getId());
                foundIt = true;
            }
        }
    }
    if (!foundIt) {
        varField.initModel();
        const model = varField.getVariable();
        model.setName(newName);
        varField.setValue(model.getId());
    }
}
exports.setVarFieldValue = setVarFieldValue;
function localizeArgumentReporter(blocksInfo, field, block) {
    var _a;
    let result = undefined;
    const mutationName = block.getLocalizationName();
    if (mutationName) {
        const localized = pxt.U.rlf(mutationName);
        if (localized !== mutationName) {
            result = localized;
        }
        else {
            result = pxtc.getBlockTranslationsCacheKey(mutationName);
        }
    }
    const parent = (0, utils_1.getArgumentReporterParent)(block, block);
    if (!parent || (0, util_1.isFunctionDefinition)(parent))
        return result;
    const fn = blocksInfo.blocksById[parent.type];
    if (!fn)
        return result;
    const comp = pxt.blocks.compileInfo(fn);
    const handlerArg = (_a = comp.handlerArgs) === null || _a === void 0 ? void 0 : _a.find(arg => arg.name === field.getValue());
    if (handlerArg) {
        return pxtc.getBlockTranslationsCacheKey(handlerArg.localizationKey);
    }
    return result;
}
