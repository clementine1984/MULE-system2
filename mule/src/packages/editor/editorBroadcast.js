"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operation_1 = require("./operation");
class editorBroadcast {
    constructor() {
        console.log('editor broadcast constructor');
    }
    onData(conn) {
        // Receive messages
        conn.on('data', (d) => {
            console.log(`Received from ${conn.peer}`, JSON.stringify(d, null, 4));
            var ops = Array.isArray(d) ? d : [d];
            ops.forEach(data => {
                if (data.type === operation_1.OperationType.LOAD) {
                    conn.send({
                        type: operation_1.OperationType.DATA,
                        data: this.getData()
                    });
                }
                else {
                    this.performOp(data);
                    console.log('received data', data);
                    // axios.post('http://localhost:3000/ops', {...data, remoteEdit: true, time: new Date().getTime()});
                }
            });
        });
    }
    performOp(data) {
        switch (data.type) {
            case operation_1.OperationType.DATA:
                this.setData(data.data);
                //data.net.filter(a => a !== this.peer.id) // not sure what to do with this
                //  .forEach(p => this.connectToTarget(p, false));
                break;
            case operation_1.OperationType.INSERT_TEXT:
                this.onInsertText && this.onInsertText(data.index, data.text);
                break;
            case operation_1.OperationType.DELETE_TEXT:
                this.onDeleteText && this.onDeleteText(data.index, data.length);
                break;
            case operation_1.OperationType.UPDATE_CURSOR_OFFSET:
                this.onUpdateCursor && this.onUpdateCursor(data.peer, data.offset);
                break;
            case operation_1.OperationType.UPDATE_SELECTION:
                this.onUpdateSelection && this.onUpdateSelection(data.peer, data.value);
                break;
            case operation_1.OperationType.ADD_TO_COMMENTS:
                this.onAddToComments && this.onAddToComments(data.comment);
                break;
            case operation_1.OperationType.EDIT_COMMENT:
                this.onEditComment && this.onEditComment(data.index, data.content);
                break;
            case operation_1.OperationType.DELETE_COMMENT:
                this.onDeleteComment && this.onDeleteComment(data.index);
                break;
            default:
                console.warn('Unknow operation received', data);
                break;
        }
    }
}
exports.EditorBroadcast = new editorBroadcast();
//# sourceMappingURL=editorBroadcast.js.map