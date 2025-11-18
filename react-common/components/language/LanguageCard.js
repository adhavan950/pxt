"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const Button_1 = require("../controls/Button");
class LanguageCard extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        this.props.onClick(this.props.langId);
    }
    render() {
        const { name, ariaLabel, description } = this.props;
        return ((0, jsx_runtime_1.jsx)(Button_1.Button, { className: "ui card link card-selected language-card", onClick: this.handleClick, role: "listitem", ariaLabel: ariaLabel, title: name, label: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "language-card-container" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "language-card-header" }, { children: name })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "language-card-description ui desktop only" }, { children: description }))] })) }));
    }
}
exports.LanguageCard = LanguageCard;
