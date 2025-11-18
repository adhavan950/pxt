"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuLinkItemImpl = exports.MenuCheckboxItemImpl = exports.MenuDropdownItemImpl = exports.MenuDropdown = void 0;
const react_1 = require("react");
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const Button_1 = require("./Button");
const FocusTrap_1 = require("./FocusTrap");
const Checkbox_1 = require("./Checkbox");
const MenuDropdown = (props) => {
    const { id, className, ariaHidden, ariaLabel, role, items, label, title, icon, tabIndex, disabled } = props;
    const [expanded, setExpanded] = React.useState(false);
    let container;
    let expandButton;
    const handleContainerRef = (ref) => {
        if (!ref)
            return;
        container = ref;
    };
    const handleButtonRef = (ref) => {
        if (!ref)
            return;
        expandButton = ref;
    };
    const onMenuButtonClick = () => {
        setExpanded(!expanded);
    };
    const onSubpaneEscape = () => {
        setExpanded(false);
        if (expandButton)
            expandButton.focus();
    };
    const onBlur = (e) => {
        if (!container)
            return;
        if (expanded && !container.contains(e.relatedTarget))
            setExpanded(false);
    };
    const onKeydown = (e) => {
        if (e.key === "ArrowDown" && !expanded) {
            setExpanded(true);
        }
    };
    const classes = (0, util_1.classList)("common-menu-dropdown", className);
    const menuId = id + "-menu";
    const menuGroups = getGroups(items);
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: classes, ref: handleContainerRef, onBlur: onBlur }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { id: id, label: label, tabIndex: tabIndex, buttonRef: handleButtonRef, title: title, leftIcon: icon, role: role || "menuitem", className: (0, util_1.classList)("menu-button", expanded && "expanded"), onClick: onMenuButtonClick, ariaHasPopup: "true", ariaExpanded: expanded, ariaControls: expanded ? menuId : undefined, ariaLabel: ariaLabel, ariaHidden: ariaHidden, disabled: disabled, onKeydown: onKeydown }), expanded &&
                (0, jsx_runtime_1.jsx)(FocusTrap_1.FocusTrap, Object.assign({ role: "menu", className: "common-menu-dropdown-pane", id: menuId, arrowKeyNavigation: true, onEscape: onSubpaneEscape, includeOutsideTabOrder: true, dontTrapFocus: true, dontRestoreFocus: true, focusFirstItem: false, ariaLabelledby: id, tagName: "ul" }, { children: menuGroups.map((group, groupIndex) => (0, jsx_runtime_1.jsxs)(React.Fragment, { children: [(0, jsx_runtime_1.jsx)("li", Object.assign({ role: "none" }, { children: (0, jsx_runtime_1.jsx)("ul", Object.assign({ role: "group" }, { children: group.items.map((item, itemIndex) => {
                                        const key = `${groupIndex}-${itemIndex}`;
                                        if (item.role === "menuitem") {
                                            return ((0, react_1.createElement)(exports.MenuDropdownItemImpl, Object.assign({}, item, { key: key, onClick: () => {
                                                    var _a;
                                                    setExpanded(false);
                                                    (_a = item.onClick) === null || _a === void 0 ? void 0 : _a.call(item);
                                                } })));
                                        }
                                        else if (item.role === "link") {
                                            return ((0, react_1.createElement)(exports.MenuLinkItemImpl, Object.assign({}, item, { key: key, onClick: () => {
                                                    var _a;
                                                    setExpanded(false);
                                                    (_a = item.onClick) === null || _a === void 0 ? void 0 : _a.call(item);
                                                } })));
                                        }
                                        else {
                                            return ((0, react_1.createElement)(exports.MenuCheckboxItemImpl, Object.assign({}, item, { key: key, onChange: newValue => {
                                                    var _a;
                                                    setExpanded(false);
                                                    (_a = item.onChange) === null || _a === void 0 ? void 0 : _a.call(item, newValue);
                                                } })));
                                        }
                                    }) })) })), groupIndex < menuGroups.length - 1 &&
                                (0, jsx_runtime_1.jsx)("li", { role: "separator", className: (0, util_1.classList)("common-menu-dropdown-separator", group.className) })] }, groupIndex)) }))] }));
};
exports.MenuDropdown = MenuDropdown;
const MenuDropdownItemImpl = (props) => {
    const inflated = (0, Button_1.inflateButtonProps)(props);
    return ((0, jsx_runtime_1.jsx)("li", Object.assign({}, inflated, { className: (0, util_1.classList)("common-menu-dropdown-item", inflated.className), role: "menuitem", tabIndex: -1 }, { children: (0, jsx_runtime_1.jsx)(Button_1.ButtonBody, Object.assign({}, props)) })));
};
exports.MenuDropdownItemImpl = MenuDropdownItemImpl;
const MenuCheckboxItemImpl = (props) => {
    const { label, isChecked, onChange, id, className, ariaLabel, ariaHidden, ariaDescribedBy, } = props;
    return ((0, jsx_runtime_1.jsxs)("li", Object.assign({ role: "menuitemcheckbox", tabIndex: -1, className: (0, util_1.classList)("common-menu-dropdown-item", "common-menu-dropdown-checkbox-item", className), "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, "aria-checked": isChecked ? "true" : "false", onClick: () => onChange(!isChecked), onKeyDown: util_1.fireClickOnEnter, id: id }, { children: [(0, jsx_runtime_1.jsx)(Checkbox_1.CheckboxIcon, { isChecked: isChecked }), (0, jsx_runtime_1.jsx)("span", { children: label })] })));
};
exports.MenuCheckboxItemImpl = MenuCheckboxItemImpl;
const MenuLinkItemImpl = (props) => {
    const { href, label, id, className, ariaLabel, ariaHidden, ariaDescribedBy, onClick } = props;
    return ((0, jsx_runtime_1.jsx)("a", Object.assign({ role: "none", className: (0, util_1.classList)("common-menu-dropdown-item", "common-menu-dropdown-link-item", className), "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, id: id, tabIndex: -1, href: href, target: "_blank", rel: "noopener noreferrer", onClick: onClick, onKeyDown: util_1.fireClickOnEnter }, { children: label })));
};
exports.MenuLinkItemImpl = MenuLinkItemImpl;
function getGroups(items) {
    const groups = [];
    let currentGroup = { items: [] };
    for (const item of items) {
        if (item.role === "separator") {
            currentGroup.className = item.className;
            if (currentGroup.items.length > 0) {
                groups.push(currentGroup);
                currentGroup = { items: [] };
            }
        }
        else {
            currentGroup.items.push(item);
        }
    }
    if (currentGroup.items.length > 0) {
        groups.push(currentGroup);
    }
    return groups;
}
