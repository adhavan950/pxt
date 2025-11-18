"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemePreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const themeManager_1 = require("./themeManager");
const util_1 = require("../util");
// Programmatically generate a preview of the theme using theme colors.
const ThemePreview = (props) => {
    const { theme } = props;
    const styleRef = React.useRef(null);
    const uniqueContainerClassName = `theme-preview-container-${theme.id}`;
    const uniqueInnerClassName = `theme-preview-${theme.id}`; // Useful for override css adjusting previews
    const miniLogo = (0, jsx_runtime_1.jsx)("img", { className: "logo", src: "/static/logo/Microsoft_logo_rgb_W-white_D-square.png", alt: "Microsoft MakeCode Logo" });
    React.useEffect(() => {
        if (styleRef === null || styleRef === void 0 ? void 0 : styleRef.current) {
            const themeCss = (0, themeManager_1.getFullColorThemeCss)(theme);
            // Set textContent instead of innerHTML to avoid XSS
            styleRef.current.textContent = `.${uniqueContainerClassName} { ${themeCss} }`;
        }
    }, [theme]);
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("theme-preview-container", uniqueContainerClassName) }, { children: [(0, jsx_runtime_1.jsx)("style", { ref: styleRef }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("theme-preview", uniqueInnerClassName) }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-header" }, { children: [miniLogo, (0, jsx_runtime_1.jsx)("i", { className: "fas fa-user-circle" })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-workspace" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-sim-sidebar" }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "theme-preview-sim" }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-sim-buttons" }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "theme-preview-sim-button" }), (0, jsx_runtime_1.jsx)("div", { className: "theme-preview-sim-button" }), (0, jsx_runtime_1.jsx)("div", { className: "theme-preview-sim-button" })] }))] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-toolbox" }, { children: [(0, jsx_runtime_1.jsx)("hr", { className: "toolbox-divider" }), (0, jsx_runtime_1.jsx)("hr", { className: "toolbox-divider" }), (0, jsx_runtime_1.jsx)("hr", { className: "toolbox-divider" })] })), (0, jsx_runtime_1.jsx)("div", { className: "theme-preview-workspace-content" })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-footer" }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "theme-preview-download-button" }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "theme-preview-editor-tools" }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "theme-preview-editor-tool-button" }), (0, jsx_runtime_1.jsx)("div", { className: "theme-preview-editor-tool-button" })] }))] }))] }))] })));
};
exports.ThemePreview = ThemePreview;
