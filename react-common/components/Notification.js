"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotificationMessage = exports.Notification = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require("react");
const ReactDOM = require("react-dom");
class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: {}
        };
    }
    push(notification) {
        const notifications = this.state.notifications;
        const id = ts.pxtc.Util.guidGen();
        Object.keys(notifications).filter(e => notifications[e].kind == notification.kind)
            .forEach(previousNotification => this.remove(previousNotification));
        notifications[id] = notification;
        const that = this;
        // Show for 3 seconds before removing
        setTimeout(() => {
            that.remove(id);
        }, 3000);
        this.setState({ notifications: notifications });
    }
    remove(id) {
        const notifications = this.state.notifications;
        if (notifications[id]) {
            delete notifications[id];
            this.setState({ notifications: notifications });
        }
    }
    render() {
        const { notifications } = this.state;
        function renderNotification(id, notification) {
            const { kind, text, hc } = notification;
            let cls = 'ignored info message';
            switch (kind) {
                case 'err':
                    cls = 'red inverted segment';
                    break;
                case 'warn':
                    cls = 'orange inverted segment';
                    break;
                case 'info':
                    cls = 'blue inverted segment';
                    break;
                case 'compile':
                    cls = 'ignored info message';
                    break;
            }
            return (0, jsx_runtime_1.jsx)("div", Object.assign({ id: `${kind}msg`, className: `ui ${hc} ${cls}` }, { children: text }), `${id}`);
        }
        return (0, jsx_runtime_1.jsx)("div", Object.assign({ id: "msg", "aria-live": "polite" }, { children: Object.keys(notifications).map(k => renderNotification(k, notifications[k])) }));
    }
}
exports.Notification = Notification;
let notificationsInitialized = false;
let notificationMessages;
function pushNotificationMessage(options) {
    if (!notificationsInitialized) {
        notificationsInitialized = true;
        const wrapper = document.body.appendChild(document.createElement('div'));
        notificationMessages = ReactDOM.render(React.createElement(Notification, options), wrapper);
        notificationMessages.push(options);
    }
    else if (notificationMessages) {
        notificationMessages.push(options);
    }
}
exports.pushNotificationMessage = pushNotificationMessage;
