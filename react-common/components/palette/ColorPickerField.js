"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPickerField = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const Button_1 = require("../controls/Button");
const Input_1 = require("../controls/Input");
const ColorPickerField = (props) => {
    const { index, color, onColorChanged, onMoveColor } = props;
    const [currentColor, setCurrentColor] = React.useState(undefined);
    const onBlur = () => {
        if (currentColor)
            onColorChanged(currentColor);
        setCurrentColor(undefined);
    };
    const onColorPickerChanged = (e) => {
        setCurrentColor(e.target.value.toUpperCase());
    };
    const onTextInputChanged = (newValue) => {
        newValue = newValue.trim();
        if ((newValue === null || newValue === void 0 ? void 0 : newValue[0]) != '#') {
            newValue = "#" + newValue;
        }
        if (newValue.length > 7) {
            newValue = newValue.substring(0, 7);
        }
        if (/#[0-9a-fA-F]{6}/.test(newValue)) {
            onColorChanged(newValue.toUpperCase());
        }
    };
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-color-picker-field" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-color-index" }, { children: index })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-color-inputs" }, { children: [(0, jsx_runtime_1.jsx)("input", { className: "color-input", type: "color", value: currentColor || color, onBlur: onBlur, onChange: onColorPickerChanged }), (0, jsx_runtime_1.jsx)(Input_1.Input, { initialValue: currentColor || color.toUpperCase(), onChange: onTextInputChanged })] })), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "circle-button", title: lf("Move color up"), leftIcon: "fas fa-arrow-up", onClick: () => onMoveColor(true), disabled: index === 1 }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "circle-button", title: lf("Move color down"), leftIcon: "fas fa-arrow-down", onClick: () => onMoveColor(false), disabled: index === 15 })] }));
};
exports.ColorPickerField = ColorPickerField;
