"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockDragger = void 0;
const Blockly = require("blockly");
class BlockDragger extends Blockly.dragging.Dragger {
    onDrag(e, totalDelta) {
        super.onDrag(e, totalDelta);
        const blocklyToolboxDiv = document.getElementsByClassName('blocklyToolbox')[0];
        const blocklyTreeRoot = document.getElementsByClassName('blocklyTreeRoot')[0]
            || document.getElementsByClassName('blocklyFlyout')[0];
        const trashIcon = document.getElementById("blocklyTrashIcon");
        if (blocklyTreeRoot && trashIcon) {
            const rect = blocklyTreeRoot.getBoundingClientRect();
            const distance = calculateDistance(blocklyTreeRoot.getBoundingClientRect(), e.clientX);
            const isMouseDrag = Blockly.Gesture.inProgress();
            if ((isMouseDrag && distance < 200) || (!isMouseDrag && isOverlappingRect(rect, e.clientX))) {
                const opacity = distance / 200;
                trashIcon.style.opacity = `${1 - opacity}`;
                trashIcon.style.display = 'block';
                if (blocklyToolboxDiv) {
                    blocklyTreeRoot.style.opacity = `${opacity}`;
                    if (distance < 50) {
                        pxt.BrowserUtils.addClass(blocklyToolboxDiv, 'blocklyToolboxDeleting');
                    }
                }
            }
            else {
                trashIcon.style.display = 'none';
                blocklyTreeRoot.style.opacity = '1';
                if (blocklyToolboxDiv)
                    pxt.BrowserUtils.removeClass(blocklyToolboxDiv, 'blocklyToolboxDeleting');
            }
        }
    }
    onDragEnd(e) {
        super.onDragEnd(e);
        const blocklyToolboxDiv = document.getElementsByClassName('blocklyToolbox')[0];
        const blocklyTreeRoot = document.getElementsByClassName('blocklyTreeRoot')[0]
            || document.getElementsByClassName('blocklyFlyout')[0];
        const trashIcon = document.getElementById("blocklyTrashIcon");
        if (trashIcon && blocklyTreeRoot) {
            trashIcon.style.display = 'none';
            blocklyTreeRoot.style.opacity = '1';
            if (blocklyToolboxDiv)
                pxt.BrowserUtils.removeClass(blocklyToolboxDiv, 'blocklyToolboxDeleting');
        }
    }
}
exports.BlockDragger = BlockDragger;
function calculateDistance(elemBounds, mouseX) {
    return Math.abs(mouseX - (elemBounds.left + (elemBounds.width / 2)));
}
function isOverlappingRect(elemBounds, mouseX) {
    return (mouseX - (elemBounds.left + (elemBounds.width))) < 0;
}
