"use strict";
/// <reference path="../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOuterHTML = exports.getDirectChildren = exports.getFirstChildWithAttr = exports.getChildrenWithAttr = exports.getBlocksWithType = void 0;
function getBlocksWithType(parent, type) {
    return getChildrenWithAttr(parent, "block", "type", type).concat(getChildrenWithAttr(parent, "shadow", "type", type));
}
exports.getBlocksWithType = getBlocksWithType;
function getChildrenWithAttr(parent, tag, attr, value) {
    return pxt.Util.toArray(parent.getElementsByTagName(tag)).filter(b => b.getAttribute(attr) === value);
}
exports.getChildrenWithAttr = getChildrenWithAttr;
function getFirstChildWithAttr(parent, tag, attr, value) {
    const res = getChildrenWithAttr(parent, tag, attr, value);
    return res.length ? res[0] : undefined;
}
exports.getFirstChildWithAttr = getFirstChildWithAttr;
function getDirectChildren(parent, tag) {
    const res = [];
    for (let i = 0; i < parent.childNodes.length; i++) {
        const n = parent.childNodes.item(i);
        if (n.tagName === tag) {
            res.push(n);
        }
    }
    return res;
}
exports.getDirectChildren = getDirectChildren;
function cleanOuterHTML(el) {
    // remove IE11 junk
    return el.outerHTML.replace(/^<\?[^>]*>/, '');
}
exports.cleanOuterHTML = cleanOuterHTML;
