"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Textarea = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const Textarea = (props) => {
    const { id, className, role, ariaHidden, ariaLabel, initialValue, label, title, placeholder, autoComplete, cols, rows, disabled, minLength, maxLength, readOnly, resize, wrap, autoResize, onChange, onEnterKey } = props;
    const [value, setValue] = React.useState(initialValue || "");
    const textareaRef = React.useRef(null);
    const previousWidthRef = React.useRef(0);
    const fitVerticalSizeToContent = () => {
        if (!textareaRef.current) {
            return;
        }
        textareaRef.current.style.height = "1px";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };
    React.useEffect(() => {
        setValue(initialValue);
        if (autoResize && textareaRef.current) {
            fitVerticalSizeToContent();
        }
    }, [initialValue]);
    React.useEffect(() => {
        if (!autoResize) {
            return () => { };
        }
        const observer = new ResizeObserver((entries) => {
            // If the width has changed, we need to update the vertical height to account for it.
            const width = entries[0].contentRect.width;
            if (previousWidthRef.current != width) {
                requestAnimationFrame(() => fitVerticalSizeToContent());
                previousWidthRef.current = width;
            }
        });
        if (textareaRef.current) {
            observer.observe(textareaRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [autoResize]);
    const changeHandler = (e) => {
        const newValue = e.target.value;
        if (!readOnly && (value !== newValue)) {
            setValue(newValue);
        }
        if (onChange) {
            onChange(newValue);
        }
        if (autoResize && textareaRef.current) {
            fitVerticalSizeToContent();
        }
    };
    const enterKeyHandler = (e) => {
        const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
        if (charCode === /*enter*/ 13 || charCode === /*space*/ 32) {
            if (onEnterKey) {
                e.preventDefault();
                onEnterKey(value);
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-textarea-wrapper", disabled && "disabled", resize && `resize-${resize}`, className) }, { children: [label && (0, jsx_runtime_1.jsx)("label", Object.assign({ className: "common-textarea-label" }, { children: label })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "common-textarea-group" }, { children: (0, jsx_runtime_1.jsx)("textarea", { id: id, className: "common-textarea", title: title, role: role || "textbox", tabIndex: disabled ? -1 : 0, "aria-label": ariaLabel, "aria-hidden": ariaHidden, placeholder: placeholder, value: value || '', cols: cols, rows: rows, minLength: minLength, maxLength: maxLength, wrap: wrap, readOnly: !!readOnly, ref: textareaRef, onChange: changeHandler, onKeyDown: enterKeyHandler, autoComplete: autoComplete ? "" : "off", autoCorrect: autoComplete ? "" : "off", autoCapitalize: autoComplete ? "" : "off", spellCheck: autoComplete, disabled: disabled }) }))] })));
};
exports.Textarea = Textarea;
