"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFooter = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const ThumbsFeedback_1 = require("./Feedback/ThumbsFeedback");
/**
 * A component containing a standard AI disclaimer and feedback buttons.
 */
const AIFooter = (props) => {
    const { className, onFeedbackSelected } = props;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("ai-footer", className) }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "ai-footer-text" }, { children: lf("AI generated content may be incorrect.") })), (0, jsx_runtime_1.jsx)(ThumbsFeedback_1.ThumbsFeedback, { lockOnSelect: true, onFeedbackSelected: onFeedbackSelected })] })));
};
exports.AIFooter = AIFooter;
