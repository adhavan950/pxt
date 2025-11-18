"use strict";
/// <reference path='../../../localtypings/dompurify.d.ts' />
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullColorThemeCss = exports.ThemeManager = void 0;
/*
 * Class to handle theming operations, like loading and switching themes.
 * Each instance can manage themes for a specific document.
*/
class ThemeManager {
    constructor(doc) {
        this.document = doc;
    }
    static getInstance(doc = document) {
        if (!ThemeManager.instances.has(doc)) {
            ThemeManager.instances.set(doc, new ThemeManager(doc));
        }
        return ThemeManager.instances.get(doc);
    }
    static isCurrentThemeHighContrast(doc = document) {
        var _a;
        const themeManager = ThemeManager.getInstance(doc);
        return themeManager.isHighContrast((_a = themeManager.getCurrentColorTheme()) === null || _a === void 0 ? void 0 : _a.id);
    }
    getCurrentColorTheme() {
        return this.currentTheme;
    }
    isKnownTheme(themeId) {
        var _a, _b;
        return !!((_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.colorThemeMap) === null || _b === void 0 ? void 0 : _b[themeId]);
    }
    getAllColorThemes() {
        var _a;
        const allThemes = ((_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.colorThemeMap) ? Object.values(pxt.appTarget.colorThemeMap) : [];
        return allThemes.sort((a, b) => {
            var _a, _b;
            // Lower weight at the front.
            if (a.weight !== b.weight) {
                return ((_a = a.weight) !== null && _a !== void 0 ? _a : Infinity) - ((_b = b.weight) !== null && _b !== void 0 ? _b : Infinity);
            }
            else {
                return a.id.localeCompare(b.id);
            }
        });
    }
    isHighContrast(themeId) {
        var _a, _b;
        return themeId && themeId === ((_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.appTheme) === null || _b === void 0 ? void 0 : _b.highContrastColorTheme);
    }
    // This is a workaround to ensure we still get all the special-case high-contrast styling
    // until we fully support high contrast via color themes (requires a lot of overrides).
    // TODO : this should be removed once we do fully support it.
    performHighContrastWorkaround(themeId) {
        if (this.isHighContrast(themeId)) {
            this.document.body.classList.add("high-contrast");
            this.document.body.classList.add("hc");
        }
        else {
            this.document.body.classList.remove("high-contrast");
            this.document.body.classList.remove("hc");
        }
    }
    switchColorTheme(themeId) {
        var _a, _b, _c;
        if (themeId === ((_a = this.getCurrentColorTheme()) === null || _a === void 0 ? void 0 : _a.id)) {
            return;
        }
        const theme = (_c = (_b = pxt.appTarget) === null || _b === void 0 ? void 0 : _b.colorThemeMap) === null || _c === void 0 ? void 0 : _c[themeId];
        // Programmatically set the CSS variables for the theme
        if (theme) {
            const themeAsStyle = getFullColorThemeCss(theme);
            const styleElementId = "theme-override";
            let styleElement = this.document.getElementById(styleElementId);
            if (!styleElement) {
                styleElement = this.document.createElement("style");
                styleElement.id = styleElementId;
                this.document.head.appendChild(styleElement);
            }
            // textContent is safer than innerHTML, less vulnerable to XSS
            styleElement.textContent = `.pxt-theme-root { ${themeAsStyle} }`;
            this.performHighContrastWorkaround(themeId);
            this.currentTheme = theme;
            this.notifySubscribers();
        }
    }
    subscribe(subscriberId, onColorThemeChange) {
        var _a;
        if ((_a = this.subscribers) === null || _a === void 0 ? void 0 : _a.some(s => s.subscriberId === subscriberId)) {
            return;
        }
        if (!this.subscribers) {
            this.subscribers = [];
        }
        this.subscribers.push({ subscriberId, onColorThemeChange });
    }
    unsubscribe(subscriberId) {
        this.subscribers = this.subscribers.filter(s => s.subscriberId !== subscriberId);
    }
    notifySubscribers() {
        var _a;
        (_a = this.subscribers) === null || _a === void 0 ? void 0 : _a.forEach(s => s.onColorThemeChange());
    }
}
exports.ThemeManager = ThemeManager;
ThemeManager.instances = new Map();
function getFullColorThemeCss(theme) {
    let css = "";
    for (const [key, value] of Object.entries(theme.colors)) {
        css += `--${key}: ${value};\n`;
    }
    if (theme.overrideCss) {
        css += `${theme.overrideCss}\n`;
    }
    // Sanitize the CSS
    css = DOMPurify.sanitize(css);
    return css;
}
exports.getFullColorThemeCss = getFullColorThemeCss;
