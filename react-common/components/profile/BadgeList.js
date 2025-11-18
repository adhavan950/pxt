"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Badge_1 = require("./Badge");
const BadgeList = (props) => {
    const { onBadgeClick, availableBadges, userState } = props;
    const badges = availableBadges.slice();
    let unlocked = {};
    for (const badge of userState.badges) {
        unlocked[badge.id] = true;
        const existing = badges.findIndex(b => b.id === badge.id);
        if (existing > -1) {
            badges[existing] = Object.assign(Object.assign({}, badges[existing]), { timestamp: badges[existing].timestamp || badge.timestamp });
        }
        else {
            badges.push(badge);
        }
    }
    const bg = [];
    for (let i = 0; i < Math.max(badges.length + 10, 20); i++) {
        bg.push((0, jsx_runtime_1.jsx)("div", { className: "placeholder-badge" }, i));
    }
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-list" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-header", id: "profile-badge-header" }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ className: "profile-badge-title" }, { children: lf("Badges") })), (0, jsx_runtime_1.jsx)("span", Object.assign({ className: "profile-badge-subtitle" }, { children: lf("Click each badge to see details") }))] })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badges-scroller" }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badges", role: "list", "aria-labelledby": "profile-badge-header" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badges-background-container", "aria-hidden": "true" }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badges-background" }, { children: bg })) })), badges.map(badge => (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-badge-and-title", role: "listitem" }, { children: [(0, jsx_runtime_1.jsx)(Badge_1.Badge, { onClick: onBadgeClick, badge: badge, disabled: !unlocked[badge.id] }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-name" }, { children: badge.title }))] }), badge.id))] })) }))] }));
};
exports.BadgeList = BadgeList;
