"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const ProgressBar = (props) => {
    const { value, max, id, className, title, label, role, ariaHidden, ariaLabel, ariaDescribedBy, ariaValueText, } = props;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-progressbar-wrapper", className) }, { children: [label && (0, jsx_runtime_1.jsx)("label", Object.assign({ className: "common-progressbar-label" }, { children: label })), (0, jsx_runtime_1.jsx)("progress", { className: "common-progressbar", value: value, "aria-valuetext": ariaValueText, max: max || 1.0, id: id, role: role || "progressbar", title: title, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-hidden": ariaHidden })] })));
};
exports.ProgressBar = ProgressBar;
