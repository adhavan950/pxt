"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusTrapDispatch = exports.useFocusTrapState = exports.removeRegion = exports.addRegion = exports.FocusTrapProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const FocustTrapStateContext = React.createContext(null);
const FocustTrapDispatchContext = React.createContext(null);
const FocusTrapProvider = ({ children, }) => {
    const [state, dispatch] = React.useReducer(focusTrapReducer, {
        regions: []
    });
    return ((0, jsx_runtime_1.jsx)(FocustTrapStateContext.Provider, Object.assign({ value: state }, { children: (0, jsx_runtime_1.jsx)(FocustTrapDispatchContext.Provider, Object.assign({ value: dispatch }, { children: children })) })));
};
exports.FocusTrapProvider = FocusTrapProvider;
const addRegion = (id, order, enabled, onEscape) => ({
    type: "ADD_REGION",
    id,
    order,
    enabled,
    onEscape
});
exports.addRegion = addRegion;
const removeRegion = (id) => ({
    type: "REMOVE_REGION",
    id
});
exports.removeRegion = removeRegion;
function useFocusTrapState() {
    return React.useContext(FocustTrapStateContext);
}
exports.useFocusTrapState = useFocusTrapState;
function useFocusTrapDispatch() {
    return React.useContext(FocustTrapDispatchContext);
}
exports.useFocusTrapDispatch = useFocusTrapDispatch;
function focusTrapReducer(state, action) {
    let newRegions = state.regions.slice();
    switch (action.type) {
        case "ADD_REGION":
            const newRegion = {
                id: action.id,
                enabled: action.enabled,
                order: action.order,
                onEscape: action.onEscape
            };
            const existing = newRegions.findIndex(r => r.id === action.id);
            if (existing !== -1) {
                newRegions.splice(existing, 1, newRegion);
            }
            else {
                newRegions.push(newRegion);
            }
            break;
        case "REMOVE_REGION":
            const toRemove = state.regions.findIndex(r => r.id === action.id);
            if (toRemove !== -1) {
                newRegions.splice(toRemove, 1);
            }
            break;
    }
    return {
        regions: newRegions
    };
}
