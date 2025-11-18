"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailRecorder = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const Button_1 = require("../controls/Button");
const util_1 = require("../util");
const ThumbnailRecorder = (props) => {
    const { initialUri, onApply, onCancel, simRecorder } = props;
    const [uri, setUri] = React.useState(undefined);
    const [error, setError] = React.useState(undefined);
    const [recorderRef, setRecorderRef] = React.useState(undefined);
    const [recorderState, setRecorderState] = React.useState("default");
    let simContainer;
    React.useEffect(() => {
        if (!recorderRef)
            return undefined;
        recorderRef.addStateChangeListener(setRecorderState);
        recorderRef.addThumbnailListener(setUri);
        recorderRef.addErrorListener(setError);
        return () => {
            recorderRef.removeStateChangeListener(setRecorderState);
            recorderRef.removeThumbnailListener(setUri);
            recorderRef.removeErrorListener(setError);
        };
    }, [recorderRef]);
    const handleApplyClick = (evt) => {
        onApply(uri);
    };
    const handleScreenshotClick = async () => {
        setError(undefined);
        if (recorderRef)
            recorderRef.screenshotAsync();
    };
    const handleRecordClick = async () => {
        setError(undefined);
        if (!recorderRef)
            return;
        if (recorderRef.state === "recording") {
            recorderRef.stopRecordingAsync();
        }
        else if (recorderRef.state === "default") {
            recorderRef.startRecordingAsync();
            if (simContainer) {
                const iframe = simContainer.querySelector("iframe");
                if (iframe)
                    iframe.focus();
            }
        }
    };
    const handleSimRecorderRef = (ref) => {
        setRecorderRef(ref);
    };
    const handleSimRecorderContainerRef = (ref) => {
        if (ref)
            simContainer = ref;
    };
    const targetTheme = pxt.appTarget.appTheme;
    const screenshotLabel = targetTheme.simScreenshotKey ? lf("Screenshot ({0})", targetTheme.simScreenshotKey) : lf("Screenshot");
    const startRecordingLabel = targetTheme.simGifKey ? lf("Record ({0})", targetTheme.simGifKey) : lf("Record");
    const stopRecordingLabel = targetTheme.simGifKey ? lf("Stop recording ({0})", targetTheme.simGifKey) : lf("Stop recording");
    const renderingLabel = lf("Rendering...");
    let recordLabel;
    switch (recorderState) {
        case "default":
            recordLabel = startRecordingLabel;
            break;
        case "recording":
            recordLabel = stopRecordingLabel;
            break;
        case "rendering":
            recordLabel = renderingLabel;
            break;
    }
    const thumbnailLabel = uri ? lf("New Thumbnail") : lf("Current Thumbnail");
    const classes = (0, util_1.classList)("gif-recorder-content", uri && "has-uri");
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: classes }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "gif-recorder-sim" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "gif-recorder-sim-embed", ref: handleSimRecorderContainerRef }, { children: React.createElement(simRecorder, { onSimRecorderInit: handleSimRecorderRef }) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "gif-recorder" }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "gif-recorder-actions" }, { children: [recorderState === "default" &&
                                        (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "teal inverted", title: screenshotLabel, label: screenshotLabel, leftIcon: "fas fa-camera", onClick: handleScreenshotClick }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "teal inverted", disabled: recorderState === "rendering", title: recordLabel, label: recordLabel, leftIcon: `fas fa-${recorderState === "recording" ? "square" : "circle"}`, onClick: handleRecordClick }), (0, jsx_runtime_1.jsx)("div", { className: "spacer mobile-only" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "mobile-only", title: lf("Cancel"), label: lf("Cancel"), onClick: onCancel })] })) }))] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "thumbnail-controls" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "thumbnail-preview" }, { children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "thumbnail-header" }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ className: "project-share-label" }, { children: thumbnailLabel })), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "link-button mobile-only", title: lf("Try again?"), label: lf("Try again?"), onClick: () => setUri(undefined) })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-thumbnail" }, { children: [recorderState !== "default" &&
                                                (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-thumbnail-placeholder" }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "common-spinner" }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "project-thumbnail-label" }, { children: recorderState === "recording" ? lf("Recording...") : lf("Rendering GIF...") }))] })), recorderState === "default" &&
                                                ((uri || initialUri)
                                                    ? (0, jsx_runtime_1.jsx)("img", { src: uri || initialUri })
                                                    : (0, jsx_runtime_1.jsx)("div", { className: "thumbnail-placeholder" }))] }))] }) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "thumbnail-actions" }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { title: lf("Cancel"), label: lf("Cancel"), onClick: onCancel }), uri && recorderState === "default" &&
                                    (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "primary", title: lf("Apply"), label: lf("Apply"), onClick: handleApplyClick })] }))] }))] })) });
};
exports.ThumbnailRecorder = ThumbnailRecorder;
