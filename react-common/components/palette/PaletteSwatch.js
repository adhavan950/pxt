"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteSwatch = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const PaletteSwatch = (props) => {
    const { palette } = props;
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-palette-swatch" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-palette-swatch-name" }, { children: palette.name })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-palette-color-list" }, { children: palette.colors.slice(1).map((color, index) => (0, jsx_runtime_1.jsx)(PaletteColor, { color: color }, index)) }))] }));
};
exports.PaletteSwatch = PaletteSwatch;
const PaletteColor = (props) => (0, jsx_runtime_1.jsx)("div", { className: "common-palette-color", style: { backgroundColor: props.color } });
