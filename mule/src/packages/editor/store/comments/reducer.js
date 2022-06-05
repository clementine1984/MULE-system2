"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const defaultState = {
    comments: [],
    commentModalOpen: false,
    currentCommentContent: ''
};
function commentsReducer(state = defaultState, action) {
    switch (action.type) {
        case types_1.ADD_TO_COMMENTS: {
            return Object.assign({}, state, { comments: [...state.comments, action.payload] });
        }
        case types_1.TOGGLE_COMMENT_MODAL: {
            return Object.assign({}, state, { commentModalOpen: !state.commentModalOpen });
        }
        case types_1.SET_COMMENT_CONTENT: {
            return Object.assign({}, state, { currentCommentContent: action.payload });
        }
        case types_1.DELETE_COMMENT: {
            let newComments = [...state.comments];
            newComments.splice(action.index, 1);
            return Object.assign({}, state, { comments: newComments });
        }
        case types_1.UPDATE_COMMENT: {
            let newComments = [...state.comments];
            newComments[action.index].content = action.payload;
            return Object.assign({}, state, { comments: newComments });
        }
    }
    return state;
}
exports.default = commentsReducer;
//# sourceMappingURL=reducer.js.map