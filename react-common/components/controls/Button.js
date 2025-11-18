"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inflateButtonProps = exports.ButtonBody = exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Button = (props) => {
    const inflated = inflateButtonProps(props);
    return ((0, jsx_runtime_1.jsx)("button", Object.assign({}, inflated, { children: (0, jsx_runtime_1.jsx)(exports.ButtonBody, Object.assign({}, props)) })));
};
exports.Button = Button;
const ButtonBody = (props) => {
    const { label, labelClassName, leftIcon, rightIcon, children } = props;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(leftIcon || rightIcon || label) && ((0, jsx_runtime_1.jsxs)("span", Object.assign({ className: "common-button-flex" }, { children: [leftIcon && (0, jsx_runtime_1.jsx)("i", { className: leftIcon, "aria-hidden": true }), (0, jsx_runtime_1.jsx)("span", Object.assign({ className: (0, util_1.classList)("common-button-label", labelClassName) }, { children: label })), rightIcon && (0, jsx_runtime_1.jsx)("i", { className: "right " + rightIcon, "aria-hidden": true })] }))), children] }));
};
exports.ButtonBody = ButtonBody;
function inflateButtonProps(props) {
    const { id, className, style, ariaLabel, ariaHidden, ariaDescribedBy, ariaControls, ariaExpanded, ariaHasPopup, ariaPosInSet, ariaSetSize, ariaSelected, ariaPressed, role, onClick, onRightClick, onKeydown, onBlur, onFocus, buttonRef, title, hardDisabled, href, target, tabIndex, } = props;
    let { disabled } = props;
    disabled = disabled || hardDisabled;
    const classes = (0, util_1.classList)("common-button", className, disabled && "disabled");
    let clickHandler = (ev) => {
        if (onClick)
            onClick();
        if (href)
            window.open(href, target || "_blank", "noopener,noreferrer");
        ev.stopPropagation();
        ev.preventDefault();
    };
    let rightClickHandler = (ev) => {
        if (onRightClick) {
            onRightClick();
            ev.stopPropagation();
            ev.preventDefault();
        }
    };
    return {
        "id": id,
        "className": classes,
        "style": style,
        "title": title,
        "ref": buttonRef,
        "onClick": !disabled ? clickHandler : undefined,
        "onContextMenu": rightClickHandler,
        "onKeyDown": onKeydown || util_1.fireClickOnEnter,
        "onBlur": onBlur,
        "onFocus": onFocus,
        "role": role || "button",
        "tabIndex": tabIndex || (disabled ? -1 : 0),
        "disabled": hardDisabled,
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
        "aria-controls": ariaControls,
        "aria-expanded": ariaExpanded,
        "aria-haspopup": ariaHasPopup,
        "aria-posinset": ariaPosInSet,
        "aria-setsize": ariaSetSize,
        "aria-describedby": ariaDescribedBy,
        "aria-selected": ariaSelected,
        "aria-pressed": ariaPressed,
    };
}
exports.inflateButtonProps = inflateButtonProps;
