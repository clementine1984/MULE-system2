"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const react_monaco_editor_1 = require("react-monaco-editor");
require("@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.min.css");
const editorBroadcast_1 = require("../editorBroadcast");
const editorUtils_1 = require("../editorUtils");
const actions_1 = require("../store/editor/actions");
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.editorRef = React.createRef();
        this.editorDidMount = this.editorDidMount.bind(this);
        this.handleEditorChange = this.handleEditorChange.bind(this);
    }
    editorDidMount(editor, monaco) {
        const model = editor.getModel();
        model.onDidChangeContent(() => {
            this.props.triggerBehaviour.edit();
        });
        this.props.addModel(model, model.getAlternativeVersionId());
        // console.log('layout info', editor.getLayoutInfo());
        // console.log('tippity top', editor.getTopForLineNumber(4));
        // Remove all /** comments from editor
        const editorContent = model.getLinesContent().join('\n');
        this.props.setEditorContent(editorContent.replace(/(\/\*\*[^*]*\*\/)/g, ''));
        // should be set based on file type
        this.props.setLang('JAVA');
        editorUtils_1.initEditorBroadcastListeners(editor, this.props.broadcast, this.props.peerId);
        editor.focus();
        editorBroadcast_1.EditorBroadcast.setSelection = (startLine, startColum, endLine, endColumn) => {
            editor.setSelection(new monaco.Range(startLine, startColum, endLine, endColumn));
        };
    }
    handleEditorChange(newValue) {
        this.props.setEditorContent(newValue);
    }
    componentWillUnmount() {
        const editorContent = editorBroadcast_1.EditorBroadcast.getData();
        this.props.stopRecording(editorContent);
    }
    render() {
        const options = {
            selectOnLineNumbers: true,
            minimap: { enabled: false }
        };
        const style = {
            float: 'left'
        };
        return (React.createElement("div", { style: style },
            React.createElement(react_monaco_editor_1.default, { ref: this.editorRef, width: "800", height: "600", language: "java", theme: "vs-dark", value: this.props.editor.code, onChange: this.handleEditorChange, options: options, editorDidMount: this.editorDidMount })));
    }
}
const mapStateToProps = (store) => {
    return {
        editor: store.editorReducer
    };
};
exports.default = react_redux_1.connect(mapStateToProps, {
    stopRecording: actions_1.stopRecording,
    setEditorContent: actions_1.setEditorContent,
    setLang: actions_1.setLang,
    addModel: actions_1.addModel
})(Editor);
//# sourceMappingURL=EditorContainer.js.map