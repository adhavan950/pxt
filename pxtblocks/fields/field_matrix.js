"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMatrix = void 0;
const Blockly = require("blockly");
class FieldMatrix extends Blockly.Field {
    constructor() {
        super(...arguments);
        this.cells = [];
        this.keyDownBinding = null;
        this.blurBinding = null;
        this.selected = undefined;
        this.forceFocusVisible = false;
        this.returnEphemeralFocusFn = undefined;
        this.getCellId = (x, y) => `${this.sourceBlock_.id}:${x}-${y}`;
    }
    createMatrixDisplay({ cellWidth, cellHeight, cellLabel, cellHorizontalMargin, cellVerticalMargin, cornerRadius = 0, cellFill, cellStroke, padLeft = 0, scale = 1 }) {
        // Initialize the matrix that holds the state
        for (let i = 0; i < this.numMatrixCols; i++) {
            this.cells.push([]);
        }
        // Create the cells of the matrix that is displayed
        for (let y = 0; y < this.numMatrixRows; y++) {
            const row = pxsim.svg.child(this.matrixSvg, "g", { 'role': 'row' });
            for (let x = 0; x < this.numMatrixCols; x++) {
                const tx = scale * x * (cellWidth + cellHorizontalMargin) + cellHorizontalMargin + padLeft;
                const ty = scale * y * (cellHeight + cellVerticalMargin) + cellVerticalMargin;
                const cellG = pxsim.svg.child(row, "g", { transform: `translate(${tx} ${ty})`, 'role': 'gridcell' });
                const rectOptions = {
                    'id': this.getCellId(x, y),
                    'aria-label': cellLabel,
                    'role': 'switch',
                    'aria-checked': "false",
                    'width': scale * cellWidth,
                    'height': scale * cellHeight,
                    'fill': cellFill !== null && cellFill !== void 0 ? cellFill : "none",
                    'stroke': cellStroke,
                    'data-x': x,
                    'data-y': y,
                    'rx': Math.max(2, scale * cornerRadius)
                };
                const cellRect = pxsim.svg.child(cellG, "rect", rectOptions);
                this.cells[x][y] = cellRect;
            }
        }
    }
    handleArrowUp(x, y) {
        this.selected = [x, y - 1];
    }
    handleArrowDown(x, y) {
        this.selected = [x, y + 1];
    }
    handleArrowLeft(x, y) {
        if (x !== 0) {
            this.selected = [x - 1, y];
        }
        else if (y !== 0) {
            this.selected = [this.numMatrixCols - 1, y - 1];
        }
    }
    handleArrowRight(x, y) {
        if (x !== this.cells.length - 1) {
            this.selected = [x + 1, y];
        }
        else if (y !== this.numMatrixRows - 1) {
            this.selected = [0, y + 1];
        }
    }
    addKeyDownHandler() {
        this.keyDownBinding = Blockly.browserEvents.bind(this.matrixSvg, 'keydown', this, (e) => {
            if (!this.selected) {
                return;
            }
            const [x, y] = this.selected;
            const ctrlCmd = pxt.BrowserUtils.isMac() ? e.metaKey : e.ctrlKey;
            switch (e.code) {
                case "ArrowUp": {
                    if (y !== 0) {
                        this.handleArrowUp(x, y);
                    }
                    break;
                }
                case "ArrowDown": {
                    if (y !== this.cells[0].length - 1) {
                        this.handleArrowDown(x, y);
                    }
                    break;
                }
                case "ArrowLeft": {
                    this.handleArrowLeft(x, y);
                    break;
                }
                case "ArrowRight": {
                    this.handleArrowRight(x, y);
                    break;
                }
                case "Home": {
                    if (ctrlCmd) {
                        this.selected = [0, 0];
                    }
                    else {
                        this.selected = [0, y];
                    }
                    break;
                }
                case "End": {
                    if (ctrlCmd) {
                        this.selected = [this.numMatrixCols - 1, this.numMatrixRows - 1];
                    }
                    else {
                        this.selected = [this.numMatrixCols - 1, y];
                    }
                    break;
                }
                case "Enter":
                case "Space": {
                    this.toggleCell(x, y, !this.getCellToggled(x, y));
                    break;
                }
                case "Escape": {
                    this.sourceBlock_.workspace.markFocused();
                    this.returnEphemeralFocus();
                    return;
                }
                default: {
                    return;
                }
            }
            const [newX, newY] = this.selected;
            this.focusCell(newX, newY);
            e.preventDefault();
            e.stopPropagation();
        });
    }
    addBlurHandler() {
        this.blurBinding = Blockly.browserEvents.bind(this.matrixSvg, 'blur', this, (_e) => {
            if (this.clearSelectionOnBlur) {
                this.removeKeyboardFocusHandlers();
                this.clearCellSelection();
            }
            else {
                this.clearFocusIndicator();
            }
        });
    }
    focusCell(x, y) {
        this.setCellSelection(x, y);
        this.setFocusIndicator(this.cells[x][y], this.useTwoToneFocusIndicator(x, y));
    }
    setCellSelection(x, y) {
        this.matrixSvg.setAttribute('aria-activedescendant', this.getCellId(x, y));
    }
    clearCellSelection() {
        if (this.selected) {
            this.clearFocusIndicator();
            this.selected = undefined;
        }
        this.matrixSvg.removeAttribute('aria-activedescendant');
    }
    setFocusIndicator(cell, useTwoToneFocusIndicator) {
        this.clearFocusIndicator();
        const focusVisible = this.matrixSvg.matches(":focus-visible");
        if (!focusVisible && !this.forceFocusVisible)
            return;
        const cellG = cell.parentNode;
        const cellWidth = parseInt(cell.getAttribute("width"));
        const cornerRadius = parseInt(cell.getAttribute("rx"));
        pxsim.svg.child(cellG, "rect", {
            transform: 'translate(-2, -2)',
            width: cellWidth + 4,
            height: cellWidth + 4,
            rx: `${Math.max(2, cornerRadius)}px`,
            stroke: "#fff",
            "stroke-width": 4,
            fill: "none"
        });
        if (useTwoToneFocusIndicator) {
            pxsim.svg.child(cellG, "rect", {
                transform: 'translate(-1, -1)',
                width: cellWidth + 2,
                height: cellWidth + 2,
                rx: `${Math.max(2, cornerRadius)}px`,
                stroke: "#000",
                "stroke-width": 2,
                fill: "none"
            });
        }
    }
    clearFocusIndicator() {
        this.cells.forEach(cell => cell.forEach(cell => {
            while (cell.nextElementSibling) {
                cell.nextElementSibling.remove();
            }
        }));
    }
    addKeyboardFocusHandlers() {
        if (this.sourceBlock_.isInFlyout)
            return;
        this.addKeyDownHandler();
        this.addBlurHandler();
    }
    attachEventHandlersToMatrix() {
        if (this.sourceBlock_.isInFlyout)
            return;
        for (let x = 0; x < this.numMatrixCols; ++x) {
            for (let y = 0; y < this.numMatrixRows; ++y) {
                this.attachPointerEventHandlersToCell(x, y, this.cells[x][y]);
            }
        }
    }
    returnEphemeralFocus() {
        if (this.returnEphemeralFocusFn) {
            // Clear field before running function. If this is called due to 'Escape',
            // onNodeBlur will fire running this function again.
            // onNodeBlur is required for mouse clicks in the workspace.
            const returnEphemeralFocusFn = this.returnEphemeralFocusFn;
            this.returnEphemeralFocusFn = undefined;
            returnEphemeralFocusFn();
        }
    }
    removeKeyboardFocusHandlers() {
        if (this.keyDownBinding) {
            Blockly.browserEvents.unbind(this.keyDownBinding);
            this.keyDownBinding = undefined;
        }
        if (this.blurBinding) {
            Blockly.browserEvents.unbind(this.blurBinding);
            this.blurBinding = undefined;
        }
    }
}
exports.FieldMatrix = FieldMatrix;
Blockly.Css.register(`
    .blocklyMatrix:focus-visible {
        outline: none;
    }
`);
