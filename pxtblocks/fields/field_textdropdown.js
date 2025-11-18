"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTextDropdown = exports.BaseFieldTextDropdown = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
class BaseFieldTextDropdown extends Blockly.FieldTextInput {
    constructor(text, menuGenerator_, opt_validator) {
        super(text, opt_validator);
        this.menuGenerator_ = menuGenerator_;
        /** A reference to the currently selected menu item. */
        this.selectedMenuItem = null;
        /** The dropdown menu. */
        this.menu_ = null;
        /** SVG based arrow element. */
        this.svgArrow = null;
        /** A cache of the most recently generated options. */
        this.generatedOptions = null;
        this.menuItems = [];
        this.lastHighlightedMenuElement = null;
    }
    initView() {
        super.initView();
        this.createSVGArrow();
    }
    inputKeydownListener(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.menu_.focus();
            if (this.selectedMenuItem) {
                this.menu_.setHighlighted(this.selectedMenuItem);
            }
            else {
                this.menu_.setHighlighted(this.menuItems[0]);
            }
        }
    }
    dropdownKeydownListener(e) {
        // This is the highlighted menu element after a key event has been handled on the dropdown div.
        // If this was the UpArrow or DownArrow, the highlighted menu item has already been updated.
        const highlightedMenuElement = this.menu_.getElement().querySelector(".blocklyMenuItemHighlight");
        if (e.key === "ArrowUp" && (highlightedMenuElement === this.lastHighlightedMenuElement || !this.lastHighlightedMenuElement)) {
            e.preventDefault();
            this.selectedMenuItem = null;
            this.menu_.setHighlighted(null);
            this.htmlInput_.focus();
        }
        this.lastHighlightedMenuElement = highlightedMenuElement;
    }
    showEditor_(e, quietInput) {
        // Align with Blockly's approach in https://github.com/google/blockly-samples/blob/master/plugins/field-slider/src/field_slider.ts
        // Always quiet the input for the super constructor, as we don't want to
        // focus on the text field, and we don't want to display the modal
        // editor on mobile devices.
        super.showEditor_(e, true);
        if (!this.dropDownOpen_)
            this.showDropdown_();
        Blockly.Touch.clearTouchIdentifier();
        this.inputKeydownHandler = this.inputKeydownListener.bind(this);
        this.htmlInput_.addEventListener('keydown', this.inputKeydownHandler);
        if (!quietInput) {
            this.htmlInput_.focus();
        }
    }
    doValueUpdate_(newValue) {
        if ((newValue === null || newValue === void 0 ? void 0 : newValue.length) > 1 &&
            newValue.charAt(0) === newValue.charAt(newValue.length - 1) &&
            (newValue.charAt(0) === "'" ||
                newValue.charAt(0) === '"')) {
            newValue = newValue.slice(1, newValue.length - 1);
        }
        super.doValueUpdate_(newValue);
    }
    getOptions(useCache) {
        if (!this.menuGenerator_) {
            // A subclass improperly skipped setup without defining the menu
            // generator.
            throw TypeError('A menu generator was never defined.');
        }
        if (Array.isArray(this.menuGenerator_))
            return this.menuGenerator_;
        if (useCache && this.generatedOptions)
            return this.generatedOptions;
        validateOptions(this.generatedOptions);
        return this.generatedOptions;
    }
    isOptionListDynamic() {
        return typeof this.menuGenerator_ === 'function';
    }
    getFieldDescription() {
        return this.getText();
    }
    dropdownDispose_() {
        Blockly.WidgetDiv.getDiv().removeEventListener('keydown', this.inputKeydownHandler);
        this.menu_.getElement().removeEventListener('keydown', this.dropdownKeydownHandler);
        this.dropDownOpen_ = false;
        if (this.menu_) {
            this.menu_.dispose();
        }
        this.menu_ = null;
        this.selectedMenuItem = null;
        this.menuItems = [];
        this.applyColour();
    }
    dropdownCreate() {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        const menu = new Blockly.Menu();
        menu.setRole(Blockly.utils.aria.Role.LISTBOX);
        this.menu_ = menu;
        const options = this.getOptions(false);
        this.selectedMenuItem = null;
        for (let i = 0; i < options.length; i++) {
            const [label, value] = options[i];
            const content = (() => {
                if ((0, field_utils_1.isImageProperties)(label)) {
                    // Convert ImageProperties to an HTMLImageElement.
                    const image = new Image(label.width, label.height);
                    image.src = label.src;
                    image.alt = label.alt;
                    return image;
                }
                return label;
            })();
            const menuItem = new Blockly.MenuItem(content, value);
            menuItem.setRole(Blockly.utils.aria.Role.OPTION);
            menuItem.setRightToLeft(block.RTL);
            menuItem.setCheckable(true);
            menu.addChild(menuItem);
            menuItem.setChecked(value === this.value_);
            if (value === this.value_) {
                this.selectedMenuItem = menuItem;
            }
            menuItem.onAction(this.handleMenuActionEvent, this);
            this.menuItems.push(menuItem);
        }
    }
    showDropdown_(e) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        this.dropdownCreate();
        if (e && typeof e.clientX === 'number') {
            this.menu_.openingCoords = new Blockly.utils.Coordinate(e.clientX, e.clientY);
        }
        else {
            this.menu_.openingCoords = null;
        }
        // Remove any pre-existing elements in the dropdown.
        (0, field_utils_1.clearDropDownDiv)();
        // Element gets created in render.
        const menuElement = this.menu_.render(Blockly.DropDownDiv.getContentDiv());
        Blockly.utils.dom.addClass(menuElement, 'blocklyDropdownMenu');
        const parent = block.getParent();
        const primaryColour = (parent || block).getColour();
        const borderColour = (parent || block).style.colourTertiary;
        Blockly.DropDownDiv.setColour(primaryColour, borderColour);
        this.dropDownOpen_ = true;
        Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this), undefined, false);
        this.dropdownKeydownHandler = this.dropdownKeydownListener.bind(this);
        this.menu_.getElement().addEventListener('keydown', this.dropdownKeydownHandler);
        // Focusing needs to be handled after the menu is rendered and positioned.
        // Otherwise it will cause a page scroll to get the misplaced menu in
        // view. See issue #1329.
        // this.menu_!.focus();
        if (this.selectedMenuItem) {
            this.menu_.setHighlighted(this.selectedMenuItem);
            Blockly.utils.style.scrollIntoContainerView(this.selectedMenuItem.getElement(), Blockly.DropDownDiv.getContentDiv(), true);
        }
        this.applyColour();
    }
    updateSize_(margin) {
        super.updateSize_(margin);
        const arrowWidth = this.positionSVGArrow(this.size_.width, this.size_.height / 2 -
            this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);
        if (this.sourceBlock_.RTL && this.textElement_) {
            const constants = this.getConstants();
            const contentWidth = Blockly.utils.dom.getFastTextWidth(this.textElement_, constants.FIELD_TEXT_FONTSIZE, constants.FIELD_TEXT_FONTWEIGHT, constants.FIELD_TEXT_FONTFAMILY);
            this.positionTextElement_(-arrowWidth, contentWidth);
        }
        this.size_.width += arrowWidth;
    }
    positionSVGArrow(x, y) {
        if (!this.svgArrow) {
            return 0;
        }
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        const hasBorder = !!this.borderRect_;
        const xPadding = hasBorder
            ? this.getConstants().FIELD_BORDER_RECT_X_PADDING
            : 0;
        const textPadding = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_PADDING;
        const svgArrowSize = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE;
        const arrowX = block.RTL ? (xPadding / 2) : x + textPadding;
        this.svgArrow.setAttribute('transform', 'translate(' + arrowX + ',' + y + ')');
        return svgArrowSize + textPadding;
    }
    createSVGArrow() {
        this.svgArrow = Blockly.utils.dom.createSvgElement('image', {
            'height': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
            'width': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px'
        }, this.fieldGroup_);
        this.svgArrow.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href', FieldTextDropdown.DROPDOWN_SVG_DATAURI);
    }
    handleMenuActionEvent(menuItem) {
        Blockly.DropDownDiv.hideIfOwner(this, true);
        this.onItemSelected_(this.menu_, menuItem);
    }
    onItemSelected_(menu, menuItem) {
        this.setValue(menuItem.getValue());
        Blockly.WidgetDiv.hideIfOwner(this);
    }
}
exports.BaseFieldTextDropdown = BaseFieldTextDropdown;
BaseFieldTextDropdown.DROPDOWN_SVG_DATAURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiM1NzVFNzUiLz48L3N2Zz4K';
function validateOptions(options) {
    if (!Array.isArray(options)) {
        throw TypeError('FieldDropdown options must be an array.');
    }
    if (!options.length) {
        throw TypeError('FieldDropdown options must not be an empty array.');
    }
    let foundError = false;
    for (let i = 0; i < options.length; i++) {
        const tuple = options[i];
        if (!Array.isArray(tuple)) {
            foundError = true;
            pxt.error('Invalid option[' +
                i +
                ']: Each FieldDropdown option must be an ' +
                'array. Found: ', tuple);
        }
        else if (typeof tuple[1] !== 'string') {
            foundError = true;
            pxt.error('Invalid option[' +
                i +
                ']: Each FieldDropdown option id must be ' +
                'a string. Found ' +
                tuple[1] +
                ' in: ', tuple);
        }
        else if (tuple[0] &&
            typeof tuple[0] !== 'string' &&
            !(0, field_utils_1.isImageProperties)(tuple[0])) {
            foundError = true;
            pxt.error('Invalid option[' +
                i +
                ']: Each FieldDropdown option must have a ' +
                'string label or image description. Found' +
                tuple[0] +
                ' in: ', tuple);
        }
    }
    if (foundError) {
        throw TypeError('Found invalid FieldDropdown options.');
    }
}
class FieldTextDropdown extends BaseFieldTextDropdown {
    constructor(text, options, opt_validator) {
        super(text, parseDropdownOptions(options), opt_validator);
        this.isFieldCustom_ = true;
    }
}
exports.FieldTextDropdown = FieldTextDropdown;
function parseDropdownOptions(options) {
    if (options.values) {
        return options.values.split(",").map(v => [v, v]);
    }
    else if (options.data) {
        let result;
        try {
            const data = JSON.parse(options.data);
            if (Array.isArray(data) && data.length) {
                if (isStringArray(data)) {
                    result = data.map(v => [v, v]);
                }
                else {
                    let foundError = false;
                    for (const value of data) {
                        if (!Array.isArray(value) || value.length !== 2 || !isStringArray(value)) {
                            foundError = true;
                            break;
                        }
                    }
                    if (!foundError) {
                        result = data;
                    }
                }
            }
        }
        catch (e) {
            // parse error
        }
        if (result) {
            return result;
        }
        else {
            pxt.warn("Could not parse textdropdown data field");
        }
    }
    return [];
}
function isStringArray(arr) {
    for (const val of arr) {
        if (typeof val !== "string") {
            return false;
        }
    }
    return true;
}
