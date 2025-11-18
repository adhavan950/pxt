"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemePickerModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal_1 = require("../controls/Modal");
const ThemeCard_1 = require("./ThemeCard");
const ThemePickerModal = (props) => {
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ id: "theme-picker-modal", title: lf("Choose a Theme"), onClose: props.onClose, className: "theme-picker-modal" }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "theme-picker", role: "list", "aria-label": lf("List of available themes") }, { children: props.themes && props.themes.map(theme => (0, jsx_runtime_1.jsx)(ThemeCard_1.ThemeCard, { theme: theme, onClick: props.onThemeClicked }, theme.id)) })) })));
};
exports.ThemePickerModal = ThemePickerModal;
