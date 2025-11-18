"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalResizeContainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const util_1 = require("../util");
const VerticalResizeContainer = (props) => {
    const { id, className, ariaDescribedBy, ariaHidden, ariaLabel, minHeight, maxHeight, initialHeight, children, resizeEnabled, onResizeDrag, onResizeEnd } = props;
    const RESIZABLE_BORDER_SIZE = 4;
    const containerRef = React.useRef();
    const heightProperty = `--${id}-height`;
    let [hasResized, setHasResized] = React.useState(false);
    React.useEffect(() => {
        if (!resizeEnabled)
            return undefined;
        const container = containerRef.current;
        const resize = (e) => {
            let heightVal = `${e.pageY - container.offsetTop}px`;
            if (maxHeight)
                heightVal = `min(${maxHeight}, ${heightVal})`;
            if (minHeight)
                heightVal = `max(${minHeight}, ${heightVal})`;
            container.style.setProperty(heightProperty, heightVal);
            if (onResizeDrag) {
                onResizeDrag(container.clientHeight);
            }
            setHasResized(true);
            e.preventDefault();
            e.stopPropagation();
        };
        const cleanupBodyEvents = () => {
            document.removeEventListener("pointermove", resize, false);
            document.removeEventListener("pointerup", onPointerUp, false);
            document.body.classList.remove("cursor-resize");
        };
        const onPointerUp = () => {
            // Clean resize events
            cleanupBodyEvents();
            // Notify resize end
            if (onResizeEnd) {
                onResizeEnd(container.clientHeight);
            }
        };
        const onPointerDown = (e) => {
            const computedStyle = getComputedStyle(container);
            const containerHeight = parseInt(computedStyle.height) - parseInt(computedStyle.borderWidth);
            if (e.offsetY < containerHeight && e.offsetY > containerHeight - RESIZABLE_BORDER_SIZE - 4) {
                document.body.classList.add("cursor-resize");
                document.addEventListener("pointermove", resize, false);
                document.addEventListener("pointerup", onPointerUp, false);
                e.preventDefault();
                e.stopPropagation();
            }
        };
        container.addEventListener("pointerdown", onPointerDown);
        return () => {
            container.removeEventListener("pointerdown", onPointerDown);
            cleanupBodyEvents();
        };
    }, [heightProperty, minHeight, maxHeight, onResizeEnd, onResizeDrag, resizeEnabled]);
    return (0, jsx_runtime_1.jsx)("div", Object.assign({ id: id, ref: containerRef, className: (0, util_1.classList)(resizeEnabled ? "vertical-resize-container" : "", className), "aria-describedby": ariaDescribedBy, "aria-hidden": ariaHidden, "aria-label": ariaLabel, style: { height: resizeEnabled && hasResized ? `var(${heightProperty})` : initialHeight } }, { children: children }));
};
exports.VerticalResizeContainer = VerticalResizeContainer;
