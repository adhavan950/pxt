"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const FocusList_1 = require("./FocusList");
const MenuBar = (props) => (0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({}, props, { role: "menubar", className: (0, util_1.classList)("common-menubar", props.className) }));
exports.MenuBar = MenuBar;
