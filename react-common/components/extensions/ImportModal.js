"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal_1 = require("../controls/Modal");
const ImportModal = (props) => {
    const handleOnImportClick = () => {
        props.onImportClick(document.getElementById("url-input").value);
    };
    const actions = [
        {
            label: lf("Cancel"),
            onClick: props.onCancelClick
        },
        {
            label: lf("Import"),
            onClick: handleOnImportClick
        }
    ];
    return (0, jsx_runtime_1.jsxs)(Modal_1.Modal, Object.assign({ title: lf("Import extension"), actions: actions, className: "import-extension-modal" }, { children: [lf("Enter Github project URL"), (0, jsx_runtime_1.jsx)("input", { id: "url-input" })] }));
};
exports.ImportModal = ImportModal;
