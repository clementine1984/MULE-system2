"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const defaultState = {
    fileState: types_1.fileState.default,
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
};
function menuReducer(state = defaultState, action) {
    switch (action.type) {
        case types_1.ENABLE_ITEM: {
            return Object.assign({}, state, { disabledOptions: Object.assign({}, state.disabledOptions, { [action.payload]: false }) });
        }
        case types_1.DISABLE_ITEM: {
            return Object.assign({}, state, { disabledOptions: Object.assign({}, state.disabledOptions, { [action.payload]: true }) });
        }
    }
    return state;
}
exports.default = menuReducer;
//# sourceMappingURL=reducer.js.map