"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldImageDropdown = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
const field_dropdowngrid_1 = require("./field_dropdowngrid");
class FieldImageDropdown extends field_dropdowngrid_1.FieldDropdownGrid {
    constructor(text, options, validator) {
        super(options.data);
        this.buttonClickAndClose_ = (value) => {
            if (!value)
                return;
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        this.columns_ = parseInt(options.columns);
        this.maxRows_ = parseInt(options.maxRows) || 0;
        this.width_ = parseInt(options.width) || 300;
        this.backgroundColour_ = (0, field_utils_1.parseColour)(options.colour);
        this.borderColour_ = pxt.toolbox.fadeColor(this.backgroundColour_, 0.4, false);
    }
    setFocusedItem_(gridItemContainer) {
        this.gridItems.forEach(button => button.setAttribute('class', 'blocklyDropDownButton'));
        const activeButton = this.gridItems[this.activeDescendantIndex];
        const activeButtonContainer = activeButton.parentElement;
        activeButton.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonFocus');
        const activeButtonRect = activeButtonContainer.getBoundingClientRect();
        // Has to be the parent element as the gridItems in the gridItemContainer are all floated.
        const containerRect = gridItemContainer.parentElement.getBoundingClientRect();
        if (activeButtonRect.bottom > containerRect.bottom) {
            activeButtonContainer.scrollIntoView({ block: "end" });
        }
        else if (activeButtonRect.top < containerRect.top) {
            activeButtonContainer.scrollIntoView({ block: "start" });
        }
    }
    createRow() {
        const row = document.createElement('div');
        row.setAttribute('role', 'row');
        return row;
    }
    /**
     * Create a dropdown menu under the text.
     * @private
     */
    showEditor_(e) {
        this.setOpeningPointerCoords(e);
        // If there is an existing drop-down we own, this is a request to hide the drop-down.
        if (Blockly.DropDownDiv.hideIfOwner(this)) {
            return;
        }
        // If there is an existing drop-down someone else owns, hide it immediately and clear it.
        Blockly.DropDownDiv.hideWithoutAnimation();
        (0, field_utils_1.clearDropDownDiv)();
        // Populate the drop-down with the icons for this field.
        let dropdownDiv = Blockly.DropDownDiv.getContentDiv();
        let contentDiv = document.createElement('div');
        // Accessibility properties
        contentDiv.setAttribute('role', 'grid');
        contentDiv.setAttribute('tabindex', '0');
        contentDiv.classList.add("blocklyMenu", "blocklyDropdownMenu");
        this.addPointerListener(dropdownDiv);
        this.addKeyDownHandler(contentDiv);
        const rows = [];
        let currentRow = {
            height: 0,
            width: 0,
            items: [],
        };
        const BUTTON_MARGIN = 8;
        const options = this.getOptions();
        const columnButtonSize = this.columns_ ? ((this.width_ / this.columns_) - BUTTON_MARGIN) : 0;
        // do a first pass to calculate the rows
        for (let i = 0; i < options.length; i++) {
            const content = options[i][0];
            let buttonWidth = content.width;
            let buttonHeight = content.height;
            if (content.type != "placeholder" && this.columns_) {
                buttonWidth = columnButtonSize;
                buttonHeight = columnButtonSize;
            }
            if (currentRow.height && (currentRow.width + buttonWidth + BUTTON_MARGIN > this.width_)) {
                rows.push(currentRow);
                currentRow = {
                    width: buttonWidth + BUTTON_MARGIN,
                    height: buttonHeight + BUTTON_MARGIN,
                    items: [options[i]]
                };
            }
            else {
                currentRow.width += buttonWidth + BUTTON_MARGIN;
                currentRow.height = Math.max(currentRow.height, buttonHeight + BUTTON_MARGIN);
                currentRow.items.push(options[i]);
            }
        }
        rows.push(currentRow);
        let selectedButtonContainer;
        let descendantIndex = 0;
        // now create the actual row elements
        for (const row of rows) {
            const rowDiv = this.createRow();
            rowDiv.style.width = row.width + "px";
            rowDiv.style.height = row.height + "px";
            contentDiv.appendChild(rowDiv);
            for (const option of row.items) {
                const localDescendantIndex = descendantIndex;
                let content = option[0]; // Human-readable text or image.
                const value = option[1]; // Language-neutral value.
                // Icons with the type property placeholder take up space but don't have any functionality
                // Use for special-case layouts
                if (content.type == 'placeholder') {
                    let placeholder = document.createElement('span');
                    placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
                    placeholder.style.width = content.width + 'px';
                    placeholder.style.height = row.height + 'px';
                    rowDiv.appendChild(placeholder);
                    continue;
                }
                const buttonContainer = document.createElement('div');
                buttonContainer.setAttribute('class', 'blocklyDropDownButtonContainer');
                const button = document.createElement('div');
                button.setAttribute('id', ':' + localDescendantIndex); // For aria-activedescendant
                button.setAttribute('role', 'gridcell');
                button.setAttribute('aria-selected', 'false');
                button.classList.add('blocklyDropDownButton');
                button.title = content.alt;
                button.style.width = (columnButtonSize || content.width) + 'px';
                button.style.height = (columnButtonSize || content.height) + 'px';
                let backgroundColor = this.backgroundColour_;
                if (value == this.getValue()) {
                    // This icon is selected, show it in a different colour
                    backgroundColor = this.sourceBlock_.getColourTertiary();
                    button.setAttribute('aria-selected', 'true');
                    this.activeDescendantIndex = localDescendantIndex;
                    contentDiv.setAttribute('aria-activedescendant', button.id);
                    button.setAttribute('class', `blocklyDropDownButton ${this.openingPointerCoords ? "blocklyDropDownButtonHover" : "blocklyDropDownButtonFocus"}`);
                    selectedButtonContainer = buttonContainer;
                }
                button.style.backgroundColor = backgroundColor;
                button.style.borderColor = this.borderColour_;
                Blockly.browserEvents.bind(button, 'click', this, () => this.buttonClickAndClose_(value));
                Blockly.browserEvents.bind(button, 'pointermove', this, () => {
                    if (this.pointerMoveTriggeredByUser()) {
                        this.gridItems.forEach(button => button.setAttribute('class', 'blocklyDropDownButton'));
                        this.activeDescendantIndex = localDescendantIndex;
                        button.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                        contentDiv.setAttribute('aria-activedescendant', button.id);
                    }
                });
                Blockly.browserEvents.bind(button, 'pointerout', this, () => {
                    if (this.pointerOutTriggeredByUser()) {
                        button.setAttribute('class', 'blocklyDropDownButton');
                        contentDiv.removeAttribute('aria-activedescendant');
                        this.activeDescendantIndex = undefined;
                    }
                });
                let buttonImg = document.createElement('img');
                buttonImg.src = content.src;
                //buttonImg.alt = icon.alt;
                // Upon click/touch, we will be able to get the clicked element as e.target
                // Store a data attribute on all possible click targets so we can match it to the icon.
                button.setAttribute('data-value', value);
                buttonImg.setAttribute('data-value', value);
                button.appendChild(buttonImg);
                this.gridItems.push(button);
                buttonContainer.appendChild(button);
                rowDiv.append(buttonContainer);
                descendantIndex++;
            }
        }
        dropdownDiv.appendChild(contentDiv);
        if (this.maxRows_) {
            // Limit the number of rows shown, but add a partial next row to indicate scrolling
            const totalHeight = sumRowHeight(rows);
            let maxHeight = sumRowHeight(rows.slice(0, this.maxRows_));
            if (rows.length > this.maxRows_) {
                maxHeight += 0.4 * (rows[this.maxRows_].height);
            }
            dropdownDiv.style.maxHeight = maxHeight + 'px';
            dropdownDiv.style.height = totalHeight + 'px';
        }
        if (pxt.BrowserUtils.isFirefox()) {
            // This is to compensate for the scrollbar that overlays content in Firefox. It
            // gets removed in onHide_()
            dropdownDiv.style.paddingRight = "20px";
        }
        Blockly.DropDownDiv.setColour(this.backgroundColour_, this.borderColour_);
        Blockly.DropDownDiv.showPositionedByField(this, this.onHide_.bind(this));
        contentDiv.focus();
        if (selectedButtonContainer) {
            selectedButtonContainer.scrollIntoView({ block: "end" });
        }
        let source = this.sourceBlock_;
        this.savedPrimary_ = source === null || source === void 0 ? void 0 : source.getColour();
        if (source === null || source === void 0 ? void 0 : source.isShadow()) {
            source.setColour(source.getColourTertiary());
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', source.getColourTertiary());
        }
    }
    doValueUpdate_(newValue) {
        this.selectedOption_ = undefined;
        super.doValueUpdate_(newValue);
    }
    getFieldDescription() {
        return lf("image");
    }
    /**
     * Callback for when the drop-down is hidden.
     */
    onHide_() {
        this.disposeGrid();
        let content = Blockly.DropDownDiv.getContentDiv();
        content.removeAttribute('role');
        content.removeAttribute('aria-activedescendant');
        content.style.width = '';
        content.style.paddingRight = '';
        content.style.maxHeight = '';
        let source = this.sourceBlock_;
        if (source === null || source === void 0 ? void 0 : source.isShadow()) {
            this.sourceBlock_.setColour(this.savedPrimary_);
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', this.savedPrimary_);
        }
    }
    ;
}
exports.FieldImageDropdown = FieldImageDropdown;
function sumRowHeight(arr) {
    return arr.reduce((accumulator, current) => accumulator + current.height, 0);
}
Blockly.Css.register(`
.blocklyDropDownButtonContainer,
.blocklyDropDownButton {
    display: inline-block;
    float: left;
    border-radius: 4px;
    text-align: center;
    margin: 0;
}

.blocklyDropDownButtonContainer {
    padding: 4px;
}

.blocklyDropDownButton {
    border: 1px solid;
    transition: box-shadow .1s;
    cursor: pointer;
    outline: none;
}

.blocklyDropDownButtonHover {
    box-shadow: 0px 0px 0px 4px rgba(255, 255, 255, 0.2);
}

.blocklyDropDownButtonFocus {
    box-shadow: 0px 0px 0px 4px rgb(255, 255, 255);
}

.blocklyDropDownButton:active {
    box-shadow: 0px 0px 0px 6px rgba(255, 255, 255, 0.2);
}

.blocklyDropDownButton > img {
    width: 80%;
    height: 80%;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
}
`);
