"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Share = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ShareInfo_1 = require("./ShareInfo");
const Share = (props) => {
    const { projectName, screenshotUri, isLoggedIn, simRecorder, publishAsync, hasProjectBeenPersistentShared, anonymousShareByDefault, setAnonymousSharePreference, isMultiplayerGame, kind, onClose } = props;
    return (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "project-share" }, { children: (0, jsx_runtime_1.jsx)(ShareInfo_1.ShareInfo, { projectName: projectName, isLoggedIn: isLoggedIn, screenshotUri: screenshotUri, simRecorder: simRecorder, publishAsync: publishAsync, isMultiplayerGame: isMultiplayerGame, kind: kind, hasProjectBeenPersistentShared: hasProjectBeenPersistentShared, anonymousShareByDefault: anonymousShareByDefault, setAnonymousSharePreference: setAnonymousSharePreference, onClose: onClose }) }));
};
exports.Share = Share;
