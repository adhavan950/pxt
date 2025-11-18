"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGameToKioskAsync = void 0;
const addGameToKioskAsync = async (kioskId, gameId) => {
    const updateKioskUrl = "https://makecode.com/api/kiosk/updatecode";
    const response = await fetch(updateKioskUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "kioskCode": kioskId,
            "shareId": gameId
        }),
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
};
exports.addGameToKioskAsync = addGameToKioskAsync;
