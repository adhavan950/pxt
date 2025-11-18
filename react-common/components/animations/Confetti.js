"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Confetti = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Confetti = (props) => {
    const { children } = props;
    const density = 100;
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "confetti-container" }, { children: [children, Array(density).fill(0).map((el, i) => {
                const style = {
                    animationDelay: `${0.1 * (i % density)}s`,
                    left: `${1 * (Math.floor(Math.random() * density))}%`
                };
                return (0, jsx_runtime_1.jsx)("div", { style: style, className: `confetti ${Math.random() > 0.5 ? "reverse" : ""} color-${Math.floor(Math.random() * 9)}` }, i);
            })] }));
};
exports.Confetti = Confetti;
