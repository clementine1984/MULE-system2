"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Comment_1 = require("../components/Comment");
const CommentForm_1 = require("../components/CommentForm");
const AddCommentButton_1 = require("../components/AddCommentButton");
const actions_1 = require("../store/comments/actions");
const editorBroadcast_1 = require("../editorBroadcast");
const operation_1 = require("../operation");
class CommentsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.handleCommentEditChange = index => event => {
            event.preventDefault();
            const content = event.target.value;
            this.props.broadcast({ type: operation_1.OperationType.EDIT_COMMENT, index, content });
            this.props.updateComment(index, content);
        };
        this.addComment = this.addComment.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
        this.handleCommentDelete = this.handleCommentDelete.bind(this);
        this.handleCommentEdit = this.handleCommentEdit.bind(this);
        this.handleCommentEditChange = this.handleCommentEditChange.bind(this);
        this.handleCommentEditSubmit = this.handleCommentEditSubmit.bind(this);
        this.handleCommentClick = this.handleCommentClick.bind(this);
    }
    componentDidMount() {
        this.props.parseComments(this.props.code);
    }
    addComment(event) {
        event.preventDefault();
        this.props.toggleCommentModal();
    }
    handleCommentChange(event) {
        this.props.setCommentContent(event.target.value);
    }
    // link comment to editor position
    handleCommentSubmit(event) {
        event.preventDefault();
        const comment = Object.assign({ content: this.props.currentCommentContent }, this.props.selectionRange);
        this.props.broadcast({ type: operation_1.OperationType.ADD_TO_COMMENTS, comment });
        this.props.addToComments(comment);
    }
    handleCommentDelete(index) {
        // need to trigger broadcast when local comment is deleted
        this.props.broadcast({ type: operation_1.OperationType.DELETE_COMMENT, index });
        console.log('index', index);
        this.props.deleteComment(index);
    }
    handleCommentEdit(index) {
        console.log('index', index);
        console.log('edit');
    }
    handleCommentEditSubmit(event) {
        event.preventDefault();
    }
    handleCommentClick(index) {
        const comment = this.props.comments[index];
        editorBroadcast_1.EditorBroadcast.setSelection(comment.startLine, comment.startColumn, comment.endLine, comment.endColumn);
    }
    render() {
        const comments = this.props.comments.map((comment, i) => {
            // if(comment.startLine > this.props.visibleRange.startLine && comment.startLine < this.props.visibleRange.endLine){
            return (React.createElement(Comment_1.default, { content: comment.content, distanceFromTop: editorBroadcast_1.EditorBroadcast.getTopForLineNumber(comment.startLine), handleCommentDelete: this.handleCommentDelete, handleCommentEdit: this.handleCommentEdit, handleCommentEditChange: this.handleCommentEditChange, handleCommentEditSubmit: this.handleCommentEditSubmit, handleCommentClick: this.handleCommentClick, key: i, index: i }));
            // }
        });
        const style = {
            float: 'right'
        };
        return (React.createElement(React.Fragment, null,
            this.props.commentModalOpen ?
                React.createElement(CommentForm_1.default, { value: this.props.currentCommentContent, onChange: this.handleCommentChange, onSubmit: this.handleCommentSubmit }) : null,
            this.props.selectionMade ? React.createElement(AddCommentButton_1.default, { addComment: this.addComment }) : null,
            React.createElement("div", { style: style }, comments)));
    }
}
const mapStateToProps = (store) => {
    return {
        comments: store.commentsReducer.comments,
        commentModalOpen: store.commentsReducer.commentModalOpen,
        currentCommentContent: store.commentsReducer.currentCommentContent,
        selectionMade: store.editorReducer.selectionMade,
        code: store.editorReducer.code,
        visibleRange: store.editorReducer.visibleRange,
        selectionRange: store.editorReducer.selectionRange
    };
};
exports.default = react_redux_1.connect(mapStateToProps, {
    parseComments: actions_1.parseComments,
    addToComments: actions_1.addToComments,
    toggleCommentModal: actions_1.toggleCommentModal,
    setCommentContent: actions_1.setCommentContent,
    deleteComment: actions_1.deleteComment,
    updateComment: actions_1.updateComment
})(CommentsContainer);
//# sourceMappingURL=CommentsContainer.js.map