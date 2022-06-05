import {
  CommentsState,
  CommentActionTypes,
  ADD_TO_COMMENTS,
  TOGGLE_COMMENT_MODAL,
  SET_COMMENT_CONTENT,
  DELETE_COMMENT,
  UPDATE_COMMENT
} from './types';

const defaultState: CommentsState = {
  comments: [],
  commentModalOpen: false,
  currentCommentContent: ''
}

export default function commentsReducer(state=defaultState, action: CommentActionTypes) {
  switch(action.type){
    case ADD_TO_COMMENTS: {
      return {
        ...state,
        comments: [...state.comments, action.payload]
      }
    }
    case TOGGLE_COMMENT_MODAL: {
      return { ...state, commentModalOpen: !state.commentModalOpen}
    }
    case SET_COMMENT_CONTENT: {
      return {...state, currentCommentContent: action.payload}
    }
    case DELETE_COMMENT: {
      let newComments = [...state.comments];
      newComments.splice(action.index, 1);
      return {...state, comments: newComments};
    }
    case UPDATE_COMMENT: {
      let newComments = [...state.comments];
      newComments[action.index].content = action.payload;
      return {...state, comments: newComments}
    }
  }
  return state;
}
