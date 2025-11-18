"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Link = (props) => {
    const { id, className, ariaLabel, href, target, children, tabIndex, title } = props;
    const classes = (0, util_1.classList)("common-link", className);
    return ((0, jsx_runtime_1.jsx)("a", Object.assign({ id: id, className: classes, "aria-label": ariaLabel, href: href, target: target, rel: target === "_blank" ? "noopener noreferrer" : "", tabIndex: tabIndex !== null && tabIndex !== void 0 ? tabIndex : 0, title: title }, { children: children })));
};
exports.Link = Link;
