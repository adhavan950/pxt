"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const Link_1 = require("../controls/Link");
const Modal_1 = require("../controls/Modal");
const LanguageCard_1 = require("./LanguageCard");
const defaultLanguages = ["en"];
class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        this.changeLanguage = this.changeLanguage.bind(this);
    }
    languageList() {
        var _a;
        if (pxt.appTarget.appTheme.selectLanguage && ((_a = pxt.appTarget.appTheme.availableLocales) === null || _a === void 0 ? void 0 : _a.length)) {
            return pxt.appTarget.appTheme.availableLocales;
        }
        return defaultLanguages;
    }
    changeLanguage(newLang) {
        if (!pxt.Util.allLanguages[newLang]) {
            return;
        }
        this.props.onLanguageChanged(newLang);
        this.props.onClose();
    }
    render() {
        const targetTheme = pxt.appTarget.appTheme;
        const languageList = this.languageList();
        return ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, Object.assign({ onClose: this.props.onClose, title: lf("Select Language"), className: "language-selector-modal" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "ui cards centered language-selector", role: "list", "aria-label": lf("List of available languages") }, { children: languageList.map((langId) => {
                        const lang = pxt.Util.allLanguages[langId];
                        return ((0, jsx_runtime_1.jsx)(LanguageCard_1.LanguageCard, { langId: langId, name: lang.localizedName, ariaLabel: lang.englishName, description: lang.englishName, onClick: this.changeLanguage }, langId));
                    }) })), targetTheme.crowdinProject ? ((0, jsx_runtime_1.jsx)(Link_1.Link, Object.assign({ "aria-label": lf("How do I add a new language?"), href: "/translate", target: "_blank" }, { children: lf("How do I add a new language?") }))) : undefined] })));
    }
}
exports.LanguageSelector = LanguageSelector;
