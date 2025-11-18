"use strict";
/// <reference path="../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAllReferencedBlocksExist = exports.patchShadows = exports.patchCommentIds = exports.importXml = exports.loadWorkspaceXml = exports.loadBlocksXml = exports.getFirstChildWithAttr = exports.getChildrenWithAttr = exports.getBlocksWithType = exports.getDirectChildren = exports.saveBlocksXml = exports.workspaceToDom = exports.saveWorkspaceXml = exports.clearWithoutEvents = exports.domToWorkspaceNoEvents = void 0;
const Blockly = require("blockly");
const loader_1 = require("./loader");
const external_1 = require("./external");
const fields_1 = require("./fields");
/**
 * Converts a DOM into workspace without triggering any Blockly event. Returns the new block ids
 * @param dom
 * @param workspace
 */
function domToWorkspaceNoEvents(dom, workspace, opts) {
    pxt.tickEvent(`blocks.domtow`);
    let newBlockIds = [];
    patchCommentIds(dom);
    patchShadows(dom, false);
    if (pxt.react.getTilemapProject) {
        (0, fields_1.updateTilemapXml)(dom, pxt.react.getTilemapProject());
    }
    try {
        Blockly.Events.disable();
        newBlockIds = Blockly.Xml.domToWorkspace(dom, workspace);
        fields_1.FieldBase.flushInitQueue();
        for (const block of workspace.getAllBlocks()) {
            if (block.afterWorkspaceLoad) {
                block.afterWorkspaceLoad.call(block);
            }
        }
        applyMetaComments(workspace, opts);
    }
    catch (e) {
        pxt.reportException(e);
    }
    finally {
        Blockly.Events.enable();
    }
    return newBlockIds.filter(id => !!workspace.getBlockById(id));
}
exports.domToWorkspaceNoEvents = domToWorkspaceNoEvents;
function applyMetaComments(workspace, opts) {
    // process meta comments
    // @highlight -> highlight block
    workspace.getAllBlocks(false)
        .filter(b => !!b.getCommentText())
        .forEach(b => {
        var _a, _b;
        const initialCommentText = b.getCommentText();
        if (/@hide/.test(initialCommentText) && (opts === null || opts === void 0 ? void 0 : opts.applyHideMetaComment)) {
            b.dispose(true);
            return;
        }
        let newCommentText = initialCommentText;
        if (/@highlight/.test(newCommentText)) {
            newCommentText = newCommentText.replace(/@highlight/g, '').trim();
            (_b = (_a = workspace).highlightBlock) === null || _b === void 0 ? void 0 : _b.call(_a, b.id, true);
        }
        if (/@collapsed/.test(newCommentText) && !b.getParent()) {
            newCommentText = newCommentText.replace(/@collapsed/g, '').trim();
            b.setCollapsed(true);
        }
        newCommentText = newCommentText.replace(/@validate-\S+/g, '').trim();
        if (initialCommentText !== newCommentText && !(opts === null || opts === void 0 ? void 0 : opts.keepMetaComments)) {
            b.setCommentText(newCommentText || null);
        }
    });
}
function clearWithoutEvents(workspace) {
    pxt.tickEvent(`blocks.clear`);
    if (!workspace)
        return;
    try {
        Blockly.Events.disable();
        workspace.clear();
        workspace.clearUndo();
    }
    finally {
        Blockly.Events.enable();
    }
}
exports.clearWithoutEvents = clearWithoutEvents;
// Saves entire workspace, including variables, into an xml string
function saveWorkspaceXml(ws, keepIds) {
    const xml = workspaceToDom(ws, !keepIds);
    const text = Blockly.Xml.domToText(xml);
    return text;
}
exports.saveWorkspaceXml = saveWorkspaceXml;
// Same as Blockly's workspaceToDom but always saves all the variables in the workspace and not
// just the ones that are used. We store some extra variables in the workspace for fields like
// FieldKind and FieldUserEnum
function workspaceToDom(workspace, keepIds) {
    const xml = Blockly.Xml.workspaceToDom(workspace, keepIds);
    const variables = Blockly.Xml.variablesToDom(workspace.getVariableMap().getAllVariables());
    const existingVariables = getDirectChildren(xml, "variables");
    for (const v of existingVariables) {
        v.remove();
    }
    // Make sure we never accidentally save projects in readonly mode
    clearReadOnlyInfo(xml.getElementsByTagName("block"));
    clearReadOnlyInfo(xml.getElementsByTagName("shadow"));
    clearReadOnlyInfo(xml.getElementsByTagName("comment"));
    if (xml.firstChild) {
        xml.insertBefore(variables, xml.firstChild);
    }
    else {
        xml.appendChild(variables);
    }
    return xml;
}
exports.workspaceToDom = workspaceToDom;
function clearReadOnlyInfo(elements) {
    for (let i = 0; i < elements.length; i++) {
        const current = elements.item(i);
        if (current.hasAttribute("editable")) {
            current.removeAttribute("editable");
        }
        if (current.hasAttribute("movable")) {
            current.removeAttribute("movable");
        }
    }
}
// Saves only the blocks xml by iterating over the top blocks
function saveBlocksXml(ws, keepIds) {
    let topBlocks = ws.getTopBlocks(false);
    return topBlocks.map(block => {
        return Blockly.Xml.domToText(Blockly.Xml.blockToDom(block, !keepIds));
    });
}
exports.saveBlocksXml = saveBlocksXml;
function getDirectChildren(parent, tag) {
    const res = [];
    for (let i = 0; i < parent.childNodes.length; i++) {
        const n = parent.childNodes.item(i);
        if (n.tagName === tag) {
            res.push(n);
        }
    }
    return res;
}
exports.getDirectChildren = getDirectChildren;
function getBlocksWithType(parent, type) {
    return getChildrenWithAttr(parent, "block", "type", type).concat(getChildrenWithAttr(parent, "shadow", "type", type));
}
exports.getBlocksWithType = getBlocksWithType;
function getChildrenWithAttr(parent, tag, attr, value) {
    return pxt.Util.toArray(parent.getElementsByTagName(tag)).filter(b => b.getAttribute(attr) === value);
}
exports.getChildrenWithAttr = getChildrenWithAttr;
function getFirstChildWithAttr(parent, tag, attr, value) {
    const res = getChildrenWithAttr(parent, tag, attr, value);
    return res.length ? res[0] : undefined;
}
exports.getFirstChildWithAttr = getFirstChildWithAttr;
function loadBlocksXml(ws, text) {
    let xmlBlock = Blockly.utils.xml.textToDom(text);
    let block = Blockly.Xml.domToBlock(xmlBlock, ws);
    if (ws.getMetrics) {
        let metrics = ws.getMetrics();
        let blockDimensions = block.getHeightWidth();
        block.moveBy(metrics.viewLeft + (metrics.viewWidth / 2) - (blockDimensions.width / 2), metrics.viewTop + (metrics.viewHeight / 2) - (blockDimensions.height / 2));
    }
}
exports.loadBlocksXml = loadBlocksXml;
/**
 * Loads the xml into a off-screen workspace (not suitable for size computations)
 */
function loadWorkspaceXml(xml, skipReport = false, opts) {
    const workspace = new Blockly.Workspace();
    try {
        const dom = Blockly.utils.xml.textToDom(xml);
        domToWorkspaceNoEvents(dom, workspace, opts);
        return workspace;
    }
    catch (e) {
        if (!skipReport)
            pxt.reportException(e);
        return null;
    }
}
exports.loadWorkspaceXml = loadWorkspaceXml;
function patchFloatingBlocks(dom, info) {
    const onstarts = getBlocksWithType(dom, ts.pxtc.ON_START_TYPE);
    let onstart = onstarts.length ? onstarts[0] : undefined;
    if (onstart) { // nothing to do
        onstart.removeAttribute("deletable");
        return;
    }
    let newnodes = [];
    const blocks = info.blocksById;
    // walk top level blocks
    let node = dom.firstElementChild;
    let insertNode = undefined;
    while (node) {
        const nextNode = node.nextElementSibling;
        // does this block is disable or have s nested statement block?
        const nodeType = node.getAttribute("type");
        if (!node.getAttribute("disabled") && !node.getElementsByTagName("statement").length
            && (loader_1.buildinBlockStatements[nodeType] ||
                (blocks[nodeType] && blocks[nodeType].retType == "void" && !(0, loader_1.hasArrowFunction)(blocks[nodeType])))) {
            // old block, needs to be wrapped in onstart
            if (!insertNode) {
                insertNode = dom.ownerDocument.createElement("statement");
                insertNode.setAttribute("name", "HANDLER");
                if (!onstart) {
                    onstart = dom.ownerDocument.createElement("block");
                    onstart.setAttribute("type", ts.pxtc.ON_START_TYPE);
                    newnodes.push(onstart);
                }
                onstart.appendChild(insertNode);
                insertNode.appendChild(node);
                node.removeAttribute("x");
                node.removeAttribute("y");
                insertNode = node;
            }
            else {
                // event, add nested statement
                const next = dom.ownerDocument.createElement("next");
                next.appendChild(node);
                insertNode.appendChild(next);
                node.removeAttribute("x");
                node.removeAttribute("y");
                insertNode = node;
            }
        }
        node = nextNode;
    }
    newnodes.forEach(n => dom.appendChild(n));
}
/**
 * Patch to transform old function blocks to new ones, and rename child nodes
 */
function patchFunctionBlocks(dom, info) {
    let functionNodes = pxt.U.toArray(dom.querySelectorAll("block[type=procedures_defnoreturn]"));
    functionNodes.forEach(node => {
        node.setAttribute("type", "function_definition");
        node.querySelector("field[name=NAME]").setAttribute("name", "function_name");
    });
    let functionCallNodes = pxt.U.toArray(dom.querySelectorAll("block[type=procedures_callnoreturn]"));
    functionCallNodes.forEach(node => {
        node.setAttribute("type", "function_call");
        node.querySelector("field[name=NAME]").setAttribute("name", "function_name");
    });
}
function importXml(pkgTargetVersion, xml, info, skipReport = false) {
    try {
        // If it's the first project we're importing in the session, Blockly is not initialized
        // and blocks haven't been injected yet
        (0, loader_1.initializeAndInject)(info);
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        const upgrades = pxt.patching.computePatches(pkgTargetVersion);
        if (upgrades) {
            // patch block types
            upgrades.filter(up => up.type == "blockId")
                .forEach(up => Object.keys(up.map).forEach(type => {
                getBlocksWithType(doc, type)
                    .forEach(blockNode => {
                    blockNode.setAttribute("type", up.map[type]);
                    pxt.debug(`patched block ${type} -> ${up.map[type]}`);
                });
            }));
            // patch block value
            upgrades.filter(up => up.type == "blockValue")
                .forEach(up => Object.keys(up.map).forEach(k => {
                const m = k.split('.');
                const type = m[0];
                const name = m[1];
                getBlocksWithType(doc, type)
                    .reduce((prev, current) => prev.concat(getDirectChildren(current, "value")), [])
                    .forEach(blockNode => {
                    blockNode.setAttribute("name", up.map[k]);
                    pxt.debug(`patched block value ${k} -> ${up.map[k]}`);
                });
            }));
            // patch enum variables
            upgrades.filter(up => up.type == "userenum")
                .forEach(up => Object.keys(up.map).forEach(k => {
                getChildrenWithAttr(doc, "variable", "type", k).forEach(el => {
                    el.setAttribute("type", up.map[k]);
                    pxt.debug(`patched enum variable type ${k} -> ${up.map[k]}`);
                });
            }));
        }
        // Blockly doesn't allow top-level shadow blocks. We've had bugs in the past where shadow blocks
        // have ended up as top-level blocks, so promote them to regular blocks just in case
        const shadows = getDirectChildren(doc.children.item(0), "shadow");
        for (const shadow of shadows) {
            const block = doc.createElement("block");
            shadow.getAttributeNames().forEach(attr => block.setAttribute(attr, shadow.getAttribute(attr)));
            for (let j = 0; j < shadow.childNodes.length; j++) {
                block.appendChild(shadow.childNodes.item(j));
            }
            shadow.replaceWith(block);
        }
        patchShadows(doc.documentElement, false);
        patchCommentIds(doc.documentElement);
        // build upgrade map
        const enums = {};
        Object.keys(info.apis.byQName).forEach(k => {
            let api = info.apis.byQName[k];
            if (api.kind == pxtc.SymbolKind.EnumMember)
                enums[api.namespace + '.' + (api.attributes.blockImportId || api.attributes.block || api.attributes.blockId || api.name)]
                    = api.namespace + '.' + api.name;
        });
        // walk through blocks and patch enums
        const blocks = doc.getElementsByTagName("block");
        for (let i = 0; i < blocks.length; ++i)
            patchBlock(info, enums, blocks[i]);
        // patch floating blocks
        patchFloatingBlocks(doc.documentElement, info);
        // patch function blocks
        patchFunctionBlocks(doc.documentElement, info);
        // apply extension patches
        (0, external_1.extensionBlocklyPatch)(pkgTargetVersion, doc.documentElement);
        // serialize and return
        return new XMLSerializer().serializeToString(doc);
    }
    catch (e) {
        if (!skipReport)
            pxt.reportException(e);
        return xml;
    }
}
exports.importXml = importXml;
function patchCommentIds(xml) {
    const comments = getDirectChildren(xml, "comment");
    for (const comment of comments) {
        if (!comment.hasAttribute("id")) {
            comment.setAttribute("id", Blockly.utils.idGenerator.genUid());
        }
    }
    // Also patch comments that don't have a width/height set
    for (const comment of xml.querySelectorAll("comment:not([h])")) {
        comment.setAttribute("h", "80");
        comment.setAttribute("w", "160");
    }
}
exports.patchCommentIds = patchCommentIds;
function promoteShadow(shadow) {
    if (shadow.parentElement.childElementCount === 2) {
        // there is already a block in this input
        shadow.remove();
        return undefined;
    }
    const newBlock = createBlockFromShadow(shadow);
    shadow.parentElement.appendChild(newBlock);
    shadow.remove();
    return newBlock;
}
;
function createBlockFromShadow(shadow) {
    const newBlock = Blockly.utils.xml.createElement("block");
    for (const attr of shadow.getAttributeNames()) {
        newBlock.setAttribute(attr, shadow.getAttribute(attr));
    }
    for (const child of shadow.childNodes) {
        newBlock.appendChild(child.cloneNode(true));
    }
    return newBlock;
}
function patchShadows(root, inShadow) {
    var _a;
    if (root.tagName === "shadow") {
        if (((_a = root.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === "xml") {
            pxt.warn(`Shadow block of type '${root.getAttribute("type")}' found at top level. Converting to non-shadow block`);
            pxt.tickEvent(`blocks.import.topLevelShadow`, { blockId: root.getAttribute("type") });
            const newBlock = createBlockFromShadow(root);
            root.parentElement.insertBefore(newBlock, root);
            root.remove();
            root = newBlock;
            const mutation = getDirectChildren(root, "mutation")[0];
            if (mutation === null || mutation === void 0 ? void 0 : mutation.hasAttribute("dupliacteondrag")) {
                mutation.removeAttribute("dupliacteondrag");
            }
        }
        else {
            const type = root.getAttribute("type");
            let shouldPatch = false;
            switch (type) {
                case "variables_get_reporter":
                case "argument_reporter_boolean":
                case "argument_reporter_number":
                case "argument_reporter_string":
                case "argument_reporter_array":
                case "argument_reporter_custom":
                    shouldPatch = true;
                    break;
            }
            if (shouldPatch) {
                root = promoteShadow(root);
                if (!root)
                    return;
                let mutation = getDirectChildren(root, "mutation")[0];
                if (mutation) {
                    mutation.setAttribute("duplicateondrag", "true");
                }
                else {
                    mutation = Blockly.utils.xml.createElement("mutation");
                    mutation.setAttribute("duplicateondrag", "true");
                    root.appendChild(mutation);
                }
            }
            else if (type === "variables_get" || hasNonShadowChild(root)) {
                root = promoteShadow(root);
            }
        }
    }
    if (!root)
        return;
    for (const child of root.children) {
        patchShadows(child, inShadow || root.tagName === "shadow");
    }
}
exports.patchShadows = patchShadows;
;
function hasNonShadowChild(el) {
    for (const child of el.children) {
        if (child.tagName.toLowerCase() === "block" || hasNonShadowChild(child))
            return true;
    }
    return false;
}
function patchBlock(info, enums, block) {
    var _a;
    let type = block.getAttribute("type");
    let b = Blockly.Blocks[type];
    let symbol = (0, loader_1.blockSymbol)(type);
    if (!symbol || !b)
        return;
    let comp = pxt.blocks.compileInfo(symbol);
    (_a = symbol.parameters) === null || _a === void 0 ? void 0 : _a.forEach((p, i) => {
        let ptype = info.apis.byQName[p.type];
        if (ptype && ptype.kind == pxtc.SymbolKind.Enum) {
            let field = getFirstChildWithAttr(block, "field", "name", comp.actualNameToParam[p.name].definitionName);
            if (field) {
                let en = enums[ptype.name + '.' + field.textContent];
                if (en)
                    field.textContent = en;
            }
            /*
<block type="device_button_event" x="92" y="77">
<field name="NAME">Button.AB</field>
</block>
              */
        }
    });
}
function validateAllReferencedBlocksExist(xml) {
    pxt.U.assert(!!(Blockly === null || Blockly === void 0 ? void 0 : Blockly.Blocks), "Called validateAllReferencedBlocksExist before initializing Blockly");
    const dom = Blockly.utils.xml.textToDom(xml);
    const blocks = dom.querySelectorAll("block");
    for (let i = 0; i < blocks.length; i++) {
        if (!Blockly.Blocks[blocks.item(i).getAttribute("type")])
            return false;
    }
    const shadows = dom.querySelectorAll("shadow");
    for (let i = 0; i < shadows.length; i++) {
        if (!Blockly.Blocks[shadows.item(i).getAttribute("type")])
            return false;
    }
    return true;
}
exports.validateAllReferencedBlocksExist = validateAllReferencedBlocksExist;
