"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse = require('comment-parser/parser');
function parseComments(editorContent) {
    return function (dispatch) {
        const comments = parse(editorContent);
        comments.forEach((comment) => {
            let content;
            let startLine;
            let endLine;
            let startColumn;
            let endColumn;
            comment.tags.forEach(tag => {
                switch (tag.name) {
                    case 'content':
                        content = tag.description;
                        break;
                    case 'startLine':
                        startLine = parseInt(tag.description);
                        break;
                    case 'endLine':
                        endLine = parseInt(tag.description);
                        break;
                    case 'startColumn':
                        startColumn = parseInt(tag.description);
                        break;
                    case 'endColumn':
                        endColumn = parseInt(tag.description);
                        break;
                }
            });
            dispatch({
                type: 'ADD_TO_COMMENTS',
                payload: { content, startLine, endLine, startColumn, endColumn }
            });
        });
    };
}
exports.parseComments = parseComments;
function toggleCommentModal() {
    return function (dispatch) {
        dispatch({ type: 'TOGGLE_COMMENT_MODAL' });
    };
}
exports.toggleCommentModal = toggleCommentModal;
function setCommentContent(commentContent) {
    return function (dispatch) {
        // Trigger broadcast in here to send connected user the comment content?
        // Should I move all the broadcast functionality to the peerjs service
        dispatch({ type: 'SET_COMMENT_CONTENT', payload: commentContent });
    };
}
exports.setCommentContent = setCommentContent;
function addToComments(comment) {
    return { type: 'ADD_TO_COMMENTS', payload: comment };
}
exports.addToComments = addToComments;
function deleteComment(index) {
    return { type: 'DELETE_COMMENT', index };
}
exports.deleteComment = deleteComment;
function updateComment(index, comment) {
    return { type: 'UPDATE_COMMENT', index, payload: comment };
}
exports.updateComment = updateComment;
//# sourceMappingURL=actions.js.map