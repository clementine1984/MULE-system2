var objectPath = require("object-path");



import {
  ENABLE_ITEM,
  DISABLE_ITEM,
  HACK_STATE,
  MenuActionTypes,
  fileState,
  MenuState
} from './types';




const defaultState: MenuState = {
  fileState: fileState.default,
  menu: [],
  disabledOptions: {
    new: false,
    open: false,
    save: false,
    saveAs: false,
    close: false,
    undo: false,
    redo: false,
    cut: false,
    copy: false,
    paste: false,
    delete: false,
    compile: true,
    run: true,
    evaluate: true
  }
}

import { fromJS, mergeDeep, set } from 'immutable';



export default function menuReducer(state=defaultState, action: MenuActionTypes){
  switch(action.type){
    case ENABLE_ITEM: {
      return{
        ...state,
        disabledOptions: {
          ...state.disabledOptions, [action.payload]: false
        }
      }
    }
    case DISABLE_ITEM: {
      return{
        ...state,
        disabledOptions: {
          ...state.disabledOptions, [action.payload]: true
        }
      }
    }
   
    /* develblock:start */
    case HACK_STATE: { 
      //console.log('Testing hack_state')
      var newstate=JSON.parse(JSON.stringify(state))
      const mergeValue = (action as any).state || (action as any).value;
      objectPath.set(newstate,(action as any).path,mergeValue)
      
      console.log("paht:",(action as any).path)
      console.log("mergevalue:",mergeValue)
      //console.log("state:",state)
      //var result= mergeDeep(state, fromJS(mergeHack));
      //console.log("result:",result)
      return newstate
    }   
   /* develblock:end */
  }
  return state;
}
