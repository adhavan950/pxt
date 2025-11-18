"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldNote = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
var Note;
(function (Note) {
    Note[Note["C"] = 262] = "C";
    Note[Note["CSharp"] = 277] = "CSharp";
    Note[Note["D"] = 294] = "D";
    Note[Note["Eb"] = 311] = "Eb";
    Note[Note["E"] = 330] = "E";
    Note[Note["F"] = 349] = "F";
    Note[Note["FSharp"] = 370] = "FSharp";
    Note[Note["G"] = 392] = "G";
    Note[Note["GSharp"] = 415] = "GSharp";
    Note[Note["A"] = 440] = "A";
    Note[Note["Bb"] = 466] = "Bb";
    Note[Note["B"] = 494] = "B";
    Note[Note["C3"] = 131] = "C3";
    Note[Note["CSharp3"] = 139] = "CSharp3";
    Note[Note["D3"] = 147] = "D3";
    Note[Note["Eb3"] = 156] = "Eb3";
    Note[Note["E3"] = 165] = "E3";
    Note[Note["F3"] = 175] = "F3";
    Note[Note["FSharp3"] = 185] = "FSharp3";
    Note[Note["G3"] = 196] = "G3";
    Note[Note["GSharp3"] = 208] = "GSharp3";
    Note[Note["A3"] = 220] = "A3";
    Note[Note["Bb3"] = 233] = "Bb3";
    Note[Note["B3"] = 247] = "B3";
    Note[Note["C4"] = 262] = "C4";
    Note[Note["CSharp4"] = 277] = "CSharp4";
    Note[Note["D4"] = 294] = "D4";
    Note[Note["Eb4"] = 311] = "Eb4";
    Note[Note["E4"] = 330] = "E4";
    Note[Note["F4"] = 349] = "F4";
    Note[Note["FSharp4"] = 370] = "FSharp4";
    Note[Note["G4"] = 392] = "G4";
    Note[Note["GSharp4"] = 415] = "GSharp4";
    Note[Note["A4"] = 440] = "A4";
    Note[Note["Bb4"] = 466] = "Bb4";
    Note[Note["B4"] = 494] = "B4";
    Note[Note["C5"] = 523] = "C5";
    Note[Note["CSharp5"] = 555] = "CSharp5";
    Note[Note["D5"] = 587] = "D5";
    Note[Note["Eb5"] = 622] = "Eb5";
    Note[Note["E5"] = 659] = "E5";
    Note[Note["F5"] = 698] = "F5";
    Note[Note["FSharp5"] = 740] = "FSharp5";
    Note[Note["G5"] = 784] = "G5";
    Note[Note["GSharp5"] = 831] = "GSharp5";
    Note[Note["A5"] = 880] = "A5";
    Note[Note["Bb5"] = 932] = "Bb5";
    Note[Note["B5"] = 988] = "B5";
    Note[Note["C6"] = 1047] = "C6";
    Note[Note["CSharp6"] = 1109] = "CSharp6";
    Note[Note["D6"] = 1175] = "D6";
    Note[Note["Eb6"] = 1245] = "Eb6";
    Note[Note["E6"] = 1319] = "E6";
    Note[Note["F6"] = 1397] = "F6";
    Note[Note["FSharp6"] = 1480] = "FSharp6";
    Note[Note["G6"] = 1568] = "G6";
    Note[Note["GSharp6"] = 1568] = "GSharp6";
    Note[Note["A6"] = 1760] = "A6";
    Note[Note["Bb6"] = 1865] = "Bb6";
    Note[Note["B6"] = 1976] = "B6";
    Note[Note["C7"] = 2093] = "C7";
})(Note || (Note = {}));
class FieldNote extends Blockly.FieldNumber {
    constructor(text, params, validator) {
        // passing null as we need more state before we properly set value.
        super(null, 0, null, null, validator);
        this.isFieldCustom_ = true;
        this.SERIALIZABLE = true;
        this.isTextValid_ = true;
        /**
         * default number of piano keys
         */
        this.nKeys_ = 36;
        this.minNote_ = 28;
        this.maxNote_ = 63;
        /** Absolute error for note frequency identification (Hz) **/
        this.eps = 2;
        this.keyHandler = (ev) => {
            const currentFreq = typeof this.value_ === "string" ? parseFloat(this.value_) : this.value_;
            if (ev.code === "ArrowUp" || ev.code === "ArrowDown") {
                const { keyAbove, keyBelow } = this.getNeighboringKeys(currentFreq);
                const newKey = ev.code === "ArrowUp" ? keyAbove : keyBelow;
                const newFrequency = this.getKeyFreq(newKey);
                this.setValue(newFrequency);
                this.playKey(this.piano[newKey - this.minNote_], newFrequency);
                this.noteLabel.textContent = this.getKeyName(newKey);
                ev.stopPropagation();
                ev.preventDefault();
            }
        };
        this.setSpellcheck(false);
        this.prepareNotes();
        this.isExpanded = false;
        this.currentPage = 0;
        this.totalPlayCount = 0;
        if (params.editorColour) {
            this.primaryColour = (0, field_utils_1.parseColour)(params.editorColour);
            this.borderColour = Blockly.utils.colour.blend("#000000", this.primaryColour, 0.2);
        }
        const eps = parseInt(params.eps);
        if (!Number.isNaN(eps) && eps >= 0) {
            this.eps = eps;
        }
        const minNote = parseInt(params.minNote) || this.minNote_;
        const maxNote = parseInt(params.maxNote) || this.maxNote_;
        if (minNote >= 28 && maxNote <= 75 && maxNote > minNote) {
            this.minNote_ = minNote;
            this.maxNote_ = maxNote;
            this.nKeys_ = this.maxNote_ - this.minNote_ + 1;
        }
        this.setValue(text);
    }
    /**
     * Ensure that only a non negative number may be entered.
     * @param {string} text The user's text.
     * @return A string representing a valid positive number, or null if invalid.
     */
    doClassValidation_(text) {
        // accommodate note strings like "Note.GSharp5" as well as numbers
        const match = /^Note\.(.+)$/.exec(text);
        const noteName = (match && match.length > 1) ? match[1] : null;
        text = Note[noteName] ? Note[noteName] : String(parseFloat(text || "0"));
        if (text === null) {
            return null;
        }
        const n = parseFloat(text || "0");
        if (isNaN(n) || n < 0) {
            return null;
        }
        const showDecimal = Math.floor(n) != n;
        return Number(n.toFixed(showDecimal ? 2 : 0));
    }
    /**
     * Return the current note frequency.
     * @return Current note in string format.
     */
    getValue() {
        return this.value_ + "";
    }
    /**
     * Called by setValue if the text input is valid. Updates the value of the
     * field, and updates the text of the field if it is not currently being
     * edited (i.e. handled by the htmlInput_).
     * @param {string} note The new note in string format.
     */
    doValueUpdate_(note) {
        if (isNaN(Number(note)) || Number(note) < 0)
            return;
        if (this.sourceBlock_ && Blockly.Events.isEnabled() && this.value_ != note) {
            Blockly.Events.fire(new Blockly.Events.BlockChange(this.sourceBlock_, "field", this.name, this.value_, note));
        }
        this.value_ = note;
        this.refreshText();
    }
    /**
     * Get the text from this field
     * @return Current text.
     */
    getText() {
        if (this.isExpanded) {
            return "" + this.value_;
        }
        else {
            return this.getNoteString();
        }
    }
    getFieldDescription() {
        return this.getNoteString() || lf("note");
    }
    getNoteString() {
        const note = +this.value_;
        for (let i = 0; i < this.nKeys_; i++) {
            if (Math.abs(this.getKeyFreq(i + this.minNote_) - note) < this.eps) {
                return this.getKeyName(i + this.minNote_);
            }
        }
        let text = note.toString();
        if (!isNaN(note))
            text += " Hz";
        return text;
    }
    /**
     * This block shows up differently when it's being edited;
     * on any transition between `editing <--> not-editing`
     * or other change in state,
     * refresh the text to get back into a valid state.
     **/
    refreshText() {
        this.forceRerender();
    }
    onFinishEditing_(text) {
        this.refreshText();
    }
    onHide() {
        this.isExpanded = false;
        this.refreshText();
    }
    ;
    widgetDispose_() {
        this.htmlInput_.removeEventListener("keydown", this.keyHandler);
        super.widgetDispose_();
    }
    /**
     * Create a piano under the note field.
     */
    showEditor_(e) {
        this.isExpanded = true;
        this.updateColor();
        // If there is an existing drop-down someone else owns, hide it immediately and clear it.
        Blockly.DropDownDiv.hideWithoutAnimation();
        (0, field_utils_1.clearDropDownDiv)();
        const isMobile = pxt.BrowserUtils.isMobile() || pxt.BrowserUtils.isIOS();
        // invoke FieldTextInputs showeditor, so we can set quiet explicitly / not have a pop up dialogue
        super.showEditor_(e, isMobile);
        this.refreshText();
        // save all changes in the same group of events
        Blockly.Events.setGroup(true);
        this.piano = [];
        this.currentSelectedKey = undefined;
        const totalWhiteKeys = this.nKeys_ - (this.nKeys_ / FieldNote.notesPerOctave * FieldNote.blackKeysPerOctave);
        const whiteKeysPerOctave = FieldNote.notesPerOctave - FieldNote.blackKeysPerOctave;
        let pianoWidth = FieldNote.keyWidth * totalWhiteKeys;
        let pianoHeight = FieldNote.keyHeight + FieldNote.labelHeight;
        const pagination = window.innerWidth < pianoWidth;
        if (pagination) {
            pianoWidth = whiteKeysPerOctave * FieldNote.keyWidth;
            pianoHeight = FieldNote.keyHeight + FieldNote.labelHeight + FieldNote.prevNextHeight;
        }
        const pianoDiv = createStyledDiv("blocklyPianoDiv", `width: ${pianoWidth}px;
            height: ${pianoHeight}px;`);
        Blockly.DropDownDiv.getContentDiv().appendChild(pianoDiv);
        // render note label
        this.noteLabel = createStyledDiv("blocklyNoteLabel", `top: ${FieldNote.keyHeight}px;
            width: ${pianoWidth}px;
            background-color: ${this.primaryColour};
            border-color: ${this.primaryColour};`);
        pianoDiv.appendChild(this.noteLabel);
        this.noteLabel.textContent = "-";
        let startingPage = 0;
        for (let i = 0; i < this.nKeys_; i++) {
            const currentOctave = Math.floor(i / FieldNote.notesPerOctave);
            let position = this.getPosition(i + this.minNote_);
            // modify original position in pagination
            if (pagination && i >= FieldNote.notesPerOctave)
                position -= whiteKeysPerOctave * currentOctave * FieldNote.keyWidth;
            const key = this.getKeyDiv(i + this.minNote_, position);
            this.piano.push(key);
            pianoDiv.appendChild(key);
            // if the current value is within eps of this note, select it.
            if (Math.abs(this.getKeyFreq(i + this.minNote_) - Number(this.getValue())) < this.eps) {
                pxt.BrowserUtils.addClass(key, "selected");
                this.currentSelectedKey = key;
                startingPage = currentOctave;
            }
        }
        if (pagination) {
            this.setPage(startingPage);
            pianoDiv.appendChild(this.getNextPrevDiv(/** prev **/ true, pianoWidth));
            pianoDiv.appendChild(this.getNextPrevDiv(/** prev **/ false, pianoWidth));
        }
        Blockly.DropDownDiv.setColour(this.primaryColour, this.borderColour);
        Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_, () => this.onHide(), undefined, false);
        this.htmlInput_.addEventListener("keydown", this.keyHandler);
    }
    playKey(key, frequency) {
        const notePlayID = ++this.totalPlayCount;
        if (this.currentSelectedKey !== key) {
            if (this.currentSelectedKey)
                pxt.BrowserUtils.removeClass(this.currentSelectedKey, "selected");
            pxt.BrowserUtils.addClass(key, "selected");
            this.setValue(frequency);
        }
        this.currentSelectedKey = key;
        /**
         * force a rerender of the preview; other attempts at changing the value
         * do not show up on the block itself until after the fieldeditor is closed,
         * as it is currently in an editable state.
         **/
        this.htmlInput_.value = this.getText();
        pxt.AudioContextManager.tone(frequency);
        setTimeout(() => {
            // Clear the sound if it is still playing after 300ms
            if (this.totalPlayCount == notePlayID)
                pxt.AudioContextManager.stop();
        }, 300);
    }
    /**
     * Close the note picker if this input is being deleted.
     */
    dispose() {
        Blockly.DropDownDiv.hideIfOwner(this);
        super.dispose();
    }
    updateColor() {
        const parent = this.sourceBlock_.getParent();
        if (parent && (this.sourceBlock_.isShadow() || hasOnlyOneField(this.sourceBlock_))) {
            this.primaryColour = parent.getColour();
            this.borderColour = parent.getColourTertiary();
        }
        else {
            this.primaryColour = "#3D3D3D";
            this.borderColour = "#2A2A2A";
        }
    }
    setPage(page) {
        const pageCount = this.nKeys_ / FieldNote.notesPerOctave;
        page = Math.max(Math.min(page, pageCount - 1), 0);
        this.noteLabel.textContent = `Octave #${page + 1}`;
        const firstKeyInOctave = page * FieldNote.notesPerOctave;
        for (let i = 0; i < this.piano.length; ++i) {
            const isInOctave = i >= firstKeyInOctave && i < firstKeyInOctave + FieldNote.notesPerOctave;
            this.piano[i].style.display = isInOctave ? "block" : "none";
        }
        this.currentPage = page;
    }
    ;
    /**
     * create a DOM to assign a style to the previous and next buttons
     * @param pianoWidth the width of the containing piano
     * @param isPrev true if is previous button, false otherwise
     * @return DOM with the new css style.s
     */
    getNextPrevDiv(isPrev, pianoWidth) {
        const xPosition = isPrev ? 0 : (pianoWidth / 2);
        const yPosition = FieldNote.keyHeight + FieldNote.labelHeight;
        const output = createStyledDiv("blocklyNotePrevNext", `top: ${yPosition}px;
            left: ${xPosition}px;
            width: ${Math.ceil(pianoWidth / 2)}px;
            ${isPrev ? "border-left-color" : "border-right-color"}: ${this.primaryColour};
            background-color: ${this.primaryColour};
            border-bottom-color: ${this.primaryColour};`);
        pxt.BrowserUtils.pointerEvents.down.forEach(ev => {
            Blockly.browserEvents.conditionalBind(output, ev, this, () => this.setPage(isPrev ? this.currentPage - 1 : this.currentPage + 1), 
            /** noCaptureIdentifier **/ true);
        });
        output.textContent = isPrev ? "<" : ">";
        return output;
    }
    getKeyDiv(keyInd, leftPosition) {
        const output = createStyledDiv(`blocklyNote ${this.isWhite(keyInd) ? "" : "black"}`, `width: ${this.getKeyWidth(keyInd)}px;
            height: ${this.getKeyHeight(keyInd)}px;
            left: ${leftPosition}px;
            border-color: ${this.primaryColour};`);
        pxt.BrowserUtils.pointerEvents.down.forEach(ev => {
            Blockly.browserEvents.conditionalBind(output, ev, this, () => this.playKey(output, this.getKeyFreq(keyInd)), 
            /** noCaptureIdentifier **/ true);
        });
        Blockly.browserEvents.conditionalBind(output, 'mouseover', this, (e) => {
            this.noteLabel.textContent = this.getKeyName(keyInd);
            if (e.buttons) {
                this.playKey(output, this.getKeyFreq(keyInd));
            }
        }, 
        /** noCaptureIdentifier **/ true);
        return output;
    }
    /**
     * @param idx index of the key
     * @return true if idx is white
     */
    isWhite(idx) {
        idx += 8;
        switch (idx % 12) {
            case 1:
            case 3:
            case 6:
            case 8:
            case 10:
                return false;
            default:
                return true;
        }
    }
    whiteKeysBefore(idx) {
        idx += 8;
        switch (idx % 12) {
            case 0: return 0;
            case 1:
            case 2:
                return 1;
            case 3:
            case 4:
                return 2;
            case 5:
                return 3;
            case 6:
            case 7:
                return 4;
            case 8:
            case 9:
                return 5;
            case 10:
            case 11:
                return 6;
        }
        return -1;
    }
    /**
     * get width of the piano key
     * @param idx index of the key
     * @return width of the key
     */
    getKeyWidth(idx) {
        if (this.isWhite(idx))
            return FieldNote.keyWidth;
        return FieldNote.keyWidth / 2;
    }
    /**
     * get height of the piano key
     * @param idx index of the key
     * @return height of the key
     */
    getKeyHeight(idx) {
        if (this.isWhite(idx))
            return FieldNote.keyHeight;
        return FieldNote.keyHeight / 2;
    }
    getNeighboringKeys(freq) {
        let lowerBound;
        let upperBound;
        for (let candidate = this.minNote_; candidate <= this.maxNote_; ++candidate) {
            if (this.getKeyFreq(candidate) + this.eps > freq) {
                upperBound = candidate;
                break;
            }
            lowerBound = candidate;
        }
        // Clamp key range at the top and bottom
        if (!lowerBound) {
            return {
                keyAbove: freq + this.eps > this.getKeyFreq(this.minNote_) ? this.minNote_ + 1 : this.minNote_,
                keyBelow: this.minNote_
            };
        }
        if (!upperBound || upperBound === this.maxNote_) {
            return {
                keyAbove: this.maxNote_,
                keyBelow: freq - this.eps < this.getKeyFreq(this.maxNote_) ? this.maxNote_ - 1 : this.maxNote_
            };
        }
        // If we are within an epsilon of confidence, only consider one boundary point
        if (freq < this.getKeyFreq(lowerBound) + this.eps) {
            upperBound = lowerBound;
        }
        else if (freq > this.getKeyFreq(upperBound) - this.eps) {
            lowerBound = upperBound;
        }
        return { keyAbove: lowerBound + 1, keyBelow: upperBound - 1 };
    }
    getKeyFreq(keyIndex) {
        return this.getKeyNoteData(keyIndex).freq;
    }
    getKeyName(keyIndex) {
        const note = this.getKeyNoteData(keyIndex);
        let name = note.prefixedName;
        if (this.nKeys_ <= FieldNote.notesPerOctave) {
            // special case: one octave
            name = note.name;
        }
        else if (this.minNote_ >= 28 && this.maxNote_ <= 63) {
            // special case: centered
            name = note.altPrefixedName || name;
        }
        return name;
    }
    getKeyNoteData(keyIndex) {
        return FieldNote.Notes[keyIndex];
    }
    /**
     * get the position of the key in the piano
     * @param idx index of the key
     * @return position of the key
     */
    getPosition(idx) {
        if (idx === this.minNote_)
            return 0;
        const blackKeyOffset = (FieldNote.keyWidth / 4);
        const startOctave = Math.floor((this.minNote_ + 8) / FieldNote.notesPerOctave);
        const currentOctave = Math.floor((idx + 8) / FieldNote.notesPerOctave);
        let startOffset = this.whiteKeysBefore(this.minNote_) * FieldNote.keyWidth;
        if (!this.isWhite(this.minNote_)) {
            startOffset -= blackKeyOffset;
        }
        if (currentOctave > startOctave) {
            const octaveWidth = FieldNote.keyWidth * 7;
            const firstOctaveWidth = octaveWidth - startOffset;
            const octaveStart = firstOctaveWidth + (currentOctave - startOctave - 1) * octaveWidth;
            return this.whiteKeysBefore(idx) * FieldNote.keyWidth + octaveStart - (this.isWhite(idx) ? 0 : blackKeyOffset);
        }
        else {
            return this.whiteKeysBefore(idx) * FieldNote.keyWidth - startOffset - (this.isWhite(idx) ? 0 : blackKeyOffset);
        }
    }
    prepareNotes() {
        if (!FieldNote.Notes) {
            FieldNote.Notes = {
                28: { name: lf("{id:note}C"), prefixedName: lf("Low C"), freq: 131 },
                29: { name: lf("C#"), prefixedName: lf("Low C#"), freq: 139 },
                30: { name: lf("{id:note}D"), prefixedName: lf("Low D"), freq: 147 },
                31: { name: lf("D#"), prefixedName: lf("Low D#"), freq: 156 },
                32: { name: lf("{id:note}E"), prefixedName: lf("Low E"), freq: 165 },
                33: { name: lf("{id:note}F"), prefixedName: lf("Low F"), freq: 175 },
                34: { name: lf("F#"), prefixedName: lf("Low F#"), freq: 185 },
                35: { name: lf("{id:note}G"), prefixedName: lf("Low G"), freq: 196 },
                36: { name: lf("G#"), prefixedName: lf("Low G#"), freq: 208 },
                37: { name: lf("{id:note}A"), prefixedName: lf("Low A"), freq: 220 },
                38: { name: lf("A#"), prefixedName: lf("Low A#"), freq: 233 },
                39: { name: lf("{id:note}B"), prefixedName: lf("Low B"), freq: 247 },
                40: { name: lf("{id:note}C"), prefixedName: lf("Middle C"), freq: 262 },
                41: { name: lf("C#"), prefixedName: lf("Middle C#"), freq: 277 },
                42: { name: lf("{id:note}D"), prefixedName: lf("Middle D"), freq: 294 },
                43: { name: lf("D#"), prefixedName: lf("Middle D#"), freq: 311 },
                44: { name: lf("{id:note}E"), prefixedName: lf("Middle E"), freq: 330 },
                45: { name: lf("{id:note}F"), prefixedName: lf("Middle F"), freq: 349 },
                46: { name: lf("F#"), prefixedName: lf("Middle F#"), freq: 370 },
                47: { name: lf("{id:note}G"), prefixedName: lf("Middle G"), freq: 392 },
                48: { name: lf("G#"), prefixedName: lf("Middle G#"), freq: 415 },
                49: { name: lf("{id:note}A"), prefixedName: lf("Middle A"), freq: 440 },
                50: { name: lf("A#"), prefixedName: lf("Middle A#"), freq: 466 },
                51: { name: lf("{id:note}B"), prefixedName: lf("Middle B"), freq: 494 },
                52: { name: lf("{id:note}C"), prefixedName: lf("Tenor C"), altPrefixedName: lf("High C"), freq: 523 },
                53: { name: lf("C#"), prefixedName: lf("Tenor C#"), altPrefixedName: lf("High C#"), freq: 554 },
                54: { name: lf("{id:note}D"), prefixedName: lf("Tenor D"), altPrefixedName: lf("High D"), freq: 587 },
                55: { name: lf("D#"), prefixedName: lf("Tenor D#"), altPrefixedName: lf("High D#"), freq: 622 },
                56: { name: lf("{id:note}E"), prefixedName: lf("Tenor E"), altPrefixedName: lf("High E"), freq: 659 },
                57: { name: lf("{id:note}F"), prefixedName: lf("Tenor F"), altPrefixedName: lf("High F"), freq: 698 },
                58: { name: lf("F#"), prefixedName: lf("Tenor F#"), altPrefixedName: lf("High F#"), freq: 740 },
                59: { name: lf("{id:note}G"), prefixedName: lf("Tenor G"), altPrefixedName: lf("High G"), freq: 784 },
                60: { name: lf("G#"), prefixedName: lf("Tenor G#"), altPrefixedName: lf("High G#"), freq: 831 },
                61: { name: lf("{id:note}A"), prefixedName: lf("Tenor A"), altPrefixedName: lf("High A"), freq: 880 },
                62: { name: lf("A#"), prefixedName: lf("Tenor A#"), altPrefixedName: lf("High A#"), freq: 932 },
                63: { name: lf("{id:note}B"), prefixedName: lf("Tenor B"), altPrefixedName: lf("High B"), freq: 988 },
                64: { name: lf("{id:note}C"), prefixedName: lf("High C"), freq: 1046 },
                65: { name: lf("C#"), prefixedName: lf("High C#"), freq: 1109 },
                66: { name: lf("{id:note}D"), prefixedName: lf("High D"), freq: 1175 },
                67: { name: lf("D#"), prefixedName: lf("High D#"), freq: 1245 },
                68: { name: lf("{id:note}E"), prefixedName: lf("High E"), freq: 1319 },
                69: { name: lf("{id:note}F"), prefixedName: lf("High F"), freq: 1397 },
                70: { name: lf("F#"), prefixedName: lf("High F#"), freq: 1478 },
                71: { name: lf("{id:note}G"), prefixedName: lf("High G"), freq: 1568 },
                72: { name: lf("G#"), prefixedName: lf("High G#"), freq: 1661 },
                73: { name: lf("{id:note}A"), prefixedName: lf("High A"), freq: 1760 },
                74: { name: lf("A#"), prefixedName: lf("High A#"), freq: 1865 },
                75: { name: lf("{id:note}B"), prefixedName: lf("High B"), freq: 1976 }
            };
        }
    }
}
exports.FieldNote = FieldNote;
FieldNote.keyWidth = 22;
FieldNote.keyHeight = 90;
FieldNote.labelHeight = 24;
FieldNote.prevNextHeight = 20;
FieldNote.notesPerOctave = 12;
FieldNote.blackKeysPerOctave = 5;
function hasOnlyOneField(block) {
    return block.inputList.length === 1 && block.inputList[0].fieldRow.length === 1;
}
function createStyledDiv(className, style) {
    const output = document.createElement("div");
    pxt.BrowserUtils.addClass(output, className);
    output.setAttribute("style", style.replace(/\s+/g, " "));
    return output;
}
