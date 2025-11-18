"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyImage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let observer;
const LazyImage = (props) => {
    const { id, className, role, src, alt, title, ariaLabel, ariaHidden, ariaDescribedBy, loadingElement, } = props;
    initObserver();
    let imageRef;
    const handleImageRef = (ref) => {
        if (!ref)
            return;
        if (imageRef)
            observer.unobserve(imageRef);
        imageRef = ref;
        observer.observe(ref);
    };
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-lazy-image-wrapper" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "loading-element" }, { children: loadingElement ? loadingElement : (0, jsx_runtime_1.jsx)("div", { className: "common-spinner" }) })), (0, jsx_runtime_1.jsx)("img", { id: id, ref: handleImageRef, className: className, "data-src": src, alt: alt, title: title, role: role, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy }), (0, jsx_runtime_1.jsx)("i", { className: "fas fa-image", "aria-hidden": true })] }));
};
exports.LazyImage = LazyImage;
function initObserver() {
    if (observer)
        return;
    const config = {
        // If the image gets within 50px in the Y axis, start the download.
        rootMargin: '50px 0px',
        threshold: 0.01
    };
    const onIntersection = (entries) => {
        entries.forEach(entry => {
            // Are we in viewport?
            if (entry.intersectionRatio > 0) {
                // Stop watching and load the image
                observer.unobserve(entry.target);
                const url = entry.target.getAttribute("data-src");
                entry.target.src = url;
                const image = entry.target;
                image.src = url;
                image.onload = () => {
                    image.parentElement.classList.add("loaded");
                    image.parentElement.classList.remove("error");
                };
                image.onerror = () => {
                    image.parentElement.classList.add("error");
                    image.parentElement.classList.remove("loaded");
                };
            }
        });
    };
    observer = new IntersectionObserver(onIntersection, config);
}
