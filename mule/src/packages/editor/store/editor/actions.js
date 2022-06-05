"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
function setEditorContent(editorContent) {
    return function (dispatch) {
        dispatch({ type: 'SET_CODE', payload: editorContent });
    };
}
exports.setEditorContent = setEditorContent;
function setLang(lang) {
    return { type: 'SET_LANG', payload: lang };
}
exports.setLang = setLang;
function startRecording(editorContent) {
    return function (dispatch) {
        console.log('in start recording', editorContent);
        axios_1.default.post('http://localhost:3000/initState', { code: editorContent });
        dispatch({ type: 'SET_CODE', payload: editorContent });
        dispatch({ type: 'TOGGLE_RECORDING' });
    };
}
exports.startRecording = startRecording;
function stopRecording(editorContent) {
    return function (dispatch) {
        dispatch({ type: 'TOGGLE_RECORDING' });
    };
}
exports.stopRecording = stopRecording;
function setTargetId(id) {
    return function (dispatch) {
        dispatch({ type: 'SET_TARGET_ID', payload: id });
    };
}
exports.setTargetId = setTargetId;
function setPlaybackSpeed(speed) {
    return function (dispatch) {
        dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
    };
}
exports.setPlaybackSpeed = setPlaybackSpeed;
function setVisibleRange(range) {
    const rangeObject = {
        startLine: range.startLineNumber,
        endLine: range.endLineNumber
    };
    return { type: 'SET_VISIBLE_RANGE', payload: rangeObject };
}
exports.setVisibleRange = setVisibleRange;
function setSelectionRange(range) {
    const selectionObject = {
        startLine: range.startLine,
        endLine: range.endLine,
        startColumn: range.startColumn,
        endColumn: range.endColumn
    };
    return { type: 'SET_CURRENT_SELECTION', payload: selectionObject };
}
exports.setSelectionRange = setSelectionRange;
function setSelectionMade(selectionMade) {
    return { type: 'SET_SELECTION_MADE', payload: selectionMade };
}
exports.setSelectionMade = setSelectionMade;
function addModel(model, lastSavedVersionId) {
    const payload = { model, lastSavedVersionId };
    return { type: 'ADD_MODEL', payload };
}
exports.addModel = addModel;
//# sourceMappingURL=actions.js.map