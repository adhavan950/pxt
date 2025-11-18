"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotification = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const UserNotification = (props) => {
    const { message, icon, actionText, link, xicon, title } = props.notification;
    const onActionClick = () => {
        window.open(link, "_blank");
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-notification" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-notification-icon" }, { children: (0, jsx_runtime_1.jsx)("i", { className: `${xicon ? "xicon" : "ui large circular icon "} ${icon}` }) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-notification-title" }, { children: title })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-notification-message" }, { children: message })), (0, jsx_runtime_1.jsxs)("button", Object.assign({ className: "ui icon button profile-notification-button", onClick: onActionClick, role: "link" }, { children: [(0, jsx_runtime_1.jsx)("i", { className: "icon external alternate" }), actionText] }))] })));
};
exports.UserNotification = UserNotification;
