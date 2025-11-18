"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentIcon = void 0;
const Blockly = require("blockly");
const textinput_bubble_1 = require("./textinput_bubble");
const fields_1 = require("../../fields");
const eventUtils = Blockly.Events;
/** The size of the comment icon in workspace-scale units. */
const SIZE = 17;
/** The default width in workspace-scale units of the text input bubble. */
const DEFAULT_BUBBLE_WIDTH = 160;
/** The default height in workspace-scale units of the text input bubble. */
const DEFAULT_BUBBLE_HEIGHT = 80;
// makecode fields generated from functions always use valid JavaScript
// identifiers for their names. starting the name with a ~ prevents us
// from colliding with those fields
const COMMENT_OFFSET_X_FIELD_NAME = "~commentOffsetX";
const COMMENT_OFFSET_Y_FIELD_NAME = "~commentOffsetY";
/**
 * An icon which allows the user to add comment text to a block.
 */
class CommentIcon extends Blockly.icons.Icon {
    constructor(sourceBlock) {
        super(sourceBlock);
        this.sourceBlock = sourceBlock;
        /** The bubble used to show editable text to the user. */
        this.textInputBubble = null;
        /** The text of this comment. */
        this.text = '';
        /** The size of this comment (which is applied to the editable bubble). */
        this.bubbleSize = new Blockly.utils.Size(DEFAULT_BUBBLE_WIDTH, DEFAULT_BUBBLE_HEIGHT);
        /**
         * The visibility of the bubble for this comment.
         *
         * This is used to track what the visibile state /should/ be, not necessarily
         * what it currently /is/. E.g. sometimes this will be true, but the block
         * hasn't been rendered yet, so the bubble will not currently be visible.
         */
        this.bubbleVisiblity = false;
    }
    getType() {
        return CommentIcon.TYPE;
    }
    initView(pointerdownListener) {
        if (this.svgRoot)
            return; // Already initialized.
        super.initView(pointerdownListener);
        Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.PATH, {
            'class': 'blocklyIconShape',
            'd': 'm 2,2 0,9.2211 3.0026599,0 1.6008929,1.5989 1.8138195,-1.5989 6.6046683,0 0,-9.2211 -13.0220406,0 z',
            'style': 'fill: #fff;'
        }, this.svgRoot);
        Blockly.utils.dom.createSvgElement('rect', {
            'class': 'blocklyIconSymbol',
            'x': '4',
            'y': '8',
            'height': '1',
            'width': '6',
            'style': 'fill: #575E75;'
        }, this.svgRoot);
        // Dot of question mark.
        Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.RECT, {
            'class': 'blocklyIconSymbol',
            'x': '4',
            'y': '6',
            'height': '1',
            'width': '6',
            'style': 'fill: #575E75;'
        }, this.svgRoot);
        Blockly.utils.dom.createSvgElement('rect', {
            'class': 'blocklyIconSymbol',
            'x': '4',
            'y': '4',
            'height': '1',
            'width': '8',
            'style': 'fill: #575E75;'
        }, this.svgRoot);
        Blockly.utils.dom.addClass(this.svgRoot, 'blockly-icon-comment');
    }
    dispose() {
        var _a;
        super.dispose();
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    getWeight() {
        return CommentIcon.WEIGHT;
    }
    getSize() {
        return new Blockly.utils.Size(SIZE, SIZE);
    }
    applyColour() {
        var _a;
        super.applyColour();
        const colour = this.sourceBlock.style.colourPrimary;
        const borderColour = this.sourceBlock.style.colourTertiary;
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.setColour(colour, borderColour);
    }
    /**
     * Updates the state of the bubble (editable / noneditable) to reflect the
     * state of the bubble if the bubble is currently shown.
     */
    async updateEditable() {
        super.updateEditable();
        if (this.bubbleIsVisible()) {
            // Close and reopen the bubble to display the correct UI.
            await this.setBubbleVisible(false);
            await this.setBubbleVisible(true);
        }
    }
    onLocationChange(blockOrigin) {
        var _a;
        super.onLocationChange(blockOrigin);
        const anchorLocation = this.getAnchorLocation();
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.setAnchorLocation(anchorLocation);
    }
    /** Sets the text of this comment. Updates any bubbles if they are visible. */
    setText(text) {
        // Blockly comments are omitted from XML serialization if they're empty.
        // In that case, they won't be present in the saved XML but any comment offset
        // data that was previously saved will be since it's a part of the block's
        // serialized data and not the comment's. In order to prevent that orphaned save
        // data from persisting, we need to clear it when the user creates a new comment.
        var _a;
        // If setText is called with the empty string while our text is already the
        // empty string, that means that this comment is newly created and we can safely
        // clear any pre-existing saved offset data.
        if (!this.text && !text) {
            this.clearSavedOffsetData();
        }
        const oldText = this.text;
        eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(this.sourceBlock, 'comment', null, oldText, text));
        this.text = text;
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.setText(this.text);
    }
    /** Returns the text of this comment. */
    getText() {
        return this.text;
    }
    /**
     * Sets the size of the editable bubble for this comment. Resizes the
     * bubble if it is visible.
     */
    setBubbleSize(size) {
        var _a;
        this.bubbleSize = size;
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.setSize(this.bubbleSize, true);
    }
    /** @returns the size of the editable bubble for this comment. */
    getBubbleSize() {
        return this.bubbleSize;
    }
    /**
     * @returns the state of the comment as a JSON serializable value if the
     * comment has text. Otherwise returns null.
     */
    saveState() {
        if (this.text) {
            return {
                'text': this.text,
                'pinned': this.bubbleIsVisible(),
                'height': this.bubbleSize.height,
                'width': this.bubbleSize.width,
            };
        }
        return null;
    }
    /** Applies the given state to this comment. */
    loadState(state) {
        var _a, _b, _c, _d;
        this.text = (_a = state['text']) !== null && _a !== void 0 ? _a : '';
        this.bubbleSize = new Blockly.utils.Size((_b = state['width']) !== null && _b !== void 0 ? _b : DEFAULT_BUBBLE_WIDTH, (_c = state['height']) !== null && _c !== void 0 ? _c : DEFAULT_BUBBLE_HEIGHT);
        this.bubbleVisiblity = (_d = state['pinned']) !== null && _d !== void 0 ? _d : false;
        this.setBubbleVisible(this.bubbleVisiblity);
    }
    // TODO: switch our custom comment position serialization
    // to use setBubbleLocation and getBubbleLocation instead
    setBubbleLocation(location) {
    }
    // TODO: switch our custom comment position serialization
    // to use setBubbleLocation and getBubbleLocation instead
    getBubbleLocation() {
        var _a;
        if (this.bubbleIsVisible()) {
            return (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.getRelativeToSurfaceXY();
        }
        return undefined;
    }
    onClick() {
        super.onClick();
        this.setBubbleVisible(!this.bubbleIsVisible());
    }
    isClickableInFlyout() {
        return false;
    }
    /**
     * Updates the text of this comment in response to changes in the text of
     * the input bubble.
     */
    onTextChange() {
        if (!this.textInputBubble)
            return;
        const newText = this.textInputBubble.getText();
        if (this.text === newText)
            return;
        eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(this.sourceBlock, 'comment', null, this.text, newText));
        this.text = newText;
    }
    /**
     * Updates the size of this icon in response to changes in the size of the
     * input bubble.
     */
    onSizeChange() {
        if (this.textInputBubble) {
            this.bubbleSize = this.textInputBubble.getSize();
        }
    }
    onPositionChange() {
        if (this.textInputBubble) {
            const coord = this.textInputBubble.getPositionRelativeToAnchor();
            (0, fields_1.setBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_X_FIELD_NAME, coord.x + "");
            (0, fields_1.setBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_Y_FIELD_NAME, coord.y + "");
        }
    }
    bubbleIsVisible() {
        return this.bubbleVisiblity;
    }
    async setBubbleVisible(visible) {
        if (this.bubbleVisiblity === visible)
            return;
        if (visible && this.textInputBubble)
            return;
        if (!visible && !this.textInputBubble)
            return;
        this.bubbleVisiblity = visible;
        if (!this.sourceBlock.rendered || this.sourceBlock.isInFlyout || this.sourceBlock.isInsertionMarker())
            return;
        await Blockly.renderManagement.finishQueuedRenders();
        if (!this.sourceBlock.rendered || this.sourceBlock.isInFlyout || this.sourceBlock.isInsertionMarker())
            return;
        if (visible) {
            if (this.sourceBlock.isEditable()) {
                this.showEditableBubble();
            }
            else {
                this.showNonEditableBubble();
            }
            this.applyColour();
        }
        else {
            this.hideBubble();
        }
        if (this.sourceBlock.isEditable()) {
            eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(this.sourceBlock, visible, 'comment'));
        }
    }
    getBubble() {
        return this.textInputBubble;
    }
    /**
     * Shows the editable text bubble for this comment, and adds change listeners
     * to update the state of this icon in response to changes in the bubble.
     */
    showEditableBubble() {
        const savedPosition = this.getSavedOffsetData();
        this.textInputBubble = new textinput_bubble_1.TextInputBubble(this.sourceBlock.workspace, this.getAnchorLocation(), this.getBubbleOwnerRect());
        this.textInputBubble.setText(this.getText());
        this.textInputBubble.setSize(this.bubbleSize, true);
        this.textInputBubble.addTextChangeListener(() => this.onTextChange());
        this.textInputBubble.addSizeChangeListener(() => this.onSizeChange());
        this.textInputBubble.addPositionChangeListener(() => this.onPositionChange());
        this.textInputBubble.setDeleteHandler(() => {
            this.setBubbleVisible(false);
            this.sourceBlock.setCommentText(null);
            this.clearSavedOffsetData();
        });
        this.textInputBubble.setCollapseHandler(() => {
            this.setBubbleVisible(false);
        });
        if (savedPosition) {
            this.textInputBubble.setPositionRelativeToAnchor(savedPosition.x, savedPosition.y);
        }
        Blockly.getFocusManager().focusNode(this.textInputBubble);
    }
    /** Shows the non editable text bubble for this comment. */
    showNonEditableBubble() {
        const savedPosition = this.getSavedOffsetData();
        this.textInputBubble = new textinput_bubble_1.TextInputBubble(this.sourceBlock.workspace, this.getAnchorLocation(), this.getBubbleOwnerRect(), true);
        this.textInputBubble.setText(this.getText());
        this.textInputBubble.setSize(this.bubbleSize, true);
        this.textInputBubble.setCollapseHandler(() => {
            this.setBubbleVisible(false);
        });
        if (savedPosition) {
            this.textInputBubble.setPositionRelativeToAnchor(savedPosition.x, savedPosition.y);
        }
        Blockly.getFocusManager().focusNode(this.textInputBubble);
    }
    /** Hides any open bubbles owned by this comment. */
    hideBubble() {
        var _a;
        (_a = this.textInputBubble) === null || _a === void 0 ? void 0 : _a.dispose();
        this.textInputBubble = null;
        Blockly.getFocusManager().focusNode(this.getSourceBlock());
    }
    /**
     * @returns the location the bubble should be anchored to.
     *     I.E. the middle of this icon.
     */
    getAnchorLocation() {
        const midIcon = SIZE / 2;
        return Blockly.utils.Coordinate.sum(this.workspaceLocation, new Blockly.utils.Coordinate(midIcon, midIcon));
    }
    /**
     * @returns the rect the bubble should avoid overlapping.
     *     I.E. the block that owns this icon.
     */
    getBubbleOwnerRect() {
        const bbox = this.sourceBlock.getSvgRoot().getBBox();
        return new Blockly.utils.Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
    }
    getSavedOffsetData() {
        const offsetX = (0, fields_1.getBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_X_FIELD_NAME);
        const offsetY = (0, fields_1.getBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_Y_FIELD_NAME);
        if (offsetX && offsetY) {
            return new Blockly.utils.Coordinate(parseFloat(offsetX), parseFloat(offsetY));
        }
        return new Blockly.utils.Coordinate(16, 16);
    }
    clearSavedOffsetData() {
        (0, fields_1.deleteBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_X_FIELD_NAME);
        (0, fields_1.deleteBlockDataForField)(this.sourceBlock, COMMENT_OFFSET_Y_FIELD_NAME);
    }
}
exports.CommentIcon = CommentIcon;
/** The type string used to identify this icon. */
CommentIcon.TYPE = Blockly.icons.IconType.COMMENT;
/**
 * The weight this icon has relative to other icons. Icons with more positive
 * weight values are rendered farther toward the end of the block.
 */
CommentIcon.WEIGHT = 3;
Blockly.icons.registry.unregister(CommentIcon.TYPE.toString());
Blockly.icons.registry.register(CommentIcon.TYPE, CommentIcon);
