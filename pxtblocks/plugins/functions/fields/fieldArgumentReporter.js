"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setArgumentReporterLocalizeFunction = exports.FieldArgumentReporter = void 0;
const Blockly = require("blockly");
const utils_1 = require("../utils");
let localizeFunction;
class FieldArgumentReporter extends Blockly.FieldLabelSerializable {
    getDisplayText_() {
        const source = this.getSourceBlock();
        if (source && (0, utils_1.isFunctionArgumentReporter)(source) && localizeFunction) {
            const localized = localizeFunction(this, source);
            if (localized) {
                return localized;
            }
        }
        return super.getDisplayText_();
    }
}
exports.FieldArgumentReporter = FieldArgumentReporter;
function setArgumentReporterLocalizeFunction(func) {
    localizeFunction = func;
}
exports.setArgumentReporterLocalizeFunction = setArgumentReporterLocalizeFunction;
Blockly.registry.register(Blockly.registry.Type.FIELD, "field_argument_reporter", FieldArgumentReporter);
