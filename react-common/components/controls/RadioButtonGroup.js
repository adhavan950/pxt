"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonGroup = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const FocusList_1 = require("./FocusList");
const RadioButtonGroup = (props) => {
    const { id, className, ariaHidden, ariaLabel, role, choices, selectedId, onChoiceSelected } = props;
    const onChoiceClick = (id) => {
        onChoiceSelected(id);
    };
    return ((0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({ id: id, className: (0, util_1.classList)("common-radio-group", className), ariaHidden: ariaHidden, ariaLabel: ariaLabel, role: role || "radiogroup", childTabStopId: selectedId }, { children: choices.map(choice => (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-radio-choice", choice.className, selectedId === choice.id && "selected") }, { children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", id: choice.id, value: choice.id, name: id + "-input", checked: selectedId === choice.id, onChange: () => onChoiceClick(choice.id), tabIndex: 0, "aria-label": choice.label ? undefined : choice.title, "aria-labelledby": choice.label ? choice.id + "-label" : undefined }), choice.label &&
                    (0, jsx_runtime_1.jsx)("span", Object.assign({ id: choice.id + "-label" }, { children: choice.label })), choice.icon && (0, jsx_runtime_1.jsx)("i", { className: choice.icon, "aria-hidden": true })] }), choice.id)) })));
};
exports.RadioButtonGroup = RadioButtonGroup;
