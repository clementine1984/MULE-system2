"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const axios_1 = require("axios");
const EditorContainer_1 = require("./EditorContainer");
const CommentsContainer_1 = require("./CommentsContainer");
const MainMenuBar_1 = require("./MainMenuBar");
const PeerConnectForm_1 = require("../components/PeerConnectForm");
const PlaybackForm_1 = require("../components/PlaybackForm");
const editorBroadcast_1 = require("../editorBroadcast");
const actions_1 = require("../store/editor/actions");
const operation_1 = require("../operation");
class App extends React.Component {
    constructor(props) {
        super(props);
        this.recordSession = this.recordSession.bind(this);
        this.replaySession = this.replaySession.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleIdChange = this.handleIdChange.bind(this);
        this.handlePlaybackChange = this.handlePlaybackChange.bind(this);
        this.broadcast = this.broadcast.bind(this);
        this.connectToTarget = this.connectToTarget.bind(this);
    }
    recordSession() {
        const editorContent = editorBroadcast_1.EditorBroadcast.getData();
        this.props.startRecording(editorContent);
    }
    // TODO: move this to an action
    replaySession() {
        return __awaiter(this, void 0, void 0, function* () {
            const initState = yield axios_1.default.get('http://localhost:3000/initState');
            editorBroadcast_1.EditorBroadcast.setData(initState.data.code);
            const res = yield axios_1.default.get('http://localhost:3000/ops');
            for (let i = 0; i < res.data.length; i++) {
                if (i > 0) {
                    const delay = res.data[i].time - res.data[i - 1].time;
                    yield this.timeout(Math.round(delay / this.props.editor.playbackSpeed));
                }
                editorBroadcast_1.EditorBroadcast.performOp(res.data[i]);
            }
        });
    }
    timeout(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    connectToTarget(id, loadInitialData = true) {
        const conn = this.props.peer.connect(id);
        conn.on('open', () => {
            if (loadInitialData) {
                conn.send({ type: operation_1.OperationType.LOAD });
            }
            editorBroadcast_1.EditorBroadcast.onData(conn);
        });
    }
    broadcast(op) {
        console.log('op', op);
        if (this.props.editor.recording) {
            // axios.post('http://localhost:3000/ops', {
            //   ...op,
            //   localEdit: false,
            //   time: new Date().getTime()
            // });
            this.props.logger.log(Object.assign({}, op, { remoteEdit: false }));
        }
        this.props.peer.getNetwork().forEach((c) => c.send(op));
    }
    handleIdChange(event) {
        this.props.setTargetId(event.currentTarget.value);
    }
    handlePlaybackChange(event) {
        this.props.setPlaybackSpeed(parseFloat(event.currentTarget.value));
    }
    handleSubmit(event) {
        event.preventDefault();
        this.connectToTarget(this.props.editor.targetID);
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(MainMenuBar_1.default, { triggerBehaviour: this.props.triggerBehaviour }),
            React.createElement(PeerConnectForm_1.default, { handleSubmit: this.handleSubmit, handleIdChange: this.handleIdChange, targetID: this.props.editor.targetID }),
            React.createElement(PlaybackForm_1.default, { recordSession: this.recordSession, replaySession: this.replaySession, handlePlaybackChange: this.handlePlaybackChange, playbackSpeed: this.props.editor.playbackSpeed }),
            React.createElement(EditorContainer_1.default, { logger: this.props.logger, broadcast: this.broadcast, peerId: this.props.peer.getPeerId(), triggerBehaviour: this.props.triggerBehaviour }),
            React.createElement(CommentsContainer_1.default, { broadcast: this.broadcast })));
    }
}
const mapStateToProps = (store) => {
    return {
        editor: store.editorReducer
    };
};
exports.default = react_redux_1.connect(mapStateToProps, {
    startRecording: actions_1.startRecording,
    setTargetId: actions_1.setTargetId,
    setPlaybackSpeed: actions_1.setPlaybackSpeed,
})(App);
//# sourceMappingURL=App.js.map