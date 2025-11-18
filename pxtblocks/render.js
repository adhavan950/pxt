"use strict";
/// <reference path="../built/pxtlib.d.ts" />
/// <reference path="../localtypings/pxteditor.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.blocksMetrics = exports.render = exports.renderWorkspace = exports.cleanRenderingWorkspace = exports.initRenderingWorkspace = void 0;
const Blockly = require("blockly");
const layout_1 = require("./layout");
const importer_1 = require("./importer");
let workspace;
let blocklyDiv;
function initRenderingWorkspace() {
    if (!workspace) {
        blocklyDiv = document.createElement("div");
        blocklyDiv.style.position = "absolute";
        blocklyDiv.style.top = "0";
        blocklyDiv.style.left = "0";
        blocklyDiv.style.width = "1px";
        blocklyDiv.style.height = "1px";
        document.body.appendChild(blocklyDiv);
        workspace = Blockly.inject(blocklyDiv, {
            move: {
                scrollbars: false
            },
            readOnly: true,
            sounds: false,
            media: pxt.webConfig.commitCdnUrl + "blockly/media/",
            rtl: pxt.Util.isUserLanguageRtl(),
            renderer: "pxt"
        });
    }
    (0, importer_1.clearWithoutEvents)(workspace);
    return workspace;
}
exports.initRenderingWorkspace = initRenderingWorkspace;
function cleanRenderingWorkspace() {
    // We re-use the workspace across renders, catch any errors so we know to
    // create a new workspace if there was an error
    if (workspace)
        workspace.dispose();
    workspace = undefined;
}
exports.cleanRenderingWorkspace = cleanRenderingWorkspace;
function renderWorkspace(options = { emPixels: 18, layout: 1 /* pxt.editor.BlockLayout.Align */ }) {
    const layout = options.splitSvg ? 1 /* pxt.editor.BlockLayout.Align */ : (options.layout || 4 /* pxt.editor.BlockLayout.Flow */);
    switch (layout) {
        case 1 /* pxt.editor.BlockLayout.Align */:
            (0, layout_1.verticalAlign)(workspace, options.emPixels || 18);
            break;
        case 4 /* pxt.editor.BlockLayout.Flow */:
            (0, layout_1.flow)(workspace, { ratio: options.aspectRatio, useViewWidth: options.useViewWidth });
            break;
        case 3 /* pxt.editor.BlockLayout.Clean */:
            if (workspace.cleanUp_)
                workspace.cleanUp_();
            break;
        default: // do nothing
            break;
    }
    let metrics = workspace.getMetrics();
    const svg = blocklyDiv.querySelectorAll('svg')[0].cloneNode(true);
    (0, layout_1.cleanUpBlocklySvg)(svg);
    pxt.U.toArray(svg.querySelectorAll('.blocklyBlockCanvas,.blocklyBubbleCanvas'))
        .forEach(el => el.setAttribute('transform', `translate(${-metrics.contentLeft}, ${-metrics.contentTop}) scale(1)`));
    svg.setAttribute('viewBox', `0 0 ${metrics.contentWidth} ${metrics.contentHeight}`);
    if (options.emPixels) {
        svg.style.width = (metrics.contentWidth / options.emPixels) + 'em';
        svg.style.height = (metrics.contentHeight / options.emPixels) + 'em';
    }
    return options.splitSvg
        ? (0, layout_1.splitSvg)(svg, workspace, options.emPixels)
        : svg;
}
exports.renderWorkspace = renderWorkspace;
function render(blocksXml, options = { emPixels: 18, layout: 1 /* pxt.editor.BlockLayout.Align */ }) {
    initRenderingWorkspace();
    try {
        let text = blocksXml || `<xml xmlns="http://www.w3.org/1999/xhtml"></xml>`;
        let xml = Blockly.utils.xml.textToDom(text);
        (0, importer_1.domToWorkspaceNoEvents)(xml, workspace, { applyHideMetaComment: true });
        return renderWorkspace(options);
    }
    catch (e) {
        pxt.reportException(e);
        return undefined;
    }
    finally {
        cleanRenderingWorkspace();
    }
}
exports.render = render;
function blocksMetrics(ws) {
    const blocks = ws.getTopBlocks(false);
    if (!blocks.length)
        return { width: 0, height: 0 };
    let m = undefined;
    blocks.forEach((b) => {
        const r = b.getBoundingRectangle();
        if (!m)
            m = { l: r.left, r: r.right, t: r.top, b: r.bottom };
        else {
            m.l = Math.min(m.l, r.left);
            m.r = Math.max(m.r, r.right);
            m.t = Math.min(m.t, r.top);
            m.b = Math.min(m.b, r.bottom);
        }
    });
    return {
        width: m.r - m.l,
        height: m.b - m.t
    };
}
exports.blocksMetrics = blocksMetrics;
