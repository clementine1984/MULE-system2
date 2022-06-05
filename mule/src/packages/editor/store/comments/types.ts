export const ADD_TO_COMMENTS = 'ADD_TO_COMMENTS';
export const TOGGLE_COMMENT_MODAL = 'TOGGLE_COMMENT_MODAL';
export const SET_COMMENT_CONTENT = 'SET_COMMENT_CONTENT';
export const DELETE_COMMENT = 'DELETE_COMMENT';
export const UPDATE_COMMENT = 'UPDATE_COMMENT';

export interface comment {
  content: string,
  startLine: number,
  endLine: number,
  startColumn: number,
  endColumn: number
}

export interface CommentsState {
  comments: Array<comment>,
  commentModalOpen: boolean,
  currentCommentContent: string
}

interface addToCommentsAction {
  type: typeof ADD_TO_COMMENTS,
  payload: comment
}

interface toggleCommentModalAction {
  type: typeof TOGGLE_COMMENT_MODAL
}

interface setCommentContentAction {
  type: typeof SET_COMMENT_CONTENT,
  payload: string
}

interface deleteCommentAction {
  type: typeof DELETE_COMMENT,
  index: number
}

interface updateCommentAction {
  type: typeof UPDATE_COMMENT,
  index: number;
  payload: string
}

export type CommentActionTypes =
  addToCommentsAction |
  toggleCommentModalAction |
  setCommentContentAction |
  deleteCommentAction |
  updateCommentAction;
