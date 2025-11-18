"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalSlider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const VerticalSlider = (props) => {
    const { value, min, max, step, bigStep, onValueChanged, id, className, role, ariaHidden, ariaLabel, ariaDescribedBy, ariaValueText, } = props;
    const [current, setCurrent] = React.useState(undefined);
    const wrapperRef = React.useRef();
    const railRef = React.useRef();
    const handleRef = React.useRef();
    const positionHandle = React.useCallback((v) => {
        const steps = ((max - min) / step);
        const bounds = railRef.current.getBoundingClientRect();
        const handleBounds = handleRef.current.getBoundingClientRect();
        const index = Math.round((v - min) / step);
        handleRef.current.style.top = (bounds.height / steps) * index - (handleBounds.height / 2) + "px";
    }, [handleRef.current, railRef.current, max, min, step]);
    const onKeyDown = React.useCallback((e) => {
        const changeValue = (newValue) => {
            newValue = Math.max(Math.min(newValue, max), min);
            if (newValue !== value) {
                positionHandle(newValue);
                onValueChanged(newValue);
            }
            e.preventDefault();
            e.stopPropagation();
        };
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            changeValue(value + step);
        }
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            changeValue(value - step);
        }
        else if (e.key === "PageDown") {
            changeValue(value + (bigStep || step * 4));
        }
        else if (e.key === "PageUp") {
            changeValue(value - (bigStep || step * 4));
        }
        else if (e.key === "Home") {
            changeValue(min);
        }
        else if (e.key === "End") {
            changeValue(max);
        }
    }, [value, min, max, onValueChanged, positionHandle]);
    React.useEffect(() => {
        let inGesture = false;
        const steps = ((max - min) / step);
        const updatePosition = (e) => {
            if (!inGesture)
                return undefined;
            const bounds = railRef.current.getBoundingClientRect();
            const y = e.clientY - bounds.top;
            const percentage = Math.min(1, Math.max(y / bounds.height, 0));
            const index = Math.round(steps * percentage);
            const newValue = min + index * step;
            setCurrent(newValue);
            positionHandle(newValue);
            return newValue;
        };
        const onGestureEnd = (newValue) => {
            if (!inGesture)
                return;
            inGesture = false;
            onValueChanged(newValue);
            setCurrent(undefined);
        };
        const pointerdown = (e) => {
            inGesture = true;
            updatePosition(e);
        };
        const pointerup = (e) => {
            onGestureEnd(updatePosition(e));
        };
        const pointermove = (e) => {
            updatePosition(e);
        };
        const pointerleave = (e) => {
            onGestureEnd(updatePosition(e));
        };
        const container = wrapperRef.current;
        container.addEventListener("pointerdown", pointerdown);
        container.addEventListener("pointerup", pointerup);
        container.addEventListener("pointermove", pointermove);
        container.addEventListener("pointerleave", pointerleave);
        return () => {
            container.removeEventListener("pointerdown", pointerdown);
            container.removeEventListener("pointerup", pointerup);
            container.removeEventListener("pointermove", pointermove);
            container.removeEventListener("pointerleave", pointerleave);
        };
    }, [min, max, step, onValueChanged, positionHandle]);
    React.useEffect(() => {
        positionHandle(value);
    }, [value, positionHandle]);
    let valueText;
    if (typeof ariaValueText === "string") {
        valueText = ariaValueText;
    }
    else {
        valueText = ariaValueText(current !== undefined ? current : value);
    }
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("common-vertical-slider-wrapper", className), ref: wrapperRef }, { children: [(0, jsx_runtime_1.jsx)("div", { className: "common-vertical-slider-rail", ref: railRef }), (0, jsx_runtime_1.jsx)("div", { id: id, className: "common-vertical-slider-handle", tabIndex: 0, role: role || "slider", ref: handleRef, onKeyDown: onKeyDown, "aria-label": ariaLabel, "aria-hidden": ariaHidden, "aria-describedby": ariaDescribedBy, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, "aria-valuetext": valueText })] })));
};
exports.VerticalSlider = VerticalSlider;
