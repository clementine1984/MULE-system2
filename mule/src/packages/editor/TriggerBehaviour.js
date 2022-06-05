"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("./store");
const actions_1 = require("./store/menu/actions");
class TriggerBehaviour {
    constructor(core, editorBehaviour) {
        this.core = core;
        this.editorBehaviour = editorBehaviour;
    }
    // enables/disables menu options
    applyOptions(options) {
        console.log("******************", options);
        //clear the disabled state
        // store.dispatch(resetMenu());
        for (let item of Object.keys(options)) {
            console.log('item', item);
            options[item] === false ?
                store_1.default.dispatch(actions_1.disableItem(item)) :
                store_1.default.dispatch(actions_1.enableItem(item));
        }
    }
    edit() {
        this.editorBehaviour.stateChange("EDITED", this.applyOptions);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.editorBehaviour.saveBehaviour();
            const models = store_1.default.getState().editorReducer.models;
            models.forEach((model) => {
                // AlternativeVersionId is a number made my monaco which increments
                // every time a change is made in the editor
                model.lastSavedVersionId = model.model.getAlternativeVersionId();
            });
            this.editorBehaviour.stateChange("SAVED", this.applyOptions);
        });
    }
    // checks for unsaved changes in editor
    isDirty() {
        return new Promise((resolve, reject) => {
            const models = store_1.default.getState().editorReducer.models;
            models.forEach((model) => {
                console.log('model', model);
                console.log('lastSavedVersionId', model.lastSavedVersionId);
                console.log('AlternativeVersionId', model.model.getAlternativeVersionId());
                if (model.lastSavedVersionId !== model.model.getAlternativeVersionId())
                    resolve(true);
            });
            resolve(false);
        });
    }
    compile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const editorState = store_1.default.getState().editorReducer;
                const socket = yield this.editorBehaviour.compileBehaviour(editorState.code, editorState.lang);
                socket.onmessage = (d) => {
                    console.log(d.data);
                    const gradeExtractor = /^compiled\:\s\=\=\>\strue$/gm;
                    const match = gradeExtractor.exec(d.data);
                    console.log(match);
                    if (match != null)
                        this.editorBehaviour.stateChange('COMPILED', this.applyOptions);
                };
                this.core.run('terminal', {
                    'interactiveCheck': false,
                    'WebSocket': socket,
                    'function': 'Compile',
                    'Title': 'Compile'
                });
            }
            catch (err) {
                console.log(err);
                alert("compile:" + err);
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('run');
            try {
                const editorState = store_1.default.getState().editorReducer;
                const socket = yield this.editorBehaviour.runBehaviour(editorState.code, editorState.lang);
                this.core.run('terminal', {
                    'interactiveCheck': false,
                    'WebSocket': socket,
                    'function': 'Run',
                    'Title': 'Run'
                });
                this.editorBehaviour.stateChange('RAN', this.applyOptions);
            }
            catch (err) {
                console.log(err);
                alert("run: " + err);
            }
        });
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('eval');
            const socket = yield this.editorBehaviour.evaluateBehaviour();
            try {
                //TODO: urgent -check if success
                this.editorBehaviour.stateChange('EVALUATED', this.applyOptions);
            }
            catch (err) {
                alert("eval:" + err);
                console.log(err);
            }
        });
    }
}
exports.default = TriggerBehaviour;
//# sourceMappingURL=TriggerBehaviour.js.map