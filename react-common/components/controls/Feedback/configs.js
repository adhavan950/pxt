"use strict";
/// <reference path="../../../../localtypings/ocv.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingFeedbackConfig = exports.createRatingQuestions = exports.getBaseConfig = void 0;
const getBaseConfig = () => {
    return {
        feedbackUiType: "NoSurface",
        hostPlatform: "IFrame",
        isDisplayed: true,
        isEmailCollectionEnabled: false,
        isFileUploadEnabled: false,
        isScreenshotEnabled: false,
        isScreenRecordingEnabled: false,
        invokeOnDismissOnEsc: false,
        isFeedbackForumEnabled: false,
        isMyFeedbackEnabled: false,
        isThankYouPageDisabled: false,
    };
};
exports.getBaseConfig = getBaseConfig;
const createRatingQuestions = () => {
    return {
        questionInstruction: {
            displayedStringInEnglish: "What did you think of this activity?",
            displayedString: lf("What did you think of this activity?")
        },
        questionOptions: [
            {
                displayedStringInEnglish: "Boring",
                displayedString: lf("Boring")
            },
            {
                displayedStringInEnglish: "Not fun",
                displayedString: lf("Not fun")
            },
            {
                displayedStringInEnglish: "Kinda fun",
                displayedString: lf("Kinda fun")
            },
            {
                displayedStringInEnglish: "Fun",
                displayedString: lf("Fun")
            },
            {
                displayedStringInEnglish: "Super fun",
                displayedString: lf("Super fun")
            },
        ],
    };
};
exports.createRatingQuestions = createRatingQuestions;
const getRatingFeedbackConfig = () => {
    return Object.assign(Object.assign({}, (0, exports.getBaseConfig)()), { initialFeedbackType: "Unclassified", scenarioConfig: {
            isScenarioEnabled: true,
            scenarioType: "Custom",
            questionDetails: Object.assign(Object.assign({ questionUiType: "Rating" }, (0, exports.createRatingQuestions)()), { "questionUiBehaviour": [
                    "CommentNotRequired"
                ] })
        } });
};
exports.getRatingFeedbackConfig = getRatingFeedbackConfig;
