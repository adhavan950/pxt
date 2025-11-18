"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAvatarDropdown = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const MenuDropdown_1 = require("../controls/MenuDropdown");
const util_1 = require("../util");
const UserAvatarDropdown = (props) => {
    var _a, _b;
    const { userProfile, title, items, onSignOutClick, className } = props;
    const avatarUrl = (_b = (_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.idp) === null || _a === void 0 ? void 0 : _a.pictureUrl) !== null && _b !== void 0 ? _b : encodedAvatarPic(userProfile);
    const avatarElem = (0, jsx_runtime_1.jsx)(UserAvatar, { avatarPicUrl: avatarUrl });
    const initialsElem = (0, jsx_runtime_1.jsx)(UserInitials, { userProfile: userProfile });
    const allItems = items ? items.slice() : [];
    if (onSignOutClick) {
        allItems.unshift({
            role: "menuitem",
            id: "signout",
            title: lf("Sign Out"),
            label: lf("Sign Out"),
            onClick: onSignOutClick
        });
    }
    return ((0, jsx_runtime_1.jsx)(MenuDropdown_1.MenuDropdown, { className: (0, util_1.classList)("user-avatar-dropdown", className), title: title, label: avatarUrl ? avatarElem : initialsElem, items: allItems }));
};
exports.UserAvatarDropdown = UserAvatarDropdown;
const UserInitials = (props) => ((0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "user-avatar-initials", "aria-hidden": "true" }, { children: pxt.auth.userInitials(props.userProfile) })) }));
const UserAvatar = (props) => ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "user-avatar-image" }, { children: (0, jsx_runtime_1.jsx)("img", { src: props.avatarPicUrl, alt: lf("Profile Image"), referrerPolicy: "no-referrer", "aria-hidden": "true" }) })));
function encodedAvatarPic(user) {
    var _a, _b, _c, _d;
    const type = (_b = (_a = user === null || user === void 0 ? void 0 : user.idp) === null || _a === void 0 ? void 0 : _a.picture) === null || _b === void 0 ? void 0 : _b.mimeType;
    const encodedImg = (_d = (_c = user === null || user === void 0 ? void 0 : user.idp) === null || _c === void 0 ? void 0 : _c.picture) === null || _d === void 0 ? void 0 : _d.encoded;
    return type && encodedImg ? `data:${type};base64,${encodedImg}` : "";
}
