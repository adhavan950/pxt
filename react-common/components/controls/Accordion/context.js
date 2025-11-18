"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAccordionDispatch = exports.useAccordionState = exports.removeExpanded = exports.setExpanded = exports.AccordionProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const AccordionStateContext = React.createContext(null);
const AccordionDispatchContext = React.createContext(null);
const AccordionProvider = ({ multiExpand, defaultExpandedIds, children, }) => {
    const [state, dispatch] = React.useReducer(accordionReducer, {
        expanded: defaultExpandedIds !== null && defaultExpandedIds !== void 0 ? defaultExpandedIds : [],
        multiExpand,
    });
    return ((0, jsx_runtime_1.jsx)(AccordionStateContext.Provider, Object.assign({ value: state }, { children: (0, jsx_runtime_1.jsx)(AccordionDispatchContext.Provider, Object.assign({ value: dispatch }, { children: children })) })));
};
exports.AccordionProvider = AccordionProvider;
const setExpanded = (id) => ({
    type: "SET_EXPANDED",
    id
});
exports.setExpanded = setExpanded;
const removeExpanded = (id) => ({
    type: "REMOVE_EXPANDED",
    id
});
exports.removeExpanded = removeExpanded;
function useAccordionState() {
    return React.useContext(AccordionStateContext);
}
exports.useAccordionState = useAccordionState;
function useAccordionDispatch() {
    return React.useContext(AccordionDispatchContext);
}
exports.useAccordionDispatch = useAccordionDispatch;
function accordionReducer(state, action) {
    switch (action.type) {
        case "SET_EXPANDED":
            return Object.assign(Object.assign({}, state), { expanded: state.multiExpand ? [...state.expanded, action.id] : [action.id] });
        case "REMOVE_EXPANDED":
            return Object.assign(Object.assign({}, state), { expanded: state.expanded.filter((id) => id !== action.id) });
    }
}
