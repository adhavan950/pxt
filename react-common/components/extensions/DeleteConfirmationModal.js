"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteConfirmationModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal_1 = require("../controls/Modal");
const DeleteConfirmationModal = (props) => {
    const actions = [
        { label: lf("Cancel"), onClick: props.onCancelClick },
        { label: lf("Remove"), className: "red", onClick: () => { props.onDeleteClick(props.ns); } }
    ];
    return (0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ title: lf("Removing extension"), actions: actions, onClose: props.onCancelClick }, { children: lf("Are you sure you want to remove this extension? Doing so will remove any of its blocks that you used in your code and other extensions that use it.") }));
};
exports.DeleteConfirmationModal = DeleteConfirmationModal;
