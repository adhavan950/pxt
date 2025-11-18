"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeDescription = exports.BadgeInfo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Badge_1 = require("./Badge");
const BadgeInfo = (props) => {
    const { badge } = props;
    const date = new Date(badge.timestamp);
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-info" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-info-image" }, { children: (0, jsx_runtime_1.jsx)(Badge_1.Badge, { badge: badge, disabled: !badge.timestamp }) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-info-item", id: "profile-badge-info-" + badge.id }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-info-header" }, { children: lf("Awarded For:") })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-info-text" }, { children: (0, exports.badgeDescription)(badge) }))] })), badge.timestamp ?
                (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-info-item" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-info-header" }, { children: lf("Awarded On:") })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-info-text" }, { children: date.toLocaleDateString(pxt.U.userLanguage()) }))] }))
                : undefined] }));
};
exports.BadgeInfo = BadgeInfo;
const badgeDescription = (badge) => {
    switch (badge.type) {
        case "skillmap-completion":
            return (0, jsx_runtime_1.jsx)("span", { children: (0, util_1.jsxLF)(lf("Completing {0}"), (0, jsx_runtime_1.jsx)("a", Object.assign({ tabIndex: 0, "aria-labelledby": "profile-badge-info-" + badge.id, target: "_blank", rel: "noopener noreferrer", href: sourceURLToSkillmapURL(badge.sourceURL) }, { children: pxt.U.rlf(badge.title) }))) });
    }
};
exports.badgeDescription = badgeDescription;
function sourceURLToSkillmapURL(sourceURL) {
    var _a;
    if (sourceURL.indexOf("/api/md/") !== -1) {
        // docs url: https://www.makecode.com/api/md/arcade/skillmap/forest
        const path = sourceURL.split("/api/md/")[1];
        // remove the target from the url
        const docsPath = path.split("/").slice(1).join("/");
        return ((_a = pxt.webConfig) === null || _a === void 0 ? void 0 : _a.skillmapUrl) + "#docs:" + docsPath;
    }
    else {
        // github url: /user/repo#filename
        const parts = sourceURL.split("#");
        if (parts.length == 2) {
            return pxt.webConfig.skillmapUrl + "#github:https://github.com/" + parts[0] + "/" + parts[1];
        }
    }
    if (pxt.BrowserUtils.isLocalHostDev()) {
        // local url: skillmap/forest
        return "http://localhost:3000#local:" + sourceURL;
    }
    return sourceURL;
}
