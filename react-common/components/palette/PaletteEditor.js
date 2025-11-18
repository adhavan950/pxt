"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ColorPickerField_1 = require("./ColorPickerField");
const PaletteEditor = (props) => {
    const { palette, onPaletteChanged } = props;
    const [currentPalette, setCurrentPalette] = (0, react_1.useState)(palette);
    (0, react_1.useEffect)(() => {
        onPaletteChanged(currentPalette);
    }, [currentPalette]);
    (0, react_1.useEffect)(() => {
        setCurrentPalette(palette);
    }, [palette]);
    const updateColor = (index, newColor) => {
        const toUpdate = currentPalette;
        setCurrentPalette(Object.assign(Object.assign({}, toUpdate), { colors: toUpdate.colors.map((c, i) => index === i ? newColor : c) }));
    };
    const moveColor = (index, up) => {
        const toUpdate = currentPalette;
        const res = Object.assign(Object.assign({}, toUpdate), { colors: toUpdate.colors.slice() });
        if (up) {
            if (index > 1) {
                res.colors[index - 1] = toUpdate.colors[index];
                res.colors[index] = toUpdate.colors[index - 1];
            }
        }
        else {
            if (index < res.colors.length - 1) {
                res.colors[index + 1] = toUpdate.colors[index];
                res.colors[index] = toUpdate.colors[index + 1];
            }
        }
        setCurrentPalette(res);
    };
    return (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-palette-editor" }, { children: currentPalette.colors.slice(1).map((c, i) => (0, jsx_runtime_1.jsx)(ColorPickerField_1.ColorPickerField, { index: i + 1, color: c, onColorChanged: newColor => updateColor(i + 1, newColor), onMoveColor: up => moveColor(i + 1, up) }, i + 1)) }));
};
exports.PaletteEditor = PaletteEditor;
