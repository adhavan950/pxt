"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card_1 = require("../controls/Card");
const LazyImage_1 = require("../controls/LazyImage");
const util_1 = require("../util");
const Link_1 = require("../controls/Link");
const ExtensionCard = (props) => {
    const { title, description, imageUrl, learnMoreUrl, label, onClick, extension, loading, showDisclaimer } = props;
    const onCardClick = () => {
        if (onClick)
            onClick(extension);
    };
    const id = pxt.Util.guidGen();
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(Card_1.Card, Object.assign({ className: (0, util_1.classList)("common-extension-card", loading && "loading"), onClick: onCardClick, ariaLabelledBy: id + "-title", ariaDescribedBy: id + "-description", tabIndex: onClick && 0, label: label }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-extension-card-contents" }, { children: !loading && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [imageUrl && (0, jsx_runtime_1.jsx)(LazyImage_1.LazyImage, { src: imageUrl, alt: title }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-extension-card-title", id: id + "-title", title: title }, { children: title })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-extension-card-description" }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ id: id + "-description" }, { children: description })) })), (showDisclaimer || learnMoreUrl) &&
                                (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-extension-card-extra-content" }, { children: [showDisclaimer && lf("User-provided extension, not endorsed by Microsoft."), learnMoreUrl &&
                                            (0, jsx_runtime_1.jsx)(Link_1.Link, Object.assign({ className: "link-button", href: learnMoreUrl, target: "_blank" }, { children: lf("Learn More") }))] }))] }) })), (0, jsx_runtime_1.jsx)("div", { className: "common-spinner" })] })) });
};
exports.ExtensionCard = ExtensionCard;
