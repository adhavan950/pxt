"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BadgeList_1 = require("./BadgeList");
const UserPane_1 = require("./UserPane");
const BadgeInfo_1 = require("./BadgeInfo");
const Profile = (props) => {
    var _a, _b, _c, _d, _e;
    const { user, signOut, deleteProfile, onClickedEmail, notification, checkedEmail, showModalAsync } = props;
    const userProfile = (user === null || user === void 0 ? void 0 : user.profile) || { idp: {} };
    const userBadges = ((_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.badges) || { badges: [] };
    const showBadges = ((_c = (_b = pxt.appTarget) === null || _b === void 0 ? void 0 : _b.cloud) === null || _c === void 0 ? void 0 : _c.showBadges) || false;
    const profileSmall = (_d = pxt.appTarget.appTheme) === null || _d === void 0 ? void 0 : _d.condenseProfile;
    const profileIcon = (_e = pxt.appTarget.appTheme) === null || _e === void 0 ? void 0 : _e.cloudProfileIcon;
    const onBadgeClick = (badge) => {
        showModalAsync({
            header: lf("{0} Badge", badge.title),
            size: "tiny",
            hasCloseIcon: true,
            onClose: () => {
                // Hack to support retrapping focus in the fullscreen modal that contains this element
                const focusable = document.body.querySelector(".common-modal-container.fullscreen [tabindex]");
                if (focusable)
                    focusable.focus();
            },
            jsx: (0, jsx_runtime_1.jsx)(BadgeInfo_1.BadgeInfo, { badge: badge })
        });
    };
    return (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "user-profile" }, { children: [(0, jsx_runtime_1.jsx)(UserPane_1.UserPane, { profile: userProfile, onSignOutClick: signOut, onDeleteProfileClick: deleteProfile, notification: notification, emailChecked: checkedEmail, onEmailCheckClick: onClickedEmail }), showBadges && (0, jsx_runtime_1.jsx)(BadgeList_1.BadgeList, { availableBadges: pxt.appTarget.defaultBadges || [], userState: userBadges, onBadgeClick: onBadgeClick }), profileSmall &&
                (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "profile-info-container" }, { children: [(0, jsx_runtime_1.jsx)("p", Object.assign({ className: "profile-info" }, { children: lf("Now that you're logged in, your projects will be automatically saved to the cloud so you can access them from any device!") })), profileIcon && (0, jsx_runtime_1.jsx)("img", { className: "ui image centered medium", src: profileIcon, alt: "" })] }))] }));
};
exports.Profile = Profile;
