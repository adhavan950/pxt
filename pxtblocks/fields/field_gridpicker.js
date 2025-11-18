"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldGridPicker = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
const field_base_1 = require("./field_base");
const field_dropdowngrid_1 = require("./field_dropdowngrid");
class FieldGridPicker extends field_dropdowngrid_1.FieldDropdownGrid {
    constructor(text, options, validator) {
        super(options.data);
        this.tabKeyBind = null;
        /**
         * Callback for when a button is clicked inside the drop-down.
         * Should be bound to the FieldIconMenu.
         * @param {string | null} value the value to set for the field
         * @private
         */
        this.buttonClick_ = (value) => {
            if (value !== null) {
                this.setValue(value);
                // Close the picker
                if (this.closeModal_) {
                    this.close();
                    this.closeModal_ = false;
                }
            }
        };
        this.buttonClickAndClose_ = (value) => {
            this.closeModal_ = true;
            this.buttonClick_(value);
        };
        this.columns_ = parseInt(options.columns) || 4;
        this.maxRows_ = parseInt(options.maxRows) || 0;
        this.width_ = parseInt(options.width) || undefined;
        this.backgroundColour_ = (0, field_utils_1.parseColour)(options.colour);
        this.borderColour_ = pxt.toolbox.fadeColor(this.backgroundColour_, 0.4, false);
        let tooltipCfg = {
            xOffset: parseInt(options.tooltipsXOffset) || 15,
            yOffset: parseInt(options.tooltipsYOffset) || -10
        };
        this.tooltipConfig_ = tooltipCfg;
        this.hasSearchBar_ = !!options.hasSearchBar || false;
    }
    setFocusedItem_(_gridItemContainer) {
        this.gridItems.forEach(button => button.classList.remove('gridpicker-option-focused', 'gridpicker-menuitem-highlight'));
        const activeItem = this.gridItems[this.activeDescendantIndex];
        activeItem.classList.add('gridpicker-option-focused');
        Blockly.utils.style.scrollIntoContainerView(activeItem, this.scrollContainer);
        const rect = activeItem.getBoundingClientRect();
        if (this.gridTooltip_) {
            const title = activeItem.title || activeItem.alt;
            this.gridTooltip_.textContent = title;
            this.gridTooltip_.style.visibility = title ? 'visible' : 'hidden';
            this.gridTooltip_.style.display = title ? '' : 'none';
            this.gridTooltip_.style.top = `${rect.bottom + 5}px`;
            this.gridTooltip_.style.left = `${rect.left}px`;
        }
        this.addKeyboardNavigableClass();
    }
    /**
     * When disposing the grid picker, make sure the tooltips are disposed too.
     * @public
     */
    dispose() {
        super.dispose();
        this.disposeGrid();
        this.disposeTooltip();
        this.disposeIntersectionObserver();
    }
    createTooltip_() {
        if (this.gridTooltip_)
            return;
        // Create tooltip
        this.gridTooltip_ = document.createElement('div');
        this.gridTooltip_.className = 'blocklyGridPickerTooltip';
        this.gridTooltip_.style.position = 'absolute';
        this.gridTooltip_.style.display = 'none';
        this.gridTooltip_.style.visibility = 'hidden';
        document.body.appendChild(this.gridTooltip_);
    }
    /**
     * Create blocklyGridPickerRows and add them to table container
     * @param options
     * @param tableContainer
     */
    populateTableContainer(options, tableContainer, scrollContainer) {
        this.gridItems = [];
        this.activeDescendantIndex = 0;
        pxsim.U.removeChildren(tableContainer);
        if (options.length == 0) {
            this.firstItem_ = undefined;
        }
        for (let i = 0; i < options.length / this.columns_; i++) {
            let row = this.populateRow(i, options, tableContainer);
            tableContainer.appendChild(row);
        }
    }
    /**
     * Populate a single row and add it to table container
     * @param row
     * @param options
     * @param tableContainer
     */
    populateRow(row, options, tableContainer) {
        const columns = this.columns_;
        const rowContent = document.createElement('div');
        rowContent.className = 'blocklyGridPickerRow';
        for (let i = (columns * row); i < Math.min((columns * row) + columns, options.length); i++) {
            let content = options[i][0]; // Human-readable text or image.
            const value = options[i][1]; // Language-neutral value.
            const menuItem = document.createElement('div');
            menuItem.className = 'gridpicker-menuitem gridpicker-option';
            menuItem.setAttribute('id', ':' + i); // For aria-activedescendant
            menuItem.setAttribute('role', 'gridcell');
            menuItem.setAttribute('aria-selected', 'false');
            menuItem.style.userSelect = 'none';
            menuItem.title = content['alt'] || content;
            menuItem.setAttribute('data-value', value);
            const menuItemContent = document.createElement('div');
            menuItemContent.setAttribute('class', 'gridpicker-menuitem-content');
            menuItemContent.title = content['alt'] || content;
            menuItemContent.setAttribute('data-value', value);
            const hasImages = typeof content == 'object';
            // Set colour
            let backgroundColour = this.backgroundColour_;
            if (value == this.getValue()) {
                // This option is selected
                menuItem.setAttribute('aria-selected', 'true');
                this.activeDescendantIndex = i;
                pxt.BrowserUtils.addClass(menuItem, `gridpicker-option-selected ${!this.openingPointerCoords ? 'gridpicker-option-focused' : ''}`);
                backgroundColour = this.sourceBlock_.getColourTertiary();
                // Save so we can scroll to it later
                this.selectedItemDom = menuItem;
                if (hasImages && !this.shouldShowTooltips()) {
                    this.updateSelectedBar_(content, value);
                }
            }
            menuItem.style.backgroundColor = backgroundColour;
            menuItem.style.borderColor = this.borderColour_;
            if (hasImages) {
                // An image, not text.
                const buttonImg = new Image(content['width'], content['height']);
                buttonImg.setAttribute('draggable', 'false');
                if (!('IntersectionObserver' in window)) {
                    // No intersection observer support, set the image url immediately
                    buttonImg.src = content['src'];
                }
                else {
                    buttonImg.src = FieldGridPicker.DEFAULT_IMG;
                    buttonImg.setAttribute('data-src', content['src']);
                    this.observer.observe(buttonImg);
                }
                buttonImg.alt = content['alt'] || '';
                buttonImg.setAttribute('data-value', value);
                menuItemContent.appendChild(buttonImg);
            }
            else {
                // text
                menuItemContent.textContent = content;
            }
            if (this.shouldShowTooltips()) {
                Blockly.browserEvents.conditionalBind(menuItem, 'click', this, () => this.buttonClickAndClose_(value));
                // Setup hover tooltips
                const xOffset = (this.sourceBlock_.RTL ? -this.tooltipConfig_.xOffset : this.tooltipConfig_.xOffset);
                const yOffset = this.tooltipConfig_.yOffset;
                Blockly.browserEvents.bind(menuItem, 'pointermove', this, (e) => {
                    if (this.pointerMoveTriggeredByUser()) {
                        this.gridItems.forEach(item => item.classList.remove('gridpicker-option-focused'));
                        this.activeDescendantIndex = i;
                        if (hasImages) {
                            this.gridTooltip_.style.top = `${e.clientY + yOffset}px`;
                            this.gridTooltip_.style.left = `${e.clientX + xOffset}px`;
                            // Set tooltip text
                            const touchTarget = document.elementFromPoint(e.clientX, e.clientY);
                            const title = touchTarget.title || touchTarget.alt;
                            this.gridTooltip_.textContent = title;
                            // Show the tooltip
                            this.gridTooltip_.style.visibility = title ? 'visible' : 'hidden';
                            this.gridTooltip_.style.display = title ? '' : 'none';
                        }
                        pxt.BrowserUtils.addClass(menuItem, 'gridpicker-menuitem-highlight');
                        tableContainer.setAttribute('aria-activedescendant', menuItem.id);
                    }
                });
                Blockly.browserEvents.bind(menuItem, 'pointerout', this, (e) => {
                    if (this.pointerOutTriggeredByUser()) {
                        this.gridItems.forEach(item => item.classList.remove('gridpicker-option-focused'));
                        if (hasImages) {
                            // Hide the tooltip
                            this.gridTooltip_.style.visibility = 'hidden';
                            this.gridTooltip_.style.display = 'none';
                        }
                        pxt.BrowserUtils.removeClass(menuItem, 'gridpicker-menuitem-highlight');
                        tableContainer.removeAttribute('aria-activedescendant');
                        this.activeDescendantIndex = undefined;
                    }
                });
            }
            else {
                if (hasImages) {
                    // Show the selected bar
                    this.selectedBar_.style.display = '';
                    // Show the selected item (in the selected bar)
                    Blockly.browserEvents.conditionalBind(menuItem, 'click', this, (e) => {
                        if (this.closeModal_) {
                            this.buttonClick_(value);
                        }
                        else {
                            // Clear all current hovers.
                            const currentHovers = tableContainer.getElementsByClassName('gridpicker-menuitem-highlight');
                            for (let i = 0; i < currentHovers.length; i++) {
                                pxt.BrowserUtils.removeClass(currentHovers[i], 'gridpicker-menuitem-highlight');
                            }
                            // Set hover on current item
                            pxt.BrowserUtils.addClass(menuItem, 'gridpicker-menuitem-highlight');
                            this.updateSelectedBar_(content, value);
                        }
                    });
                }
                else {
                    Blockly.browserEvents.conditionalBind(menuItem, 'click', this, () => this.buttonClickAndClose_(value));
                    Blockly.browserEvents.conditionalBind(menuItem, 'mouseup', this, () => this.buttonClickAndClose_(value));
                }
            }
            menuItem.appendChild(menuItemContent);
            this.gridItems.push(menuItem);
            rowContent.appendChild(menuItem);
            if (i == 0) {
                this.firstItem_ = menuItem;
            }
        }
        return rowContent;
    }
    doClassValidation_(newValue) {
        return newValue;
    }
    getFieldDescription() {
        return this.getValue();
    }
    /**
     * Closes the gridpicker.
     */
    close() {
        this.disposeTooltip();
        this.disposeGrid();
        Blockly.WidgetDiv.hideIfOwner(this);
        Blockly.Events.setGroup(false);
        if (this.tabKeyBind)
            Blockly.browserEvents.unbind(this.tabKeyBind);
    }
    /**
     * Highlight first item in menu, de-select and de-highlight all others
     */
    highlightFirstItem(tableContainerDom) {
        let menuItemsDom = tableContainerDom.childNodes;
        if (menuItemsDom.length && menuItemsDom[0].childNodes) {
            for (let row = 0; row < menuItemsDom.length; ++row) {
                let rowLength = menuItemsDom[row].childNodes.length;
                for (let col = 0; col < rowLength; ++col) {
                    const menuItem = menuItemsDom[row].childNodes[col];
                    pxt.BrowserUtils.removeClass(menuItem, "gridpicker-menuitem-highlight");
                    pxt.BrowserUtils.removeClass(menuItem, "gridpicker-option-selected");
                }
            }
            let firstItem = menuItemsDom[0].childNodes[0];
            firstItem.className += " gridpicker-menuitem-highlight";
        }
    }
    /**
     * Scroll menu to item that equals current value of gridpicker
     */
    highlightAndScrollSelected(tableContainerDom, scrollContainerDom) {
        if (!this.selectedItemDom)
            return;
        Blockly.utils.style.scrollIntoContainerView(this.selectedItemDom, scrollContainerDom, true);
    }
    /**
     * Create a dropdown menu under the text.
     * @private
     */
    showEditor_(e) {
        this.setOpeningPointerCoords(e);
        Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, () => {
            this.onClose_();
        });
        this.setupIntersectionObserver_();
        this.createTooltip_();
        const tableContainer = document.createElement("div");
        this.positionMenu_(tableContainer);
        tableContainer.focus();
        if (!e) {
            this.addKeyboardNavigableClass();
        }
    }
    positionMenu_(tableContainer) {
        // Record viewport dimensions before adding the dropdown.
        const viewportBBox = Blockly.utils.svgMath.getViewportBBox();
        const anchorBBox = this.getAnchorDimensions_();
        const { paddingContainer, scrollContainer } = this.createWidget_(tableContainer);
        this.scrollContainer = scrollContainer;
        const containerSize = {
            width: paddingContainer.offsetWidth,
            height: paddingContainer.offsetHeight
        };
        const windowHeight = window.outerHeight || window.innerHeight;
        // Set width
        if (this.width_) {
            const windowWidth = window.outerWidth || window.innerWidth;
            if (this.width_ > windowWidth) {
                this.width_ = windowWidth;
            }
            tableContainer.style.width = this.width_ + 'px';
        }
        let addedHeight = 0;
        if (this.hasSearchBar_)
            addedHeight += 50; // Account for search bar
        if (this.selectedBar_)
            addedHeight += 50; // Account for the selected bar
        // Set height
        if (this.maxRows_) {
            // Calculate height
            const firstRowDom = tableContainer.children[0];
            const rowHeight = firstRowDom.offsetHeight;
            // Compute maxHeight using maxRows + 0.3 to partially show next row, to hint at scrolling
            let maxHeight = rowHeight * (this.maxRows_ + 0.3);
            if (windowHeight < (maxHeight + addedHeight)) {
                maxHeight = windowHeight - addedHeight;
            }
            if (containerSize.height > maxHeight) {
                scrollContainer.style.overflowY = "auto";
                scrollContainer.style.height = maxHeight + "px";
                containerSize.height = maxHeight;
            }
        }
        containerSize.height += addedHeight;
        // Position the menu.
        Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, containerSize, this.sourceBlock_.RTL);
        //            (<any>scrollContainer).focus();
        this.highlightAndScrollSelected(tableContainer, scrollContainer);
    }
    ;
    shouldShowTooltips() {
        return !pxt.BrowserUtils.isMobile();
    }
    getAnchorDimensions_() {
        const boundingBox = this.getScaledBBox();
        if (this.sourceBlock_.RTL) {
            boundingBox.right += field_base_1.FieldBase.CHECKMARK_OVERHANG;
        }
        else {
            boundingBox.left -= field_base_1.FieldBase.CHECKMARK_OVERHANG;
        }
        return boundingBox;
    }
    ;
    createWidget_(tableContainer) {
        const widgetDiv = Blockly.WidgetDiv.getDiv();
        const options = this.getOptions();
        // Container for the menu rows
        tableContainer.setAttribute('role', 'grid');
        tableContainer.setAttribute('tabindex', '0');
        this.addPointerListener(widgetDiv);
        this.addKeyDownHandler(tableContainer);
        // Container used to limit the height of the tableContainer, because the tableContainer uses
        // display: table, which ignores height and maxHeight
        const scrollContainer = document.createElement("div");
        // Needed to correctly style borders and padding around the scrollContainer, because the padding around the
        // scrollContainer is part of the scrollable area and will not be correctly shown at the top and bottom
        // when scrolling
        const paddingContainer = document.createElement("div");
        paddingContainer.style.border = `solid 1px ${this.borderColour_}`;
        tableContainer.style.backgroundColor = this.backgroundColour_;
        scrollContainer.style.backgroundColor = this.backgroundColour_;
        paddingContainer.style.backgroundColor = this.backgroundColour_;
        tableContainer.className = 'blocklyGridPickerMenu';
        scrollContainer.className = 'blocklyGridPickerScroller';
        paddingContainer.className = 'blocklyGridPickerPadder';
        paddingContainer.appendChild(scrollContainer);
        scrollContainer.appendChild(tableContainer);
        widgetDiv.appendChild(paddingContainer);
        // Search bar
        let searchBar;
        if (this.hasSearchBar_) {
            const { searchBarDiv, searchBar: input } = this.createSearchBar_(tableContainer, scrollContainer, options);
            paddingContainer.insertBefore(searchBarDiv, paddingContainer.childNodes[0]);
            searchBar = input;
        }
        // Selected bar
        let cancelButton;
        if (!this.shouldShowTooltips()) {
            const { selectedBar, cancelButton: buttton } = this.createSelectedBar_();
            this.selectedBar_ = selectedBar;
            cancelButton = buttton;
            paddingContainer.appendChild(this.selectedBar_);
        }
        // Render elements
        this.populateTableContainer(options, tableContainer, scrollContainer);
        if (this.hasSearchBar_ || this.selectedBar_) {
            this.firstFocusableElement = searchBar || tableContainer;
            this.lastFocusableElement = cancelButton || tableContainer;
            this.tabKeyBind = Blockly.browserEvents.bind(widgetDiv, "keydown", this, this.handleTabKey.bind(this));
        }
        return { paddingContainer, scrollContainer };
    }
    createSearchBar_(tableContainer, scrollContainer, options) {
        const searchBarDiv = document.createElement("div");
        searchBarDiv.setAttribute("class", "ui fluid icon input");
        const searchIcon = document.createElement("i");
        searchIcon.setAttribute("class", "search icon");
        const searchBar = document.createElement("input");
        searchBar.setAttribute("type", "search");
        searchBar.setAttribute("id", "search-bar");
        searchBar.setAttribute("class", "blocklyGridPickerSearchBar");
        searchBar.setAttribute("placeholder", pxt.Util.lf("Search"));
        searchBar.setAttribute("tabindex", "0");
        searchBar.addEventListener("click", () => {
            searchBar.focus();
            searchBar.setSelectionRange(0, searchBar.value.length);
        });
        // Search on key change
        searchBar.addEventListener("keyup", pxt.Util.debounce((e) => {
            if (e.code === "Tab") {
                return;
            }
            let text = searchBar.value;
            let re = new RegExp(text, "i");
            let filteredOptions = options.filter((block) => {
                const alt = block[0].alt; // Human-readable text or image.
                const value = block[1]; // Language-neutral value.
                return alt ? re.test(alt) : re.test(value);
            });
            this.populateTableContainer(filteredOptions, tableContainer, scrollContainer);
            if (text) {
                this.highlightFirstItem(tableContainer);
            }
            else {
                this.highlightAndScrollSelected(tableContainer, scrollContainer);
            }
            // Hide the tooltip
            this.gridTooltip_.style.visibility = 'hidden';
            this.gridTooltip_.style.display = 'none';
        }, 300, false));
        // Select the first item if the enter key is pressed
        searchBar.addEventListener("keyup", (e) => {
            const code = e.which;
            if (code == 13) { /* Enter key */
                // Select the first item in the list
                const firstRow = tableContainer.childNodes[0];
                if (firstRow) {
                    const firstItem = firstRow.childNodes[0];
                    if (firstItem) {
                        this.closeModal_ = true;
                        firstItem.click();
                    }
                }
            }
        });
        searchBarDiv.appendChild(searchBar);
        searchBarDiv.appendChild(searchIcon);
        return { searchBarDiv, searchBar };
    }
    createSelectedBar_() {
        const selectedBar = document.createElement("div");
        selectedBar.setAttribute("class", "blocklyGridPickerSelectedBar");
        selectedBar.style.display = 'none';
        const selectedWrapper = document.createElement("div");
        const selectedImgWrapper = document.createElement("div");
        selectedImgWrapper.className = 'blocklyGridPickerSelectedImage';
        selectedWrapper.appendChild(selectedImgWrapper);
        this.selectedImg_ = document.createElement("img");
        this.selectedImg_.setAttribute('width', '30px');
        this.selectedImg_.setAttribute('height', '30px');
        this.selectedImg_.setAttribute('draggable', 'false');
        this.selectedImg_.style.display = 'none';
        this.selectedImg_.src = FieldGridPicker.DEFAULT_IMG;
        selectedImgWrapper.appendChild(this.selectedImg_);
        this.selectedBarText_ = document.createElement("span");
        this.selectedBarText_.className = 'blocklyGridPickerTooltip';
        selectedWrapper.appendChild(this.selectedBarText_);
        const buttonsWrapper = document.createElement("div");
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = 'ui buttons mini';
        buttonsWrapper.appendChild(buttonsDiv);
        const selectButton = document.createElement("button");
        selectButton.className = "ui button icon green";
        const selectButtonIcon = document.createElement("i");
        selectButtonIcon.className = 'icon check';
        selectButton.appendChild(selectButtonIcon);
        Blockly.browserEvents.conditionalBind(selectButton, 'click', this, () => {
            this.setValue(this.selectedBarValue_);
            this.close();
        });
        const cancelButton = document.createElement("button");
        cancelButton.className = "ui button icon red";
        const cancelButtonIcon = document.createElement("i");
        cancelButtonIcon.className = 'icon cancel';
        cancelButton.appendChild(cancelButtonIcon);
        Blockly.browserEvents.conditionalBind(cancelButton, 'click', this, () => {
            this.close();
        });
        buttonsDiv.appendChild(selectButton);
        buttonsDiv.appendChild(cancelButton);
        selectedBar.appendChild(selectedWrapper);
        selectedBar.appendChild(buttonsWrapper);
        return { selectedBar, cancelButton };
    }
    updateSelectedBar_(content, value) {
        if (content['src']) {
            this.selectedImg_.src = content['src'];
            this.selectedImg_.style.display = '';
        }
        this.selectedImg_.alt = content['alt'] || content;
        this.selectedBarText_.textContent = content['alt'] || content;
        this.selectedBarValue_ = value;
    }
    setupIntersectionObserver_() {
        if (!('IntersectionObserver' in window))
            return;
        this.disposeIntersectionObserver();
        // setup intersection observer for the image
        const preloadImage = (el) => {
            const lazyImageUrl = el.getAttribute('data-src');
            if (lazyImageUrl) {
                el.src = lazyImageUrl;
                el.removeAttribute('data-src');
            }
        };
        const config = {
            // If the image gets within 50px in the Y axis, start the download.
            rootMargin: '20px 0px',
            threshold: 0.01
        };
        const onIntersection = (entries) => {
            entries.forEach(entry => {
                // Are we in viewport?
                if (entry.intersectionRatio > 0) {
                    // Stop watching and load the image
                    this.observer.unobserve(entry.target);
                    preloadImage(entry.target);
                }
            });
        };
        this.observer = new IntersectionObserver(onIntersection, config);
    }
    disposeIntersectionObserver() {
        if (this.observer) {
            this.observer = null;
        }
    }
    /**
     * Disposes the tooltip DOM.
     * @private
     */
    disposeTooltip() {
        if (this.gridTooltip_) {
            pxsim.U.remove(this.gridTooltip_);
            this.gridTooltip_ = null;
        }
    }
    onClose_() {
        this.disposeTooltip();
        this.disposeGrid();
    }
    // Used for focus trap
    handleTabKey(e) {
        if (e.code === "Tab") {
            this.addKeyboardNavigableClass();
            if (document.activeElement === this.lastFocusableElement && !e.shiftKey) {
                this.firstFocusableElement.focus();
                e.preventDefault();
            }
            else if (document.activeElement === this.firstFocusableElement && e.shiftKey) {
                this.lastFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
    addKeyboardNavigableClass() {
        if (this.scrollContainer) {
            this.scrollContainer.classList.add("keyboardNavigable");
        }
    }
}
exports.FieldGridPicker = FieldGridPicker;
FieldGridPicker.DEFAULT_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
Blockly.Css.register(`
.blocklyGridPickerTooltip {
    z-index: 995;
}

.blocklyGridPickerPadder {
    outline: none;
    box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, .3)
}

.blocklyWidgetDiv .blocklyGridPickerRow {
    display: table-row;
}

.blocklyWidgetDiv .blocklyGridPickerMenu {
    display: table;
    outline: none;
    border-spacing: 7px;
}

.blocklyGridPickerScroller {
    outline: none;
    padding: 4px;
    border-radius: 4px;
    position: relative;
    -webkit-overflow-scrolling: touch;
}

.blocklyGridPickerScroller.keyboardNavigable:has(:focus-visible) {
    outline: 4px solid var(--pxt-focus-border);
}

.blocklyGridPickerPadder {
    border-radius: 4px;
    outline: none;
    position: relative;
}

.blocklyGridPickerPadder .ui.input i.search.icon {
    margin-top: -0.2rem;
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-menuitem {
    background: white;
    cursor: pointer;
    min-width: unset;
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-menuitem-highlight, .blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-menuitem-hover {
    background: #d6e9f8;
    box-shadow: 0px 0px 0px 4px rgba(255, 255, 255, 0.2);
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-option {
    border: solid 1px black;
    border-radius: 4px;
    color: #fff;
    font-size: 12pt;
    font-weight: bold;
    display: table-cell;
    padding: 8px;
    text-align: center;
    vertical-align: top;
    -webkit-user-select: none;
    -moz-user-select: -moz-none;
    -ms-user-select: none;
        user-select: none;
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-menuitem-content {
    color: #fff;
    font-size: 13px;
    font-family: var(--pxt-page-font);
}

.blocklyWidgetDiv .blocklyGridPickerMenu .floatLeft {
    float: left;
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-option.gridpicker-option-selected {
    position: relative;
}

.blocklyWidgetDiv .blocklyGridPickerMenu .gridpicker-menuitem .gridpicker-menuitem-checkbox {
    display: none;
}

.blocklyWidgetDiv .blocklyGridPickerMenu:focus .blocklyGridPickerRow .gridpicker-menuitem.gridpicker-option-focused {
    outline: 3px solid var(--pxt-focus-border);
}

.blocklyGridPickerTooltip {
    z-index: 995;
}

.blocklyGridPickerSelectedBar {
    display: flex;
    padding-top: 5px;
    justify-content: space-between;
}

.blocklyGridPickerSelectedImage {
    padding: 3px;
    display: inline-block;
    vertical-align: middle;
}

.ui.input input.blocklyGridPickerSearchBar {
    background: none;
    border: none;
    color: white;
}

.ui.input input.blocklyGridPickerSearchBar::placeholder {
    color: white;
}

.ui.input input.blocklyGridPickerSearchBar::-webkit-input-placeholder {
    color: white;
}

.ui.input input.blocklyGridPickerSearchBar::-moz-placeholder {
    color: white;
}

.ui.input input.blocklyGridPickerSearchBar:-ms-input-placeholder {
    color: white;
}

.ui.input input.blocklyGridPickerSearchBar:-moz-placeholder {
    color: white;
}
`);
