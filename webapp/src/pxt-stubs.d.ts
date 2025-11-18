/* Minimal global stubs for pxt/pxsim to allow webapp compile when built d.ts are missing.
   These are intentionally permissive to let the webapp TypeScript compile; replace
   with real declarations from `built/*.d.ts` for accurate typing. */

declare var pxt: any;
declare var pxsim: any;
declare var pxtc: any;
declare var Cloud: any;
declare var U: any;

declare function lf(msg: string, ...args: any[]): string;

declare namespace pxt {
    const appTarget: any;
    const BLOCKS_PROJECT_NAME: string;
    const JAVASCRIPT_PROJECT_NAME: string;
    const PYTHON_PROJECT_NAME: string;
    const MAIN_TS: string;
    const MAIN_PY: string;
    const MAIN_BLOCKS: string;
    const ASSETS_FILE: string;
    const SERIAL_EDITOR_FILE: string;
    const CONFIG_NAME: string;
    const debug: any;
    const diff: any;
    const shell: any;
    const storage: any;
    const BrowserUtils: any;
    const commands: any;
}

declare namespace pxsim {
    type GlobalAction = any;
    type SimulatorMessage = any;
    const SimulatorState: any;
}
