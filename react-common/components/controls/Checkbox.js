"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxIcon = exports.Checkbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Checkbox = (props) => {
    const { id, className, ariaHidden, ariaLabel, role, isChecked, onChange, label, style, tabIndex } = props;
    const onCheckboxClick = () => {
        onChange(!isChecked);
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-checkbox", className, style === "toggle" && "toggle") }, { children: [(0, jsx_runtime_1.jsx)("input", { id: id, tabIndex: tabIndex !== null && tabIndex !== void 0 ? tabIndex : 0, type: "checkbox", checked: isChecked, onChange: onCheckboxClick, onKeyDown: util_1.fireClickOnEnter, role: role, "aria-hidden": ariaHidden, "aria-label": ariaLabel }), label && (0, jsx_runtime_1.jsx)("label", Object.assign({ htmlFor: id }, { children: label }))] })));
};
exports.Checkbox = Checkbox;
const CheckboxIcon = (props) => {
    const { isChecked } = props;
    return ((0, jsx_runtime_1.jsx)("span", Object.assign({ className: (0, util_1.classList)("common-checkbox-icon", isChecked && "checked") }, { children: isChecked && (0, jsx_runtime_1.jsx)("i", { className: "fas fa-check" }) })));
};
exports.CheckboxIcon = CheckboxIcon;
