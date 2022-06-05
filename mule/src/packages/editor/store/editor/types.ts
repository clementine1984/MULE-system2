export const SET_CODE = 'SET_CODE';
export const SET_LOCKED = 'SET_LOCKED';
export const SET_LANG = 'SET_LANG';
export const SET_TARGET_ID = 'SET_TARGET_ID';
export const SET_PLAYBACK_SPEED = 'SET_PLAYBACK_SPEED';
export const TOGGLE_RECORDING = 'TOGGLE_RECORDING';
export const SET_VISIBLE_RANGE = 'SET_VISIBLE_RANGE';
export const SET_SELECTION_MADE = 'SET_SELECTION_MADE';
export const SET_CURRENT_SELECTION = 'SET_CURRENT_SELECTION';
export const ADD_MODEL = 'ADD_MODEL';
export const SET_TAB = 'SET_TAB';
export const SET_THEME = 'SET_THEME';
export interface visibleRange {
  startLine: number,
  endLine: number,
}

export interface selectionRange {
  startLine: number,
  endLine: number,
  startColumn: number,
  endColumn: number
}

export interface EditorState {
  code: string,
  lang: string,
  theme: string,
  targetID: string,
  playbackSpeed: number,
  recording: boolean,
  visibleRange: visibleRange,
  selectionRange: selectionRange,
  selectionMade: boolean,
  locked: boolean,
  models: model[],
  activeTab: number
}

interface model {
  model: any,
  lastSavedVersionId: string
}

interface setCodeAction {
  type: typeof SET_CODE,
  payload: string
}

interface setLockedAction {
  type: typeof SET_LOCKED,
  payload: string
}

interface setLangAction {
  type: typeof SET_LANG,
  payload: string
}
interface setThemeAction {
  type: typeof SET_THEME,
  payload: string
}

interface toggleRecordingAction {
  type: typeof TOGGLE_RECORDING
}

interface setTargetIdAction {
  type: typeof SET_TARGET_ID,
  payload: string
}

interface setPlaybackSpeedAction {
  type: typeof SET_PLAYBACK_SPEED,
  payload: number
}

interface setTabAction {
  type: typeof SET_TAB,
  payload: number
}

interface setVisibleRangeAction {
  type: typeof SET_VISIBLE_RANGE,
  payload: visibleRange
}

interface setSelectionMade {
  type: typeof SET_SELECTION_MADE,
  payload: boolean
}

interface setSelectionRangeAction {
  type: typeof SET_CURRENT_SELECTION,
  payload: selectionRange
}

interface addModelAction {
  type: typeof ADD_MODEL,
  payload: model
}

export type EditorActionTypes =
  setCodeAction |
  setLangAction |
  toggleRecordingAction |
  setTargetIdAction |
  setPlaybackSpeedAction |
  setVisibleRangeAction |
  setSelectionMade |
  setSelectionRangeAction |
  addModelAction |
  setLockedAction |
  setTabAction |
  setThemeAction
 