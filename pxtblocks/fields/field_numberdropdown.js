"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldNumberDropdown = void 0;
const field_textdropdown_1 = require("./field_textdropdown");
// common time options -- do not remove
// lf("100 ms")
// lf("200 ms")
// lf("500 ms")
// lf("1 second")
// lf("2 seconds")
// lf("5 seconds")
// lf("1 minute")
// lf("1 hour")
class BaseFieldNumberDropdown extends field_textdropdown_1.BaseFieldTextDropdown {
    constructor(value, menuGenerator, opt_min, opt_max, opt_precision, opt_validator) {
        super(value + "", menuGenerator, opt_validator);
        this.setConstraints(opt_min, opt_max, opt_precision);
    }
    setConstraints(min, max, precision) {
        this.setMinInternal(min);
        this.setMaxInternal(max);
        this.setPrecisionInternal(precision);
        this.setValue(this.getValue());
    }
    getValue() {
        return Number(super.getValue());
    }
    setMinInternal(min) {
        if (min == null) {
            this.min_ = -Infinity;
        }
        else {
            min = Number(min);
            if (!isNaN(min)) {
                this.min_ = min;
            }
        }
    }
    setMaxInternal(max) {
        if (max == null) {
            this.max_ = Infinity;
        }
        else {
            max = Number(max);
            if (!isNaN(max)) {
                this.max_ = max;
            }
        }
    }
    setPrecisionInternal(precision) {
        this.precision_ = Number(precision) || 0;
        let precisionString = String(this.precision_);
        if (precisionString.indexOf('e') !== -1) {
            // String() is fast.  But it turns .0000001 into '1e-7'.
            // Use the much slower toLocaleString to access all the digits.
            precisionString = this.precision_.toLocaleString('en-US', {
                maximumFractionDigits: 20,
            });
        }
        const decimalIndex = precisionString.indexOf('.');
        if (decimalIndex === -1) {
            // If the precision is 0 (float) allow any number of decimals,
            // otherwise allow none.
            this.decimalPlaces = precision ? 0 : null;
        }
        else {
            this.decimalPlaces = precisionString.length - decimalIndex - 1;
        }
    }
    doClassValidation_(newValue) {
        if (newValue === null) {
            return null;
        }
        // Clean up text.
        newValue = `${newValue}`;
        // TODO: Handle cases like 'ten', '1.203,14', etc.
        // 'O' is sometimes mistaken for '0' by inexperienced users.
        newValue = newValue.replace(/O/gi, '0');
        // Strip out thousands separators.
        newValue = newValue.replace(/,/g, '');
        // Ignore case of 'Infinity'.
        newValue = newValue.replace(/infinity/i, 'Infinity');
        // Clean up number.
        let n = Number(newValue || 0);
        if (isNaN(n)) {
            // Invalid number.
            return null;
        }
        // Get the value in range.
        if (this.min_ !== undefined) {
            n = Math.max(n, this.min_);
        }
        if (this.max_ !== undefined) {
            n = Math.min(n, this.max_);
        }
        // Round to nearest multiple of precision.
        if (this.precision_ && isFinite(n)) {
            n = Math.round(n / this.precision_) * this.precision_;
        }
        // Clean up floating point errors.
        if (this.decimalPlaces !== null) {
            n = Number(n.toFixed(this.decimalPlaces));
        }
        return n + "";
    }
}
class FieldNumberDropdown extends BaseFieldNumberDropdown {
    constructor(value, options, opt_validator) {
        super(value, parseDropdownOptions(options), options.min, options.max, options.precision, opt_validator);
        this.isFieldCustom_ = true;
    }
    getOptions() {
        let newOptions;
        if (this.menuGenerator_) {
            if (typeof this.menuGenerator_ === "string") {
                this.menuGenerator_ = JSON.parse(this.menuGenerator_);
            }
            newOptions = this.menuGenerator_.map((x) => {
                if (typeof x == 'object') {
                    return [pxt.Util.rlf(x[0]), x[1]];
                }
                else {
                    return [String(x), String(x)];
                }
            });
        }
        return newOptions;
    }
}
exports.FieldNumberDropdown = FieldNumberDropdown;
function parseDropdownOptions(options) {
    let result;
    if (options.values) {
        const parsed = [];
        const data = options.values.split(",");
        let foundError = false;
        for (const entry of data) {
            const parsedValue = parseFloat(entry);
            if (Number.isNaN(parsedValue)) {
                foundError = true;
                break;
            }
            parsed.push([entry, parsedValue]);
        }
        if (!foundError) {
            result = parsed;
        }
    }
    else if (options.data) {
        try {
            const data = JSON.parse(options.data);
            if (Array.isArray(data) && data.length) {
                if (isNumberArray(data)) {
                    return data.map(d => ["" + d, d]);
                }
                else {
                    let foundError = false;
                    for (const value of data) {
                        if (!Array.isArray(value) ||
                            typeof value[0] !== "string" ||
                            typeof value[1] !== "number") {
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
    }
    if (result) {
        return result;
    }
    else {
        pxt.warn("Could not parse numberdropdown data field");
    }
    return [];
}
function isNumberArray(arr) {
    for (const val of arr) {
        if (typeof val !== "number") {
            return false;
        }
    }
    return true;
}
