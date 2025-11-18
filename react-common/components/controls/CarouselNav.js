"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselNav = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Button_1 = require("./Button");
const CarouselNav = (props) => {
    const { pages, selected, maxDisplayed, onPageSelected } = props;
    const displayedPages = [];
    let start = 0;
    let end = pages;
    if (maxDisplayed) {
        start = Math.min(Math.max(0, selected - (maxDisplayed >> 1)), Math.max(0, start + pages - maxDisplayed));
        end = Math.min(start + maxDisplayed, pages);
    }
    for (let i = start; i < end; i++) {
        displayedPages.push(i);
    }
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-carousel-nav" }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { className: "common-carousel-nav-arrow", title: lf("Previous page"), leftIcon: "fas fa-chevron-circle-left", onClick: () => onPageSelected(selected - 1), disabled: selected === 0 }), (0, jsx_runtime_1.jsx)("ul", Object.assign({ className: "common-carousel-nav" }, { children: displayedPages.map(page => (0, jsx_runtime_1.jsx)("li", Object.assign({ onClick: () => onPageSelected(page) }, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { className: (0, util_1.classList)(selected === page && "selected"), title: lf("Jump to page {0}", page + 1), onClick: () => onPageSelected(page), label: (0, jsx_runtime_1.jsx)("span", { className: "common-carousel-nav-button-handle" }) }) }), page)) })), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "common-carousel-nav-arrow", title: lf("Next page"), leftIcon: "fas fa-chevron-circle-right", onClick: () => onPageSelected(selected + 1), disabled: selected === pages - 1 })] })));
};
exports.CarouselNav = CarouselNav;
