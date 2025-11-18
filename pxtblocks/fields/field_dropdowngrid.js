"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldDropdownGrid = void 0;
const Blockly = require("blockly");
const field_dropdown_1 = require("./field_dropdown");
class FieldDropdownGrid extends field_dropdown_1.FieldDropdown {
    constructor() {
        super(...arguments);
        this.isFieldCustom_ = true;
        this.gridItems = [];
        this.keyDownBinding = null;
        this.pointerMoveBinding = null;
    }
    setFocusedItem(gridItemContainer, e) {
        this.lastUserInputAction = 'keymove';
        this.setFocusedItem_(gridItemContainer);
        gridItemContainer.setAttribute('aria-activedescendant', ":" + this.activeDescendantIndex);
        e.preventDefault();
        e.stopPropagation();
    }
    /**
     * Set openingPointerCoords if the Event is a PointerEvent.
     * @param {Event} e the event that triggered showEditor_
     * @protected
     */
    setOpeningPointerCoords(e) {
        if (!e) {
            return;
        }
        const { pageX, pageY } = e;
        if (pageX !== undefined && pageY !== undefined) {
            this.openingPointerCoords = {
                x: pageX,
                y: pageY
            };
        }
    }
    addKeyDownHandler(gridItemContainer) {
        const nextKey = pxt.Util.isUserLanguageRtl() ? "ArrowLeft" : "ArrowRight";
        const prevKey = pxt.Util.isUserLanguageRtl() ? "ArrowRight" : "ArrowLeft";
        this.keyDownBinding = Blockly.browserEvents.bind(gridItemContainer, 'keydown', this, (e) => {
            if (this.activeDescendantIndex === undefined) {
                if (e.code === 'ArrowDown' || e.code === nextKey || e.code === 'Home') {
                    this.activeDescendantIndex = 0;
                    return this.setFocusedItem(gridItemContainer, e);
                }
                else if (e.code === 'ArrowUp' || e.code === prevKey || e.code === 'End') {
                    this.activeDescendantIndex = this.gridItems.length - 1;
                    return this.setFocusedItem(gridItemContainer, e);
                }
            }
            const ctrlCmd = pxt.BrowserUtils.isMac() ? e.metaKey : e.ctrlKey;
            switch (e.code) {
                case 'ArrowUp':
                    if (this.activeDescendantIndex - this.columns_ >= 0) {
                        this.activeDescendantIndex -= this.columns_;
                    }
                    break;
                case 'ArrowDown':
                    if (this.activeDescendantIndex + this.columns_ < this.gridItems.length) {
                        this.activeDescendantIndex += this.columns_;
                    }
                    break;
                case nextKey:
                    if (this.activeDescendantIndex < this.gridItems.length - 1) {
                        this.activeDescendantIndex++;
                    }
                    break;
                case prevKey:
                    if (this.activeDescendantIndex !== 0) {
                        this.activeDescendantIndex--;
                    }
                    break;
                case "Home": {
                    if (ctrlCmd) {
                        this.activeDescendantIndex = 0;
                    }
                    else {
                        while (this.activeDescendantIndex % this.columns_ !== 0) {
                            this.activeDescendantIndex--;
                        }
                    }
                    break;
                }
                case "End": {
                    if (ctrlCmd) {
                        this.activeDescendantIndex = this.gridItems.length - 1;
                    }
                    else {
                        while (this.activeDescendantIndex % this.columns_ !== this.columns_ - 1 &&
                            this.activeDescendantIndex < this.gridItems.length - 1) {
                            this.activeDescendantIndex++;
                        }
                    }
                    break;
                }
                case "Enter":
                case "Space": {
                    this.buttonClickAndClose_(this.gridItems[this.activeDescendantIndex].getAttribute('data-value'));
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                default: {
                    return;
                }
            }
            this.setFocusedItem(gridItemContainer, e);
        });
    }
    addPointerListener(parentDiv) {
        this.pointerMoveBinding = Blockly.browserEvents.bind(parentDiv, 'pointermove', this, () => {
            this.lastUserInputAction = 'pointermove';
        });
    }
    pointerMoveTriggeredByUser() {
        return this.openingPointerCoords && !this.lastUserInputAction || this.lastUserInputAction === 'pointermove';
    }
    pointerOutTriggeredByUser() {
        return this.lastUserInputAction === 'pointermove';
    }
    disposeGrid() {
        if (this.keyDownBinding) {
            Blockly.browserEvents.unbind(this.keyDownBinding);
        }
        if (this.pointerMoveBinding) {
            Blockly.browserEvents.unbind(this.pointerMoveBinding);
        }
        this.keyDownBinding = null;
        this.pointerMoveBinding = null;
        this.openingPointerCoords = undefined;
        this.lastUserInputAction = undefined;
        this.activeDescendantIndex = undefined;
        this.gridItems = [];
    }
}
exports.FieldDropdownGrid = FieldDropdownGrid;
