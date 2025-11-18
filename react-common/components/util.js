"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusLastActive = exports.isFocusable = exports.findNextFocusableElement = exports.screenToSVGCoord = exports.clientCoord = exports.CheckboxStatus = exports.nodeListToArray = exports.classList = exports.fireClickOnEnter = exports.jsxLF = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
function jsxLF(loc, ...rest) {
    const indices = [];
    loc.replace(/\{\d\}/g, match => {
        indices.push(parseInt(match.substr(1, 1)));
        return match;
    });
    const out = [];
    let parts;
    let i = 0;
    for (const index of indices) {
        parts = loc.split(`{${index}}`);
        pxt.U.assert(parts.length === 2);
        out.push((0, jsx_runtime_1.jsx)("span", { children: parts[0] }, i++));
        out.push((0, jsx_runtime_1.jsx)("span", { children: rest[index] }, i++));
        loc = parts[1];
    }
    out.push((0, jsx_runtime_1.jsx)("span", { children: loc }, i++));
    return out;
}
exports.jsxLF = jsxLF;
function fireClickOnEnter(e) {
    const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode === 13 /* enter */ || charCode === 32 /* space */) {
        e.preventDefault();
        e.currentTarget.click();
    }
}
exports.fireClickOnEnter = fireClickOnEnter;
function classList(...classes) {
    return classes
        .filter(c => typeof c === "string")
        .reduce((prev, c) => prev.concat(c.split(" ")), [])
        .map(c => c.trim())
        .filter(c => !!c)
        .join(" ");
}
exports.classList = classList;
function nodeListToArray(list) {
    const out = [];
    for (const node of list) {
        out.push(node);
    }
    return out;
}
exports.nodeListToArray = nodeListToArray;
var CheckboxStatus;
(function (CheckboxStatus) {
    CheckboxStatus[CheckboxStatus["Selected"] = 0] = "Selected";
    CheckboxStatus[CheckboxStatus["Unselected"] = 1] = "Unselected";
    CheckboxStatus[CheckboxStatus["Waiting"] = 2] = "Waiting";
})(CheckboxStatus = exports.CheckboxStatus || (exports.CheckboxStatus = {}));
function clientCoord(ev) {
    if (ev.touches) {
        const te = ev;
        if (te.touches.length) {
            return te.touches[0];
        }
        return te.changedTouches[0];
    }
    return ev;
}
exports.clientCoord = clientCoord;
function screenToSVGCoord(ref, coord) {
    const screenCoord = ref.createSVGPoint();
    screenCoord.x = coord.clientX;
    screenCoord.y = coord.clientY;
    return screenCoord.matrixTransform(ref.getScreenCTM().inverse());
}
exports.screenToSVGCoord = screenToSVGCoord;
function findNextFocusableElement(elements, focusedIndex, index, forward, isFocusable) {
    const increment = forward ? 1 : -1;
    const element = elements[index];
    // in this case, there are no focusable elements
    if (focusedIndex === index) {
        return element;
    }
    if (isFocusable ? isFocusable(element) : isVisible(element)) {
        return element;
    }
    else {
        if (index + increment >= elements.length) {
            index = 0;
        }
        else if (index + increment < 0) {
            index = elements.length - 1;
        }
        else {
            index += increment;
        }
    }
    return findNextFocusableElement(elements, focusedIndex, index, forward, isFocusable);
}
exports.findNextFocusableElement = findNextFocusableElement;
function isVisible(e) {
    if (e.checkVisibility) {
        return e.checkVisibility({ visibilityProperty: true });
    }
    const style = getComputedStyle(e);
    return style.display !== "none" && style.visibility !== "hidden";
}
function isFocusable(e) {
    if (e) {
        return (e.getAttribute("data-isfocusable") === "true"
            || e.tabIndex !== -1)
            && getComputedStyle(e).display !== "none";
    }
    else {
        return false;
    }
}
exports.isFocusable = isFocusable;
function focusLastActive(el) {
    while (el && !isFocusable(el)) {
        const toFocusParent = el.parentElement;
        if (toFocusParent) {
            el = toFocusParent;
        }
        else {
            break;
        }
    }
    el.focus();
}
exports.focusLastActive = focusLastActive;
