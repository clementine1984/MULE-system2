import * as Peer from 'peerjs';
import { OperationType, Operation, DataOperation } from "./operation";
import { comment } from './store/comments/types';

class editorBroadcast {
    onInsertText?: (index: number, value: string) => void;
    onDeleteText?: (index: number, length: number) => void;
    onUpdateCursor?: (peer: string, offset: number) => void;
    onUpdateSelection?: (peer: string, value: { start: number, end: number } | undefined) => void;
    onAddToComments?: (comment: comment) => void;
    onEditComment?: (index: number, content: string) => void;
    onDeleteComment?: (index: number) => void;
    setSelection?: (startLine: number, startColumn: number, endLine: number, endColumn: number) => void;
    getTopForLineNumber?: (lineNumber: number) => number;
    setData: (data: any) => void;
    getData: () => any;
    constructor() {
        console.log('editor broadcast constructor');
    }

    onData(conn: Peer.DataConnection) {
        // Receive messages
        conn.on('data', (d: Operation | Operation[]) => {
            console.log(`Received from ${conn.peer}`, JSON.stringify(d, null, 4));
            var ops = Array.isArray(d) ? d : [d];

            ops.forEach(data => {
              if(data.type === OperationType.LOAD){
                conn.send({
                    type: OperationType.DATA,
                    data: this.getData()
                } as DataOperation);
              }
              else{
                this.performOp(data);
                console.log('received data', data);
                // axios.post('http://localhost:3000/ops', {...data, remoteEdit: true, time: new Date().getTime()});
              }
            });
        });
    }
    performOp(data: Operation){
      switch (data.type) {
          case OperationType.DATA:
              this.setData(data.data);
              //data.net.filter(a => a !== this.peer.id) // not sure what to do with this
                //  .forEach(p => this.connectToTarget(p, false));
              break;
          case OperationType.INSERT_TEXT:
              this.onInsertText && this.onInsertText(data.index, data.text);
              break;
          case OperationType.DELETE_TEXT:
              this.onDeleteText && this.onDeleteText(data.index, data.length);
              break;
          case OperationType.UPDATE_CURSOR_OFFSET:
              this.onUpdateCursor && this.onUpdateCursor(data.peer, data.offset);
              break;
          case OperationType.UPDATE_SELECTION:
              this.onUpdateSelection && this.onUpdateSelection(data.peer, data.value);
              break;
          case OperationType.ADD_TO_COMMENTS:
              this.onAddToComments && this.onAddToComments(data.comment);
              break;
          case OperationType.EDIT_COMMENT:
              this.onEditComment && this.onEditComment(data.index, data.content);
              break;
          case OperationType.DELETE_COMMENT:
              this.onDeleteComment && this.onDeleteComment(data.index);
              break;
          default:
              console.warn('Unknow operation received', data);
              break;
      }
    }
}

export const EditorBroadcast = new editorBroadcast();
