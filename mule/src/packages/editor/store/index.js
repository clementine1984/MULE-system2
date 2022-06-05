"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const redux_thunk_1 = require("redux-thunk");
const redux_logger_1 = require("redux-logger");
const redux_2 = require("redux");
const reducer_1 = require("./editor/reducer");
const reducer_2 = require("./comments/reducer");
const reducer_3 = require("./menu/reducer");
const rootReducer = redux_2.combineReducers({
    editorReducer: reducer_1.default,
    commentsReducer: reducer_2.default,
    menuReducer: reducer_3.default
});
exports.default = redux_1.createStore(rootReducer, redux_1.applyMiddleware(redux_thunk_1.default, redux_logger_1.default));
//# sourceMappingURL=index.js.map