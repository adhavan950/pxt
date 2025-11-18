"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareInfo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const Button_1 = require("../controls/Button");
const EditorToggle_1 = require("../controls/EditorToggle");
const Input_1 = require("../controls/Input");
const Textarea_1 = require("../controls/Textarea");
const Modal_1 = require("../controls/Modal");
const ThumbnailRecorder_1 = require("./ThumbnailRecorder");
const SocialButton_1 = require("./SocialButton");
const Checkbox_1 = require("../controls/Checkbox");
const MultiplayerConfirmation_1 = require("./MultiplayerConfirmation");
const Kiosk_1 = require("./Kiosk");
const Notification_1 = require("../Notification");
const util_1 = require("../util");
const Link_1 = require("../controls/Link");
const vscodeDevUrl = "https://vscode.dev/edu/makecode/";
const ShareInfo = (props) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { projectName, description, screenshotUri, isLoggedIn, simRecorder, publishAsync, hasProjectBeenPersistentShared, anonymousShareByDefault, setAnonymousSharePreference, isMultiplayerGame, kind = "share", onClose, } = props;
    const [name, setName] = React.useState(projectName);
    const [thumbnailUri, setThumbnailUri] = React.useState(screenshotUri);
    const [shareState, setShareState] = React.useState("share");
    const [shareData, setShareData] = React.useState();
    const [embedState, setEmbedState] = React.useState("none");
    const [showQRCode, setShowQRCode] = React.useState(false);
    const [copySuccessful, setCopySuccessful] = React.useState(false);
    const [kioskSubmitSuccessful, setKioskSubmitSuccessful] = React.useState(false);
    const [kioskState, setKioskState] = React.useState(false);
    const [isAnonymous, setIsAnonymous] = React.useState(!isLoggedIn || anonymousShareByDefault);
    const [isShowingMultiConfirmation, setIsShowingMultiConfirmation] = React.useState(false);
    const { simScreenshot, simGif } = pxt.appTarget.appTheme;
    const showSimulator = (simScreenshot || simGif) && !!simRecorder;
    const prePublish = shareState === "share" || shareState === "publishing";
    const isPublished = shareState === "publish" || shareState === "publish-vscode";
    const showDescription = !isPublished;
    let qrCodeButtonRef;
    let inputRef;
    let kioskInputRef;
    React.useEffect(() => {
        setThumbnailUri(screenshotUri);
    }, [screenshotUri]);
    React.useEffect(() => {
        if (isLoggedIn) {
            pxt.tickEvent("share.open.loggedIn", { state: shareState, anonymous: isAnonymous === null || isAnonymous === void 0 ? void 0 : isAnonymous.toString(), persistent: hasProjectBeenPersistentShared === null || hasProjectBeenPersistentShared === void 0 ? void 0 : hasProjectBeenPersistentShared.toString() });
        }
        else {
            pxt.tickEvent("share.open", { state: shareState });
        }
    }, [shareState, isAnonymous, hasProjectBeenPersistentShared]);
    const exitGifRecord = () => {
        setShareState("share");
    };
    const applyGifChange = (uri) => {
        setThumbnailUri(uri);
        exitGifRecord();
    };
    const handlePublishClick = async () => {
        setShareState("publishing");
        let publishedShareData = await publishAsync(name, thumbnailUri, isAnonymous);
        setShareData(publishedShareData);
        if (!(publishedShareData === null || publishedShareData === void 0 ? void 0 : publishedShareData.error))
            setShareState("publish");
        else
            setShareState("share");
    };
    const handlePublishInVscodeClick = async () => {
        setShareState("publishing");
        let publishedShareData = await publishAsync(name, thumbnailUri, isAnonymous);
        setShareData(publishedShareData);
        if (!(publishedShareData === null || publishedShareData === void 0 ? void 0 : publishedShareData.error)) {
            setShareState("publish-vscode");
            pxt.tickEvent(`share.openInVscode`);
            window.open(vscodeDevUrl + publishedShareData.url.split("/").pop(), "_blank");
        }
        else
            setShareState("share");
    };
    const handleCopyClick = () => {
        if (pxt.BrowserUtils.isIpcRenderer()) {
            setCopySuccessful(pxt.BrowserUtils.legacyCopyText(inputRef));
        }
        else {
            navigator.clipboard.writeText(shareData.url);
            setCopySuccessful(true);
        }
    };
    const handleCopyBlur = () => {
        setCopySuccessful(false);
    };
    const handleKioskSubmitBlur = () => {
        setKioskSubmitSuccessful(false);
    };
    const handleKioskSubmitClick = async () => {
        var _a;
        pxt.tickEvent("share.kiosk.submitClicked");
        const gameId = pxt.Cloud.parseScriptId(shareData.url);
        if (kioskInputRef === null || kioskInputRef === void 0 ? void 0 : kioskInputRef.value) {
            let validKioskId = (_a = /^[a-zA-Z0-9]{6}$/.exec(kioskInputRef.value)) === null || _a === void 0 ? void 0 : _a[0];
            if (validKioskId) {
                validKioskId = validKioskId.toUpperCase();
                setKioskSubmitSuccessful(true);
                try {
                    await (0, Kiosk_1.addGameToKioskAsync)(validKioskId, gameId);
                    pxt.tickEvent("share.kiosk.submitSuccessful");
                    (0, Notification_1.pushNotificationMessage)({
                        kind: 'info',
                        text: lf("Game submitted to kiosk {0} successfully!", validKioskId),
                        hc: false
                    });
                }
                catch (error) {
                    pxt.tickEvent("share.kiosk.submitServerError");
                    if (error.message === "Not Found") {
                        (0, Notification_1.pushNotificationMessage)({
                            kind: 'err',
                            text: lf("Kiosk Code not found"),
                            hc: false
                        });
                    }
                    else {
                        (0, Notification_1.pushNotificationMessage)({
                            kind: 'err',
                            text: lf("Something went wrong submitting game to kiosk {0}", validKioskId),
                            hc: false
                        });
                    }
                }
            }
            else {
                (0, Notification_1.pushNotificationMessage)({
                    kind: 'err',
                    text: lf("Invalid format for Kiosk Code"),
                    hc: false
                });
            }
        }
        else {
            (0, Notification_1.pushNotificationMessage)({
                kind: 'err',
                text: lf("Input a six-character kiosk Code"),
                hc: false
            });
        }
    };
    const handleEmbedClick = () => {
        if (embedState === "none") {
            pxt.tickEvent(`share.embed`);
            setShowQRCode(false);
            setKioskState(false);
            setEmbedState("code");
        }
        else {
            setEmbedState("none");
        }
    };
    const handleKioskClick = () => {
        if (!kioskState) {
            pxt.tickEvent(`share.kiosk`);
            setEmbedState("none");
            setShowQRCode(false);
            setKioskState(true);
        }
        else {
            setKioskState(false);
        }
    };
    const handleKioskHelpClick = () => {
        const kioskDocumentationUrl = "https://arcade.makecode.com/hardware/kiosk";
        window.open(kioskDocumentationUrl, "_blank");
    };
    const handleQRCodeClick = () => {
        pxt.tickEvent('share.qrtoggle');
        if (!showQRCode) {
            setEmbedState("none");
            setShowQRCode(true);
            setKioskState(false);
        }
        else {
            setShowQRCode(false);
        }
    };
    const handleDeviceShareClick = async () => {
        var _a;
        pxt.tickEvent("share.device");
        const shareOpts = {
            title: document.title,
            url: shareData.url,
            text: lf("Check out my new MakeCode project!"),
        };
        // TODO: Fix this; typing for navigator not included in the lib typing we use in tsconfig
        if ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.canShare) === null || _a === void 0 ? void 0 : _a.call(navigator, shareOpts)) {
            return navigator.share(shareOpts);
        }
    };
    const handleMultiplayerShareConfirmClick = async () => {
        setShareState("publishing");
        setIsShowingMultiConfirmation(false);
        const publishedShareData = await publishAsync(name, thumbnailUri, isAnonymous);
        // TODO multiplayer: This won't work on staging (parseScriptId domains check doesn't include staging urls)
        // but those wouldn't load anyways (as staging multiplayer is currently fetching games from prod links)
        const shareId = pxt.Cloud.parseScriptId(publishedShareData.url);
        if (!shareId) {
            pxt.tickEvent(`share.hostMultiplayerError`);
            return;
        }
        const multiplayerHostUrl = pxt.multiplayer.makeHostLink(shareId, false);
        // NOTE: It is allowable to log the shareId here because this is within the multiplayer context.
        // In this context, the user has consented to allowing the shareId being made public.
        pxt.tickEvent(`share.hostMultiplayerShared`, { shareId });
        window.open(multiplayerHostUrl, "_blank");
        setShareData(publishedShareData);
        if (!(publishedShareData === null || publishedShareData === void 0 ? void 0 : publishedShareData.error))
            setShareState("publish");
        else
            setShareState("share");
        if (kind === "multiplayer") {
            // If we're in the "for multiplayer" context, we want to close the share dialog after launching the multiplayer session.
            onClose();
        }
    };
    const handleMultiplayerShareClick = async () => {
        setIsShowingMultiConfirmation(true);
        pxt.tickEvent(`share.hostMultiplayer`);
    };
    const handleMultiplayerShareCancelClick = async () => {
        setIsShowingMultiConfirmation(false);
        pxt.tickEvent(`share.hostMultiplayerCancel`);
    };
    const embedOptions = [{
            name: "code",
            label: lf("Code"),
            title: lf("Code"),
            focusable: true,
            onClick: () => setEmbedState("code")
        },
        {
            name: "editor",
            label: lf("Editor"),
            title: lf("Editor"),
            focusable: true,
            onClick: () => setEmbedState("editor")
        },
        {
            name: "simulator",
            label: lf("Simulator"),
            title: lf("Simulator"),
            focusable: true,
            onClick: () => setEmbedState("simulator")
        }];
    const handleQRCodeButtonRef = (ref) => {
        if (ref)
            qrCodeButtonRef = ref;
    };
    const handleQRCodeModalClose = () => {
        setShowQRCode(false);
        if (qrCodeButtonRef)
            qrCodeButtonRef.focus();
    };
    const handleInputRef = (ref) => {
        if (ref)
            inputRef = ref;
    };
    const handleKioskInputRef = (ref) => {
        if (ref)
            kioskInputRef = ref;
    };
    const handleAnonymousShareClick = (newValue) => {
        pxt.tickEvent("share.persistentCheckbox", { checked: newValue.toString() });
        setIsAnonymous(!newValue);
        if (setAnonymousSharePreference)
            setAnonymousSharePreference(!newValue);
    };
    const inputTitle = prePublish ? lf("Project Title") :
        (shareState === "publish-vscode" ? lf("Share Successful") : lf("Project Link"));
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-info" }, { children: [showSimulator && shareState !== "gifrecord" &&
                    (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-thumbnail" }, { children: [thumbnailUri
                                ? (0, jsx_runtime_1.jsx)("img", { src: thumbnailUri, alt: lf("Preview of your code running on the simulator"), "aria-label": lf("Simulator preview") })
                                : (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "project-thumbnail-placeholder" }, { children: (0, jsx_runtime_1.jsx)("div", { className: "common-spinner" }) })), !isPublished &&
                                (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "link-button", title: lf("Update project thumbnail"), label: lf("Update project thumbnail"), onClick: () => setShareState("gifrecord") })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-content" }, { children: [(prePublish || isPublished) && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "project-share-title project-share-label", id: "share-input-title" }, { children: inputTitle })), showDescription && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Input_1.Input, { ariaDescribedBy: "share-input-title", className: "name-input", initialValue: name, placeholder: lf("Name your project"), onChange: setName, onBlur: setName, onEnterKey: setName, preserveValueOnBlur: true }), isLoggedIn && hasProjectBeenPersistentShared && (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "persistent-share-checkbox", label: lf("Update existing share link for this project"), isChecked: !isAnonymous, onChange: handleAnonymousShareClick })] }), prePublish && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(shareData === null || shareData === void 0 ? void 0 : shareData.error) && (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "project-share-error" }, { children: (shareData.error.statusCode === 413
                                                && ((_c = (_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.cloud) === null || _b === void 0 ? void 0 : _b.cloudProviders) === null || _c === void 0 ? void 0 : _c.github))
                                                ? lf("Oops! Your project is too big. You can create a GitHub repository to share it.")
                                                : lf("Oops! There was an error. Please ensure you are connected to the Internet and try again.") })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-publish-actions" }, { children: [shareState === "share" &&
                                                    (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [((_e = (_d = pxt.appTarget) === null || _d === void 0 ? void 0 : _d.appTheme) === null || _e === void 0 ? void 0 : _e.multiplayer) && (isMultiplayerGame || kind === "multiplayer") &&
                                                                (0, jsx_runtime_1.jsx)(Button_1.Button, { className: (0, util_1.classList)("primary share-host-button", kind === "share" && "primary inverted text-only", kind === "multiplayer" && "share-publish-button"), title: lf("Host a multiplayer game"), label: lf("Host a multiplayer game"), leftIcon: "xicon multiplayer", onClick: handleMultiplayerShareClick }), kind === "share" && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "primary share-publish-button", title: lf("Share Project"), label: lf("Share Project"), onClick: handlePublishClick }), kind === "vscode" && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "primary share-publish-button", title: lf("Open in VS Code"), label: lf("Open in VS Code"), onClick: handlePublishInVscodeClick })] }), shareState === "publishing" &&
                                                    (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "primary share-publish-button", title: lf("Publishing..."), label: (0, jsx_runtime_1.jsx)("div", { className: "common-spinner" }), onClick: () => { } })] }))] }), shareState === "publish-vscode" &&
                                    (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-vscode" }, { children: [(0, jsx_runtime_1.jsx)("div", { children: lf("🎉 All set! Your project is launching in VS Code. If it doesn't open soon, just click the button below!") }), (0, jsx_runtime_1.jsx)(Link_1.Link, Object.assign({ className: "common-button secondary", href: vscodeDevUrl + shareData.url.split("/").pop(), target: "_blank" }, { children: lf("Open vscode.dev") }))] })), shareState === "publish" &&
                                    (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-data" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-input-attached-button" }, { children: [(0, jsx_runtime_1.jsx)(Input_1.Input, { ariaDescribedBy: "share-input-title", ariaLabel: lf("Your shareable project link"), handleInputRef: handleInputRef, initialValue: shareData.url, readOnly: true, onChange: setName }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: copySuccessful ? "green" : "primary", title: lf("Copy link"), label: copySuccessful ? lf("Copied!") : lf("Copy"), leftIcon: "fas fa-link", onClick: handleCopyClick, onBlur: handleCopyBlur })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-actions" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-social" }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { className: "square-button neutral embed mobile-portrait-hidden", title: lf("Show embed code"), leftIcon: "fas fa-code", onClick: handleEmbedClick }), (0, jsx_runtime_1.jsx)(SocialButton_1.SocialButton, { className: "square-button facebook", url: shareData === null || shareData === void 0 ? void 0 : shareData.url, type: 'facebook', heading: lf("Share on Facebook") }), (0, jsx_runtime_1.jsx)(SocialButton_1.SocialButton, { className: "square-button twitter", url: shareData === null || shareData === void 0 ? void 0 : shareData.url, type: 'twitter', heading: lf("Share on Twitter") }), (0, jsx_runtime_1.jsx)(SocialButton_1.SocialButton, { className: "square-button google-classroom", url: shareData === null || shareData === void 0 ? void 0 : shareData.url, type: 'google-classroom', heading: lf("Share on Google Classroom") }), (0, jsx_runtime_1.jsx)(SocialButton_1.SocialButton, { className: "square-button microsoft-teams", url: shareData === null || shareData === void 0 ? void 0 : shareData.url, type: 'microsoft-teams', heading: lf("Share on Microsoft Teams") }), (0, jsx_runtime_1.jsx)(SocialButton_1.SocialButton, { className: "square-button whatsapp", url: shareData === null || shareData === void 0 ? void 0 : shareData.url, type: 'whatsapp', heading: lf("Share on WhatsApp") }), ((_g = (_f = pxt.appTarget) === null || _f === void 0 ? void 0 : _f.appTheme) === null || _g === void 0 ? void 0 : _g.shareToKiosk) &&
                                                                (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "square-button neutral mobile-portrait-hidden", title: lf("Share to MakeCode Arcade Kiosk"), leftIcon: "xicon kiosk", onClick: handleKioskClick }), navigator.share && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "square-button device-share", title: lf("Show device share options"), ariaLabel: lf("Show device share options"), leftIcon: "icon share", onClick: handleDeviceShareClick })] })), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "menu-button project-qrcode", buttonRef: handleQRCodeButtonRef, title: lf("Show QR Code"), label: (0, jsx_runtime_1.jsx)("img", { className: "qrcode-image", src: shareData === null || shareData === void 0 ? void 0 : shareData.qr, alt: lf("QR code to access your project"), "aria-label": lf("Project share link QR code") }), onClick: handleQRCodeClick })] }))] })), embedState !== "none" && (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-embed" }, { children: [(0, jsx_runtime_1.jsx)(EditorToggle_1.EditorToggle, { id: "project-embed-toggle", className: "slim tablet-compact", items: embedOptions, selected: embedOptions.findIndex(i => i.name === embedState) }), (0, jsx_runtime_1.jsx)(Textarea_1.Textarea, { readOnly: true, rows: 5, initialValue: shareData === null || shareData === void 0 ? void 0 : shareData.embed[embedState], ariaLabel: lf("Embed code textarea") })] })), kioskState &&
                                    (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "project-share-label" }, { children: [lf("Enter Kiosk Code"), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "link-button kiosk", title: lf("Learn more about Kiosk"), leftIcon: "far fa-question-circle", onClick: handleKioskHelpClick })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-input-attached-button" }, { children: [(0, jsx_runtime_1.jsx)(Input_1.Input, { handleInputRef: handleKioskInputRef, ariaDescribedBy: "share-input-title", preserveValueOnBlur: true, placeholder: "A12B3C" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: kioskSubmitSuccessful ? "green" : "primary", title: lf("Submit Kiosk Code"), label: kioskSubmitSuccessful ? lf("Submitted!") : lf("Submit"), onClick: handleKioskSubmitClick, onBlur: handleKioskSubmitBlur })] }))] })] }), shareState === "gifrecord" && (0, jsx_runtime_1.jsx)(ThumbnailRecorder_1.ThumbnailRecorder, { initialUri: thumbnailUri, onApply: applyGifChange, onCancel: exitGifRecord, simRecorder: simRecorder })] })), showQRCode &&
                    (0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ title: lf("QR Code"), onClose: handleQRCodeModalClose, ariaLabel: lf("QR Code modal") }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "qrcode-modal-body" }, { children: (0, jsx_runtime_1.jsx)("img", { className: "qrcode-image", src: shareData === null || shareData === void 0 ? void 0 : shareData.qr, alt: lf("QR code to access your project"), "aria-label": lf("Project share link QR code enlarged") }) })) })), isShowingMultiConfirmation &&
                    (0, jsx_runtime_1.jsx)(MultiplayerConfirmation_1.MultiplayerConfirmation, { onCancelClicked: handleMultiplayerShareCancelClick, onConfirmClicked: handleMultiplayerShareConfirmClick })] })) });
};
exports.ShareInfo = ShareInfo;
