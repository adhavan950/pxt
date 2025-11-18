"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
/**
 * A list of focusable items that represents a single tab stop in the tab order. The
 * children of the list can be navigated between using the arrow keys. Any child with
 * a tabindex other than -1 will be included in the list.
 *
 * If childTabStopId is specified, then the tab stop will be placed on the child with
 * the given id instead of the outer div.
 */
const FocusList = (props) => {
    const { id, className, role, ariaHidden, ariaLabel, childTabStopId, children, focusSelectsItem, onItemReceivedFocus, useUpAndDownArrowKeys } = props;
    let focusableElements;
    let focusList;
    const handleRef = (ref) => {
        if (!ref || focusList)
            return;
        focusList = ref;
        const focusable = ref.querySelectorAll(`[tabindex]:not([tabindex="-1"]),[data-isfocusable]`);
        focusableElements = [];
        for (const element of focusable.values()) {
            focusableElements.push(element);
            // Remove them from the tab order, menu items are navigable using the arrow keys
            element.setAttribute("tabindex", "-1");
            element.setAttribute("data-isfocusable", "true");
        }
        if (childTabStopId) {
            const childTabStop = focusList.querySelector("#" + childTabStopId);
            if (childTabStop) {
                childTabStop.setAttribute("tabindex", "0");
            }
        }
    };
    const isFocusable = (e) => {
        return e.getAttribute("data-isfocusable") === "true"
            && e.offsetParent !== null;
    };
    const onKeyDown = (e) => {
        if (!(focusableElements === null || focusableElements === void 0 ? void 0 : focusableElements.length))
            return;
        const target = document.activeElement;
        const index = focusableElements.indexOf(target);
        const handleClick = (element) => {
            if (element.click) {
                element.click();
            }
            else {
                // SVG Elements
                element.dispatchEvent(new Event("click"));
            }
        };
        const focus = (element) => {
            element.focus();
            if (onItemReceivedFocus)
                onItemReceivedFocus(element);
            if (focusSelectsItem) {
                handleClick(element);
            }
        };
        if (index === -1 && target !== focusList)
            return;
        let prevKey, nextKey;
        if (useUpAndDownArrowKeys) {
            prevKey = "ArrowUp";
            nextKey = "ArrowDown";
        }
        else {
            if (pxt.Util.isUserLanguageRtl()) {
                prevKey = "ArrowRight";
                nextKey = "ArrowLeft";
            }
            else {
                prevKey = "ArrowLeft";
                nextKey = "ArrowRight";
            }
        }
        if (!focusSelectsItem && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            e.stopPropagation();
            handleClick(target);
        }
        else if (e.key === nextKey) {
            if (index === focusableElements.length - 1 || target === focusList) {
                focus((0, util_1.findNextFocusableElement)(focusableElements, index, 0, true, isFocusable));
            }
            else {
                focus((0, util_1.findNextFocusableElement)(focusableElements, index, index + 1, true, isFocusable));
            }
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key === prevKey) {
            if (index === 0 || target === focusList) {
                focus((0, util_1.findNextFocusableElement)(focusableElements, index, focusableElements.length - 1, false, isFocusable));
            }
            else {
                focus((0, util_1.findNextFocusableElement)(focusableElements, index, index - 1, false, isFocusable));
            }
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key === "Home") {
            focus((0, util_1.findNextFocusableElement)(focusableElements, index, 0, true, isFocusable));
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key === "End") {
            focus((0, util_1.findNextFocusableElement)(focusableElements, index, focusableElements.length - 1, true, isFocusable));
            e.preventDefault();
            e.stopPropagation();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, className: className, role: role, tabIndex: childTabStopId ? undefined : 0, onKeyDown: onKeyDown, ref: handleRef, "aria-hidden": ariaHidden, "aria-label": ariaLabel }, { children: children })));
};
exports.FocusList = FocusList;
