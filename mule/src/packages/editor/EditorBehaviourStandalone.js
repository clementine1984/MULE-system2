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
class EditorBehaviourStandalone {
    constructor() {
        this.enabledOptions = {};
    }
    // decides which menu options are enabled/disabled for a given file state
    stateChange(fileState, applyOptionsCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (fileState) {
                case "DEFAULT":
                    this.enabledOptions["compile"] = false;
                    this.enabledOptions["run"] = false;
                    this.enabledOptions["evaluate"] = false;
                    break;
                case "NEW":
                case "EDITED":
                    this.enabledOptions["compile"] = false;
                    this.enabledOptions["run"] = false;
                    this.enabledOptions["evaluate"] = false;
                    break;
                case "OPENED":
                    this.enabledOptions["compile"] = true;
                    break;
                case "SAVED":
                    this.enabledOptions["compile"] = true;
                    break;
                case "COMPILED":
                    this.enabledOptions["compile"] = true;
                    this.enabledOptions["run"] = true;
                    break;
                case "RAN":
                case "EVALUATED":
                    this.enabledOptions["compile"] = true;
                    this.enabledOptions["run"] = true;
                    this.enabledOptions["evaluate"] = false; //there is no evaluate in standalone mode
                    break;
            }
            applyOptionsCallback(this.enabledOptions);
        });
    }
    setWorkFiles(workFiles) {
        this.workFiles = workFiles;
    }
    compileBehaviour(content, lang, script) {
        return __awaiter(this, void 0, void 0, function* () {
            throw "No compile available in standalone mode";
        });
    }
    runBehaviour(content, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            throw "No run available in standalone mode";
        });
    }
    evaluateBehaviour(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            throw "No evaluate available in standalone mode";
        });
    }
    saveBehaviour(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            throw "No save available in standalone mode";
        });
    }
    onload(editor) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    createCopyPasteDialog(current, cb) {
        // Dialog.create('Alert', {
        //   title: "Can't access clipboard",
        //   message: "This browser can't access your clipboard!<br/> You can use keyboard shortcuts instead: <br/>  Cut = Ctrl+X <br/>  Copy = Ctrl + C <br/>  Paste = Ctrl + V",
        //
        // }, function(ev, button, result) {
        //   if (button === 'ok' && result) {
        //     cb(result);
        //   }
        // }, self);
    }
    paste(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log("PASTING!!!!!!!")
            const p = new Promise((resolve, reject) => {
                try {
                    resolve(navigator.clipboard.readText());
                }
                catch (err) {
                    this.createCopyPasteDialog(null, function (font) { });
                }
            });
            return p;
        });
    }
    //allow any paste through
    onPaste(editor) {
        alert("paste!");
        /*return (t, e)=> {
                let n = {
                    text: t,
                    event: e
                };
                editor.commands.exec("paste", editor, n)
            }*/
    }
    onCopy(editor) {
        /*return ()=> {
                editor.commands.exec("copy", editor)
            }*/
    }
    onCut(editor) {
        /*return ()=> {
                editor.commands.exec("cut", editor)
            }*/
    }
    writeClipboardContents(txt) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = new Promise((resolve) => {
                try {
                    //write to workbook clipboard
                    resolve(navigator.clipboard.writeText(txt));
                }
                catch (err) {
                    this.createCopyPasteDialog(null, function (font) { });
                }
            });
            return p;
        });
    }
}
exports.default = new EditorBehaviourStandalone();
//# sourceMappingURL=EditorBehaviourStandalone.js.map