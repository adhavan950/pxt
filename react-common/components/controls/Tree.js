"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemBody = exports.TreeItem = exports.Tree = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const FocusList_1 = require("./FocusList");
const Tree = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, } = props;
    if (!role || role === "tree") {
        return ((0, jsx_runtime_1.jsx)(FocusList_1.FocusList, Object.assign({ className: (0, util_1.classList)("common-tree", className), id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role || "tree" }, { children: children })));
    }
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: (0, util_1.classList)("common-tree", "subtree", className), id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role || "tree" }, { children: children })));
};
exports.Tree = Tree;
const TreeItem = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, initiallyExpanded, onClick, title } = props;
    const [expanded, setExpanded] = React.useState(initiallyExpanded);
    const mappedChildren = React.Children.toArray(children);
    const hasSubtree = mappedChildren.length > 1;
    const subtreeContainer = React.useRef();
    React.useEffect(() => {
        if (!hasSubtree)
            return;
        if (expanded) {
            const focusable = subtreeContainer.current.querySelectorAll(`[tabindex]:not([tabindex="-1"]),[data-isfocusable]`);
            focusable.forEach(f => f.setAttribute("data-isfocusable", "true"));
        }
        else {
            const focusable = subtreeContainer.current.querySelectorAll(`[tabindex]:not([tabindex="-1"]),[data-isfocusable]`);
            focusable.forEach(f => f.setAttribute("data-isfocusable", "false"));
        }
    }, [expanded, hasSubtree]);
    const onTreeItemClick = React.useCallback(() => {
        if (hasSubtree) {
            setExpanded(!expanded);
        }
        if (onClick) {
            onClick();
        }
    }, [hasSubtree, expanded]);
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "common-treeitem-container", id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role || "treeitem", title: title }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-treeitem", className), onClick: onTreeItemClick }, { children: [hasSubtree &&
                        (0, jsx_runtime_1.jsx)("i", { className: (0, util_1.classList)("fas", expanded ? "fa-chevron-down" : "fa-chevron-right"), "aria-hidden": true }), mappedChildren[0]] })), (0, jsx_runtime_1.jsx)("div", Object.assign({ ref: subtreeContainer, style: { display: expanded ? undefined : "none" } }, { children: hasSubtree ? mappedChildren[1] : undefined }))] })));
};
exports.TreeItem = TreeItem;
const TreeItemBody = (props) => {
    const { children, id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, } = props;
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: (0, util_1.classList)("common-treeitembody", className), id: id, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, role: role, tabIndex: 0 }, { children: children })));
};
exports.TreeItemBody = TreeItemBody;
