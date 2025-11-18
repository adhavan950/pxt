"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputBubble = void 0;
const bubble_js_1 = require("./bubble.js");
const Blockly = require("blockly");
var dom = Blockly.utils.dom;
var browserEvents = Blockly.browserEvents;
/**
 * A bubble that displays editable text. It can also be resized by the user.
 * Used by the comment icon.
 */
class TextInputBubble extends bubble_js_1.Bubble {
    /**
     * @param workspace The workspace this bubble belongs to.
     * @param anchor The anchor location of the thing this bubble is attached to.
     *     The tail of the bubble will point to this location.
     * @param ownerRect An optional rect we don't want the bubble to overlap with
     *     when automatically positioning.
     */
    constructor(workspace, anchor, ownerRect, readOnly) {
        super(workspace, anchor, ownerRect, TextInputBubble.createTextArea());
        this.workspace = workspace;
        this.anchor = anchor;
        this.ownerRect = ownerRect;
        this.readOnly = readOnly;
        /**
         * Event data associated with the listener for pointer up events on the
         * resize group.
         */
        this.resizePointerUpListener = null;
        /**
         * Event data associated with the listener for pointer move events on the
         * resize group.
         */
        this.resizePointerMoveListener = null;
        /** Functions listening for changes to the text of this bubble. */
        this.textChangeListeners = [];
        /** Functions listening for changes to the size of this bubble. */
        this.sizeChangeListeners = [];
        /** Functions listening for changes to the position of this bubble. */
        this.positionChangeListeners = [];
        /** The text of this bubble. */
        this.text = '';
        /** The default size of this bubble, including borders. */
        this.DEFAULT_SIZE = new Blockly.utils.Size(160 + bubble_js_1.Bubble.DOUBLE_BORDER, 80 + bubble_js_1.Bubble.DOUBLE_BORDER);
        /** The minimum size of this bubble, including borders. */
        this.MIN_SIZE = new Blockly.utils.Size(45 + bubble_js_1.Bubble.DOUBLE_BORDER, 20 + bubble_js_1.Bubble.DOUBLE_BORDER);
        dom.addClass(this.svgRoot, 'blocklyTextInputBubble');
        this.textArea = this.getFocusableElement();
        this.inputRoot = this.createEditor(this.contentContainer, this.textArea);
        this.resizeGroup = this.createResizeHandle(this.svgRoot, workspace);
        this.setSize(this.DEFAULT_SIZE, true);
        if (readOnly) {
            this.deleteIcon.style.display = "none";
        }
        browserEvents.conditionalBind(this.textArea, 'keydown', this, this.onKeyDown);
    }
    /** @returns the text of this bubble. */
    getText() {
        return this.text;
    }
    moveTo(x, y) {
        super.moveTo(x, y);
        this.onPositionChange();
    }
    /** Sets the text of this bubble. Calls change listeners. */
    setText(text) {
        this.text = text;
        this.textArea.value = text;
        this.onTextChange();
    }
    /** Adds a change listener to be notified when this bubble's text changes. */
    addTextChangeListener(listener) {
        this.textChangeListeners.push(listener);
    }
    /** Adds a change listener to be notified when this bubble's size changes. */
    addSizeChangeListener(listener) {
        this.sizeChangeListeners.push(listener);
    }
    addPositionChangeListener(listener) {
        this.positionChangeListeners.push(listener);
    }
    static createTextArea() {
        const textArea = document.createElementNS(dom.HTML_NS, 'textarea');
        textArea.className = 'blocklyTextarea blocklyText';
        return textArea;
    }
    /** Creates and returns the UI container element for this bubble's editor. */
    createEditor(container, textArea) {
        const inputRoot = dom.createSvgElement(Blockly.utils.Svg.FOREIGNOBJECT, {
            'x': bubble_js_1.Bubble.BORDER_WIDTH,
            'y': this.contentTop(),
        }, container);
        // in safari and firefox, contentTop will return the incorrect
        // height for the topbar unless the rect is already in the dom.
        // this settimeout will run after the render is complete.
        setTimeout(() => {
            inputRoot.setAttribute("y", this.contentTop() + "");
        });
        const body = document.createElementNS(dom.HTML_NS, 'body');
        body.setAttribute('xmlns', dom.HTML_NS);
        body.className = 'blocklyMinimalBody';
        textArea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');
        body.appendChild(textArea);
        inputRoot.appendChild(body);
        this.bindTextAreaEvents(textArea);
        return inputRoot;
    }
    /** Binds events to the text area element. */
    bindTextAreaEvents(textArea) {
        // Don't zoom with mousewheel.
        browserEvents.conditionalBind(textArea, 'wheel', this, (e) => {
            e.stopPropagation();
        });
        // Don't let the pointerdown event get to the workspace.
        browserEvents.conditionalBind(textArea, 'pointerdown', this, (e) => {
            e.stopPropagation();
            Blockly.Touch.clearTouchIdentifier();
        });
        browserEvents.conditionalBind(textArea, 'change', this, this.onTextChange);
    }
    /** Creates the resize handler elements and binds events to them. */
    createResizeHandle(container, workspace) {
        const resizeHandle = dom.createSvgElement(Blockly.utils.Svg.IMAGE, {
            'class': 'blocklyResizeHandle',
            'href': `${workspace.options.pathToMedia}resize-handle.svg`,
        }, container);
        browserEvents.conditionalBind(resizeHandle, 'pointerdown', this, this.onResizePointerDown);
        return resizeHandle;
    }
    /**
     * Sets the size of this bubble, including the border.
     *
     * @param size Sets the size of this bubble, including the border.
     * @param relayout If true, reposition the bubble from scratch so that it is
     *     optimally visible. If false, reposition it so it maintains the same
     *     position relative to the anchor.
     */
    setSize(size, relayout = false) {
        size.width = Math.max(size.width, this.MIN_SIZE.width);
        size.height = Math.max(size.height, this.MIN_SIZE.height + this.contentTop());
        const widthMinusBorder = size.width - bubble_js_1.Bubble.DOUBLE_BORDER;
        const heightMinusBorder = size.height - this.contentTop() - bubble_js_1.Bubble.BORDER_WIDTH;
        this.inputRoot.setAttribute('width', `${widthMinusBorder}`);
        this.inputRoot.setAttribute('height', `${heightMinusBorder}`);
        this.textArea.style.width = `100%`;
        this.textArea.style.height = `100%`;
        const resizeSize = this.resizeGroup.getBBox();
        if (this.workspace.RTL) {
            this.resizeGroup.setAttribute('transform', `translate(${bubble_js_1.Bubble.BORDER_WIDTH}, ${size.height - bubble_js_1.Bubble.BORDER_WIDTH - resizeSize.height}) scale(-1 1)`);
        }
        else {
            this.resizeGroup.setAttribute('transform', `translate(${widthMinusBorder - resizeSize.width}, ${size.height - bubble_js_1.Bubble.BORDER_WIDTH - resizeSize.height})`);
        }
        super.setSize(size, relayout);
        this.onSizeChange();
    }
    /** @returns the size of this bubble. */
    getSize() {
        // Overriden to be public.
        return super.getSize();
    }
    isDeletable() {
        return !this.readOnly;
    }
    /** Handles mouse down events on the resize target. */
    onResizePointerDown(e) {
        this.bringToFront();
        if (browserEvents.isRightButton(e)) {
            e.stopPropagation();
            return;
        }
        this.workspace.startDrag(e, new Blockly.utils.Coordinate(this.workspace.RTL ? -this.getSize().width : this.getSize().width, this.getSize().height));
        this.resizePointerUpListener = browserEvents.conditionalBind(document, 'pointerup', this, this.onResizePointerUp);
        this.resizePointerMoveListener = browserEvents.conditionalBind(document, 'pointermove', this, this.onResizePointerMove);
        this.workspace.hideChaff();
        // This event has been handled.  No need to bubble up to the document.
        e.stopPropagation();
    }
    /** Handles pointer up events on the resize target. */
    onResizePointerUp(_e) {
        Blockly.Touch.clearTouchIdentifier();
        if (this.resizePointerUpListener) {
            browserEvents.unbind(this.resizePointerUpListener);
            this.resizePointerUpListener = null;
        }
        if (this.resizePointerMoveListener) {
            browserEvents.unbind(this.resizePointerMoveListener);
            this.resizePointerMoveListener = null;
        }
    }
    /** Handles pointer move events on the resize target. */
    onResizePointerMove(e) {
        const delta = this.workspace.moveDrag(e);
        this.setSize(new Blockly.utils.Size(this.workspace.RTL ? -delta.x : delta.x, delta.y), false);
        this.onSizeChange();
    }
    /** Handles a text change event for the text area. Calls event listeners. */
    onTextChange() {
        this.text = this.textArea.value;
        for (const listener of this.textChangeListeners) {
            listener();
        }
    }
    /** Handles a size change event for the text area. Calls event listeners. */
    onSizeChange() {
        for (const listener of this.sizeChangeListeners) {
            listener();
        }
    }
    /** Handles a position change event for the text area. Calls event listeners. */
    onPositionChange() {
        for (const listener of this.positionChangeListeners) {
            listener();
        }
    }
    onKeyDown(e) {
        if (e.key === 'Escape') {
            this.collapseHandler();
            e.stopPropagation();
        }
    }
}
exports.TextInputBubble = TextInputBubble;
Blockly.Css.register(`
.blocklyTextInputBubble .blocklyTextarea {
  background-color: var(--commentFillColour);
  border: 0;
  display: block;
  margin: 0;
  outline: 0;
  padding: 3px;
  resize: none;
  text-overflow: hidden;
}
`);
