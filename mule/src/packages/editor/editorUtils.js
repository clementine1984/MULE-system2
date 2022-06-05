"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_assigner_1 = require("@convergence/color-assigner");
const editorBroadcast_1 = require("./editorBroadcast");
const monaco_collab_ext_1 = require("@convergencelabs/monaco-collab-ext");
const actions_1 = require("./store/editor/actions");
const actions_2 = require("./store/comments/actions");
const operation_1 = require("./operation");
const store_1 = require("./store");
function initEditorBroadcastListeners(editor, broadcast, peerID) {
    editorBroadcast_1.EditorBroadcast.getData = () => editor.getModel().getLinesContent().join('\n');
    editorBroadcast_1.EditorBroadcast.setData = (value) => editor.getModel().setValue(value);
    const contentManager = createContentManager(editor, broadcast);
    editorBroadcast_1.EditorBroadcast.onInsertText = (index, value) => contentManager.insert(index, value);
    editorBroadcast_1.EditorBroadcast.onDeleteText = (index, length) => contentManager.delete(index, length);
    const _colorAssigner = new color_assigner_1.ColorAssigner();
    const remoteCursors = new Map();
    const cursorManager = new monaco_collab_ext_1.RemoteCursorManager({
        editor: editor,
        tooltips: true,
        tooltipDuration: 2
    });
    editorBroadcast_1.EditorBroadcast.onUpdateCursor = (remotePeerID, offset) => {
        // ignore local cursor
        console.log('on update cursor');
        console.log('remote id', remotePeerID);
        if (peerID === remotePeerID) {
            return;
        }
        let remoteCursor = remoteCursors.get(remotePeerID);
        if (!remoteCursor && offset !== null) {
            console.log('add cursor');
            const color = _colorAssigner.getColorAsHex(remotePeerID);
            remoteCursor = cursorManager.addCursor(remotePeerID, color, remotePeerID);
            remoteCursors.set(remotePeerID, remoteCursor);
        }
        if (offset !== null) {
            console.log('set offset');
            remoteCursor.setOffset(offset);
        }
        else if (!!remoteCursor) {
            remoteCursor.hide();
        }
    };
    const remoteSelections = new Map();
    const selectionManager = new monaco_collab_ext_1.RemoteSelectionManager({ editor: editor });
    editorBroadcast_1.EditorBroadcast.onUpdateSelection = (remotePeerId, value) => {
        // ignore local cursor
        console.log('on update selection');
        if (peerID === remotePeerId) {
            return;
        }
        let remoteSelection = remoteSelections.get(remotePeerId);
        console.log('remoteSelection', remoteSelection);
        if (!remoteSelection && value !== null) {
            console.log('add selection');
            const color = _colorAssigner.getColorAsHex(remotePeerId);
            remoteSelection = selectionManager.addSelection(remotePeerId, color);
            remoteSelections.set(remotePeerId, remoteSelection);
        }
        if (value !== null) {
            remoteSelection.setOffsets(value.start, value.end);
        }
        else if (!!remoteSelection) {
            remoteSelection.hide();
        }
    };
    editorBroadcast_1.EditorBroadcast.onAddToComments = (comment) => {
        store_1.default.dispatch(actions_2.addToComments(comment));
    };
    editorBroadcast_1.EditorBroadcast.onEditComment = (index, content) => {
        store_1.default.dispatch(actions_2.updateComment(index, content));
    };
    editorBroadcast_1.EditorBroadcast.onDeleteComment = (index) => {
        store_1.default.dispatch(actions_2.deleteComment(index));
    };
    editorBroadcast_1.EditorBroadcast.getTopForLineNumber = (lineNumber) => {
        const scrollTop = editor.getScrollTop();
        const topForLineNumber = editor.getTopForLineNumber(lineNumber);
        return topForLineNumber - scrollTop;
    };
    initEditorListeners(editor, broadcast, peerID);
}
exports.initEditorBroadcastListeners = initEditorBroadcastListeners;
function createContentManager(editor, broadcast) {
    console.log('create content manager');
    return new monaco_collab_ext_1.EditorContentManager({
        editor: editor,
        onInsert(index, text) {
            broadcast({ type: operation_1.OperationType.INSERT_TEXT, index, text });
        },
        onReplace(index, length, text) {
            broadcast([
                { type: operation_1.OperationType.DELETE_TEXT, index, length },
                { type: operation_1.OperationType.INSERT_TEXT, index, text }
            ]);
        },
        onDelete(index, length) {
            broadcast({ type: operation_1.OperationType.DELETE_TEXT, index, length });
        }
    });
}
function initEditorListeners(editor, broadcast, peerID) {
    let lastSelection = undefined;
    // editor.setSelection(3,1,3,1);
    editor.onDidChangeCursorSelection(() => {
        // setLocalSelection
        const selection = editor.getSelection();
        if (!selection.isEmpty()) {
            const editorModel = editor.getModel();
            const start = editorModel.getOffsetAt(selection.getStartPosition());
            const end = editorModel.getOffsetAt(selection.getEndPosition());
            lastSelection = { start, end };
            const currentSelectionRange = {
                startLine: selection.startLineNumber,
                endLine: selection.endLineNumber,
                startColumn: selection.startColumn,
                endColumn: selection.endColumn
            };
            console.log('selectonRange', currentSelectionRange);
            store_1.default.dispatch(actions_1.setSelectionRange(currentSelectionRange));
            store_1.default.dispatch(actions_1.setSelectionMade(true));
            broadcast({
                type: operation_1.OperationType.UPDATE_SELECTION,
                peer: peerID,
                value: lastSelection
            });
        }
        else if (!!lastSelection) {
            lastSelection = null;
            store_1.default.dispatch(actions_1.setSelectionMade(false));
        }
    });
    editor.onDidChangeCursorPosition(() => {
        // setLocalCursor
        const position = editor.getPosition();
        const offset = editor.getModel().getOffsetAt(position);
        broadcast({
            type: operation_1.OperationType.UPDATE_CURSOR_OFFSET,
            offset,
            peer: peerID
        });
    });
    store_1.default.dispatch(actions_1.setVisibleRange(editor.getVisibleRanges()[0]));
    editor.onDidScrollChange(() => {
        store_1.default.dispatch(actions_1.setVisibleRange(editor.getVisibleRanges()[0]));
    });
}
//# sourceMappingURL=editorUtils.js.map