"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFrameEmbeddedClient = void 0;
class IFrameEmbeddedClient {
    constructor(messageHandler) {
        this.messageHandler = messageHandler;
        this.onMessageReceived = (event) => {
            const data = event.data;
            if (data) {
                if (data.type === "iframeclientsetmessageport") {
                    this.port = event.ports[0];
                    this.port.onmessage = this.onMessageReceived;
                    this.postMessage({
                        type: "iframeclientsetmessageport"
                    });
                    return;
                }
                else if (data.type === "iframeclientready") {
                    this.sendReadyMessage();
                    return;
                }
            }
            this.messageHandler(event);
        };
        this.frameId = frameId();
        window.addEventListener("message", this.onMessageReceived);
        this.sendReadyMessage();
    }
    dispose() {
        window.removeEventListener("message", this.onMessageReceived);
        if (this.port) {
            this.port.close();
        }
    }
    postMessage(message) {
        this.postMessageCore(message);
    }
    postMessageCore(message) {
        if (this.frameId) {
            message.frameId = this.frameId;
        }
        if (this.port) {
            this.port.postMessage(message);
        }
        else if (window.acquireVsCodeApi) {
            window.acquireVsCodeApi().postMessage(message);
        }
        else if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
        }
    }
    sendReadyMessage() {
        this.postMessage({
            type: "iframeclientready"
        });
    }
}
exports.IFrameEmbeddedClient = IFrameEmbeddedClient;
function frameId() {
    const match = /frameid=([a-zA-Z0-9\-]+)/i.exec(window.location.href);
    if (match) {
        return match[1];
    }
    return undefined;
}
