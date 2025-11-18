"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useId = void 0;
const React = require("react");
function useId() {
    return React.useMemo(() => pxt.Util.guidGen(), []);
}
exports.useId = useId;
