"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Badge = (props) => {
    const { badge, disabled, isNew, onClick } = props;
    const onBadgeClick = onClick && (() => {
        onClick(badge);
    });
    const image = (disabled && badge.lockedImage) || badge.image;
    const alt = disabled ? pxt.U.lf("Locked '{0}' badge", badge.title) : badge.title;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: `profile-badge ${onClick ? "clickable" : ""}`, role: onClick ? "button" : undefined, tabIndex: onClick ? 0 : undefined, title: lf("{0} Badge", badge.title), onClick: onBadgeClick, onKeyDown: util_1.fireClickOnEnter }, { children: [isNew && (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-badge-notification" }, { children: pxt.U.lf("New!") })), (0, jsx_runtime_1.jsx)("img", { src: image, alt: alt })] })));
};
exports.Badge = Badge;
