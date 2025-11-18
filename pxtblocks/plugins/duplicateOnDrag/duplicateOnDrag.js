"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDuplicateOnDragState = exports.shouldDuplicateOnDrag = exports.isAllowlistedShadow = exports.setDuplicateOnDrag = exports.setDraggableShadowBlocks = void 0;
let draggableShadowAllowlist;
let duplicateRefs;
function setDraggableShadowBlocks(ids) {
    draggableShadowAllowlist = ids;
}
exports.setDraggableShadowBlocks = setDraggableShadowBlocks;
/**
 * Configures duplicate on drag for a block's child inputs
 *
 * @param parentBlockType   The type of the parent block
 * @param inputName         The value input to duplicate blocks on when dragged. If not
 *                          specified, all child value inputs will be duplicated
 * @param childBlockType    The type of the child block to be duplicated. If not specified,
 *                          any block attached to the input will be duplicated on drag
 *                          regardless of type
 */
function setDuplicateOnDrag(parentBlockType, inputName, childBlockType) {
    if (!duplicateRefs) {
        duplicateRefs = [];
    }
    const existing = duplicateRefs.some(ref => ref.parentBlockType === parentBlockType && ref.inputName === inputName && ref.childBlockType === childBlockType);
    if (existing) {
        return;
    }
    duplicateRefs.push({
        parentBlockType,
        inputName,
        childBlockType
    });
}
exports.setDuplicateOnDrag = setDuplicateOnDrag;
function isAllowlistedShadow(block) {
    if (draggableShadowAllowlist) {
        if (draggableShadowAllowlist.indexOf(block.type) !== -1) {
            return true;
        }
    }
    return false;
}
exports.isAllowlistedShadow = isAllowlistedShadow;
function shouldDuplicateOnDrag(block) {
    var _a, _b;
    if (block.isShadow() && isAllowlistedShadow(block)) {
        return true;
    }
    if (duplicateRefs) {
        const parent = (_a = block.outputConnection) === null || _a === void 0 ? void 0 : _a.targetBlock();
        if (parent) {
            const refs = duplicateRefs.filter(r => r.parentBlockType === parent.type);
            for (const ref of refs) {
                if (ref && (!ref.childBlockType || ref.childBlockType === block.type)) {
                    if (ref.inputName) {
                        const targetConnection = block.outputConnection.targetConnection;
                        if (((_b = targetConnection.getParentInput()) === null || _b === void 0 ? void 0 : _b.name) === ref.inputName) {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
exports.shouldDuplicateOnDrag = shouldDuplicateOnDrag;
function updateDuplicateOnDragState(block) {
    // run this in a timeout to ensure that the block's parent has been intialized
    // in case this is called during block initialization
    setTimeout(() => {
        const shouldDuplicate = shouldDuplicateOnDrag(block);
        if (block.pathObject) {
            block.pathObject.setHasDottedOutlineOnHover(shouldDuplicate);
        }
        block.setDeletable(!shouldDuplicate);
    });
}
exports.updateDuplicateOnDragState = updateDuplicateOnDragState;
