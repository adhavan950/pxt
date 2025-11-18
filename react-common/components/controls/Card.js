"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Card = (props) => {
    const { id, className, role, children, ariaDescribedBy, ariaLabelledBy, ariaHidden, ariaLabel, onClick, label, labelClass, tabIndex } = props;
    const handleLinkOrTriggerClick = (e) => {
        if (e.target && e.target.tagName == "A") {
            return;
        }
        e.preventDefault();
        onClick();
    };
    const handleClick = (e) => {
        handleLinkOrTriggerClick(e);
    };
    const handleKeyDown = (e) => {
        const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
        if (charCode === /*enter*/ 13 || charCode === /*space*/ 32) {
            handleLinkOrTriggerClick(e);
        }
    };
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ id: id, className: (0, util_1.classList)("common-card", className), role: role || (onClick ? "button" : undefined), "aria-describedby": ariaDescribedBy, "aria-labelledby": ariaLabelledBy, "aria-hidden": ariaHidden, "aria-label": ariaLabel, onClick: handleClick, tabIndex: tabIndex, onKeyDown: handleKeyDown }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-card-body" }, { children: children })), label &&
                (0, jsx_runtime_1.jsx)("label", Object.assign({ className: (0, util_1.classList)("common-card-label", labelClass) }, { children: label }))] }));
};
exports.Card = Card;
