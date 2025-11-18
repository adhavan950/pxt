"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ThemePreview_1 = require("./ThemePreview");
const Card_1 = require("../controls/Card");
const ThemeCard = (props) => {
    const { onClick, theme } = props;
    const themeName = pxt.Util.rlf(`{id:color-theme-name}${theme.name}`);
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, Object.assign({ className: "theme-card", role: "listitem", "aria-label": theme.name, onClick: () => onClick(theme), tabIndex: onClick && 0 }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-info-box" }, { children: [(0, jsx_runtime_1.jsx)(ThemePreview_1.ThemePreview, { theme: theme }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "theme-picker-item-name" }, { children: themeName }))] })) }), theme.id));
};
exports.ThemeCard = ThemeCard;
