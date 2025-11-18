"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const List = (props) => {
    const { id, className, ariaHidden, ariaLabel, role } = props;
    return (0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, "aria-hidden": ariaHidden, "aria-label": ariaLabel, role: role, className: (0, util_1.classList)("common-list", className) }, { children: React.Children.map(props.children, (child, index) => (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-list-item" }, { children: child }), index)) }));
};
exports.List = List;
