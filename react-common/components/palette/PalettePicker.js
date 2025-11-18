"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PalettePicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Dropdown_1 = require("../controls/Dropdown");
const PaletteSwatch_1 = require("./PaletteSwatch");
const PalettePicker = (props) => {
    const { palettes, selectedId, onPaletteSelected } = props;
    const onItemSelected = (id) => {
        onPaletteSelected(palettes.find(p => p.id === id));
    };
    return (0, jsx_runtime_1.jsx)(Dropdown_1.Dropdown, { id: "common-palette-picker", selectedId: selectedId, onItemSelected: onItemSelected, items: palettes.map(p => ({
            id: p.id,
            title: p.name,
            label: (0, jsx_runtime_1.jsx)(PaletteSwatch_1.PaletteSwatch, { palette: p })
        })) });
};
exports.PalettePicker = PalettePicker;
