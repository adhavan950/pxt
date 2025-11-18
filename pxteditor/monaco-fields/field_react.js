"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoReactFieldEditor = void 0;
const fieldEditorId = "image-editor";
class MonacoReactFieldEditor {
    getId() {
        return fieldEditorId;
    }
    showEditorAsync(fileType, editrange, host) {
        this.fileType = fileType;
        this.editrange = editrange;
        this.host = host;
        return this.initAsync().then(() => {
            const value = this.textToValue(host.getText(editrange));
            if (!value) {
                return Promise.resolve(null);
            }
            this.fv = pxt.react.getFieldEditorView(this.getFieldEditorId(), value, this.getOptions());
            this.fv.onHide(() => {
                this.onClosed();
            });
            this.fv.show();
            return new Promise((resolve, reject) => {
                this.resolver = resolve;
                this.rejecter = reject;
            });
        });
    }
    onClosed() {
        if (this.resolver) {
            this.resolver({
                range: this.editrange,
                replacement: this.resultToText(this.fv.getResult())
            });
            this.editrange = undefined;
            this.resolver = undefined;
            this.rejecter = undefined;
        }
    }
    dispose() {
        this.onClosed();
    }
    initAsync() {
        return Promise.resolve();
    }
    textToValue(text) {
        return null;
    }
    resultToText(result) {
        return result + "";
    }
    getFieldEditorId() {
        return "";
    }
    getOptions() {
        return null;
    }
}
exports.MonacoReactFieldEditor = MonacoReactFieldEditor;
