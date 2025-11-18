"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedExperienceModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/// <reference path="../types.d.ts" />
const Modal_1 = require("../controls/Modal");
/**
 * A modal that displays a message when the specified experience is not supported
 * by the current target. Contains a button to return to the home page and no dismiss.
 */
const UnsupportedExperienceModal = () => {
    function fireGoBackTick() {
        pxt.tickEvent("unsupportedexperience.goback");
    }
    const homeUrl = pxt.U.getHomeUrl();
    const goBackAction = {
        label: lf("Go Back"),
        onClick: fireGoBackTick,
        className: "primary",
        url: homeUrl
    };
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ title: lf("Unsupported Experience"), hideDismissButton: true, actions: [goBackAction] }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "ui unsupported-modal-content" }, { children: (0, jsx_runtime_1.jsx)("p", { children: lf("The current experience is not supported in {0}.", pxt.appTarget.nickname || pxt.appTarget.id) }) })) })));
};
exports.UnsupportedExperienceModal = UnsupportedExperienceModal;
