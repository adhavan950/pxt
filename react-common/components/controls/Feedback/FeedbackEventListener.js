"use strict";
/// <reference path="../../../../localtypings/ocv.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUpdateFeedbackTheme = exports.removeFeedbackEventListener = exports.initFeedbackEventListener = void 0;
const defaultTheme = "PublisherLightTheme";
const highContrastTheme = "TeamsHighContrastV2";
// for styling the feedback, we use this object. It is mostly used to change the colors.
// we'll want to change this based on the target and whether high contrast is enabled
let themeOptions = {
    baseTheme: defaultTheme,
};
let initfeedbackOptions;
let feedbackCallbacks;
let FEEDBACK_FRAME_ID;
// the function to initialize the feedback event listener
// feedbackConfig: needs to be passed in as a prop because the things that
/**
 * The function to initialize the feedback event listener
 * @param feedbackConfig: the feedback config object whose fields are defined in OCV.
 *  This changes based on what type of feedback we want to collect. Look at configs.ts for more details.
 * @param frameId: the html id of the actual iframe where the feedback will be displayed
 * @param [callbacks]: an object of functions that can be called when certain events happen in the feedback modal.
 *  Needs to be passed in because the callbacks will depend on what the parent wants to react to.
 */
const initFeedbackEventListener = (feedbackConfig, frameId, callbacks) => {
    var _a, _b;
    window.addEventListener('message', feedbackCallbackEventListener);
    feedbackCallbacks = callbacks;
    initfeedbackOptions = {
        appId: (_b = (_a = pxt.webConfig) === null || _a === void 0 ? void 0 : _a.ocv) === null || _b === void 0 ? void 0 : _b.appId,
        ageGroup: "Undefined",
        authenticationType: "Unauthenticated",
        clientName: "MakeCode",
        feedbackConfig: feedbackConfig,
        isProduction: false,
        themeOptions: themeOptions,
        telemetry: {
            featureArea: pxt.appTarget.id,
            browser: pxt.BrowserUtils.browser(),
            browserVersion: pxt.BrowserUtils.browserVersion(),
            platform: pxt.BrowserUtils.os(),
            feedbackOrigin: frameId
        }
    };
    FEEDBACK_FRAME_ID = frameId;
};
exports.initFeedbackEventListener = initFeedbackEventListener;
const removeFeedbackEventListener = () => {
    window.removeEventListener('message', feedbackCallbackEventListener);
};
exports.removeFeedbackEventListener = removeFeedbackEventListener;
/**
 * The function that listens for the feedback events.
 * The events here are the ones that seemed most useful to log or respond to
 * @param event: the event received from OCV
 */
const feedbackCallbackEventListener = (event) => {
    var _a;
    if (event.data.Event) {
        const payload = event.data;
        switch (payload.Event) {
            case 'InAppFeedbackInitOptions': //This is required to initialise feedback
                sendFeedbackInitOptions();
                break;
            case 'InAppFeedbackOnError': //Invoked when an error occurrs on feedback submission - would be nice to log something to the user
                pxt.warn('Error Message: ', payload.EventArgs);
                break;
            case 'InAppFeedbackInitializationComplete': //Invoked when feedback form is fully initialised and displays error/warning if any - nice to have a log for this
                pxt.debug('InAppFeedbackInitializationComplete: ', payload.EventArgs);
                break;
            case 'InAppFeedbackOnSuccess': //Invoked when feedback submission is successful - would be useful to have telemetry/something else on this event
                pxt.debug('InAppFeedbackOnSuccess: ', payload.EventArgs);
                break;
            case 'InAppFeedbackDismissWithResult': //Invoked when feedback is dismissed - the big important one for us to be able to close the feedback modal
                pxt.debug('InAppFeedbackDismissWithResult: ', payload.EventArgs);
                (_a = feedbackCallbacks === null || feedbackCallbacks === void 0 ? void 0 : feedbackCallbacks.onDismiss) === null || _a === void 0 ? void 0 : _a.call(feedbackCallbacks);
                break;
        }
    }
};
// ***************** Helper Functions *****************
const getIFrameAndSend = (payload) => {
    var _a, _b;
    const iFrameElement = document.getElementById(FEEDBACK_FRAME_ID);
    if (iFrameElement) {
        iFrameElement.contentWindow.postMessage(payload, (_b = (_a = pxt.webConfig) === null || _a === void 0 ? void 0 : _a.ocv) === null || _b === void 0 ? void 0 : _b.iframeEndpoint);
    }
};
const sendUpdateFeedbackTheme = (highContrastOn) => {
    let currentTheme = themeOptions.baseTheme;
    if (currentTheme === defaultTheme && highContrastOn) {
        currentTheme = highContrastTheme;
    }
    else if (currentTheme === highContrastTheme && !highContrastOn) {
        currentTheme = defaultTheme;
    }
    const response = {
        event: 'OnFeedbackHostAppThemeChanged',
        data: {
            baseTheme: currentTheme
        },
    };
    themeOptions.baseTheme = currentTheme;
    getIFrameAndSend(response);
};
exports.sendUpdateFeedbackTheme = sendUpdateFeedbackTheme;
/**
 * Actually initializes the feedback session. This is called when the feedback modal opens.
 */
const sendFeedbackInitOptions = () => {
    let response = {
        event: 'InAppFeedbackInitOptions',
        data: initfeedbackOptions,
    };
    getIFrameAndSend(response);
};
