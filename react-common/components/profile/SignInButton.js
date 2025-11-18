"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../controls/Button");
const util_1 = require("../util");
const SignInButton = ({ onSignInClick, className }) => {
    return ((0, jsx_runtime_1.jsx)(Button_1.Button, { className: (0, util_1.classList)(className, "sign-in-button"), rightIcon: "xicon cloud-user large", title: lf("Sign In"), label: lf("Sign In"), onClick: onSignInClick }));
};
exports.SignInButton = SignInButton;
