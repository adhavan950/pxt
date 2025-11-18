"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const Button_1 = require("./Button");
const FocusList_1 = require("./FocusList");
const Input = (props) => {
    var _a;
    const { id, className, inputClassName, groupClassName, role, ariaHidden, ariaLabel, initialValue, label, title, placeholder, icon, iconTitle, disabled, type, readOnly, autoComplete, selectOnClick, onChange, onEnterKey, onIconClick, onFocus, onBlur, onOptionSelected, handleInputRef, preserveValueOnBlur = true, options } = props;
    const [value, setValue] = React.useState(initialValue || "");
    const [expanded, setExpanded] = React.useState(false);
    const [filter] = React.useState(props.filter ? new RegExp(props.filter) : undefined);
    let container;
    React.useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);
    const handleContainerRef = (ref) => {
        if (!ref)
            return;
        container = ref;
    };
    const clickHandler = (evt) => {
        if (selectOnClick) {
            evt.target.select();
        }
        if (options && !expanded) {
            setExpanded(true);
        }
    };
    const changeHandler = (e) => {
        var _a;
        let newValue = e.target.value;
        if (newValue && filter) {
            newValue = ((_a = newValue.match(filter)) === null || _a === void 0 ? void 0 : _a.join("")) || "";
        }
        if (!readOnly && (value !== newValue)) {
            setValue(newValue);
        }
        if (onChange) {
            onChange(newValue);
        }
    };
    const keyDownHandler = (e) => {
        var _a, _b;
        const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
        if (charCode === /*enter*/ 13 || props.treatSpaceAsEnter && charCode === /*space*/ 32) {
            if (onEnterKey) {
                e.preventDefault();
                onEnterKey(value);
            }
        }
        else if (options && e.key === "ArrowDown") {
            if (expanded) {
                (_a = document.getElementById(getDropdownOptionId(Object.values(options)[0]))) === null || _a === void 0 ? void 0 : _a.focus();
            }
            else {
                expandButtonClickHandler();
            }
            e.preventDefault();
            e.stopPropagation();
        }
        else if (options && expanded && e.key === "ArrowUp") {
            const optionVals = Object.values(options);
            (_b = document.getElementById(getDropdownOptionId(optionVals[optionVals.length - 1]))) === null || _b === void 0 ? void 0 : _b.focus();
            e.preventDefault();
            e.stopPropagation();
        }
    };
    const captureEscapeKey = (e) => {
        var _a;
        if (e.code !== "Escape")
            return;
        e.target.blur();
        expandButtonClickHandler();
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.focus();
        e.stopPropagation();
        e.preventDefault();
    };
    const iconClickHandler = () => {
        if (onIconClick)
            onIconClick(value);
    };
    const expandButtonClickHandler = () => {
        if (options) {
            setExpanded(!expanded);
        }
    };
    const focusHandler = () => {
        if (onFocus) {
            onFocus(value);
        }
    };
    const blurHandler = () => {
        if (onBlur) {
            onBlur(value);
        }
        if (!preserveValueOnBlur) {
            setValue("");
        }
    };
    const containerBlurHandler = (e) => {
        if (expanded && !container.contains(e.relatedTarget)) {
            setExpanded(false);
        }
    };
    const optionClickHandler = (option) => {
        var _a;
        setExpanded(false);
        const value = options[option];
        setValue(value);
        if (onOptionSelected) {
            onOptionSelected(value);
        }
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const getDropdownOptionId = (option) => {
        return option && Object.values(options).indexOf(option) != -1 ? `dropdown-item-${option}` : undefined;
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-input-wrapper", disabled && "disabled", className), onBlur: containerBlurHandler, ref: handleContainerRef }, { children: [label && (0, jsx_runtime_1.jsx)("label", Object.assign({ className: "common-input-label", htmlFor: id }, { children: label })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-input-group", groupClassName) }, { children: [(0, jsx_runtime_1.jsx)("input", { id: id, className: (0, util_1.classList)("common-input", icon && "has-icon", inputClassName), title: title, role: role || "textbox", tabIndex: disabled ? -1 : 0, "aria-label": ariaLabel, "aria-hidden": ariaHidden, type: type || "text", placeholder: placeholder, value: value, readOnly: !!readOnly, onClick: clickHandler, onChange: changeHandler, onKeyDown: keyDownHandler, onBlur: blurHandler, onFocus: focusHandler, autoComplete: autoComplete ? "" : "off", autoCorrect: autoComplete ? "" : "off", autoCapitalize: autoComplete ? "" : "off", spellCheck: autoComplete, disabled: disabled, ref: handleInputRef }), icon && (onIconClick
                        ? (0, jsx_runtime_1.jsx)(Button_1.Button, { leftIcon: icon, title: iconTitle, disabled: disabled, onClick: iconClickHandler })
                        : (0, jsx_runtime_1.jsx)("i", { className: icon, "aria-hidden": true })), options && (0, jsx_runtime_1.jsx)(Button_1.Button, { leftIcon: expanded ? "fas fa-chevron-up" : "fas fa-chevron-down", title: iconTitle, disabled: disabled, ariaHasPopup: "listbox", ariaExpanded: expanded, ariaLabel: ariaLabel, tabIndex: -1, onClick: expandButtonClickHandler })] })), expanded &&
                (0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({ role: "listbox", className: "common-menu-dropdown-pane common-dropdown-shadow", childTabStopId: (_a = getDropdownOptionId(value)) !== null && _a !== void 0 ? _a : getDropdownOptionId(Object.values(options)[0]), "aria-labelledby": id, useUpAndDownArrowKeys: true }, { children: (0, jsx_runtime_1.jsx)("ul", Object.assign({ role: "presentation", onKeyDown: captureEscapeKey }, { children: Object.keys(options).map(option => (0, jsx_runtime_1.jsx)("li", Object.assign({ role: "presentation" }, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { title: option, label: option, id: getDropdownOptionId(options[option]), className: (0, util_1.classList)("common-dropdown-item"), onClick: () => optionClickHandler(option), ariaSelected: getDropdownOptionId(options[option]) === getDropdownOptionId(value !== null && value !== void 0 ? value : initialValue), role: "option" }) }), option)) })) }))] })));
};
exports.Input = Input;
