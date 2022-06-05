import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { combineReducers } from 'redux';
import editorReducer from './editor/reducer';
import commentsReducer from './comments/reducer';
import menuReducer from './menu/reducer';

const rootReducer = combineReducers({
  editorReducer,
  commentsReducer,
  menuReducer
});
export type AppState = ReturnType<typeof rootReducer>;

export default createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk, logger)));
