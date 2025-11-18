"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldScopedValueSelector = void 0;
const Blockly = require("blockly");
const field_utils_1 = require("./field_utils");
class FieldScopedValueSelector extends Blockly.FieldLabel {
    constructor(value, params) {
        super(value);
        this.isFieldCustom_ = true;
        this.types = [];
        this.dragging = false;
        this.onDragEvent = (ev) => {
            var _a;
            // Make sure our block is in the event
            const block = ev.blocks.find(b => b.id === this.sourceBlock_.id);
            if (!block)
                return;
            this.dragging = ev.isStart;
            if (ev.isStart) {
                this.forceRerender();
                return;
            }
            // gather all scopes where we might find a compatible value
            const scopes = [];
            {
                let parent = (_a = this.sourceBlock_.getParent()) === null || _a === void 0 ? void 0 : _a.getParent();
                while (parent) {
                    scopes.push(parent);
                    parent = parent.getParent();
                }
            }
            const getCodeCard = (block) => {
                return block.codeCard;
            };
            const apiInfos = pxt.getBundledApiInfo();
            const getSymbolInfo = (block) => {
                const card = getCodeCard(block);
                if (!card || !card.name)
                    return null;
                // check each entry in apiInfo
                for (const info of Object.values(apiInfos)) {
                    if (info.apis.byQName[card.name]) {
                        return info.apis.byQName[card.name];
                    }
                }
                return undefined;
            };
            // find the value in the scopes
            this.scopedValue = null;
            for (const scope of scopes) {
                if (scope.type === "variables_set") {
                    const inputList = scope.inputList;
                    const input = inputList.find(i => i.name === "VALUE");
                    if (!input)
                        continue;
                    const fieldRow = input.fieldRow;
                    if (!fieldRow)
                        continue;
                    const field = fieldRow.find(f => f.name === "VAR");
                    if (!field)
                        continue;
                    const variable = field.getVariable();
                    if (!variable)
                        continue;
                    //if (this.types.includes(variable.type)) {
                    {
                        return this.setValue(variable.getName());
                    }
                    continue;
                }
                const symbol = getSymbolInfo(scope);
                if (!symbol)
                    continue;
                for (const parameter of symbol.parameters) {
                    if (parameter.handlerParameters) {
                        for (const handlerParameter of parameter.handlerParameters) {
                            if (this.types.includes(handlerParameter.type)) {
                                return this.setValue(handlerParameter.name);
                            }
                        }
                    }
                }
            }
            this.setValue(this.defl);
        };
        this.onWorkspaceChange = (ev) => {
            if (!this.sourceBlock_ || !this.sourceBlock_.workspace || this.sourceBlock_.disposed)
                return;
            if (ev.type === Blockly.Events.BLOCK_DRAG)
                return this.onDragEvent(ev);
        };
        this.defl = params.defl;
        if (params.types)
            this.types = params.types.split(",");
        else if (params.type)
            this.types = [params.type];
        this.types = this.types.map(t => t.trim().replace(/['"]+/g, ""));
    }
    init() {
        super.init();
        if (this.sourceBlock_) {
            this.scopedValue = (0, field_utils_1.getBlockDataForField)(this.sourceBlock_, "scopedValue");
            this.sourceBlock_.workspace.addChangeListener(this.onWorkspaceChange);
        }
    }
    dispose() {
        if (this.sourceBlock_) {
            this.sourceBlock_.workspace.removeChangeListener(this.onWorkspaceChange);
        }
        super.dispose();
    }
    getValue() {
        var _a;
        // compiler emits into typescript
        if ((_a = this.sourceBlock_) === null || _a === void 0 ? void 0 : _a.isInFlyout) {
            return lf("(dynamic)");
        }
        else if (this.dragging) {
            return lf("what will it be?");
        }
        if (this.sourceBlock_ && !this.scopedValue) {
            this.scopedValue = (0, field_utils_1.getBlockDataForField)(this.sourceBlock_, "scopedValue");
        }
        return this.scopedValue || this.defl || lf("unknown");
    }
    setValue(newValue, fireChangeEvent) {
        this.scopedValue = newValue || this.defl || lf("unknown");
        if (this.sourceBlock_)
            (0, field_utils_1.setBlockDataForField)(this.sourceBlock_, "scopedValue", this.scopedValue || "");
        super.setValue(this.scopedValue, fireChangeEvent);
        this.forceRerender();
    }
    getFieldDescription() {
        return this.scopedValue || this.defl || lf("value");
    }
}
exports.FieldScopedValueSelector = FieldScopedValueSelector;
