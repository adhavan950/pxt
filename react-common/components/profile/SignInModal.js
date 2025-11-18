"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/// <reference path="../types.d.ts" />
const React = require("react");
const Checkbox_1 = require("../controls/Checkbox");
const Button_1 = require("../controls/Button");
const Link_1 = require("../controls/Link");
const Modal_1 = require("../controls/Modal");
const SignInModal = (props) => {
    var _a, _b;
    const { onSignIn, onClose, appMessage, dialogMessages, hideDismissButton } = props;
    const { signInMessage, signUpMessage } = dialogMessages || {
        signInMessage: lf("Sign in to save your progress and access your work anytime, anywhere."),
        signUpMessage: lf("Join now to save your progress and access your work anytime, anywhere.")
    };
    const resolvePath = (_a = props.resolvePath) !== null && _a !== void 0 ? _a : (path => path);
    const [rememberMe, setRememberMe] = React.useState(false);
    const [mode, setMode] = React.useState((_b = props.mode) !== null && _b !== void 0 ? _b : "signin");
    const titleText = React.useMemo(() => (mode === "signin" ? lf("Sign in") : lf("Sign up")), [mode]);
    const headerText = React.useMemo(() => (mode === "signin" ? signInMessage : signUpMessage), [mode, signInMessage, signUpMessage]);
    const footerFragment = React.useMemo(() => mode === "signin" ? ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'switch' }, { children: [(0, jsx_runtime_1.jsx)("span", { children: lf("Don't have an account?") }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: 'link-button', onClick: () => setMode("signup"), title: lf("Sign up"), label: lf("Sign up") })] }))) : ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'switch' }, { children: [(0, jsx_runtime_1.jsx)("span", { children: lf("Have an account?") }), (0, jsx_runtime_1.jsx)(Button_1.Button, { className: 'link-button', onClick: () => setMode("signin"), title: lf("Sign in"), label: lf("Sign in") })] }))), [mode]);
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, Object.assign({ title: titleText, onClose: onClose, hideDismissButton: hideDismissButton }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'signin-form' }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'signin-header' }, { children: [appMessage ? appMessage : undefined, " ", headerText] })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: 'signin-body' }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'providers' }, { children: [pxt.auth.identityProviders().map((provider, index) => {
                                const title = mode === "signin"
                                    ? lf("Continue with {0}", provider.name)
                                    : lf("Sign up with {0}", provider.name);
                                return ((0, jsx_runtime_1.jsx)(Button_1.Button, { className: 'provider', onClick: () => onSignIn(provider, rememberMe), title: title, ariaLabel: title, label: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'label' }, { children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("img", { className: 'logo', src: resolvePath(provider.icon) }) }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: 'title' }, { children: title }))] })) }, index));
                            }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: 'rememberme' }, { children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { id: 'rememberme', label: lf("Remember me"), isChecked: rememberMe, onChange: setRememberMe }) }))] })) })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: 'signin-footer' }, { children: [footerFragment, (0, jsx_runtime_1.jsx)("div", Object.assign({ className: 'learn' }, { children: (0, jsx_runtime_1.jsx)(Link_1.Link, Object.assign({ href: '/identity/sign-in', target: '_blank' }, { children: lf("Learn more") })) }))] }))] })) })));
};
exports.SignInModal = SignInModal;
