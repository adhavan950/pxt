"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorToggle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const util_1 = require("../util");
const Button_1 = require("./Button");
const FocusList_1 = require("./FocusList");
const MenuDropdown_1 = require("./MenuDropdown");
const react_1 = require("react");
const EditorToggle = (props) => {
    const { id, className, ariaHidden, ariaLabel, role, items, selected } = props;
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const hasDropdown = items.some(item => isDropdownItem(item));
    const onKeydown = (ev) => {
        // TODO
    };
    const classNameComposite = (0, util_1.classList)("common-editor-toggle", hasDropdown && "has-dropdown", isFocused && "focused", className);
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-editor-toggle-outer" }, { children: [(0, jsx_runtime_1.jsx)(EditorToggleAccessibleMenu, Object.assign({ setIsFocused: setIsFocused }, props)), (0, jsx_runtime_1.jsxs)("div", Object.assign({ id: id, className: classNameComposite, role: role || "tablist", "aria-hidden": true, "aria-label": ariaLabel }, { children: [items.map((item, index) => {
                        const isSelected = selected === index;
                        return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-editor-toggle-item", isSelected && "selected", isDropdownItem(item) && "common-editor-toggle-item-dropdown") }, { children: [(0, jsx_runtime_1.jsx)(ToggleButton, { item: item, isSelected: isSelected, onKeydown: onKeydown }), isDropdownItem(item) &&
                                    (0, jsx_runtime_1.jsx)(MenuDropdown_1.MenuDropdown, { id: "toggle-dropdown", className: "toggle-dropdown", icon: "fas fa-chevron-down", title: lf("More options"), tabIndex: -1, ariaHidden: true, items: item.items.map(item => ({
                                            role: "menuitem",
                                            title: item.title,
                                            label: item.label,
                                            onClick: item.onClick,
                                            leftIcon: item.icon
                                        })) })] }), index));
                    }), (0, jsx_runtime_1.jsx)("div", { className: "common-editor-toggle-handle", "aria-hidden": true })] }))] })));
};
exports.EditorToggle = EditorToggle;
const ToggleButton = (props) => {
    const { item, isSelected, onKeydown } = props;
    const { label, title, onClick, icon, focusable } = item;
    return (0, jsx_runtime_1.jsx)(Button_1.Button, { className: icon ? undefined : "no-icon", role: focusable ? "tab" : undefined, tabIndex: -1, onKeydown: onKeydown, label: label, title: title, onClick: onClick, leftIcon: icon, ariaHidden: true });
};
const EditorToggleAccessibleMenu = (props) => {
    const { items, id, selected, ariaHidden, setIsFocused } = props;
    let selectedIndex;
    const tabs = items.reduce((prev, current, index) => {
        const next = [...prev];
        next.push(Object.assign({}, current));
        // The selected item will always be a top-level option, not in a dropdown
        if (selected === index) {
            next[next.length - 1].selected = true;
            selectedIndex = index;
        }
        else {
            next[next.length - 1].selected = false;
        }
        if (isDropdownItem(current)) {
            next.push(...current.items.filter(i => i.focusable));
        }
        return next;
    }, []);
    const childIdPrefix = `${id}-option-`;
    return (0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({ id: id, role: "tablist", className: "common-toggle-accessibility", childTabStopId: `${childIdPrefix}${selectedIndex}`, focusSelectsItem: true }, { children: tabs.map((item, index) => (0, jsx_runtime_1.jsx)(Button_1.Button, { className: item.selected ? "selected" : undefined, id: `${childIdPrefix}${index}`, role: "tab", title: item.title, label: item.label, onClick: item.onClick, onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), ariaSelected: item.selected, ariaHidden: ariaHidden }, index)) }));
};
function isDropdownItem(item) {
    var _a;
    return !!((_a = item.items) === null || _a === void 0 ? void 0 : _a.length);
}
