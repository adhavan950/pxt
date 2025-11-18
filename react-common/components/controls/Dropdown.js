"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dropdown = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const Button_1 = require("./Button");
const FocusList_1 = require("./FocusList");
const Dropdown = (props) => {
    const { id, className, ariaHidden, ariaLabel, role, items, tabIndex, selectedId, onItemSelected } = props;
    const [expanded, setExpanded] = React.useState(false);
    const container = React.useRef();
    const dropdownButton = React.useRef();
    const focusableItems = React.useRef({});
    React.useEffect(() => {
        if (expanded && Object.keys(focusableItems.current).length) {
            focusableItems.current[selectedId !== null && selectedId !== void 0 ? selectedId : 0].focus();
        }
    }, [expanded]);
    const onMenuButtonClick = () => {
        setExpanded(!expanded);
    };
    const onBlur = (e) => {
        if (!container.current)
            return;
        if (expanded && !container.current.contains(e.relatedTarget))
            setExpanded(false);
    };
    const classes = (0, util_1.classList)("common-dropdown", className);
    const selected = items.find(item => item.id === selectedId) || items[0];
    const onItemFocused = (element) => {
        if (element.id && items.some(item => item.id === element.id))
            onItemSelected(element.id);
    };
    const onKeyDown = (e) => {
        const selectedIndex = items.indexOf(selected);
        if (e.key === "ArrowDown") {
            if (expanded) {
                if (selectedIndex < items.length - 1) {
                    onItemSelected(items[selectedIndex + 1].id);
                }
            }
            else {
                setExpanded(true);
            }
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key === "ArrowUp") {
            if (selectedIndex > 0) {
                onItemSelected(items[selectedIndex - 1].id);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        else if (e.key === "Enter") {
            setExpanded(true);
            e.preventDefault();
            e.stopPropagation();
        }
    };
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: classes, ref: container, onBlur: onBlur }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, Object.assign({}, selected, { id: id, buttonRef: ref => dropdownButton.current = ref, tabIndex: tabIndex, rightIcon: expanded ? "fas fa-chevron-up" : "fas fa-chevron-down", role: role, className: (0, util_1.classList)("common-dropdown-button", expanded && "expanded", selected.className), onClick: onMenuButtonClick, onKeydown: onKeyDown, ariaHasPopup: "listbox", ariaExpanded: expanded, ariaLabel: ariaLabel, ariaHidden: ariaHidden })), expanded &&
                (0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({ role: "listbox", className: "common-menu-dropdown-pane common-dropdown-shadow", childTabStopId: selectedId, "aria-labelledby": id, useUpAndDownArrowKeys: true, onItemReceivedFocus: onItemFocused }, { children: (0, jsx_runtime_1.jsx)("ul", Object.assign({ role: "presentation" }, { children: items.map(item => (0, jsx_runtime_1.jsx)("li", Object.assign({ role: "presentation" }, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, Object.assign({}, item, { buttonRef: ref => focusableItems.current[item.id] = ref, className: (0, util_1.classList)("common-dropdown-item", item.className), onClick: () => {
                                    var _a;
                                    setExpanded(false);
                                    onItemSelected(item.id);
                                    (_a = dropdownButton.current) === null || _a === void 0 ? void 0 : _a.focus();
                                }, ariaSelected: item.id === selectedId, role: "option" })) }), item.id)) })) }))] }));
};
exports.Dropdown = Dropdown;
