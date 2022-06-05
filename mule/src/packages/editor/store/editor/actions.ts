import axios from 'axios';
import { ThunkAction } from 'redux-thunk';
import {Action } from 'redux';
import { AppState } from '../index';

export function setEditorContent(editorContent: string)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    dispatch({ type: 'SET_CODE', payload: editorContent });
  }
}

export function setLang(lang: string){
  return { type: 'SET_LANG', payload: lang };
}

export function setTheme(theme: string){
  return { type: 'SET_THEME', payload: theme };
}



export function startRecording(editorContent: string)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    console.log('in start recording', editorContent);
    axios.post('http://localhost:3000/initState', { code: editorContent });
    dispatch({ type: 'SET_CODE', payload: editorContent });
    dispatch({ type: 'TOGGLE_RECORDING' });
  }
}

export function stopRecording(editorContent: string)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    dispatch({ type: 'TOGGLE_RECORDING' });
  }
}

export function setTargetId(id: string)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    dispatch({ type: 'SET_TARGET_ID', payload: id });
  }
}

export function setPlaybackSpeed(speed: number)
: ThunkAction<void, AppState, null, Action<string>>{
  return function(dispatch){
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  }
}

export function setVisibleRange(range: any){
  const rangeObject = {
    startLine: range.startLineNumber,
    endLine: range.endLineNumber
  };
  return { type: 'SET_VISIBLE_RANGE', payload: rangeObject };
}

export function setSelectionRange(range: any){
  const selectionObject = {
    startLine: range.startLine,
    endLine: range.endLine,
    startColumn: range.startColumn,
    endColumn: range.endColumn
  };
  return { type: 'SET_CURRENT_SELECTION', payload: selectionObject };
}

export function setSelectionMade(selectionMade: boolean){
  return { type: 'SET_SELECTION_MADE', payload: selectionMade };
}

export function addModel(model: any, lastSavedVersionId: string){
  const payload = { model, lastSavedVersionId };
  return { type: 'ADD_MODEL', payload };
}

export function setTab(tab: number){
  const payload =  tab ;
  return { type: 'SET_TAB', payload };
}