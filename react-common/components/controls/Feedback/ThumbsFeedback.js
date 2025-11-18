"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbsFeedback = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../../util");
const Button_1 = require("../Button");
/**
 * A component for gathering simple thumbs up/down feedback.
 */
const ThumbsFeedback = (props) => {
    const { lockOnSelect, onFeedbackSelected, positiveFeedbackText, negativeFeedbackText, rootClassName, positiveClassName, negativeClassName, } = props;
    const [selectedFeedback, setSelectedFeedback] = React.useState(undefined);
    const handleFeedbackSelected = (positive) => {
        if (positive === selectedFeedback) {
            // If the user clicks the same feedback button again, reset it
            setSelectedFeedback(undefined);
            onFeedbackSelected(undefined);
        }
        else {
            setSelectedFeedback(positive);
            onFeedbackSelected(positive);
        }
    };
    const positiveText = positiveFeedbackText || lf("Helpful");
    const negativeText = negativeFeedbackText || lf("Not Helpful");
    const lockButtons = lockOnSelect && selectedFeedback !== undefined;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("feedback-buttons", rootClassName) }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { className: (0, util_1.classList)("feedback-button", positiveClassName, selectedFeedback ? "selected" : undefined), onClick: () => handleFeedbackSelected(true), title: positiveText, ariaLabel: positiveText, leftIcon: selectedFeedback ? "fas fa-thumbs-up" : "far fa-thumbs-up", disabled: lockButtons }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: (0, util_1.classList)("feedback-button", negativeClassName, selectedFeedback === false ? "selected" : undefined), onClick: () => handleFeedbackSelected(false), title: negativeText, ariaLabel: negativeText, leftIcon: selectedFeedback === false ? "fas fa-thumbs-down" : "far fa-thumbs-down", disabled: lockButtons })] })));
};
exports.ThumbsFeedback = ThumbsFeedback;
