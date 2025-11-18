"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../controls/Button");
const util_1 = require("../util");
const SocialButton = (props) => {
    const { className, url, type, heading } = props;
    const classes = (0, util_1.classList)(className, "social-button", "type");
    const socialOptions = pxt.appTarget.appTheme.socialOptions || {};
    let socialUrl = "";
    switch (type) {
        case "facebook": {
            socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        }
        case "twitter": {
            let twitterText = lf("Check out what I made!");
            if (socialOptions.twitterHandle && socialOptions.orgTwitterHandle) {
                twitterText = lf("Check out what I made with @{0} and @{1}!", socialOptions.twitterHandle, socialOptions.orgTwitterHandle);
            }
            else if (socialOptions.twitterHandle) {
                twitterText = lf("Check out what I made with @{0}!", socialOptions.twitterHandle);
            }
            else if (socialOptions.orgTwitterHandle) {
                twitterText = lf("Check out what I made with @{0}!", socialOptions.orgTwitterHandle);
            }
            socialUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` +
                `&text=${encodeURIComponent(twitterText)}` +
                (socialOptions.hashtags ? `&hashtags=${encodeURIComponent(socialOptions.hashtags)}` : '') +
                (socialOptions.related ? `&related=${encodeURIComponent(socialOptions.related)}` : '');
            break;
        }
        case "discourse": {
            // https://meta.discourse.org/t/compose-a-new-pre-filled-topic-via-url/28074
            socialUrl = `${socialOptions.discourse || "https://forum.makecode.com/"}new-topic?title=${encodeURIComponent(url)}`;
            if (socialOptions.discourseCategory)
                socialUrl += `&category=${encodeURIComponent(socialOptions.discourseCategory)}`;
            break;
        }
        case "google-classroom":
            socialUrl = `https://classroom.google.com/share?url=${encodeURIComponent(url)}`;
            break;
        case "microsoft-teams":
            socialUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(url)}`;
            break;
        case "whatsapp":
            socialUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
            break;
    }
    const handleClick = () => {
        pxt.tickEvent(`share.social.${type}`);
    };
    switch (type) {
        // Icon buttons
        case "facebook":
        case "twitter":
        case "discourse":
        case "whatsapp":
            return ((0, jsx_runtime_1.jsx)(LinkButton, { className: (0, util_1.classList)(classes, "social-icon"), ariaLabel: type, title: heading, href: socialUrl, leftIcon: `icon ${type}`, heading: heading, onClick: handleClick }));
        // Image buttons
        case "google-classroom":
        case "microsoft-teams":
            return ((0, jsx_runtime_1.jsx)(LinkButton, { className: classes, ariaLabel: type, title: heading, href: socialUrl, label: (0, jsx_runtime_1.jsx)("img", { src: `/static/logo/social-buttons/${type}.png`, alt: heading || pxt.U.rlf(type) }), heading: heading, onClick: handleClick }));
    }
};
exports.SocialButton = SocialButton;
const LinkButton = (props) => {
    const inflatedProps = (0, Button_1.inflateButtonProps)(props);
    const onClick = (ev) => {
        if (props.onClick) {
            props.onClick();
        }
        ev.stopPropagation();
        // if we are in game, don't call preventDefault so that the default browser
        // navigation behavior occurs
        if (!pxt.BrowserUtils.isInGame()) {
            ev.preventDefault();
            pxt.BrowserUtils.popupWindow(props.href, props.heading, 600, 600);
        }
    };
    return ((0, jsx_runtime_1.jsx)("a", Object.assign({ className: inflatedProps.className, title: inflatedProps.title, href: props.href, target: "_blank", rel: "noopener,noreferrer", onClick: onClick }, { children: (0, jsx_runtime_1.jsx)(Button_1.ButtonBody, Object.assign({}, props)) })));
};
