"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkEnv = exports.emptyEnv = exports.BlockDeclarationType = exports.Point = void 0;
const util_1 = require("./util");
class Point {
    constructor(link, type, parentType, childType, isArrayType) {
        this.link = link;
        this.type = type;
        this.parentType = parentType;
        this.childType = childType;
        this.isArrayType = isArrayType;
    }
}
exports.Point = Point;
var BlockDeclarationType;
(function (BlockDeclarationType) {
    BlockDeclarationType[BlockDeclarationType["None"] = 0] = "None";
    BlockDeclarationType[BlockDeclarationType["Argument"] = 1] = "Argument";
    BlockDeclarationType[BlockDeclarationType["Assigned"] = 2] = "Assigned";
    BlockDeclarationType[BlockDeclarationType["Implicit"] = 3] = "Implicit";
})(BlockDeclarationType = exports.BlockDeclarationType || (exports.BlockDeclarationType = {}));
function emptyEnv(w, options) {
    return {
        workspace: w,
        options,
        stdCallTable: {},
        userFunctionReturnValues: {},
        diagnostics: [],
        errors: [],
        renames: {
            oldToNew: {},
            takenNames: {},
            oldToNewFunctions: {}
        },
        stats: {},
        enums: [],
        kinds: [],
        idToScope: {},
        blockDeclarations: {},
        allVariables: [],
        blocksInfo: null,
        placeholders: {}
    };
}
exports.emptyEnv = emptyEnv;
// This function creates an empty environment where type inference has NOT yet
// been performed.
// - All variables have been assigned an initial [Point] in the union-find.
// - Variables have been marked to indicate if they are compatible with the
//   TouchDevelop for-loop model.
function mkEnv(w, blockInfo, options = {}) {
    // The to-be-returned environment.
    let e = emptyEnv(w, options);
    e.blocksInfo = blockInfo;
    // append functions in stdcalltable
    if (blockInfo) {
        // Enums, tagged templates, and namespaces are not enclosed in namespaces,
        // so add them to the taken names to avoid collision
        Object.keys(blockInfo.apis.byQName).forEach(name => {
            const info = blockInfo.apis.byQName[name];
            // Note: the check for info.pkg filters out functions defined in the user's project.
            // Otherwise, after the first compile the function will be renamed because it conflicts
            // with itself. You can still get collisions if you attempt to define a function with
            // the same name as a function defined in another file in the user's project (e.g. custom.ts)
            if (info.pkg && (info.kind === pxtc.SymbolKind.Enum || info.kind === pxtc.SymbolKind.Function || info.kind === pxtc.SymbolKind.Module || info.kind === pxtc.SymbolKind.Variable)) {
                e.renames.takenNames[info.qName] = true;
            }
        });
        if (blockInfo.enumsByName) {
            Object.keys(blockInfo.enumsByName).forEach(k => e.enums.push(blockInfo.enumsByName[k]));
        }
        if (blockInfo.kindsByName) {
            Object.keys(blockInfo.kindsByName).forEach(k => e.kinds.push(blockInfo.kindsByName[k]));
        }
        blockInfo.blocks
            .forEach(fn => {
            if (e.stdCallTable[fn.attributes.blockId]) {
                pxt.reportError("blocks", "function already defined", {
                    "details": fn.attributes.blockId,
                    "qualifiedName": fn.qName,
                    "packageName": fn.pkg,
                });
                return;
            }
            e.renames.takenNames[fn.namespace] = true;
            const comp = pxt.blocks.compileInfo(fn);
            const instance = !!comp.thisParameter;
            e.stdCallTable[fn.attributes.blockId] = {
                namespace: fn.namespace,
                f: fn.name,
                comp,
                attrs: fn.attributes,
                isExtensionMethod: instance,
                isExpression: fn.retType && fn.retType !== "void",
                imageLiteral: fn.attributes.imageLiteral || fn.attributes.gridLiteral,
                imageLiteralColumns: fn.attributes.imageLiteralColumns,
                imageLiteralRows: fn.attributes.imageLiteralRows,
                hasHandler: pxt.blocks.hasHandler(fn),
                property: !fn.parameters,
                isIdentity: fn.attributes.shim == "TD_ID"
            };
        });
        w.getTopBlocks(false).filter(util_1.isFunctionDefinition).forEach(b => {
            // Add functions to the rename map to prevent name collisions with variables
            const name = b.type === "procedures_defnoreturn" ? b.getFieldValue("NAME") : b.getField("function_name").getText();
            (0, util_1.escapeVarName)(name, e, true);
        });
    }
    return e;
}
exports.mkEnv = mkEnv;
