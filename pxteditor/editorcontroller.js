"use strict";
/// <reference path="../localtypings/pxteditor.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.postHostMessageAsync = exports.shouldPostHostMessages = exports.enableControllerAnalytics = exports.bindEditorMessages = void 0;
const runValidatorPlan_1 = require("./code-validation/runValidatorPlan");
const iframeEmbeddedClient_1 = require("../pxtservices/iframeEmbeddedClient");
const projectImport_1 = require("./projectImport");
const pendingRequests = {};
let iframeClient;
/**
 * Binds incoming window messages to the project view.
 * Requires the "allowParentController" flag in the pxtarget.json/appTheme object.
 *
 * When the project view receives a request (EditorMessageRequest),
 * it starts the command and returns the result upon completion.
 * The response (EditorMessageResponse) contains the request id and result.
 * Some commands may be async, use the ``id`` field to correlate to the original request.
 */
function bindEditorMessages(getEditorAsync) {
    const allowEditorMessages = pxt.appTarget.appTheme.allowParentController || pxt.shell.isControllerMode();
    const allowExtensionMessages = pxt.appTarget.appTheme.allowPackageExtensions;
    const allowSimTelemetry = pxt.appTarget.appTheme.allowSimulatorTelemetry;
    if (!allowEditorMessages && !allowExtensionMessages && !allowSimTelemetry)
        return;
    const handleMessage = (msg) => {
        const data = msg.data;
        if (!data || !/^pxt(host|editor|pkgext|sim)$/.test(data.type))
            return false;
        if (data.type === "pxtpkgext" && allowExtensionMessages) {
            // Messages sent to the editor iframe from a child iframe containing an extension
            getEditorAsync().then(projectView => {
                projectView.handleExtensionRequest(data);
            });
        }
        else if (data.type === "pxtsim" && allowSimTelemetry) {
            const event = data;
            if (event.action === "event") {
                if (event.category || event.message) {
                    pxt.reportError(event.category, event.message, event.data);
                }
                else {
                    pxt.tickEvent(event.tick, event.data);
                }
            }
        }
        else if (allowEditorMessages) {
            // Messages sent to the editor from the parent frame
            let p = Promise.resolve();
            let resp = undefined;
            if (data.type == "pxthost") { // response from the host
                const req = pendingRequests[data.id];
                if (!req) {
                    pxt.debug(`pxthost: unknown request ${data.id}`);
                }
                else {
                    p = p.then(() => req.resolve(data));
                }
            }
            else if (data.type == "pxteditor") { // request from the editor
                p = p.then(() => {
                    return getEditorAsync().then(projectView => {
                        const req = data;
                        pxt.debug(`pxteditor: ${req.action}`);
                        switch (req.action.toLowerCase()) {
                            case "switchjavascript": return Promise.resolve().then(() => projectView.openJavaScript());
                            case "switchpython": return Promise.resolve().then(() => projectView.openPython());
                            case "switchblocks": return Promise.resolve().then(() => projectView.openBlocks());
                            case "startsimulator": return Promise.resolve().then(() => projectView.startSimulator());
                            case "restartsimulator": return Promise.resolve().then(() => projectView.restartSimulator());
                            case "hidesimulator": return Promise.resolve().then(() => projectView.collapseSimulator());
                            case "showsimulator": return Promise.resolve().then(() => projectView.expandSimulator());
                            case "closeflyout": return Promise.resolve().then(() => projectView.closeFlyout());
                            case "unloadproject": return Promise.resolve().then(() => projectView.unloadProjectAsync());
                            case "saveproject": return projectView.saveProjectAsync();
                            case "compile": return projectView.compile();
                            case "redo": return Promise.resolve()
                                .then(() => {
                                const editor = projectView.editor;
                                if (editor && editor.hasRedo())
                                    editor.redo();
                            });
                            case "undo": return Promise.resolve()
                                .then(() => {
                                const editor = projectView.editor;
                                if (editor && editor.hasUndo())
                                    editor.undo();
                            });
                            case "setscale": {
                                const zoommsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.editor.setScale(zoommsg.scale));
                            }
                            case "stopsimulator": {
                                const stop = data;
                                return Promise.resolve()
                                    .then(() => projectView.stopSimulator(stop.unload));
                            }
                            case "newproject": {
                                const create = data;
                                return Promise.resolve()
                                    .then(() => projectView.newProject(create.options));
                            }
                            case "importproject": {
                                const load = data;
                                return Promise.resolve()
                                    .then(() => projectView.importProjectAsync(load.project, {
                                    filters: load.filters,
                                    searchBar: load.searchBar
                                }));
                            }
                            case "importexternalproject": {
                                const importExternal = data;
                                return (0, projectImport_1.saveProjectAsync)(importExternal.project)
                                    .then(importId => {
                                    const importUrl = location.origin + location.pathname + `#embedimport:${importId}`;
                                    resp = {
                                        importUrl
                                    };
                                });
                            }
                            case "openheader": {
                                const open = data;
                                return projectView.openProjectByHeaderIdAsync(open.headerId);
                            }
                            case "startactivity": {
                                const msg = data;
                                let tutorialPath = msg.path;
                                let editorProjectName = undefined;
                                if (/^([jt]s|py|blocks?):/i.test(tutorialPath)) {
                                    if (/^py:/i.test(tutorialPath))
                                        editorProjectName = pxt.PYTHON_PROJECT_NAME;
                                    else if (/^[jt]s:/i.test(tutorialPath))
                                        editorProjectName = pxt.JAVASCRIPT_PROJECT_NAME;
                                    else
                                        editorProjectName = pxt.BLOCKS_PROJECT_NAME;
                                    tutorialPath = tutorialPath.substr(tutorialPath.indexOf(':') + 1);
                                }
                                return Promise.resolve()
                                    .then(() => projectView.startActivity({
                                    activity: msg.activityType,
                                    path: tutorialPath,
                                    title: msg.title,
                                    editor: editorProjectName,
                                    previousProjectHeaderId: msg.previousProjectHeaderId,
                                    carryoverPreviousCode: msg.carryoverPreviousCode
                                }));
                            }
                            case "importtutorial": {
                                const load = data;
                                return Promise.resolve()
                                    .then(() => projectView.importTutorialAsync(load.markdown));
                            }
                            case "proxytosim": {
                                const simmsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.proxySimulatorMessage(simmsg.content));
                            }
                            case "renderblocks": {
                                const rendermsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.renderBlocksAsync(rendermsg))
                                    .then(r => {
                                    return r.xml.then((svg) => {
                                        resp = svg.xml;
                                    });
                                });
                            }
                            case "renderxml": {
                                const rendermsg = data;
                                return Promise.resolve()
                                    .then(() => {
                                    const r = projectView.renderXml(rendermsg);
                                    return r.resultXml.then((svg) => {
                                        resp = svg.xml;
                                    });
                                });
                            }
                            case "renderbyblockid": {
                                const rendermsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.renderByBlockIdAsync(rendermsg))
                                    .then(r => {
                                    return r.resultXml.then((svg) => {
                                        resp = svg.xml;
                                    });
                                });
                            }
                            case "runeval": {
                                const evalmsg = data;
                                const plan = evalmsg.validatorPlan;
                                const planLib = evalmsg.planLib;
                                return Promise.resolve()
                                    .then(() => {
                                    const blocks = projectView.getBlocks();
                                    return (0, runValidatorPlan_1.runValidatorPlan)(blocks, plan, planLib);
                                })
                                    .then(results => {
                                    resp = results;
                                });
                            }
                            case "gettoolboxcategories": {
                                const msg = data;
                                return Promise.resolve()
                                    .then(() => {
                                    resp = projectView.getToolboxCategories(msg.advanced);
                                });
                            }
                            case "getblockastext": {
                                const msg = data;
                                return Promise.resolve()
                                    .then(() => {
                                    const readableName = projectView.getBlockAsText(msg.blockId);
                                    resp = { blockAsText: readableName };
                                });
                            }
                            case "renderpython": {
                                const rendermsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.renderPythonAsync(rendermsg))
                                    .then(r => {
                                    resp = r.python;
                                });
                            }
                            case "toggletrace": {
                                const togglemsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.toggleTrace(togglemsg.intervalSpeed));
                            }
                            case "settracestate": {
                                const trcmsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.setTrace(trcmsg.enabled, trcmsg.intervalSpeed));
                            }
                            case "setsimulatorfullscreen": {
                                const fsmsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.setSimulatorFullScreen(fsmsg.enabled));
                            }
                            case "showthemepicker": {
                                return Promise.resolve()
                                    .then(() => projectView.showThemePicker());
                            }
                            case "togglehighcontrast": {
                                return Promise.resolve()
                                    .then(() => projectView.toggleHighContrast());
                            }
                            case "sethighcontrast": {
                                const hcmsg = data;
                                return Promise.resolve()
                                    .then(() => projectView.setHighContrast(hcmsg.on));
                            }
                            case "togglegreenscreen": {
                                return Promise.resolve()
                                    .then(() => projectView.toggleGreenScreen());
                            }
                            case "togglekeyboardcontrols": {
                                return Promise.resolve()
                                    .then(() => projectView.toggleAccessibleBlocks("editormessage"));
                            }
                            case "print": {
                                return Promise.resolve()
                                    .then(() => projectView.printCode());
                            }
                            case "pair": {
                                return projectView.pairAsync().then(() => { });
                            }
                            case "info": {
                                return Promise.resolve()
                                    .then(() => {
                                    resp = {
                                        versions: pxt.appTarget.versions,
                                        locale: ts.pxtc.Util.userLanguage(),
                                        availableLocales: pxt.appTarget.appTheme.availableLocales,
                                        keyboardControls: projectView.isAccessibleBlocks()
                                    };
                                });
                            }
                            case "shareproject": {
                                const msg = data;
                                return projectView.anonymousPublishHeaderByIdAsync(msg.headerId, msg.projectName)
                                    .then(scriptInfo => {
                                    resp = scriptInfo;
                                });
                            }
                            case "savelocalprojectstocloud": {
                                const msg = data;
                                return projectView.saveLocalProjectsToCloudAsync(msg.headerIds)
                                    .then(guidMap => {
                                    resp = {
                                        headerIdMap: guidMap
                                    };
                                });
                            }
                            case "requestprojectcloudstatus": {
                                // Responses are sent as separate "projectcloudstatus" messages.
                                const msg = data;
                                return projectView.requestProjectCloudStatus(msg.headerIds);
                            }
                            case "convertcloudprojectstolocal": {
                                const msg = data;
                                return projectView.convertCloudProjectsToLocal(msg.userId);
                            }
                            case "setlanguagerestriction": {
                                const msg = data;
                                if (msg.restriction === "no-blocks") {
                                    pxt.warn("no-blocks language restriction is not supported");
                                    throw new Error("no-blocks language restriction is not supported");
                                }
                                return projectView.setLanguageRestrictionAsync(msg.restriction);
                            }
                            case "precachetutorial": {
                                const msg = data;
                                const tutorialData = msg.data;
                                const lang = msg.lang || pxt.Util.userLanguage();
                                return pxt.github.db.cacheReposAsync(tutorialData)
                                    .then(async () => {
                                    if (typeof tutorialData.markdown === "string") {
                                        // the markdown needs to be cached in the translation db
                                        const db = await pxt.BrowserUtils.translationDbAsync();
                                        await db.setAsync(lang, tutorialData.path, undefined, undefined, tutorialData.markdown);
                                    }
                                });
                            }
                            case "setcolorthemebyid": {
                                const msg = data;
                                projectView.setColorThemeById(msg.colorThemeId, !!msg.savePreference);
                                return Promise.resolve();
                            }
                        }
                        return Promise.resolve();
                    });
                });
            }
            p.then(() => sendResponse(data, resp, true, undefined), (err) => sendResponse(data, resp, false, err));
        }
        return true;
    };
    iframeClient = new iframeEmbeddedClient_1.IFrameEmbeddedClient(handleMessage);
}
exports.bindEditorMessages = bindEditorMessages;
/**
 * Sends analytics messages upstream to container if any
 */
let controllerAnalyticsEnabled = false;
function enableControllerAnalytics() {
    if (controllerAnalyticsEnabled)
        return;
    const hasOnPostHostMessage = !!pxt.commands.onPostHostMessage;
    const hasAllowParentController = pxt.appTarget.appTheme.allowParentController;
    const isInsideIFrame = pxt.BrowserUtils.isIFrame();
    if (!(hasOnPostHostMessage || (hasAllowParentController && isInsideIFrame))) {
        return;
    }
    const analyticsTickEvent = pxt.tickEvent;
    pxt.tickEvent = function (id, data, opts) {
        if (analyticsTickEvent)
            analyticsTickEvent(id, data, opts);
        postHostMessageAsync({
            type: 'pxthost',
            action: 'event',
            tick: id,
            response: false,
            data
        });
    };
    const rexp = pxt.reportException;
    pxt.reportException = function (err, data) {
        if (rexp)
            rexp(err, data);
        try {
            postHostMessageAsync({
                type: 'pxthost',
                action: 'event',
                tick: 'error',
                message: err.message,
                response: false,
                data
            });
        }
        catch (e) {
        }
    };
    const re = pxt.reportError;
    pxt.reportError = function (cat, msg, data) {
        if (re)
            re(cat, msg, data);
        postHostMessageAsync({
            type: 'pxthost',
            action: 'event',
            tick: 'error',
            category: cat,
            message: msg,
            data
        });
    };
    controllerAnalyticsEnabled = true;
}
exports.enableControllerAnalytics = enableControllerAnalytics;
function sendResponse(request, resp, success, error) {
    if (request.response) {
        const toSend = {
            type: request.type,
            id: request.id,
            resp,
            success,
            error
        };
        if (iframeClient) {
            iframeClient.postMessage(toSend);
        }
        else {
            window.parent.postMessage(toSend, "*");
        }
    }
}
/**
 * Determines if host messages should be posted
 */
function shouldPostHostMessages() {
    return pxt.appTarget.appTheme.allowParentController && pxt.BrowserUtils.isIFrame();
}
exports.shouldPostHostMessages = shouldPostHostMessages;
/**
 * Posts a message from the editor to the host
 */
function postHostMessageAsync(msg) {
    return new Promise((resolve, reject) => {
        const env = pxt.Util.clone(msg);
        env.id = ts.pxtc.Util.guidGen();
        if (msg.response)
            pendingRequests[env.id] = { resolve, reject };
        if (iframeClient) {
            iframeClient.postMessage(env);
        }
        else {
            window.parent.postMessage(env, "*");
        }
        // Post to editor extension if it wants to be notified of these messages.
        // Note this is a one-way notification. Responses are not supported.
        if (pxt.commands.onPostHostMessage) {
            try {
                pxt.commands.onPostHostMessage(env);
            }
            catch (err) {
                pxt.reportException(err);
            }
        }
        if (!msg.response)
            resolve(undefined);
    });
}
exports.postHostMessageAsync = postHostMessageAsync;
