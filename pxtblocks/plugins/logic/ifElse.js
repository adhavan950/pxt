"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blockly = require("blockly");
const field_imagenotext_1 = require("../../fields/field_imagenotext");
const IF_ELSE_MIXIN = {
    elseifCount_: 0,
    elseCount_: 0,
    valueConnections_: [],
    statementConnections_: [],
    elseStatementConnection_: null,
    /**
     * Create XML to represent the number of else-if and else inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        if (!this.elseifCount_ && !this.elseCount_) {
            return null;
        }
        const container = Blockly.utils.xml.createElement('mutation');
        if (this.elseifCount_) {
            container.setAttribute('elseif', this.elseifCount_ + "");
        }
        if (this.elseCount_) {
            container.setAttribute('else', "1");
        }
        return container;
    },
    /**
     * Parse XML to restore the else-if and else inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        if (!xmlElement)
            return;
        this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
        this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
        this.rebuildShape_();
    },
    /**
     * Store pointers to any connected child blocks.
     */
    storeConnections_: function (arg) {
        if (!arg)
            arg = 0;
        this.valueConnections_ = [null];
        this.statementConnections_ = [null];
        this.elseStatementConnection_ = null;
        for (let i = 1; i <= this.elseifCount_; i++) {
            if (arg != i) {
                this.valueConnections_.push(this.getInput('IF' + i).connection.targetConnection);
                this.statementConnections_.push(this.getInput('DO' + i).connection.targetConnection);
            }
        }
        if (this.getInput('ELSE'))
            this.elseStatementConnection_ = this.getInput('ELSE').connection.targetConnection;
    },
    /**
     * Restore pointers to any connected child blocks.
     */
    restoreConnections_: function () {
        var _a, _b;
        for (let i = 1; i <= this.elseifCount_; i++) {
            this.reconnectValueConnection_(i, this.valueConnections_);
            (_a = this.statementConnections_[i]) === null || _a === void 0 ? void 0 : _a.reconnect(this, 'DO' + i);
        }
        if (this.getInput('ELSE'))
            (_b = this.elseStatementConnection_) === null || _b === void 0 ? void 0 : _b.reconnect(this, 'ELSE');
    },
    addElse_: function () {
        const update = () => {
            this.elseCount_++;
        };
        this.update_(update);
    },
    removeElse_: function () {
        const update = () => {
            this.elseCount_--;
        };
        this.update_(update);
    },
    addElseIf_: function () {
        const update = () => {
            this.elseifCount_++;
        };
        this.update_(update);
    },
    removeElseIf_: function (arg) {
        const update = () => {
            this.elseifCount_--;
        };
        this.update_(update, arg);
    },
    update_: function (update, arg) {
        Blockly.Events.setGroup(true);
        this.storeConnections_(arg);
        const block = this;
        const oldMutationDom = block.mutationToDom();
        const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
        // Update the mutation
        if (update)
            update.call(this);
        // Allow the source block to rebuild itself.
        this.updateShape_();
        // Mutation may have added some elements that need initializing.
        if (block instanceof Blockly.BlockSvg) {
            block.initSvg();
        }
        // Ensure that any bump is part of this mutation's event group.
        const group = Blockly.Events.getGroup();
        const newMutationDom = block.mutationToDom();
        const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
        if (oldMutation != newMutation) {
            Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldMutation, newMutation));
            setTimeout(function () {
                Blockly.Events.setGroup(group);
                block.bumpNeighbours();
                Blockly.Events.setGroup(false);
            }, Blockly.config.bumpDelay);
        }
        if (block.rendered && block instanceof Blockly.BlockSvg) {
            block.queueRender();
        }
        this.restoreConnections_();
        Blockly.Events.setGroup(false);
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @this Blockly.Block
     * @private
     */
    updateShape_: function () {
        // Delete everything.
        if (this.getInput('ELSE')) {
            this.removeInput('ELSE');
            this.removeInput('ELSETITLE');
            this.removeInput('ELSEBUTTONS');
        }
        let i = 1;
        while (this.getInput('IF' + i)) {
            this.removeInput('IF' + i);
            this.removeInput('IFTITLE' + i);
            this.removeInput('IFBUTTONS' + i);
            this.removeInput('DO' + i);
            i++;
        }
        // Rebuild block.
        for (let i = 1; i <= this.elseifCount_; i++) {
            const removeElseIf = function (arg) {
                return function () {
                    that.removeElseIf_(arg);
                };
            }(i);
            this.appendValueInput('IF' + i)
                .setCheck('Boolean')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF)
                .setShadowDom(createShadowDom());
            this.appendDummyInput('IFTITLE' + i)
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
            this.appendDummyInput('IFBUTTONS' + i)
                .appendField(new field_imagenotext_1.FieldImageNoText(this.REMOVE_IMAGE_DATAURI, 24, 24, "*", removeElseIf, false))
                .setAlign(Blockly.inputs.Align.RIGHT);
            this.appendStatementInput('DO' + i);
        }
        if (this.elseCount_) {
            this.appendDummyInput('ELSETITLE')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
            this.appendDummyInput('ELSEBUTTONS')
                .setAlign(Blockly.inputs.Align.RIGHT)
                .appendField(new field_imagenotext_1.FieldImageNoText(this.REMOVE_IMAGE_DATAURI, 24, 24, "*", this.removeElse_.bind(this), false));
            this.appendStatementInput('ELSE');
        }
        if (this.getInput('ADDBUTTON'))
            this.removeInput('ADDBUTTON');
        const that = this;
        const addElseIf = function () {
            return function () {
                if (that.elseCount_ == 0) {
                    that.addElse_();
                }
                else {
                    if (!that.elseifCount_)
                        that.elseifCount_ = 0;
                    that.addElseIf_();
                }
            };
        }();
        this.appendDummyInput('ADDBUTTON')
            .appendField(new field_imagenotext_1.FieldImageNoText(this.ADD_IMAGE_DATAURI, 24, 24, "*", addElseIf, false));
    },
    /**
     * Reconstructs the block with all child blocks attached.
     */
    rebuildShape_: function () {
        const valueConnections = [null];
        const statementConnections = [null];
        let elseStatementConnection = null;
        if (this.getInput('ELSE')) {
            elseStatementConnection = this.getInput('ELSE').connection.targetConnection;
        }
        let i = 1;
        while (this.getInput('IF' + i)) {
            const inputIf = this.getInput('IF' + i);
            const inputDo = this.getInput('DO' + i);
            valueConnections.push(inputIf.connection.targetConnection);
            statementConnections.push(inputDo.connection.targetConnection);
            i++;
        }
        this.updateShape_();
        this.reconnectChildBlocks_(valueConnections, statementConnections, elseStatementConnection);
    },
    /**
     * Reconnects child blocks.
     * @param {!Array<?Blockly.RenderedConnection>} valueConnections List of value
     * connectsions for if input.
     * @param {!Array<?Blockly.RenderedConnection>} statementConnections List of
     * statement connections for do input.
     * @param {?Blockly.RenderedConnection} elseStatementConnection Statement
     * connection for else input.
     */
    reconnectChildBlocks_: function (valueConnections, statementConnections, elseStatementConnection) {
        var _a;
        for (let i = 1; i <= this.elseifCount_; i++) {
            this.reconnectValueConnection_(i, valueConnections);
            (_a = statementConnections[i]) === null || _a === void 0 ? void 0 : _a.reconnect(this, 'DO' + i);
        }
        elseStatementConnection === null || elseStatementConnection === void 0 ? void 0 : elseStatementConnection.reconnect(this, 'ELSE');
    },
    reconnectValueConnection_: function (i, valueConnections) {
        var _a;
        const shadow = (_a = this.getInput('IF' + i)) === null || _a === void 0 ? void 0 : _a.connection.targetBlock();
        if (valueConnections[i]) {
            valueConnections[i].reconnect(this, 'IF' + i);
            // Sometimes reconnect leaves behind orphaned shadow blocks behind. If
            // that happens, clean it up
            if (shadow && !shadow.getParent()) {
                shadow.dispose();
            }
        }
    }
};
function createShadowDom() {
    const shadow = document.createElement("shadow");
    shadow.setAttribute("type", "logic_boolean");
    const field = document.createElement("field");
    field.setAttribute("name", "BOOL");
    field.textContent = "FALSE";
    shadow.appendChild(field);
    return shadow;
}
Blockly.Blocks["controls_if"] = Object.assign(Object.assign({}, IF_ELSE_MIXIN), { init() {
        Blockly.Extensions.apply('inline-svgs', this, false);
        this.elseifCount_ = 0;
        this.elseCount_ = 0;
        this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
        this.appendValueInput('IF0')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
        this.appendDummyInput('THEN0')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        this.appendStatementInput('DO0');
        if (this.workspace instanceof Blockly.WorkspaceSvg) {
            const renderer = this.workspace.getRenderer();
            this.setOutputShape(renderer.getConstants().SHAPES["HEXAGONAL"]);
        }
        this.updateShape_();
        this.setInputsInline(true);
        this.setColour(Blockly.Msg.LOGIC_HUE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(() => {
            if (!this.elseifCount_ && !this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_1'];
            }
            else if (!this.elseifCount_ && this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_2'];
            }
            else if (this.elseifCount_ && !this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_3'];
            }
            else if (this.elseifCount_ && this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_4'];
            }
            return '';
        });
    } });
