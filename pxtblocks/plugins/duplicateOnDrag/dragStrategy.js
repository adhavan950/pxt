"use strict";
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDuplicateOnDragStrategy = exports.DuplicateOnDragStrategy = void 0;
const Blockly = require("blockly");
const duplicateOnDrag_1 = require("./duplicateOnDrag");
var eventUtils = Blockly.Events;
var Coordinate = Blockly.utils.Coordinate;
var dom = Blockly.utils.dom;
const BLOCK_LAYER = 50; // not exported by blockly
class DuplicateOnDragStrategy {
    constructor(block) {
        this.block = block;
        /** The parent block at the start of the drag. */
        this.startParentConn = null;
        /**
         * The child block at the start of the drag. Only gets set if
         * `healStack` is true.
         */
        this.startChildConn = null;
        this.startLoc = null;
        this.connectionCandidate = null;
        this.connectionPreviewer = null;
        this.dragging = false;
        /** Used to persist an event group when snapping is done async. */
        this.originalEventGroup = '';
        /**
         * If this is a shadow block, the offset between this block and the parent
         * block, to add to the drag location. In workspace units.
         */
        this.dragOffset = new Coordinate(0, 0);
        this.workspace = block.workspace;
    }
    /** Returns true if the block is currently movable. False otherwise. */
    isMovable() {
        var _a, _b;
        if (this.block.isShadow()) {
            return (_b = (_a = this.block.getParent()) === null || _a === void 0 ? void 0 : _a.isMovable()) !== null && _b !== void 0 ? _b : false;
        }
        return (this.block.isOwnMovable() &&
            !this.block.isDeadOrDying() &&
            !this.workspace.options.readOnly &&
            // We never drag blocks in the flyout, only create new blocks that are
            // dragged.
            !this.block.isInFlyout);
    }
    /**
     * Handles any setup for starting the drag, including disconnecting the block
     * from any parent blocks.
     */
    startDrag(e) {
        var _a;
        if (this.block.isShadow() && !(0, duplicateOnDrag_1.isAllowlistedShadow)(this.block)) {
            this.startDraggingShadow(e);
            return;
        }
        this.dragging = true;
        if (!eventUtils.getGroup()) {
            eventUtils.setGroup(true);
        }
        this.fireDragStartEvent();
        this.startLoc = this.block.getRelativeToSurfaceXY();
        const previewerConstructor = Blockly.registry.getClassFromOptions(Blockly.registry.Type.CONNECTION_PREVIEWER, this.workspace.options);
        this.connectionPreviewer = new previewerConstructor(this.block);
        // During a drag there may be a lot of rerenders, but not field changes.
        // Turn the cache on so we don't do spurious remeasures during the drag.
        dom.startTextWidthCache();
        this.workspace.setResizesEnabled(false);
        Blockly.blockAnimations.disconnectUiStop();
        const healStack = !!e && (e.altKey || e.ctrlKey || e.metaKey);
        if (this.shouldDisconnect(healStack)) {
            this.disconnectBlock(healStack);
        }
        this.block.setDragging(true);
        (_a = this.workspace.getLayerManager()) === null || _a === void 0 ? void 0 : _a.moveToDragLayer(this.block);
    }
    /** Starts a drag on a shadow, recording the drag offset. */
    startDraggingShadow(e) {
        const parent = this.block.getParent();
        if (!parent) {
            throw new Error('Tried to drag a shadow block with no parent. ' +
                'Shadow blocks should always have parents.');
        }
        this.dragOffset = Coordinate.difference(parent.getRelativeToSurfaceXY(), this.block.getRelativeToSurfaceXY());
        parent.startDrag(e);
    }
    /**
     * Whether or not we should disconnect the block when a drag is started.
     *
     * @param healStack Whether or not to heal the stack after disconnecting.
     * @returns True to disconnect the block, false otherwise.
     */
    shouldDisconnect(healStack) {
        return !!(this.block.getParent() ||
            (healStack &&
                this.block.nextConnection &&
                this.block.nextConnection.targetBlock()));
    }
    /**
     * Disconnects the block from any parents. If `healStack` is true and this is
     * a stack block, we also disconnect from any next blocks and attempt to
     * attach them to any parent.
     *
     * @param healStack Whether or not to heal the stack after disconnecting.
     */
    disconnectBlock(healStack) {
        var _a, _b, _c, _d;
        let clone;
        let target;
        let xml;
        const isShadow = this.block.isShadow();
        if (isShadow) {
            this.block.setShadow(false);
        }
        if ((0, duplicateOnDrag_1.shouldDuplicateOnDrag)(this.block)) {
            const output = this.block.outputConnection;
            if (!(output === null || output === void 0 ? void 0 : output.targetConnection))
                return;
            xml = Blockly.Xml.blockToDom(this.block, true);
            if (!isShadow) {
                clone = Blockly.Xml.domToBlock(xml, this.block.workspace);
            }
            target = output.targetConnection;
        }
        this.startParentConn =
            (_b = (_a = this.block.outputConnection) === null || _a === void 0 ? void 0 : _a.targetConnection) !== null && _b !== void 0 ? _b : (_c = this.block.previousConnection) === null || _c === void 0 ? void 0 : _c.targetConnection;
        if (healStack) {
            this.startChildConn = (_d = this.block.nextConnection) === null || _d === void 0 ? void 0 : _d.targetConnection;
        }
        if (target && isShadow) {
            target.setShadowDom(xml);
        }
        this.block.unplug(healStack);
        Blockly.blockAnimations.disconnectUiEffect(this.block);
        (0, duplicateOnDrag_1.updateDuplicateOnDragState)(this.block);
        if (target && clone) {
            target.connect(clone.outputConnection);
        }
    }
    /** Fire a UI event at the start of a block drag. */
    fireDragStartEvent() {
        const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(this.block, true, this.block.getDescendants(false));
        eventUtils.fire(event);
    }
    /** Fire a UI event at the end of a block drag. */
    fireDragEndEvent() {
        const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(this.block, false, this.block.getDescendants(false));
        eventUtils.fire(event);
    }
    /** Fire a move event at the end of a block drag. */
    fireMoveEvent() {
        if (this.block.isDeadOrDying())
            return;
        const event = new (eventUtils.get(eventUtils.BLOCK_MOVE))(this.block);
        event.setReason(['drag']);
        event.oldCoordinate = this.startLoc;
        event.recordNew();
        eventUtils.fire(event);
    }
    /** Moves the block and updates any connection previews. */
    drag(newLoc) {
        var _a;
        if (this.block.isShadow()) {
            (_a = this.block.getParent()) === null || _a === void 0 ? void 0 : _a.drag(Coordinate.sum(newLoc, this.dragOffset));
            return;
        }
        this.block.moveDuringDrag(newLoc);
        this.updateConnectionPreview(this.block, Coordinate.difference(newLoc, this.startLoc));
    }
    /**
     * @param draggingBlock The block being dragged.
     * @param delta How far the pointer has moved from the position
     *     at the start of the drag, in workspace units.
     */
    updateConnectionPreview(draggingBlock, delta) {
        const currCandidate = this.connectionCandidate;
        const newCandidate = this.getConnectionCandidate(draggingBlock, delta);
        if (!newCandidate) {
            this.connectionPreviewer.hidePreview();
            this.connectionCandidate = null;
            return;
        }
        const candidate = currCandidate &&
            this.currCandidateIsBetter(currCandidate, delta, newCandidate)
            ? currCandidate
            : newCandidate;
        this.connectionCandidate = candidate;
        const { local, neighbour } = candidate;
        const localIsOutputOrPrevious = local.type === Blockly.ConnectionType.OUTPUT_VALUE ||
            local.type === Blockly.ConnectionType.PREVIOUS_STATEMENT;
        const neighbourIsConnectedToRealBlock = neighbour.isConnected() && !neighbour.targetBlock().isInsertionMarker();
        if (localIsOutputOrPrevious &&
            neighbourIsConnectedToRealBlock &&
            !this.orphanCanConnectAtEnd(draggingBlock, neighbour.targetBlock(), local.type)) {
            this.connectionPreviewer.previewReplacement(local, neighbour, neighbour.targetBlock());
            return;
        }
        this.connectionPreviewer.previewConnection(local, neighbour);
    }
    /**
     * Returns true if the given orphan block can connect at the end of the
     * top block's stack or row, false otherwise.
     */
    orphanCanConnectAtEnd(topBlock, orphanBlock, localType) {
        const orphanConnection = localType === Blockly.ConnectionType.OUTPUT_VALUE
            ? orphanBlock.outputConnection
            : orphanBlock.previousConnection;
        return !!Blockly.Connection.getConnectionForOrphanedConnection(topBlock, orphanConnection);
    }
    /**
     * Returns true if the current candidate is better than the new candidate.
     *
     * We slightly prefer the current candidate even if it is farther away.
     */
    currCandidateIsBetter(currCandiate, delta, newCandidate) {
        const { local: currLocal, neighbour: currNeighbour } = currCandiate;
        const localPos = new Coordinate(currLocal.x, currLocal.y);
        const neighbourPos = new Coordinate(currNeighbour.x, currNeighbour.y);
        const currDistance = Coordinate.distance(Coordinate.sum(localPos, delta), neighbourPos);
        return (newCandidate.distance > currDistance - Blockly.config.currentConnectionPreference);
    }
    /**
     * Returns the closest valid candidate connection, if one can be found.
     *
     * Valid neighbour connections are within the configured start radius, with a
     * compatible type (input, output, etc) and connection check.
     */
    getConnectionCandidate(draggingBlock, delta) {
        const localConns = this.getLocalConnections(draggingBlock);
        let radius = this.connectionCandidate
            ? Blockly.config.connectingSnapRadius
            : Blockly.config.snapRadius;
        let candidate = null;
        for (const conn of localConns) {
            const { connection: neighbour, radius: rad } = conn.closest(radius, delta);
            if (neighbour) {
                candidate = {
                    local: conn,
                    neighbour: neighbour,
                    distance: rad,
                };
                radius = rad;
            }
        }
        return candidate;
    }
    /**
     * Returns all of the connections we might connect to blocks on the workspace.
     *
     * Includes any connections on the dragging block, and any last next
     * connection on the stack (if one exists).
     */
    getLocalConnections(draggingBlock) {
        const available = draggingBlock.getConnections_(false);
        const lastOnStack = draggingBlock.lastConnectionInStack(true);
        if (lastOnStack && lastOnStack !== draggingBlock.nextConnection) {
            available.push(lastOnStack);
        }
        return available;
    }
    /**
     * Cleans up any state at the end of the drag. Applies any pending
     * connections.
     */
    endDrag(e) {
        var _a, _b;
        if (this.block.isShadow()) {
            (_a = this.block.getParent()) === null || _a === void 0 ? void 0 : _a.endDrag(e);
            return;
        }
        this.originalEventGroup = eventUtils.getGroup();
        this.fireDragEndEvent();
        this.fireMoveEvent();
        dom.stopTextWidthCache();
        Blockly.blockAnimations.disconnectUiStop();
        this.connectionPreviewer.hidePreview();
        if (!this.block.isDeadOrDying() && this.dragging) {
            // These are expensive and don't need to be done if we're deleting, or
            // if we've already stopped dragging because we moved back to the start.
            (_b = this.workspace
                .getLayerManager()) === null || _b === void 0 ? void 0 : _b.moveOffDragLayer(this.block, Blockly.layers.BLOCK);
            this.block.setDragging(false);
        }
        if (this.connectionCandidate) {
            // Applying connections also rerenders the relevant blocks.
            this.applyConnections(this.connectionCandidate);
            this.disposeStep();
        }
        else {
            this.block.queueRender().then(() => this.disposeStep());
        }
    }
    /** Disposes of any state at the end of the drag. */
    disposeStep() {
        const newGroup = eventUtils.getGroup();
        eventUtils.setGroup(this.originalEventGroup);
        this.block.snapToGrid();
        // Must dispose after connections are applied to not break the dynamic
        // connections plugin. See #7859
        this.connectionPreviewer.dispose();
        this.workspace.setResizesEnabled(true);
        eventUtils.setGroup(newGroup);
    }
    /** Connects the given candidate connections. */
    applyConnections(candidate) {
        const { local, neighbour } = candidate;
        local.connect(neighbour);
        const inferiorConnection = local.isSuperior() ? neighbour : local;
        const rootBlock = this.block.getRootBlock();
        Blockly.renderManagement.finishQueuedRenders().then(() => {
            Blockly.blockAnimations.connectionUiEffect(inferiorConnection.getSourceBlock());
            // bringToFront is incredibly expensive. Delay until the next frame.
            setTimeout(() => {
                rootBlock.bringToFront();
            }, 0);
        });
    }
    /**
     * Moves the block back to where it was at the beginning of the drag,
     * including reconnecting connections.
     */
    revertDrag() {
        var _a, _b, _c;
        if (this.block.isShadow()) {
            (_a = this.block.getParent()) === null || _a === void 0 ? void 0 : _a.revertDrag();
            return;
        }
        (_b = this.startChildConn) === null || _b === void 0 ? void 0 : _b.connect(this.block.nextConnection);
        if (this.startParentConn) {
            switch (this.startParentConn.type) {
                case Blockly.ConnectionType.INPUT_VALUE:
                    this.startParentConn.connect(this.block.outputConnection);
                    break;
                case Blockly.ConnectionType.NEXT_STATEMENT:
                    this.startParentConn.connect(this.block.previousConnection);
            }
        }
        else {
            this.block.moveTo(this.startLoc, ['drag']);
            (_c = this.workspace
                .getLayerManager()) === null || _c === void 0 ? void 0 : _c.moveOffDragLayer(this.block, BLOCK_LAYER);
            // Blocks dragged directly from a flyout may need to be bumped into
            // bounds.
            Blockly.bumpObjects.bumpIntoBounds(this.workspace, this.workspace.getMetricsManager().getScrollMetrics(true), this.block);
        }
        this.startChildConn = null;
        this.startParentConn = null;
        this.connectionPreviewer.hidePreview();
        this.connectionCandidate = null;
        this.block.setDragging(false);
        this.dragging = false;
    }
}
exports.DuplicateOnDragStrategy = DuplicateOnDragStrategy;
function setDuplicateOnDragStrategy(block) {
    var _a, _b;
    (_b = (_a = block).setDragStrategy) === null || _b === void 0 ? void 0 : _b.call(_a, new DuplicateOnDragStrategy(block));
}
exports.setDuplicateOnDragStrategy = setDuplicateOnDragStrategy;
