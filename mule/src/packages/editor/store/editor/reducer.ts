import {
  EditorState,
  EditorActionTypes,
  SET_CODE,
  SET_LANG,
  SET_LOCKED,
  SET_TARGET_ID,
  SET_PLAYBACK_SPEED,
  TOGGLE_RECORDING,
  SET_VISIBLE_RANGE,
  SET_SELECTION_MADE,
  SET_CURRENT_SELECTION,
  ADD_MODEL,
  SET_TAB,
  SET_THEME
} from './types';

const defaultState: EditorState = {
  code: '/**\n @comment content Should say hello there! \n @comment startLine 4\n @comment endLine 4\n @comment startColumn 5\n @comment endColumn 21\n*/\n/**\n @comment content I disagree it should say hello Rian! \n @comment startLine 35\n @comment endLine 35\n @comment startColumn 21\n @comment endColumn 21\n*/\n{\n    "hello": "world"\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
  lang: '',
  theme: '',
  targetID: '',
  playbackSpeed: 1,
  recording: false,
  selectionMade: false,
  locked: false,
  visibleRange: {
    startLine: 1,
    endLine: 1
  },
  selectionRange: {
    startLine: 1,
    endLine: 1,
    startColumn: 1,
    endColumn: 1
  },
  models: [],
  activeTab: 0
}

export default function editorReducer(state=defaultState, action: EditorActionTypes) {
  switch(action.type){
    case SET_CODE: {
      return { ...state, code: action.payload}
    }
    case SET_LOCKED: {
      console.log("SETTING LOCKED TO ",action.payload)
      return { ...state, locked: action.payload}
    }
    case SET_LANG: {
      return { ...state, lang: action.payload }
    }
    case SET_TAB: {
      return { ...state, activeTab: action.payload }
    }
    case SET_THEME: {
      return { ...state, theme: action.payload }
    }
    case SET_TARGET_ID: {
      return { ...state, targetID: action.payload}
    }
    case SET_PLAYBACK_SPEED: {
      return { ...state, playbackSpeed: action.payload}
    }
    case TOGGLE_RECORDING: {
      return { ...state, recording: !state.recording}
    }
    case SET_VISIBLE_RANGE: {
      return { ...state, visibleRange: action.payload}
    }
    case SET_SELECTION_MADE: {
      return {...state, selectionMade: action.payload }
    }
    case SET_CURRENT_SELECTION: {
      return { ...state, selectionRange: action.payload}
    }
    case ADD_MODEL: {
      return { ...state, models: [...state.models, action.payload]}
    }
    // TODO: removeConnection
  }
  return state;
}
