import { RemoteCursor } from '@convergencelabs/monaco-collab-ext/typings/RemoteCursor';
import { RemoteSelection } from '@convergencelabs/monaco-collab-ext/typings/RemoteSelection';
import { ColorAssigner } from '@convergence/color-assigner';
import { EditorBroadcast } from './editorBroadcast';
import { EditorContentManager, RemoteCursorManager, RemoteSelectionManager } from "@convergencelabs/monaco-collab-ext";
import { setSelectionMade, setSelectionRange, setVisibleRange } from './store/editor/actions';
import { addToComments, updateComment, deleteComment } from './store/comments/actions';
import { OperationType } from "./operation";
import store from './store';

export function initEditorBroadcastListeners(editor, broadcast, peerID: string){
  EditorBroadcast.getData = () => editor.getModel().getLinesContent().join('\n');
  EditorBroadcast.setData = (value) => editor.getModel().setValue(value);

  const contentManager = createContentManager(editor, broadcast);
  EditorBroadcast.onInsertText = (index, value) => contentManager.insert(index, value);
  EditorBroadcast.onDeleteText = (index, length) => contentManager.delete(index, length);

  const _colorAssigner = new ColorAssigner();

  const remoteCursors = new Map<string, RemoteCursor>();
  const cursorManager = new RemoteCursorManager({
    editor: editor,
    tooltips: true,
    tooltipDuration: 2
  })
  EditorBroadcast.onUpdateCursor = (remotePeerID, offset) => {
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
    } else if (!!remoteCursor) {
        remoteCursor.hide();
    }
  }

  const remoteSelections = new Map<string, RemoteSelection>();
  const selectionManager =  new RemoteSelectionManager({ editor: editor });
  EditorBroadcast.onUpdateSelection = (remotePeerId, value) => {
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
    } else if (!!remoteSelection) {
        remoteSelection.hide();
    }
  }
  EditorBroadcast.onAddToComments = (comment) => {
    store.dispatch(addToComments(comment));
  }
  EditorBroadcast.onEditComment = (index, content) => {
    store.dispatch(updateComment(index, content));
  }
  EditorBroadcast.onDeleteComment = (index) => {
    store.dispatch(deleteComment(index));
  }
  EditorBroadcast.getTopForLineNumber = (lineNumber) => {
    const scrollTop = editor.getScrollTop();
    const topForLineNumber = editor.getTopForLineNumber(lineNumber);
    return topForLineNumber - scrollTop;
  }
  initEditorListeners(editor, broadcast, peerID);
}

function createContentManager(editor: any, broadcast: any){
  console.log('create content manager');
  return new EditorContentManager({
      editor: editor,
      onInsert(index, text) {
          broadcast({ type: OperationType.INSERT_TEXT, index, text });
      },
      onReplace(index, length, text) {
          broadcast([
            { type: OperationType.DELETE_TEXT, index, length },
            { type: OperationType.INSERT_TEXT, index, text}
          ]);
      },
      onDelete(index, length) {
          broadcast({ type: OperationType.DELETE_TEXT, index, length });
      }
  });
}

function initEditorListeners(editor: any, broadcast: any, peerID: string){
  let lastSelection: any = undefined;
  // editor.setSelection(3,1,3,1);
  editor.onDidChangeCursorSelection( () => {
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
        }
        console.log('selectonRange', currentSelectionRange);
        store.dispatch(setSelectionRange(currentSelectionRange));
        store.dispatch(setSelectionMade(true));
        broadcast({
          type: OperationType.UPDATE_SELECTION,
          peer: peerID,
          value: lastSelection
        });
    } else if (!!lastSelection) {
        lastSelection = null;
        store.dispatch(setSelectionMade(false));
    }
  });

  editor.onDidChangeCursorPosition(() => {
    // setLocalCursor
    const position = editor.getPosition();
    const offset = editor.getModel().getOffsetAt(position);
    broadcast({
        type: OperationType.UPDATE_CURSOR_OFFSET,
        offset,
        peer: peerID
    })
  });

  store.dispatch(setVisibleRange(editor.getVisibleRanges()[0]));
  editor.onDidScrollChange(() => {
    store.dispatch(setVisibleRange(editor.getVisibleRanges()[0]));
  })
}
