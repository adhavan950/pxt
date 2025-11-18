"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusTrapRegion = exports.FocusTrap = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../../util");
const context_1 = require("./context");
const useId_1 = require("../../../hooks/useId");
const FocusTrap = (props) => {
    return ((0, jsx_runtime_1.jsx)(context_1.FocusTrapProvider, { children: (0, jsx_runtime_1.jsx)(FocusTrapInner, Object.assign({}, props)) }));
};
exports.FocusTrap = FocusTrap;
const FocusTrapInner = (props) => {
    const { children, id, className, onEscape, arrowKeyNavigation, dontStealFocus, includeOutsideTabOrder, dontRestoreFocus, dontTrapFocus, focusFirstItem, tagName, role, ariaLabelledby, ariaLabel, ariaHidden } = props;
    const containerRef = React.useRef(null);
    const previouslyFocused = React.useRef(document.activeElement);
    const [stoleFocus, setStoleFocus] = React.useState(false);
    const lastValidTabElement = React.useRef(null);
    const { regions } = (0, context_1.useFocusTrapState)();
    React.useEffect(() => {
        return () => {
            if (!dontRestoreFocus && previouslyFocused.current) {
                (0, util_1.focusLastActive)(previouslyFocused.current);
            }
        };
    }, []);
    const getElements = React.useCallback(() => {
        var _a, _b, _c;
        let all = (0, util_1.nodeListToArray)(includeOutsideTabOrder ? (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll(`[tabindex]`) :
            (_b = containerRef.current) === null || _b === void 0 ? void 0 : _b.querySelectorAll(`[tabindex]:not([tabindex="-1"])`));
        if (regions.length) {
            const regionElements = {};
            for (const region of regions) {
                const el = (_c = containerRef.current) === null || _c === void 0 ? void 0 : _c.querySelector(`[data-focus-trap-region="${region.id}"]`);
                if (el) {
                    regionElements[region.id] = el;
                }
            }
            for (const region of regions) {
                const regionElement = regionElements[region.id];
                if (!region.enabled && regionElement) {
                    all = all.filter(el => !regionElement.contains(el));
                }
            }
            const initialOrder = all.slice();
            all.sort((a, b) => {
                const aRegion = regions.find(r => { var _a; return r.enabled && ((_a = regionElements[r.id]) === null || _a === void 0 ? void 0 : _a.contains(a)); });
                const bRegion = regions.find(r => { var _a; return r.enabled && ((_a = regionElements[r.id]) === null || _a === void 0 ? void 0 : _a.contains(b)); });
                if ((aRegion === null || aRegion === void 0 ? void 0 : aRegion.order) === (bRegion === null || bRegion === void 0 ? void 0 : bRegion.order)) {
                    const aIndex = initialOrder.indexOf(a);
                    const bIndex = initialOrder.indexOf(b);
                    return aIndex - bIndex;
                }
                else if (!aRegion) {
                    return 1;
                }
                else if (!bRegion) {
                    return -1;
                }
                else {
                    return aRegion.order - bRegion.order;
                }
            });
        }
        return all;
    }, [regions, includeOutsideTabOrder]);
    const handleRef = React.useCallback((ref) => {
        if (!ref)
            return;
        containerRef.current = ref;
        const elements = getElements();
        if (!dontStealFocus && !stoleFocus && !ref.contains(document.activeElement) && elements.length) {
            containerRef.current.focus();
            if (focusFirstItem) {
                (0, util_1.findNextFocusableElement)(elements, -1, 0, true).focus();
            }
            // Only steal focus once
            setStoleFocus(true);
        }
    }, [getElements, dontStealFocus, stoleFocus, focusFirstItem]);
    const onKeyDown = React.useCallback((e) => {
        var _a;
        if (!containerRef.current)
            return;
        const moveFocus = (forward, goToEnd) => {
            const focusable = getElements();
            if (!focusable.length)
                return;
            let index = focusable.indexOf(e.target);
            if (index < 0) {
                // If we have arrived at a non-indexed focusable, it's probably
                // been triggered by a calling focus() on an element with
                // tabindex=-1, from the last focusable element, so try to use
                // that.
                index = focusable.indexOf(lastValidTabElement.current);
            }
            let nextFocusableElement;
            if (forward) {
                if (goToEnd) {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, focusable.length - 1, forward);
                }
                else if (index === focusable.length - 1) {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, 0, forward);
                }
                else {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, index + 1, forward);
                }
            }
            else {
                if (goToEnd) {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, 0, forward);
                }
                else if (index === 0) {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, focusable.length - 1, forward);
                }
                else {
                    nextFocusableElement = (0, util_1.findNextFocusableElement)(focusable, index, Math.max(index - 1, 0), forward);
                }
            }
            lastValidTabElement.current = nextFocusableElement;
            nextFocusableElement.focus();
            e.preventDefault();
            e.stopPropagation();
        };
        if (e.key === "Escape") {
            let foundHandler = false;
            if (regions.length) {
                for (const region of regions) {
                    if (!region.onEscape)
                        continue;
                    const regionElement = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`[data-focus-trap-region="${region.id}"]`);
                    if (regionElement === null || regionElement === void 0 ? void 0 : regionElement.contains(document.activeElement)) {
                        foundHandler = true;
                        region.onEscape();
                        break;
                    }
                }
            }
            if (!foundHandler) {
                onEscape();
            }
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key === "Tab") {
            if (dontTrapFocus) {
                onEscape();
            }
            else if (e.shiftKey)
                moveFocus(false, false);
            else
                moveFocus(true, false);
        }
        else if (arrowKeyNavigation) {
            if (e.key === "ArrowDown") {
                moveFocus(true, false);
            }
            else if (e.key === "ArrowUp") {
                moveFocus(false, false);
            }
            else if (e.key === "Home") {
                moveFocus(false, true);
            }
            else if (e.key === "End") {
                moveFocus(true, true);
            }
        }
    }, [getElements, onEscape, arrowKeyNavigation, regions, dontTrapFocus]);
    return React.createElement(tagName || "div", {
        id,
        className: (0, util_1.classList)("common-focus-trap", className),
        ref: handleRef,
        onKeyDown,
        role,
        tabIndex: -1,
        "aria-labelledby": ariaLabelledby,
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
    }, children);
};
const FocusTrapRegion = (props) => {
    const { className, id, onEscape, order, enabled, children, divRef } = props;
    const regionId = (0, useId_1.useId)();
    const dispatch = (0, context_1.useFocusTrapDispatch)();
    React.useEffect(() => {
        dispatch((0, context_1.addRegion)(regionId, order, enabled, onEscape));
        return () => dispatch((0, context_1.removeRegion)(regionId));
    }, [regionId, enabled, order]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, className: className, "data-focus-trap-region": regionId, tabIndex: -1, ref: divRef }, { children: children })));
};
exports.FocusTrapRegion = FocusTrapRegion;
