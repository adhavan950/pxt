"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccordionPanel = exports.AccordionHeader = exports.AccordionItem = exports.Accordion = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../../util");
const useId_1 = require("../../../hooks/useId");
const context_1 = require("./context");
const Accordion = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, multiExpand, defaultExpandedIds } = props;
    return ((0, jsx_runtime_1.jsx)(context_1.AccordionProvider, Object.assign({ multiExpand: multiExpand, defaultExpandedIds: defaultExpandedIds }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: (0, util_1.classList)("common-accordion", className), id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role }, { children: children })) })));
};
exports.Accordion = Accordion;
const AccordionItem = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, noChevron, itemId, onExpandToggled, } = props;
    const { expanded } = (0, context_1.useAccordionState)();
    const dispatch = (0, context_1.useAccordionDispatch)();
    const panelId = itemId !== null && itemId !== void 0 ? itemId : (0, useId_1.useId)();
    const mappedChildren = React.Children.toArray(children);
    const isExpanded = expanded.indexOf(panelId) !== -1;
    const onHeaderClick = React.useCallback(() => {
        if (isExpanded) {
            dispatch((0, context_1.removeExpanded)(panelId));
        }
        else {
            dispatch((0, context_1.setExpanded)(panelId));
        }
        onExpandToggled === null || onExpandToggled === void 0 ? void 0 : onExpandToggled(!isExpanded);
    }, [isExpanded]);
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-accordion", className), id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ className: "common-accordion-header-outer", "aria-expanded": isExpanded, "aria-controls": panelId, onClick: onHeaderClick, onKeyDown: util_1.fireClickOnEnter }, { children: (0, jsx_runtime_1.jsxs)("div", { children: [!noChevron &&
                            (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-accordion-chevron" }, { children: (0, jsx_runtime_1.jsx)("i", { className: (0, util_1.classList)("fas", isExpanded ? "fa-chevron-down" : "fa-chevron-right"), "aria-hidden": true }) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-accordion-header-content" }, { children: mappedChildren[0] }))] }) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ id: panelId, className: "common-accordion-panel-outer", style: { display: isExpanded ? "block" : "none" } }, { children: isExpanded && mappedChildren[1] }))] })));
};
exports.AccordionItem = AccordionItem;
const AccordionHeader = (props) => {
    const { id, className, ariaLabel, children, } = props;
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, className: (0, util_1.classList)("common-accordion-header", className), "aria-label": ariaLabel }, { children: children })));
};
exports.AccordionHeader = AccordionHeader;
const AccordionPanel = (props) => {
    const { id, className, ariaLabel, children, } = props;
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, className: (0, util_1.classList)("common-accordion-body", className), "aria-label": ariaLabel }, { children: children })));
};
exports.AccordionPanel = AccordionPanel;
