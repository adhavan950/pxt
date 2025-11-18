"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PxtWorkspaceSearch = void 0;
const Blockly = require("blockly");
const plugin_workspace_search_1 = require("@blockly/plugin-workspace-search");
class PxtWorkspaceSearch extends plugin_workspace_search_1.WorkspaceSearch {
    constructor(workspace) {
        super(workspace);
        this.injectionDiv = workspace.getInjectionDiv();
    }
    highlightSearchGroup(blocks) {
        blocks.forEach((block) => {
            const blockPath = block.pathObject.svgPath;
            Blockly.utils.dom.addClass(blockPath, 'blockly-ws-search-highlight-pxt');
        });
    }
    unhighlightSearchGroup(blocks) {
        blocks.forEach((block) => {
            const blockPath = block.pathObject.svgPath;
            Blockly.utils.dom.removeClass(blockPath, 'blockly-ws-search-highlight-pxt');
        });
    }
    open() {
        super.open();
        Blockly.utils.dom.addClass(this.injectionDiv, 'blockly-ws-searching');
    }
    close() {
        super.close();
        Blockly.utils.dom.removeClass(this.injectionDiv, 'blockly-ws-searching');
    }
}
exports.PxtWorkspaceSearch = PxtWorkspaceSearch;
Blockly.Css.register(`
.blockly-ws-search {
    background: var(--pxt-neutral-background1);
    color: var(--pxt-neutral-foreground1);
    border: solid var(--pxt-neutral-alpha50) 1px;
    border-top: none;
    border-right: none;
    box-shadow: 0px 2px 15px var(--pxt-neutral-alpha50);
}

.blockly-ws-search input {
    -webkit-tap-highlight-color: transparent;
    background: var(--pxt-neutral-background1);
    color: var(--pxt-neutral-foreground1);
    border: none;
}

.blockly-ws-search input::-webkit-input-placeholder {
    color: var(--pxt-neutral-alpha50);
}

.blockly-ws-search input::-moz-placeholder {
    color: var(--pxt-neutral-alpha50);
}

.blockly-ws-search input::-ms-input-placeholder {
    color: var(--pxt-neutral-alpha50);
}

.blockly-ws-search input:active,
.blockly-ws-search input:focus {
    border-color: var(--pxt-neutral-alpha50);
    background: var(--pxt-neutral-background1);
    color: var(--pxt-neutral-foreground1);
}

.blockly-ws-search input::selection {
    color: var(--pxt-neutral-foreground1);
}

.blockly-ws-search button {
    padding-left: 6px;
    padding-right: 6px;
    color: var(--pxt-neutral-foreground1);
}`);
