"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ReactDOM = require("react-dom");
const util_1 = require("../util");
const Button_1 = require("./Button");
const FocusTrap_1 = require("./FocusTrap");
const Link_1 = require("./Link");
const Modal = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, title, leftIcon, helpUrl, actions, onClose, parentElement, fullscreen, hideDismissButton, } = props;
    const closeClickHandler = (e) => {
        if (onClose)
            onClose();
    };
    const classes = (0, util_1.classList)("common-modal-container", fullscreen && "fullscreen", className);
    return ReactDOM.createPortal((0, jsx_runtime_1.jsx)(FocusTrap_1.FocusTrap, Object.assign({ className: classes, onEscape: closeClickHandler }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ id: id, className: "common-modal", role: role || "dialog", "aria-hidden": ariaHidden, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-labelledby": "modal-title" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-modal-header" }, { children: [fullscreen && !hideDismissButton &&
                            (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-modal-back" }, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "menu-button", onClick: closeClickHandler, title: lf("Go Back"), label: lf("Go Back"), leftIcon: "fas fa-arrow-left" }) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ id: "modal-title", className: "common-modal-title" }, { children: [leftIcon && (0, jsx_runtime_1.jsx)("i", { className: leftIcon, "aria-hidden": true }), title] })), fullscreen && helpUrl &&
                            (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-modal-help" }, { children: (0, jsx_runtime_1.jsx)(Link_1.Link, Object.assign({ className: "common-button menu-button", title: lf("Help on {0} dialog", title), href: props.helpUrl, target: "_blank" }, { children: (0, jsx_runtime_1.jsx)("span", Object.assign({ className: "common-button-flex" }, { children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-question", "aria-hidden": true }) })) })) })), !fullscreen && !hideDismissButton &&
                            (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-modal-close" }, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "menu-button", onClick: closeClickHandler, title: lf("Close"), rightIcon: "fas fa-times-circle" }) }))] })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-modal-body" }, { children: children })), (actions === null || actions === void 0 ? void 0 : actions.length) &&
                    (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-modal-footer" }, { children: actions.map((action, index) => {
                            var _a;
                            return (0, jsx_runtime_1.jsx)(Button_1.Button, { className: (_a = action.className) !== null && _a !== void 0 ? _a : "primary inverted", disabled: action.disabled, onClick: action.onClick, href: action.url, label: action.label, title: action.label, rightIcon: (action.xicon ? "xicon " : "") + action.icon, leftIcon: action.leftIcon }, index);
                        }) }))] })) })), parentElement || document.getElementById("root") || document.body);
};
exports.Modal = Modal;
