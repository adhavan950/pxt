"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = exports.FeedbackModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/// <reference path="../../../../localtypings/ocv.d.ts" />
const react_1 = require("react");
const FeedbackEventListener_1 = require("./FeedbackEventListener");
const configs_1 = require("./configs");
const Modal_1 = require("../Modal");
// Wrapper component of the feedback modal so kind can determine what feedback actually shows in the modal
const FeedbackModal = (props) => {
    const { kind, onClose } = props;
    const title = kind === "rating" ? lf("Rate this activity") : lf("Leave Feedback for Microsoft");
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ className: "feedback-modal", title: title, onClose: onClose }, { children: (0, jsx_runtime_1.jsx)(exports.Feedback, { kind: kind, onClose: onClose }) })));
};
exports.FeedbackModal = FeedbackModal;
const Feedback = (props) => {
    var _a, _b, _c, _d;
    const { kind, onClose } = props;
    const feedbackConfig = kind === "rating" ? (0, configs_1.getRatingFeedbackConfig)() : (0, configs_1.getBaseConfig)();
    const frameId = kind === "rating" ? "activity-feedback-frame" : "menu-feedback-frame";
    const onDismiss = () => {
        if (onClose) {
            onClose();
        }
    };
    let callbacks = { onDismiss };
    (0, react_1.useEffect)(() => {
        (0, FeedbackEventListener_1.initFeedbackEventListener)(feedbackConfig, frameId, callbacks);
        return () => {
            (0, FeedbackEventListener_1.removeFeedbackEventListener)();
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: pxt.U.ocvEnabled() &&
            (0, jsx_runtime_1.jsx)("iframe", { title: "feedback", id: frameId, src: `${(_b = (_a = pxt.webConfig) === null || _a === void 0 ? void 0 : _a.ocv) === null || _b === void 0 ? void 0 : _b.iframeEndpoint}/centrohost?appname=ocvfeedback&feature=host-ocv-inapp-feedback&platform=web&appId=${(_d = (_c = pxt.webConfig) === null || _c === void 0 ? void 0 : _c.ocv) === null || _d === void 0 ? void 0 : _d.appId}#/hostedpage`, sandbox: "allow-scripts allow-same-origin allow-forms allow-popups" }) }));
};
exports.Feedback = Feedback;
