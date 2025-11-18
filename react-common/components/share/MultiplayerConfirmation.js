"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplayerConfirmation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal_1 = require("../controls/Modal");
const MultiplayerConfirmation = (props) => {
    const { onCancelClicked, onConfirmClicked } = props;
    const actions = [
        {
            label: lf("Cancel"),
            onClick: onCancelClicked,
        },
        {
            label: lf("Share and Host"),
            onClick: onConfirmClicked,
            className: "primary"
        }
    ];
    return (0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ title: lf("Host a multiplayer game"), actions: actions, onClose: onCancelClicked }, { children: lf("This will share the code of your game publicly. Is that okay?") }));
};
exports.MultiplayerConfirmation = MultiplayerConfirmation;
