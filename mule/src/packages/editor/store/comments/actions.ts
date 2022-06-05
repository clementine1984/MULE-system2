const parse = require('comment-parser/parser');
import { ThunkAction } from 'redux-thunk';
import {Action } from 'redux';
import { AppState } from '../index';
import { comment } from './types';

export function parseComments(
  editorContent: string,
): ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    const comments = parse(editorContent);

    comments.forEach( (comment) => {
      let content: string;
      let startLine: number;
      let endLine: number;
      let startColumn: number;
      let endColumn: number;
      comment.tags.forEach( tag => {
        switch(tag.name){
          case 'content' : content = tag.description; break;
          case 'startLine': startLine = parseInt(tag.description); break;
          case 'endLine': endLine = parseInt(tag.description); break;
          case 'startColumn': startColumn = parseInt(tag.description); break;
          case 'endColumn': endColumn = parseInt(tag.description); break;
        }
      })
      dispatch({
        type: 'ADD_TO_COMMENTS',
        payload: { content, startLine, endLine, startColumn, endColumn }
      });
    })
  }
}

export function toggleCommentModal()
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    dispatch({type: 'TOGGLE_COMMENT_MODAL'});
  }
}

export function setCommentContent(commentContent: string)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    // Trigger broadcast in here to send connected user the comment content?
    // Should I move all the broadcast functionality to the peerjs service
    dispatch({ type: 'SET_COMMENT_CONTENT', payload: commentContent});
  }
}

export function addToComments(comment: comment){
  return { type: 'ADD_TO_COMMENTS', payload: comment }
}

export function deleteComment(index: number){
  return { type: 'DELETE_COMMENT', index};
}

export function updateComment(index: number, comment: string){
  return { type: 'UPDATE_COMMENT', index, payload: comment };
}
