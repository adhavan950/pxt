"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFlyoutInflaters = exports.MultiFlyoutRecyclableBlockInflater = exports.LabelFlyoutInflater = exports.ButtonFlyoutInflater = void 0;
const buttonFlyoutInflater_1 = require("./buttonFlyoutInflater");
Object.defineProperty(exports, "ButtonFlyoutInflater", { enumerable: true, get: function () { return buttonFlyoutInflater_1.ButtonFlyoutInflater; } });
const labelFlyoutInflater_1 = require("./labelFlyoutInflater");
Object.defineProperty(exports, "LabelFlyoutInflater", { enumerable: true, get: function () { return labelFlyoutInflater_1.LabelFlyoutInflater; } });
const blockInflater_1 = require("./blockInflater");
Object.defineProperty(exports, "MultiFlyoutRecyclableBlockInflater", { enumerable: true, get: function () { return blockInflater_1.MultiFlyoutRecyclableBlockInflater; } });
__exportStar(require("./cachingFlyout"), exports);
function registerFlyoutInflaters() {
    buttonFlyoutInflater_1.ButtonFlyoutInflater.register();
    labelFlyoutInflater_1.LabelFlyoutInflater.register();
    blockInflater_1.MultiFlyoutRecyclableBlockInflater.register();
}
exports.registerFlyoutInflaters = registerFlyoutInflaters;
