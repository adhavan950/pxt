"use strict";
/// <reference path="../../built/pxtlib.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldEditor = exports.registerFieldEditor = exports.initFieldEditors = void 0;
const field_animation_1 = require("./field_animation");
const field_tilemap_1 = require("./field_tilemap");
const field_textinput_1 = require("./field_textinput");
const field_sprite_1 = require("./field_sprite");
const field_gridpicker_1 = require("./field_gridpicker");
const field_colour_1 = require("./field_colour");
const field_images_1 = require("./field_images");
const field_textdropdown_1 = require("./field_textdropdown");
const field_numberdropdown_1 = require("./field_numberdropdown");
const field_imagedropdown_1 = require("./field_imagedropdown");
const field_note_1 = require("./field_note");
const field_melodySandbox_1 = require("./field_melodySandbox");
const field_toggle_1 = require("./field_toggle");
const field_toggle_downup_1 = require("./field_toggle_downup");
const field_toggle_highlow_1 = require("./field_toggle_highlow");
const field_toggle_onoff_1 = require("./field_toggle_onoff");
const field_toggle_updown_1 = require("./field_toggle_updown");
const field_toggle_winlose_1 = require("./field_toggle_winlose");
const field_toggle_yesno_1 = require("./field_toggle_yesno");
const field_protractor_1 = require("./field_protractor");
const field_position_1 = require("./field_position");
const field_speed_1 = require("./field_speed");
const field_tileset_1 = require("./field_tileset");
const field_turnratio_1 = require("./field_turnratio");
const field_musiceditor_1 = require("./field_musiceditor");
const field_sound_effect_1 = require("./field_sound_effect");
const field_autocomplete_1 = require("./field_autocomplete");
const field_colorwheel_1 = require("./field_colorwheel");
const field_scopedvalueselector_1 = require("./field_scopedvalueselector");
let registeredFieldEditors = {};
function initFieldEditors() {
    var _a;
    registerFieldEditor('text', field_textinput_1.FieldTextInput);
    registerFieldEditor('note', field_note_1.FieldNote);
    registerFieldEditor('gridpicker', field_gridpicker_1.FieldGridPicker);
    registerFieldEditor('textdropdown', field_textdropdown_1.FieldTextDropdown);
    registerFieldEditor('numberdropdown', field_numberdropdown_1.FieldNumberDropdown);
    registerFieldEditor('imagedropdown', field_imagedropdown_1.FieldImageDropdown);
    registerFieldEditor('colorwheel', field_colorwheel_1.FieldColorWheel);
    registerFieldEditor('toggle', field_toggle_1.FieldToggle);
    registerFieldEditor('toggleonoff', field_toggle_onoff_1.FieldToggleOnOff);
    registerFieldEditor('toggleyesno', field_toggle_yesno_1.FieldToggleYesNo);
    registerFieldEditor('toggleupdown', field_toggle_updown_1.FieldToggleUpDown);
    registerFieldEditor('toggledownup', field_toggle_downup_1.FieldToggleDownUp);
    registerFieldEditor('togglehighlow', field_toggle_highlow_1.FieldToggleHighLow);
    registerFieldEditor('togglewinlose', field_toggle_winlose_1.FieldToggleWinLose);
    registerFieldEditor('colornumber', field_colour_1.FieldColorNumber);
    registerFieldEditor('images', field_images_1.FieldImages);
    registerFieldEditor('sprite', field_sprite_1.FieldSpriteEditor);
    registerFieldEditor('animation', field_animation_1.FieldAnimationEditor);
    registerFieldEditor('tilemap', field_tilemap_1.FieldTilemap);
    registerFieldEditor('tileset', field_tileset_1.FieldTileset);
    registerFieldEditor('speed', field_speed_1.FieldSpeed);
    registerFieldEditor('turnratio', field_turnratio_1.FieldTurnRatio);
    registerFieldEditor('protractor', field_protractor_1.FieldProtractor);
    registerFieldEditor('position', field_position_1.FieldPosition);
    registerFieldEditor('melody', field_melodySandbox_1.FieldCustomMelody);
    registerFieldEditor('soundeffect', field_sound_effect_1.FieldSoundEffect);
    registerFieldEditor('autocomplete', field_autocomplete_1.FieldAutoComplete);
    registerFieldEditor('scopedvalueselector', field_scopedvalueselector_1.FieldScopedValueSelector);
    if ((_a = pxt.appTarget.appTheme) === null || _a === void 0 ? void 0 : _a.songEditor) {
        registerFieldEditor('musiceditor', field_musiceditor_1.FieldMusicEditor);
    }
}
exports.initFieldEditors = initFieldEditors;
function registerFieldEditor(selector, field, validator) {
    if (registeredFieldEditors[selector] == undefined) {
        registeredFieldEditors[selector] = {
            field: field,
            validator: validator
        };
    }
}
exports.registerFieldEditor = registerFieldEditor;
function createFieldEditor(selector, text, params) {
    if (registeredFieldEditors[selector] == undefined) {
        pxt.error(`Field editor ${selector} not registered`);
        return null;
    }
    if (!params) {
        params = {};
    }
    pxt.Util.assert(params.lightMode == undefined, "lightMode is a reserved parameter for custom fields");
    params.lightMode = pxt.options.light;
    let customField = registeredFieldEditors[selector];
    let instance = new customField.field(text, params, customField.validator);
    return instance;
}
exports.createFieldEditor = createFieldEditor;
