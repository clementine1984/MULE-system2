export const ENABLE_ITEM = 'ENABLE_ITEM';
export const DISABLE_ITEM = 'DISABLE_ITEM';
export const HACK_STATE = 'HACK_STATE';

export enum fileState {
  default = 'DEFAULT',
  opened = 'OPENED',
  new = 'NEW',
  edited = 'EDITED',
  saved = 'SAVED',
  compiled = 'COMPILED',
  ran = 'RAN',
  evaluated = 'EVALUATED'
}

export interface disabledOptions {
  new: boolean,
  open: boolean,
  save: boolean,
  saveAs: boolean,
  close: boolean,
  undo: boolean,
  redo: boolean,
  cut: boolean,
  copy: boolean,
  paste: boolean,
  delete: boolean,
  compile: boolean,
  run: boolean,
  evaluate: boolean
}

export interface MenuState {
  fileState: fileState,
  disabledOptions: disabledOptions,
  menu: any
}

interface enableItemAction {
  type: typeof ENABLE_ITEM,
  payload: string
}

interface disableItemAction {
  type: typeof DISABLE_ITEM,
  payload: string
}


interface hackStateAction {
  type: typeof HACK_STATE,
  payload: string
}


export type MenuActionTypes =
  enableItemAction |
  disableItemAction | hackStateAction;
