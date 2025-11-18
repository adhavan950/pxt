"use strict";
/// <reference path="../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompiledDiffAsync = exports.mergeXml = exports.diffXml = exports.needsDecompiledDiff = void 0;
const Blockly = require("blockly");
const importer_1 = require("./importer");
const render_1 = require("./render");
// sniff ids to see if the xml was completly reconstructed
function needsDecompiledDiff(oldXml, newXml) {
    if (!oldXml || !newXml)
        return false;
    // collect all ids
    const oldids = {};
    oldXml.replace(/id="([^"]+)"/g, (m, id) => { oldids[id] = true; return ""; });
    if (!Object.keys(oldids).length)
        return false;
    // test if any newid exists in old
    let total = 0;
    let found = 0;
    newXml.replace(/id="([^"]+)"/g, (m, id) => {
        total++;
        if (oldids[id])
            found++;
        return "";
    });
    return total > 0 && found == 0;
}
exports.needsDecompiledDiff = needsDecompiledDiff;
function diffXml(oldXml, newXml, options) {
    const oldWs = (0, importer_1.loadWorkspaceXml)(oldXml, true);
    const newWs = (0, importer_1.loadWorkspaceXml)(newXml, true);
    return diffWorkspace(oldWs, newWs, options);
}
exports.diffXml = diffXml;
const UNMODIFIED_COLOR = "#d0d0d0";
// Workspaces are modified in place!
function diffWorkspace(oldWs, newWs, options) {
    try {
        Blockly.Events.disable();
        return diffWorkspaceNoEvents(oldWs, newWs, options);
    }
    catch (e) {
        pxt.reportException(e);
        return {
            ws: undefined,
            message: lf("Oops, we could not diff those blocks."),
            error: e,
            deleted: 0,
            added: 0,
            modified: 0
        };
    }
    finally {
        Blockly.Events.enable();
    }
}
function logger() {
    const log = pxt.options.debug || (window && /diffdbg=1/.test(window.location.href))
        ? pxt.log : (message, ...args) => { };
    return log;
}
const DIFF_DISABLED_REASON = "disabled_for_diff";
function diffWorkspaceNoEvents(oldWs, newWs, options) {
    pxt.tickEvent("blocks.diff", { started: 1 });
    options = options || {};
    const log = logger();
    if (!oldWs) {
        return {
            ws: undefined,
            message: lf("All blocks are new."),
            added: 0,
            deleted: 0,
            modified: 1
        }; // corrupted blocks
    }
    if (!newWs) {
        return {
            ws: undefined,
            message: lf("The current blocks seem corrupted."),
            added: 0,
            deleted: 0,
            modified: 1
        }; // corrupted blocks
    }
    // remove all unmodified topblocks
    // when doing a Blocks->TS roundtrip, all ids are trashed.
    const oldXml = pxt.Util.toDictionary(oldWs.getTopBlocks(false), b => normalizedDom(b, true));
    newWs.getTopBlocks(false)
        .forEach(newb => {
        const newn = normalizedDom(newb, true);
        // try to find by id or by matching normalized xml
        const oldb = oldWs.getBlockById(newb.id) || oldXml[newn];
        if (oldb) {
            const oldn = normalizedDom(oldb, true);
            if (newn == oldn) {
                log(`fast unmodified top `, newb.id);
                newb.dispose(false);
                oldb.dispose(false);
            }
        }
    });
    // we'll ignore disabled blocks in the final output
    const oldBlocks = oldWs.getAllBlocks(false).filter(b => b.isEnabled());
    const oldTopBlocks = oldWs.getTopBlocks(false).filter(b => b.isEnabled());
    const newBlocks = newWs.getAllBlocks(false).filter(b => b.isEnabled());
    log(`blocks`, newBlocks.map(b => b.toDevString()));
    log(newBlocks);
    if (oldBlocks.length == 0 && newBlocks.length == 0) {
        pxt.tickEvent("blocks.diff", { moves: 1 });
        return {
            ws: undefined,
            message: lf("Some blocks were moved or changed."),
            added: 0,
            deleted: 0,
            modified: 1
        }; // just moves
    }
    // locate deleted and added blocks
    const deletedTopBlocks = oldTopBlocks.filter(b => !newWs.getBlockById(b.id));
    const deletedBlocks = oldBlocks.filter(b => !newWs.getBlockById(b.id));
    const addedBlocks = newBlocks.filter(b => !oldWs.getBlockById(b.id));
    // clone new workspace into rendering workspace
    const ws = (0, render_1.initRenderingWorkspace)();
    const newXml = (0, importer_1.saveWorkspaceXml)(newWs, true);
    (0, importer_1.domToWorkspaceNoEvents)(Blockly.utils.xml.textToDom(newXml), ws);
    // delete disabled blocks from final workspace
    ws.getAllBlocks(false).filter(b => !b.isEnabled()).forEach(b => {
        log('disabled ', b.toDevString());
        b.dispose(false);
    });
    const todoBlocks = pxt.Util.toDictionary(ws.getAllBlocks(false), b => b.id);
    log(`todo blocks`, todoBlocks);
    logTodo('start');
    // 1. deleted top blocks
    if (!options.hideDeletedTopBlocks) {
        deletedTopBlocks.forEach(b => {
            log(`deleted top ${b.toDevString()}`);
            done(b);
            const b2 = cloneIntoDiff(b);
            done(b2);
            b2.setDisabledReason(true, DIFF_DISABLED_REASON);
        });
        logTodo('deleted top');
    }
    // 2. added blocks
    addedBlocks.map(b => ws.getBlockById(b.id))
        .filter(b => !!b) // ignore disabled
        .forEach(b => {
        log(`added ${b.toDevString()}`);
        //b.inputList[0].insertFieldAt(0, new Blockly.FieldImage(ADD_IMAGE_DATAURI, 24, 24, false));
        done(b);
    });
    logTodo('added');
    // 3. delete statement blocks
    // inject deleted blocks in new workspace
    const dids = {};
    if (!options.hideDeletedBlocks) {
        const deletedStatementBlocks = deletedBlocks
            .filter(b => !todoBlocks[b.id]
            && !isUsed(b)
            && (!b.outputConnection || !b.outputConnection.isConnected()) // ignore reporters
        );
        deletedStatementBlocks
            .forEach(b => {
            const b2 = cloneIntoDiff(b);
            dids[b.id] = b2.id;
            log(`deleted block ${b.toDevString()}->${b2.toDevString()}`);
        });
        // connect deleted blocks together
        deletedStatementBlocks
            .forEach(b => stitch(b));
    }
    // 4. moved blocks
    let modified = 0;
    pxt.Util.values(todoBlocks).filter(b => moved(b)).forEach(b => {
        log(`moved ${b.toDevString()}`);
        delete todoBlocks[b.id];
        markUsed(b);
        modified++;
    });
    logTodo('moved');
    // 5. blocks with field properties that changed
    pxt.Util.values(todoBlocks).filter(b => changed(b)).forEach(b => {
        log(`changed ${b.toDevString()}`);
        delete todoBlocks[b.id];
        markUsed(b);
        modified++;
    });
    logTodo('changed');
    // delete unmodified top blocks
    ws.getTopBlocks(false)
        .forEach(b => {
        if (!findUsed(b)) {
            log(`unmodified top ${b.toDevString()}`);
            delete todoBlocks[b.id];
            b.dispose(false);
        }
    });
    logTodo('cleaned');
    // all unmodifed blocks are greyed out
    pxt.Util.values(todoBlocks).filter(b => !!ws.getBlockById(b.id)).forEach(b => {
        unmodified(b);
    });
    logTodo('unmodified');
    // if nothing is left in the workspace, we "missed" change
    if (!ws.getAllBlocks(false).length) {
        pxt.tickEvent("blocks.diff", { missed: 1 });
        return {
            ws,
            message: lf("Some blocks were changed."),
            deleted: deletedBlocks.length,
            added: addedBlocks.length,
            modified: modified
        };
    }
    // make sure everything is rendered
    ws.resize();
    Blockly.svgResize(ws);
    // final render
    const svg = (0, render_1.renderWorkspace)(options.renderOptions || {
        emPixels: 20,
        layout: 4 /* pxt.editor.BlockLayout.Flow */,
        aspectRatio: 0.5,
        useViewWidth: true
    });
    // and we're done
    const r = {
        ws,
        svg: svg,
        deleted: deletedBlocks.length,
        added: addedBlocks.length,
        modified: modified
    };
    pxt.tickEvent("blocks.diff", { deleted: r.deleted, added: r.added, modified: r.modified });
    return r;
    function stitch(b) {
        log(`stitching ${b.toDevString()}->${dids[b.id]}`);
        const wb = ws.getBlockById(dids[b.id]);
        wb.setDisabledReason(true, DIFF_DISABLED_REASON);
        markUsed(wb);
        done(wb);
        // connect previous connection to delted or existing block
        const previous = b.getPreviousBlock();
        if (previous) {
            const previousw = ws.getBlockById(dids[previous.id]) || ws.getBlockById(previous.id);
            log(`previous ${b.id}->${wb.toDevString()}: ${previousw.toDevString()}`);
            if (previousw) {
                // either connected under or in the block
                if (previousw.nextConnection)
                    wb.previousConnection.connect(previousw.nextConnection);
                else {
                    const ic = previousw.inputList.slice()
                        .reverse()
                        .find(input => input.connection && input.connection.type == Blockly.NEXT_STATEMENT);
                    if (ic)
                        wb.previousConnection.connect(ic.connection);
                }
            }
        }
        // connect next connection to delete or existing block
        const next = b.getNextBlock();
        if (next) {
            const nextw = ws.getBlockById(dids[next.id]) || ws.getBlockById(next.id);
            if (nextw) {
                log(`next ${b.id}->${wb.toDevString()}: ${nextw.toDevString()}`);
                wb.nextConnection.connect(nextw.previousConnection);
            }
        }
    }
    function markUsed(b) {
        b.__pxt_used = true;
    }
    function isUsed(b) {
        return !!b.__pxt_used;
    }
    function cloneIntoDiff(b) {
        const bdom = Blockly.Xml.blockToDom(b, false);
        const b2 = Blockly.Xml.domToBlock(bdom, ws);
        // disconnect
        if (b2.nextConnection && b2.nextConnection.targetConnection)
            b2.nextConnection.disconnect();
        if (b2.previousConnection && b2.previousConnection.targetConnection)
            b2.previousConnection.disconnect();
        return b2;
    }
    function forceRender(b) {
        // b.rendered = false;
        b.inputList.forEach(i => i.fieldRow.forEach(f => {
            f.init();
            // FIXME (riknoll): Not sure if this is still necessary
            // if (f.borderRect_) {
            //     f.borderRect_.setAttribute('fill', b.getColour())
            //     f.borderRect_.setAttribute('stroke', (b as Blockly.BlockSvg).getColourTertiary())
            // }
        }));
    }
    function done(b) {
        b.getDescendants(false).forEach(t => { delete todoBlocks[t.id]; markUsed(t); });
    }
    function findUsed(b) {
        return !!b.getDescendants(false).find(c => isUsed(c));
    }
    function logTodo(msg) {
        log(`${msg}:`, pxt.Util.values(todoBlocks).map(b => b.toDevString()));
    }
    function moved(b) {
        const oldb = oldWs.getBlockById(b.id); // extra block created in added step
        if (!oldb)
            return false;
        const newPrevious = b.getPreviousBlock();
        // connection already already processed
        if (newPrevious && !todoBlocks[newPrevious.id])
            return false;
        const newNext = b.getNextBlock();
        // already processed
        if (newNext && !todoBlocks[newNext.id])
            return false;
        const oldPrevious = oldb.getPreviousBlock();
        if (!oldPrevious && !newPrevious)
            return false; // no connection
        if (!!oldPrevious != !!newPrevious // new connection
            || oldPrevious.id != newPrevious.id) // new connected blocks
            return true;
        const oldNext = oldb.getNextBlock();
        if (!oldNext && !newNext)
            return false; // no connection
        if (!!oldNext != !!newNext // new connection
            || oldNext.id != newNext.id) // new connected blocks
            return true;
        return false;
    }
    function changed(b) {
        let oldb = oldWs.getBlockById(b.id); // extra block created in added step
        if (!oldb)
            return false;
        // normalize
        //oldb = copyToTrashWs(oldb);
        const oldText = normalizedDom(oldb);
        //b = copyToTrashWs(b);
        const newText = normalizedDom(b);
        if (oldText != newText) {
            log(`old ${oldb.toDevString()}`, oldText);
            log(`new ${b.toDevString()}`, newText);
            return true;
        }
        // not changed!
        return false;
    }
    function unmodified(b) {
        b.setColour(UNMODIFIED_COLOR);
        forceRender(b);
        if (options.statementsOnly) {
            // mark all nested reporters as unmodified
            (b.inputList || [])
                .map(input => input.type == Blockly.inputs.inputTypes.VALUE && input.connection && input.connection.targetBlock())
                .filter(argBlock => !!argBlock)
                .forEach(argBlock => unmodified(argBlock));
        }
    }
}
function mergeXml(xmlA, xmlO, xmlB) {
    if (xmlA == xmlO)
        return xmlB;
    if (xmlB == xmlO)
        return xmlA;
    // TODO merge
    return undefined;
}
exports.mergeXml = mergeXml;
function normalizedDom(b, keepChildren) {
    const dom = Blockly.Xml.blockToDom(b, true);
    normalizeAttributes(dom);
    visDom(dom, (e) => {
        normalizeAttributes(e);
        if (!keepChildren) {
            if (e.localName == "next")
                e.remove(); // disconnect or unplug not working propertly
            else if (e.localName == "statement")
                e.remove();
            else if (e.localName == "shadow") // ignore internal nodes
                e.remove();
        }
    });
    return Blockly.Xml.domToText(dom);
}
function normalizeAttributes(e) {
    e.removeAttribute("id");
    e.removeAttribute("x");
    e.removeAttribute("y");
    e.removeAttribute("deletable");
    e.removeAttribute("editable");
    e.removeAttribute("movable");
}
function visDom(el, f) {
    if (!el)
        return;
    f(el);
    for (const child of pxt.Util.toArray(el.children))
        visDom(child, f);
}
function decompiledDiffAsync(oldTs, oldResp, newTs, newResp, options = {}) {
    const log = logger();
    const oldXml = oldResp.outfiles[pxt.MAIN_BLOCKS];
    let newXml = newResp.outfiles[pxt.MAIN_BLOCKS];
    log(oldXml);
    log(newXml);
    // compute diff of typescript sources
    const diffLines = pxt.diff.computeFormattedDiff(oldTs, newTs, {
        ignoreWhitespace: true,
        full: true
    });
    log(diffLines);
    // build old -> new lines mapping
    const newids = {};
    let oldLineStart = 0;
    let newLineStart = 0;
    diffLines.forEach((ln, index) => {
        // moving cursors
        const marker = ln[0];
        const line = ln.substr(2);
        let lineLength = line.length;
        switch (marker) {
            case "-": // removed
                oldLineStart += lineLength + 1;
                break;
            case "+": // added
                newLineStart += lineLength + 1;
                break;
            default: // unchanged
                // skip leading white space
                const lw = /^\s+/.exec(line);
                if (lw) {
                    const lwl = lw[0].length;
                    oldLineStart += lwl;
                    newLineStart += lwl;
                    lineLength -= lwl;
                }
                // find block ids mapped to the ranges
                const newid = findBlockIdByPosition(newResp.blockSourceMap, {
                    start: newLineStart,
                    length: lineLength
                });
                if (newid && !newids[newid]) {
                    const oldid = findBlockIdByPosition(oldResp.blockSourceMap, {
                        start: oldLineStart,
                        length: lineLength
                    });
                    // patch workspace
                    if (oldid) {
                        log(ln);
                        log(`id ${oldLineStart}:${line.length}>${oldid} ==> ${newLineStart}:${line.length}>${newid}`);
                        newids[newid] = oldid;
                        newXml = newXml.replace(newid, oldid);
                    }
                }
                oldLineStart += lineLength + 1;
                newLineStart += lineLength + 1;
                break;
        }
    });
    // parse workspacews
    const oldWs = (0, importer_1.loadWorkspaceXml)(oldXml, true);
    const newWs = (0, importer_1.loadWorkspaceXml)(newXml, true);
    options.statementsOnly = true; // no info on expression diffs
    return diffWorkspace(oldWs, newWs, options);
}
exports.decompiledDiffAsync = decompiledDiffAsync;
function findBlockIdByPosition(sourceMap, loc) {
    if (!loc)
        return undefined;
    let bestChunk;
    let bestChunkLength;
    // look for smallest chunk containing the block
    for (let i = 0; i < sourceMap.length; ++i) {
        let chunk = sourceMap[i];
        if (chunk.startPos <= loc.start
            && chunk.endPos >= loc.start + loc.length
            && (!bestChunk || bestChunkLength > chunk.endPos - chunk.startPos)) {
            bestChunk = chunk;
            bestChunkLength = chunk.endPos - chunk.startPos;
        }
    }
    if (bestChunk) {
        return bestChunk.id;
    }
    return undefined;
}
