"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingBubble = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ReactDOM = require("react-dom");
const Button_1 = require("./Button");
const Confetti_1 = require("../animations/Confetti");
const util_1 = require("../util");
const FocusTrap_1 = require("./FocusTrap");
const react_1 = require("react");
const TeachingBubble = (props) => {
    const { id, className, ariaLabel, ariaHidden, ariaDescribedBy, role, targetContent, onClose, onNext, onBack, onFinish, footer, stepNumber, totalSteps, parentElement, activeTarget, forceHideSteps, hasPrevious, hasNext } = props;
    const margin = 10;
    const outlineOffset = 2.5;
    const tryFit = {
        above: false,
        below: false,
        left: false,
        right: false
    };
    (0, react_1.useEffect)(() => {
        if (targetContent.onStepBegin) {
            targetContent.onStepBegin();
        }
        positionBubbleAndCutout();
        window.addEventListener("resize", positionBubbleAndCutout);
        return () => {
            window.removeEventListener("resize", positionBubbleAndCutout);
        };
    }, [stepNumber, targetContent]);
    const positionBubbleAndCutout = () => {
        const bubble = document.getElementById(id);
        const bubbleArrow = document.querySelector(".teaching-bubble-arrow");
        bubbleArrow.style.border = "none";
        const bubbleArrowOutline = document.querySelector(".teaching-bubble-arrow-outline");
        bubbleArrowOutline.style.border = "none";
        const bubbleBounds = bubble.getBoundingClientRect();
        let cutoutBounds;
        if (!targetContent.targetQuery || targetContent.targetQuery === "nothing") {
            cutoutBounds = {
                top: window.innerHeight / 2,
                bottom: 0,
                left: window.innerWidth / 2,
                right: 0,
                width: 0,
                height: 0
            };
        }
        else {
            const targetElement = document.querySelector(targetContent.targetQuery);
            const targetBounds = targetElement.getBoundingClientRect();
            cutoutBounds = getCutoutBounds(targetBounds, targetElement);
        }
        setCutout(cutoutBounds);
        setPosition(cutoutBounds, bubble, bubbleBounds, bubbleArrow, bubbleArrowOutline);
    };
    const getCutoutBounds = (targetBounds, targetElement) => {
        let cutoutTop = targetBounds.top;
        let cutoutLeft = targetBounds.left;
        let cutoutWidth = targetBounds.width;
        let cutoutHeight = targetBounds.height;
        if (targetContent.sansQuery) { // TO DO - take care of cases when sansElement is not to the left or below
            const sansElement = document.querySelector(targetContent.sansQuery);
            const sansBounds = sansElement.getBoundingClientRect();
            const tempBounds = {
                top: cutoutTop,
                bottom: cutoutTop + cutoutHeight,
                left: cutoutLeft,
                right: cutoutLeft + cutoutWidth,
                width: cutoutWidth,
                height: cutoutHeight
            };
            // check that cutout intersects with sansElement
            if (collision(tempBounds, sansBounds)) {
                if (targetContent.sansLocation === 2 /* pxt.tour.BubbleLocation.Left */) {
                    cutoutLeft = targetBounds.left + sansBounds.width;
                    cutoutWidth = targetBounds.width - sansBounds.width;
                }
                else if (targetContent.sansLocation === 1 /* pxt.tour.BubbleLocation.Below */) {
                    cutoutHeight = targetBounds.height - sansBounds.height;
                    if (tempBounds.bottom > window.innerHeight) {
                        cutoutHeight -= tempBounds.bottom - window.innerHeight;
                    }
                }
            }
        }
        // make cutout bigger if no padding and not centered
        if (targetContent.location !== 4 /* pxt.tour.BubbleLocation.Center */) {
            const paddingTop = parseFloat(window.getComputedStyle(targetElement).paddingTop);
            const paddingRight = parseFloat(window.getComputedStyle(targetElement).paddingRight);
            const paddingBottom = parseFloat(window.getComputedStyle(targetElement).paddingBottom);
            const paddingLeft = parseFloat(window.getComputedStyle(targetElement).paddingLeft);
            if (paddingTop < margin) {
                cutoutTop -= margin + paddingTop;
                cutoutHeight += margin - paddingTop;
            }
            if (paddingBottom < margin) {
                cutoutHeight += margin - paddingBottom;
            }
            if (paddingLeft < margin) {
                cutoutLeft -= margin + paddingLeft;
                cutoutWidth += margin - paddingLeft;
            }
            if (paddingRight < margin) {
                cutoutWidth += margin - paddingRight;
            }
        }
        const cutoutRight = cutoutLeft + cutoutWidth;
        const cutoutBottom = cutoutTop + cutoutHeight;
        const cutoutBounds = {
            top: cutoutTop,
            bottom: cutoutBottom,
            left: cutoutLeft,
            right: cutoutRight,
            width: cutoutWidth,
            height: cutoutHeight
        };
        return cutoutBounds;
    };
    const setCutout = (cutoutBounds) => {
        const cutout = document.querySelector(".teaching-bubble-cutout");
        cutout.style.top = `${cutoutBounds.top}px`;
        cutout.style.height = `${cutoutBounds.height}px`;
        cutout.style.left = `${cutoutBounds.left}px`;
        cutout.style.width = `${cutoutBounds.width}px`;
        if (activeTarget) {
            cutout.style.pointerEvents = "none";
        }
    };
    const resetTryFit = () => {
        tryFit.above = false;
        tryFit.below = false;
        tryFit.left = false;
        tryFit.right = false;
    };
    const setPosition = (cutoutBounds, bubble, bubbleBounds, bubbleArrow, bubbleArrowOutline) => {
        bubbleArrowOutline.style.opacity = "1";
        bubbleArrow.style.opacity = "1";
        resetTryFit();
        const transparentBorder = `${margin}px solid transparent`;
        const opaqueBorder = `${margin}px solid`;
        const transparentOutline = `${margin + outlineOffset}px solid transparent`;
        const opaqueOutline = `${margin + outlineOffset}px solid`;
        const positionAbove = () => {
            const top = cutoutBounds.top - bubbleBounds.height - margin;
            const left = cutoutBounds.left - (bubbleBounds.width - cutoutBounds.width) / 2;
            tryFit.above = true;
            if (!updatedBubblePosition(top, left))
                return;
            const arrowTop = top + bubbleBounds.height;
            const arrowLeft = cutoutBounds.left + (cutoutBounds.width - margin) / 2;
            bubbleArrow.style.borderLeft = transparentBorder;
            bubbleArrow.style.borderRight = transparentBorder;
            bubbleArrow.style.borderTop = opaqueBorder;
            updatePosition(bubbleArrow, arrowTop, arrowLeft);
            bubbleArrowOutline.style.borderLeft = transparentOutline;
            bubbleArrowOutline.style.borderRight = transparentOutline;
            bubbleArrowOutline.style.borderTop = opaqueOutline;
            updatePosition(bubbleArrowOutline, arrowTop, arrowLeft - outlineOffset);
        };
        const positionBelow = () => {
            const top = cutoutBounds.bottom + margin;
            const left = cutoutBounds.left - (bubbleBounds.width - cutoutBounds.width) / 2;
            tryFit.below = true;
            if (!updatedBubblePosition(top, left))
                return;
            const arrowTop = top - margin;
            const arrowLeft = cutoutBounds.left + (cutoutBounds.width - margin) / 2;
            bubbleArrow.style.borderLeft = transparentBorder;
            bubbleArrow.style.borderRight = transparentBorder;
            bubbleArrow.style.borderBottom = opaqueBorder;
            updatePosition(bubbleArrow, arrowTop, arrowLeft);
            bubbleArrowOutline.style.borderLeft = transparentOutline;
            bubbleArrowOutline.style.borderRight = transparentOutline;
            bubbleArrowOutline.style.borderBottom = opaqueOutline;
            updatePosition(bubbleArrowOutline, arrowTop - outlineOffset, arrowLeft - outlineOffset);
        };
        const positionLeft = () => {
            const top = cutoutBounds.top - (bubbleBounds.height - cutoutBounds.height) / 2;
            const left = cutoutBounds.left - bubbleBounds.width - margin;
            tryFit.left = true;
            if (!updatedBubblePosition(top, left))
                return;
            const arrowTop = top + (bubbleBounds.height - margin) / 2;
            const arrowLeft = cutoutBounds.left - margin;
            bubbleArrow.style.borderLeft = opaqueBorder;
            bubbleArrow.style.borderTop = transparentBorder;
            bubbleArrow.style.borderBottom = transparentBorder;
            updatePosition(bubbleArrow, arrowTop, arrowLeft);
            bubbleArrowOutline.style.borderLeft = opaqueOutline;
            bubbleArrowOutline.style.borderTop = transparentOutline;
            bubbleArrowOutline.style.borderBottom = transparentOutline;
            updatePosition(bubbleArrowOutline, arrowTop - outlineOffset, arrowLeft);
        };
        const positionRight = () => {
            const top = cutoutBounds.top - (bubbleBounds.height - cutoutBounds.height) / 2;
            const left = cutoutBounds.right + margin;
            tryFit.right = true;
            if (!updatedBubblePosition(top, left))
                return;
            const arrowTop = top + (bubbleBounds.height - margin) / 2;
            const arrowLeft = cutoutBounds.right;
            bubbleArrow.style.borderRight = opaqueBorder;
            bubbleArrow.style.borderTop = transparentBorder;
            bubbleArrow.style.borderBottom = transparentBorder;
            updatePosition(bubbleArrow, arrowTop, arrowLeft);
            bubbleArrowOutline.style.borderRight = opaqueOutline;
            bubbleArrowOutline.style.borderTop = transparentOutline;
            bubbleArrowOutline.style.borderBottom = transparentOutline;
            updatePosition(bubbleArrowOutline, arrowTop - outlineOffset, arrowLeft - outlineOffset);
        };
        const positionCenter = () => {
            const top = (cutoutBounds.height - bubbleBounds.height) / 2 + cutoutBounds.top;
            const left = (cutoutBounds.width - bubbleBounds.width) / 2 + cutoutBounds.left;
            updatedBubblePosition(top, left);
            // update arrow position to be centered and then transparent to improve animation appearance
            updatePosition(bubbleArrow, top + bubbleBounds.height / 2, left + bubbleBounds.width / 2);
            updatePosition(bubbleArrowOutline, top + bubbleBounds.height / 2, left + bubbleBounds.width / 2);
            bubbleArrowOutline.style.opacity = "0";
            bubbleArrow.style.opacity = "0";
        };
        const updatedBubblePosition = (top, left) => {
            const [adjTop, adjLeft] = bubbleFits(cutoutBounds, bubbleBounds, top, left);
            if (adjTop && adjLeft) {
                updatePosition(bubble, adjTop, adjLeft);
            }
            else {
                reposition();
                return false;
            }
            return true;
        };
        const reposition = () => {
            if (!tryFit.above) {
                positionAbove();
            }
            else if (!tryFit.below) {
                positionBelow();
            }
            else if (!tryFit.left) {
                positionLeft();
            }
            else if (!tryFit.right) {
                positionRight();
            }
            else {
                positionCenterScreen(bubble, bubbleBounds);
            }
        };
        switch (targetContent.location) {
            case 0 /* pxt.tour.BubbleLocation.Above */:
                positionAbove();
                break;
            case 1 /* pxt.tour.BubbleLocation.Below */:
                positionBelow();
                break;
            case 2 /* pxt.tour.BubbleLocation.Left */:
                positionLeft();
                break;
            case 3 /* pxt.tour.BubbleLocation.Right */:
                positionRight();
                break;
            default:
                positionCenter();
        }
    };
    const bubbleFits = (cutoutBounds, bubbleBounds, top, left) => {
        if (top < margin)
            top = margin;
        if (left < margin)
            left = margin;
        const right = left + bubbleBounds.width;
        const bottom = top + bubbleBounds.height;
        if (right < window.innerWidth - margin && bottom < window.innerHeight - margin)
            return [top, left];
        if (right > window.innerWidth) {
            left -= right - window.innerWidth + margin;
        }
        if (bottom > window.innerHeight) {
            top -= bottom - window.innerHeight + margin;
        }
        if (collision(cutoutBounds, bubbleBounds, top, left))
            return [null, null];
        return [top, left];
    };
    const collision = (cutoutBounds, bubbleBounds, top, left) => {
        const hCheck1 = (left !== null && left !== void 0 ? left : bubbleBounds.left) < cutoutBounds.left + cutoutBounds.width;
        const hCheck2 = (left !== null && left !== void 0 ? left : bubbleBounds.left) + bubbleBounds.width > cutoutBounds.left;
        const vCheck1 = (top !== null && top !== void 0 ? top : bubbleBounds.top) < cutoutBounds.top + cutoutBounds.height;
        const vCheck2 = (top !== null && top !== void 0 ? top : bubbleBounds.top) + bubbleBounds.height > cutoutBounds.top;
        return hCheck1 && hCheck2 && vCheck1 && vCheck2;
    };
    const positionCenterScreen = (bubble, bubbleBounds) => {
        updatePosition(bubble, (window.innerHeight - bubbleBounds.height) / 2, (window.innerWidth - bubbleBounds.width) / 2);
    };
    const updatePosition = (element, top, left) => {
        if (top < margin)
            top = margin;
        if (left < margin)
            left = margin;
        element.style.top = top + "px";
        element.style.left = left + "px";
    };
    const hasSteps = totalSteps > 1;
    const closeLabel = lf("Close");
    const backLabel = lf("Back");
    const nextLabel = lf("Next");
    const finishLabel = hasSteps ? lf("Finish") : lf("Got it");
    const classes = (0, util_1.classList)("teaching-bubble-container", className, targetContent.bubbleStyle);
    return ReactDOM.createPortal((0, jsx_runtime_1.jsxs)(FocusTrap_1.FocusTrap, Object.assign({ className: classes, onEscape: onClose }, { children: [props.showConfetti && (0, jsx_runtime_1.jsx)(Confetti_1.Confetti, {}), (0, jsx_runtime_1.jsx)("div", { className: "teaching-bubble-cutout" }), (0, jsx_runtime_1.jsx)("div", { className: "teaching-bubble-arrow" }), (0, jsx_runtime_1.jsx)("div", { className: "teaching-bubble-arrow-outline" }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ id: id, className: "teaching-bubble", role: role || "dialog", "aria-hidden": ariaHidden, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-labelledby": "teaching-bubble-title" }, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { className: "teaching-bubble-close", onClick: onClose, title: closeLabel, ariaLabel: closeLabel, rightIcon: "fas fa-times-circle" }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "teaching-bubble-body" }, { children: [(0, jsx_runtime_1.jsx)("strong", Object.assign({ "aria-live": "polite" }, { children: targetContent.title })), (0, jsx_runtime_1.jsx)("p", Object.assign({ "aria-live": "polite" }, { children: targetContent.description })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: `teaching-bubble-navigation ${!hasSteps ? "no-steps" : ""}` }, { children: [hasSteps && (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: (0, util_1.classList)("teaching-bubble-steps", forceHideSteps && "hidden"), "aria-live": "polite" }, { children: [stepNumber, " of ", totalSteps] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "teaching-bubble-navigation-buttons" }, { children: [hasPrevious && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "tertiary tour-button", onClick: onBack, title: backLabel, ariaLabel: backLabel, label: backLabel }), hasNext && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "tertiary inverted teaching-bubble-button", onClick: onNext, title: nextLabel, ariaLabel: nextLabel, label: nextLabel }), !hasNext && (0, jsx_runtime_1.jsx)(Button_1.Button, { className: "tertiary inverted teaching-bubble-button", onClick: onFinish, title: finishLabel, ariaLabel: finishLabel, label: finishLabel })] }))] }))] })), footer && (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "teaching-bubble-footer" }, { children: footer }))] }))] })), parentElement || document.getElementById("root") || document.body);
};
exports.TeachingBubble = TeachingBubble;
