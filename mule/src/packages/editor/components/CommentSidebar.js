"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Comment_1 = require("./Comment");
const CommentSidebar = (props) => {
    const comments = props.comments.map((comment, i) => {
        if (comment.lineNumber > props.visibleRange.startLine && comment.lineNumber < props.visibleRange.endLine) {
            return (React.createElement(Comment_1.default, { content: comment.content, handleCommentDelete: props.handleCommentDelete, handleCommentEdit: props.handleCommentEdit, handleCommentEditChange: props.handleCommentEditChange, key: i, index: i }));
        }
    });
    const style = {
        float: 'right'
    };
    return (React.createElement("div", { style: style }, comments));
};
exports.default = CommentSidebar;
//# sourceMappingURL=CommentSidebar.js.map