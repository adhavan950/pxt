"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPane = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const UserNotification_1 = require("./UserNotification");
const Checkbox_1 = require("../controls/Checkbox");
const Button_1 = require("../controls/Button");
const UserPane = (props) => {
    const { profile, onSignOutClick, onDeleteProfileClick, onEmailCheckClick, notification, emailChecked } = props;
    const { username, displayName, picture, pictureUrl } = profile.idp;
    const picUrl = pictureUrl !== null && pictureUrl !== void 0 ? pictureUrl : picture === null || picture === void 0 ? void 0 : picture.dataUrl;
    const emailLabel = (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [emailChecked === util_1.CheckboxStatus.Waiting ? (0, jsx_runtime_1.jsx)("div", { className: "common-spinner" }) : undefined, lf("I would like to receive the MakeCode newsletter. "), (0, jsx_runtime_1.jsx)("a", Object.assign({ href: "https://makecode.com/privacy", target: "_blank", rel: "noopener noreferrer", tabIndex: 0 }, { children: lf("View Privacy Statement") }))] });
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-user-pane" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-portrait" }, { children: picUrl ?
                    // Google user picture URL must have referrer policy set to no-referrer
                    (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("img", { src: picUrl, alt: pxt.U.lf("Profile Picture"), referrerPolicy: "no-referrer" }) })
                    : (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-initials-portrait" }, { children: pxt.auth.userInitials(profile) })) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-user-details" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-display-name" }, { children: displayName })), username &&
                        (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-username" }, { children: username }))] })), notification && (0, jsx_runtime_1.jsx)(UserNotification_1.UserNotification, { notification: notification }), (0, jsx_runtime_1.jsx)("div", { className: "profile-spacer" }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "profile-email" }, { children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: "profile-email-checkbox", className: emailChecked === util_1.CheckboxStatus.Waiting ? "loading" : "", isChecked: emailChecked === util_1.CheckboxStatus.Selected, onChange: onEmailCheckClick, label: emailLabel }) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-actions" }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { className: "link-button", title: lf("Delete Profile"), label: lf("Delete Profile"), onClick: onDeleteProfileClick }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "sign-out", leftIcon: "fas fa-sign-out-alt", title: lf("Sign Out"), label: lf("Sign Out"), onClick: onSignOutClick })] }))] }));
};
exports.UserPane = UserPane;
