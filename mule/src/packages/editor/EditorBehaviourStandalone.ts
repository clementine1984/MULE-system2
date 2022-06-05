import store from "./store";
import { EditorBroadcast } from "./editorBroadcast";
import { EditorBehaviour } from "./EditorBehaviour";
import axios from "axios";
import WebSocketWrapper from "./WebSocketWrapper";
import { AssertionError } from "assert";
import assert = require("assert");
import { EditorFile } from "./EditorFile";
var keycode = require("keycode");

const CLIPBOARD_TARGET = "SYSTEM";
const CLIPBOARD_SOURCE = "SYSTEM";

export const fileTypes = {
  java: "java",
  c: "c"
};
const osjs = require("osjs");

//========================================================
interface MyWindow extends Window {
  monaco: any;
}

declare var window: MyWindow;
//========================================================

const proxiedWebSocket = new Proxy(WebSocket, {
  construct(target, args) {
    console.log("constructor of originalClass called.");

    return new Proxy(new target(args), {
      get(target, prop, receiver) {
        console.log(prop , " accessed on an instance of originalClass");
        const val = target[prop];
        if (typeof target[prop] === "function") {
          console.log(prop , " was a function");
          return function(args) {
            console.log(prop , "() called");
            return val.apply(this, args);
          };
        } else {
          return val;
        }
      }
    });
  }
});

export class EditorBehaviourStandalone extends EditorBehaviour {
  enabledOptions = {};
  rights:any
  optionState: string;
  workFiles: any;
  core: any;
  proc: any;
  win: any;
  _shouldDestroy: boolean;
  editor: any; //the wrapped monaco editor instance
  models: any; //TODO: this is kinf of monaco specific
  editorFiles: any
  userFiles: any
  title: string

  store:any
  clipboardTarget="system"
  clipboardSource="system"
  //filename: any;
  //lastSavedVersionId: any; //for single file use only
  //fontSize: number; //todo - this should be a query to monaco
  //theme: string;

  menu: any;
  actions: any

  constructor(store,core, proc,args) {
    super();
    this.core = core;
    this.proc = proc;
    this._shouldDestroy = false;
    this.store=store
    this.rights={ run: true }
    //this.filename = "";

    console.log("ARGS ARE: ",args)

    this.userFiles={"untitled":""}
    if((args!=null) && (args.userFiles!=null))
    {
      this.userFiles={}
      for(var f of args.userFiles)
      {
        this.userFiles[f]=args.files[f]
      }
    }
    
    this.title=(((args!=null)&&(args.title!=null))?args.title:"editor")

    console.log("TITLE IS: ",this.title)


    this.menu = [
      {
        name: "File",
        enabled: true,
        children: [
          {
            name: "New",
            enabled: true,
            action: "new",
            themeIcon: "document-new.png"
          },
          {
            name: "Open",
            enabled: true,
            action: "open",
            themeIcon: "document-open.png"
          },
          {
            name: "Save",
            enabled: true,
            action: "save",
            themeIcon: "document-save.png"
          },
          {
            name: "Save as",
            enabled: true,
            action: "save-as",
            themeIcon: "document-save-as.png"
          },
          {
            name: "Close",
            enabled: true,
            action: "close",
            themeIcon: "window-close.png"
          }
        ]
      },
      {
        name: "Edit",
        enabled: true,
        children: [
          {
            name: "Undo",
            enabled: true,
            action: "undo",
            themeIcon: "edit-undo.png"
          },
          {
            name: "Redo",
            enabled: true,
            action: "redo",
            themeIcon: "edit-redo.png"
          },
          {
            name: "Cut",
            enabled: true,
            action: "cut",
            themeIcon: "edit-cut.png"
          },
          {
            name: "Copy",
            enabled: true,
            action: "copy",
            themeIcon: "edit-copy.png"
          },
          {
            name: "Paste",
            enabled: true,
            action: "paste",
            themeIcon: "edit-paste.png"
          },
          {
            name: "Font-size",
            enabled: true,
            themeIcon: "applications-system.png",
            children: [
              {
                name: "Larger",
                enabled: true,
                action: "font-larger",
                themeIcon: "zoom-in.png"
              },
              {
                name: "Smaller",
                enabled: true,
                action: "font-smaller",
                themeIcon: "zoom-out.png"
              }
            ]
          },
          {
            name: "Theme",
            enabled: true,
            themeIcon: "applications-system.png",
            children: [
              {
                name: "Visual Studio",
                enabled: true,
                action: "set-theme vs",
                themeIcon: "preferences-desktop-keyboard.png"
              },
              {
                name: "Visual Studio Dark",
                enabled: true,
                action: "set-theme vs-dark",
                themeIcon: "preferences-desktop-keyboard.png"
              }
            ]
          }
        ]
      },
      {
        name: "Code",
        enabled: true,
        children: [
          {
            name: "Compile",
            enabled: true,
            action: "compile",
            themeIcon: "preferences-desktop-keyboard.png"
          },
          {
            name: "Run",
            enabled: true,
            action: "run",
            themeIcon: "utilities-terminal.png"
          }
          /*{ name: "Evaluate", enabled: true, action:"evaluate", themeIcon: "x-office-presentation-template.png"}*/
        ]
      }
    ];

    this.store.dispatch({
      type: "HACK_STATE",
      path: "menu",
      value: this.menu
    });

    this.editorFiles=[]
    
    console.log("USERFILES:::::::",this.userFiles)
  
    for(var e in this.userFiles)
    {
      this.editorFiles.push(new EditorFile({
      changeHandler: this.handleChange.bind(this),
      editor: null, //not available yet
      model: null, // monaco editor not yet available - window.monaco.editor.createModel(),
      path: e,
      content: this.userFiles[e]
      }))
    }

    //If there's only one file, make it the window title
    /*
    if(this.userFiles.length==1)
    {
      this.setTitle(this.userFiles[0].path)
    }*/








    this.actions = {
      paste: this.handlePaste.bind(this),
      cut: this.handleCut.bind(this),
      copy: this.handleCopy.bind(this),
      undo: this.handleUndo.bind(this),
      redo: this.handleRedo.bind(this),
      open: this.handleOpen.bind(this),
      save: this.handleSave.bind(this),
      "save-as": this.handleSaveAs.bind(this),
      new: this.handleNew.bind(this),
      close: this.handleClose.bind(this),
      "font-larger": this.handleZoomIn.bind(this),
      "font-smaller": this.handleZoomOut.bind(this),
      compile: this.handleCompile.bind(this),
      run: this.handleRun.bind(this)
    };

    //console.log("MENU is (1)",this.menu)

    this.doStateChange("DIRTY");
    //this.handleChange() //too early - wait until model is created
    
  }


  createModels()
  {
    this.editorFiles.forEach((f)=>{
      f.setModel(window.monaco.editor.createModel(f.content))
    })
  }

  getModels()
  {
    return this.editorFiles.map((f)=>{ return f.model })
  }

  //============================================================================
  // Menu related functions
  //============================================================================

  async trigger(action: string) {
    if (action.startsWith("set-theme ")) {
      this.proc.settings.theme = action.substring("set-theme ".length);
      this.updateEditor();
      return;
    }

 

    if (this.actions[action]) return this.actions[action]();
    alert(action);
  }





  //convert "File/New" to "menu.0.children.0"
  getMenuPath(friendlyPath) {
    var unfriendlyPath = "menu";
    var path = friendlyPath.split("/");
    var children: Array<any> = this.menu;

    while (path.length > 0) {
      var found = null;
      var next = path.shift();
      for (var index in children) {
        if (children[index].name === next) {
          found = index;
          unfriendlyPath += "." + found;
          break;
        }
      }
      if (found == null) throw "Menu item not found";
      if (path.length > 0) {
        unfriendlyPath += ".children";
        children = this.menu[found].children;
      }
    }
    return unfriendlyPath;
  }
  //============================================================================
  // END Menu related functions
  //============================================================================








  //===============================================================================

  setWindow(win) {
    this.win = win;
    this.setTitle(this.title);
  }

  updateEditor() {
    this.setTheme();
    this.editor.updateOptions({
      fontSize: this.proc.settings.fontSize + "px"
    });
  }
  //===============================================================================
  // associate an editor  (monaco?) with this behaviour
  setEditor(editor) {
    this.editor = editor;
    this.updateEditor();


    //get rid of any editor files already set (prob should not be any)
    //....if there are, maybe there should be a dirty check
    if(this.editorFiles!=null)
    {
      this.editorFiles.forEach((f)=>{f.editor=editor}) //do we even need this?
    }

    //create a new editorFile (it will be linked to the existing monaco editor)

    //this.editorFiles=[new EditorFile({
    //  changeHandler: this.handleChange.bind(this),
    //  editor: this.editor,
    //  model: this.editor.getModel()
    //})]


    //decorate default model
    //var m = 

    //if (m.isDirty == null) m = ModelWrapper(m);

    //attach listenters to models
    //this.editor.getModel().onDidChangeContent(this.handleChange.bind(this));





    this.handleChange(true);

    const keyMod = window.monaco.KeyMod;
    //Controls for cut/copy/paste
    for (var c of [
      { shortcut: keyMod.CtrlCmd | keyMod.KEY_C, command: this.handleCopy },
      { shortcut: keyMod.CtrlCmd | keyMod.KEY_X, command: this.handleCut },
      { shortcut: keyMod.CtrlCmd | keyMod.KEY_V, command: this.handlePaste }
    ]) {
      this.editor.addCommand(c.shortcut, c.command.bind(this));
    }
  }


  //==================================================================================================================

  /*getDefaultModel() {
    var m = ModelWrapper(window.monaco.editor.createModel("")); //TODO: ugly hack - fix it!
    m.onDidChangeContent(this.handleChange.bind(this));
  }*/

  //===============================================================================

 
  //===============================================================================

  setTheme() {
    var theme = this.proc.settings.theme;
    //console.log("Setting theme to", theme);
    window.monaco.editor.setTheme(theme);

    this.proc.settings.theme = theme;
    this.proc.saveSettings();
    this.saveSettings();
  }



  async handleZoomOut() {
    this.proc.settings.fontSize -= 2;
    this.editor.updateOptions({
      fontSize: this.proc.settings.fontSize + "px"
    });
    this.proc.saveSettings();
    this.saveSettings();
  }

  async handleZoomIn() {
    this.proc.settings.fontSize += 2;
    this.editor.updateOptions({
      fontSize: this.proc.settings.fontSize + "px"
    });
    this.proc.saveSettings();
    this.saveSettings();
  }


  //Figure out the language from the file path
  detectLanguage() {
    assert(this.editorFiles.length==1)

    var extension = this.editorFiles[0].getExtension();
    var lang = fileTypes[extension];
    console.log("ext:", extension, "lang:", lang);

    window.monaco.editor.setModelLanguage(this.editor.getModel(), lang);
  }



  getEditorFilenames()
  {
    return this.editorFiles.map((f)=>{return f.getFilename()})
  }

  //===================================================================================================================
  // File New, Open, Save, Save as
  //===========================================================================================================
  async handleNew() {
    if (!(await this.okToLoseChanges())) return;



    //get rid of any editor files already set (prob should not be any)
    if(this.editorFiles!=null)
    {
      this.editorFiles.forEach((f)=>{f.dispose()})
    }


    //create a new editorFile (it will be linked to the existing monaco editor)


    var m = window.monaco.editor.createModel(""); //TODO: ugly hack - fix it!
    this.editor.setModel(m);

    this.editorFiles=[new EditorFile({
      changeHandler: this.handleChange.bind(this),
      editor: this.editor,
      model: m,
      content: ""
    })]




    //this.editor.getModel().dispose();

    

    
    this.clearDirty();
    //m.onDidChangeContent(this.handleChange.bind(this));
    this.setTitle(this.title);
    this.doStateChange("DIRTY");
    return m;
  }




    async handleOpen() {
      var ok = await this.okToLoseChanges();
      if (!ok) return;
  
      this.core.make(
        "osjs/dialog",
        "file",
        {
          filetype: "file" // New option
        },
        async (button, file) => {
          if (button !== "ok") return;
          //now load file.path with vfs
          var text = await this.core.make("osjs/vfs").readfile(file.path);
  
          //var lang=langDetector.contents(file.path, text)
  
          //clone the default uri
          //var uri = JSON.parse(JSON.stringify(this.editor.getModel().uri));
          //uri["scheme"] = "vfs";
          //uri["fpath"] = file.path;
  
          //this.editor.getModel().dispose();
              //get rid of any editor files already set (prob should not be any)
          if(this.editorFiles!=null)
          {
            this.editorFiles.forEach((f)=>{f.dispose()})
          }

          var m = window.monaco.editor.createModel(text); //TODO: ugly hack - fix it!
          
      
          var efile=new EditorFile({
            changeHandler: this.handleChange.bind(this),
            editor: this.editor,
            model: m,
            path: file.path
          })

          this.editorFiles=[efile]
          this.editor.setModel(null);
          this.lock()

          this.editor.setModel(m);
  
          this.unlock()
          //var m = ModelWrapper(window.monaco.editor.createModel(text)); //TODO: ugly hack - fix it!
          //m.path = file.path;
          //this.editor.setModel(m);
  
          var extension = efile.getExtension();
          var lang = fileTypes[extension];
          console.log("ext:", extension, "lang:", lang);
  
          window.monaco.editor.setModelLanguage(this.editor.getModel(), lang);
  
          this.clearDirty();
         // m.onDidChangeContent(this.handleChange.bind(this));
          this.setTitle(this.title) //this.editorFiles[0].getFilename());

         
          this.doStateChange("CLEAN");
          // window.monaco.editor.setModelLanguage(this.editor.getModel(), lang)
        }
      );
    }

  async handleSave() {

    assert(this.editorFiles.length==1)
    var path = this.editorFiles[0].path;

    if (path == null) {
      return await this.handleSaveAs();
    }
    //=======================================================
    var text = this.editorFiles[0].getContent()

    await this.core.make("osjs/vfs").writefile(path, text);
    this.clearDirty();

    this.doStateChange("CLEAN");
  }


  setTitle(fname){
    this.win.setTitle(fname);
  }



  async handleSaveAs() {
    this.core.make(
      "osjs/dialog",
      "file",
      { type: "save", title: "Save As" },
      async (button, file) => {
        //console.log("BUTTON", button);
        if (button === "cancel") return;
        //console.log("Chosen file:", file);

        assert(this.editorFiles.length==1)
        var text = this.editorFiles[0].getContent()

        await this.core.make("osjs/vfs").writefile(file.path, text);
        this.editorFiles[0].path = file.path;
        this.lock()
        this.unlock()
        //this.setTitle(this.editorFiles[0].getFilename());
        this.setTitle(this.title)
        this.clearDirty();

        this.detectLanguage();

        this.doStateChange("CLEAN");
      }
    );
  }
  //===================================================================================================================
  // File New, Open, Save, Save as
  //===================================================================================================================

  
  //========================================================================================================
  // TODO: This should be system-wide
  async saveSettings() {
    var path = "home:/.osjs/settings.json";

    var allSettings = JSON.parse(JSON.stringify(window.localStorage));
    var allKeys = Object.keys(allSettings);
    var matchingKeys = allKeys.filter(k => {
     // console.log("   ", k);
      return k.startsWith("osjs");
    });

    var settings = {};
    matchingKeys.forEach(k => {
      settings[k] = JSON.parse(allSettings[k]);
    });

    await this.core.make("osjs/vfs").writefile(path, JSON.stringify(settings));
  }
  //===============================================================================
  // Clipboard functions
  //===============================================================================
  async writeToClipboard(text) {
    assert(CLIPBOARD_TARGET === "SYSTEM"); //more options later
    await navigator.clipboard.writeText(text);
  }

  async readFromClipboard() {
    assert(CLIPBOARD_SOURCE === "SYSTEM"); //more options later
    return await navigator.clipboard.readText();
  }

  //decide where the paste source is: system, browser, workbook, question, or file
  async handlePaste() {
    var text = null;

    try {
      text = await this.readFromClipboard();
    } catch (err) {
      alert("Cannot access clipboard");
    }

    var selection = this.editor.getSelection();
    var id = { major: 1, minor: 1 };
    var op = {
      identifier: id,
      range: selection,
      text: text,
      forceMoveMarkers: true
    };
    this.editor.executeEdits("my-source", [op]);
  }

  //decide where the copy destination is: system, browser, workbook, question, or file
  async handleCut() {
    var text = this.editor
      .getModel()
      .getValueInRange(this.editor.getSelection());

    try {
      await this.writeToClipboard(text);
    } catch (err) {
      alert("Cannot access clipboard");
    }

    //and clear the selection
    var selection = this.editor.getSelection();
    var id = { major: 1, minor: 1 };
    var op = {
      identifier: id,
      range: selection,
      text: "",
      forceMoveMarkers: true
    };
    this.editor.executeEdits("my-source", [op]);
  }

  //decide where the copy destination is: system, browser, workbook, question, or file
  async handleCopy() {
    var text = this.editor
      .getModel()
      .getValueInRange(this.editor.getSelection());

    try {
      await this.writeToClipboard(text);
    } catch (err) {
      alert("Cannot access clipboard");
    }
  }

  handleUndo() {
    this.editor.trigger("whatever...", "undo");
    setTimeout(() => this.isDirty(), 100);
  }

  handleRedo() {
    this.editor.trigger("whatever...", "redo");
    this.isDirty();
  }

  //===============================================================================
  // END Clipboard functions
  //===============================================================================



  //===============================================================================
  // Window Functions
  //===============================================================================
  lock()
  {
    this.store.dispatch({
      type: "SET_LOCKED",
      payload: true
    });
  }

  unlock()
  {
    this.store.dispatch({
      type: "SET_LOCKED",
      payload: false
    });
  }





  keyDown(ev, win) {
    //======================================================================================
    // ctrl+s => save
    //======================================================================================

    //const disabledOptions = store.getState().menuReducer.disabledOptions;
    const code = ev.keyCode;
    const ctrl = ev.ctrlKey || ev.metaKey;
    const alt = ev.altKey;

    //this is only for ctrl+s
    if (keycode(code) === "s" && ctrl && !alt) {
      ev.preventDefault();
      this.handleSave();
      return false;
    }

    //this is only for ctrl+v
    if (keycode(code) === "v" && ctrl && !alt) {
      ev.preventDefault();
      this.handlePaste();
      return false;
    }


    //this is only for ctrl+x
    if (keycode(code) === "x" && ctrl && !alt) {
      ev.preventDefault();
      this.handleCut();
      return false;
    }


    //this is only for ctrl+c
    if (keycode(code) === "c" && ctrl && !alt) {
      ev.preventDefault();
      this.handleCopy();
      return false;
    }


  }


  shouldDestroy() {
    return this._shouldDestroy;
  }

  async okToLoseChanges() {
    return new Promise(async (resolve, reject) => {
      const dialogOptions = {
        title: "Discard Changes?",
        message: "You have unsaved changes. Do you really want to lose them?"
      };
      const isDirty = this.isDirty();
      //console.log("ISDIRTY", isDirty);
      if (!isDirty) return resolve(true);
      this.core.make(
        "osjs/dialog",
        "confirm",
        dialogOptions,
        async (btn, value) => {
          if (btn === "no") return resolve(false);
          return resolve(true);
        }
      );
    });
  }

  async closeWindow(win) {
    var ok = await this.okToLoseChanges();

    if (ok) {
      this._shouldDestroy = true;
      win.destroy();
      //const editorContent = EditorBroadcast.getData();
      //axios.post("http://localhost:3000/finalState", { code: editorContent });
      //this.editor.destroy()
      this.proc.destroy();
    } else this._shouldDestroy = false;
  }

  async handleClose() {
    await this.closeWindow(this.win);
  }
 
  //===============================================================================
  // END Window Functions
  //=============================================================================== 
 





  //===============================================================================
  // State management
  //=============================================================================== 
  async handleChange(force?) {
    if (this.isDirty()) this.doStateChange("DIRTY");
  }

  // checks for unsaved changes in editor
 isDirty(): boolean {
      //const models = store.getState().editorReducer.models;
      const efiles=this.editorFiles

      for (var f of efiles) {
        if (f.isDirty()) return true;
      }

      return false;
  }

  

  // clears all dirty flags
  clearDirty() {
     
    const efiles=this.editorFiles

    for (var f of efiles) {
      f.clearDirty()
    }

    return false;

  }

  // decides which menu options are enabled/disabled for a given file state
  // TODO: DIRTY here does not mean NEW (we should fix this)
  doStateChange(fileState: string) {
    var oldState = this.optionState;

    //TODO: better handling of side effect
    try {
      var name = null;
      assert(this.editorFiles.length==1)

      const f = this.editorFiles[0].path;
      if (f == null) name = "Untitled";
      else name = f.split("/").pop();
      this.setTitle(this.title + (fileState === "DIRTY" ? "*" : ""));
    } catch (err) {}

    const states = {
      DIRTY: { compile: false, run: false, evaluate: false },
      CLEAN: { compile: true, run: false, evaluate: false },
      COMPILED: { compile: true, run: true, evaluate: false },
      RAN: { compile: true, run: true, evaluate: true } //note there is no evaluate in standalone mode
    };

    assert(fileState in states);

    this.enabledOptions = states[fileState];
    this.optionState = fileState;

    if (this.optionState != oldState) {
      this.enableCompile(this.enabledOptions["compile"]);
      this.enableExecute(this.enabledOptions["run"] && (this.rights.run===true));
	    
	    
	
	
	    
	    
    
    
    }
    //applyOptionsCallback(this.enabledOptions);
  }

  //TODO: remove the need for this
  stateChange(fileState: string) {}

  //===============================================================================
  // END State management
  //=============================================================================== 





//=================================================================
// Code execution and compilation
//=================================================================


  setWorkFiles(workFiles) {
    this.workFiles = workFiles
  }


  enableCompile(v) {
    this.store.dispatch({
      type: "HACK_STATE",
      path: this.getMenuPath("Code/Compile") + ".enabled",
      value: v
    })
  }

  enableExecute(v) {
    this.store.dispatch({
      type: "HACK_STATE",
      path: this.getMenuPath("Code/Run") + ".enabled",
      value: v
    })
  }

  enableEvaluate(v) {/* does nothing here */
  }


  async handleCompile() {

    if (this.isDirty()) {
      alert("Changes not saved. Save file first.")
      return
    }

    let files = {}

    for (let i = 0; i < this.editorFiles.length; i++) {
      let text = this.editorFiles[i].getContent()
      let path = this.editorFiles[i].path
      files[path.substring(path.indexOf("/"))] = {content: text}
    }

    const response = await this.proc.request('/cee/submit', {
      method: 'post', body: {
        command: 'compile',
        files: files
      }
    })

    if (!response.success) {
      return alert(response.message);
    }

    const ws = this.proc.socket(`/cee/execute/${response.executionTicket}`)

    //prevent a race condition by passing a function to the terminal for socket connection
    let launchTerm = () => {
      let wrapped = new WebSocketWrapper(ws.connection)

      //Watch out for compilation succeeding
      wrapped["receiveFilter"] = msg => {
        if (msg.startsWith("compiled: ==> true")) {
          msg = "Compilation succeeded with no errors.\r\n"
          this.doStateChange("COMPILED")
        }
        return msg
      }

      return wrapped
    }

    let o = this.core.make("osjs/packages")
    o.core.run("terminal", {webSocketLauncher: launchTerm})
  }

  async handleRun() {
    let files = {}

    for (let i = 0; i < this.editorFiles.length; i++) {
      let text = this.editorFiles[i].getContent()
      let path = this.editorFiles[i].path
      files[path.substring(path.indexOf("/"))] = {content: text}
    }

    const response = await this.proc.request('/cee/submit', {
      method: 'post', body: {
        command: 'run',
        files: files
      }
    })

    if (!response.success) {
      return alert(response.message);
    }

    const ws = this.proc.socket(`/cee/execute/${response.executionTicket}`)


    //prevent a race condition by passing a function to the terminal for socket connection
    let launchTerm = () => {
      let wrapped = new WebSocketWrapper(ws.connection)
      return wrapped
    }

    let o = this.core.make("osjs/packages")
    o.core.run("tictactoe", {webSocketLauncher: launchTerm})
    this.doStateChange("RAN")
  }


//=================================================================
// END Code execution and compilation
//=================================================================


setThemes(v) {
  try //the menu item doesn't always exist when this method is called, hence the try..catch
  {
          this.store.dispatch({
      type: "HACK_STATE",
      path: this.getMenuPath("Edit/Theme") + ".children",
      value: v.map(t => 
        {
          return {
            name: t.name,
            enabled: true,
            themeIcon: "preferences-desktop-keyboard.png",
            action: "set-theme "+t.value
          }
        })
          });
  }catch(err)
  {}
  
}














  //createCopyPasteDialog(current, cb) {
  // Dialog.create('Alert', {
  //   title: "Can't access clipboard",
  //   message: "This browser can't access your clipboard!<br/> You can use keyboard shortcuts instead: <br/>  Cut = Ctrl+X <br/>  Copy = Ctrl + C <br/>  Paste = Ctrl + V",
  //
  // }, function(ev, button, result) {
  //   if (button === 'ok' && result) {
  //     cb(result);
  //   }
  // }, self);
  //}
  /*
  async paste() {
    //console.log("PASTING!!!!!!!")
    const p = new Promise((resolve, reject) => {
      try {
        resolve(navigator.clipboard.readText());
      } catch (err) {
        this.createCopyPasteDialog(null, function(font) {});
      }
    });

    return p;
  }
*/
  //An opportunity to override the default paste
  /*async onPaste(e) {
    this.editor.trigger("whatever...", "undo");
    var selection = this.editor.getSelection();
    var id = { major: 1, minor: 1 };
    try {
      alert(await navigator.clipboard.readText());
    } catch (err) {
      alert("Clipboard problem!");
    }

    var text = "XXX";
    var op = {
      identifier: id,
      range: selection,
      text: text,
      forceMoveMarkers: true
    };
    this.editor.executeEdits("my-source", [op]);
  }*/

  //allow any paste through
  /* onPaste() {
    alert("paste!")
    /*return (t, e)=> {
            let n = {
                text: t,
                event: e
            };
            editor.commands.exec("paste", editor, n)
        }
}*/

  //onCopy(editor) {
  /*return ()=> {
            editor.commands.exec("copy", editor)
        }*/
  //}

  //onCut(editor) {
  /*return ()=> {
            editor.commands.exec("cut", editor)
        }*/
  // }
  /*
  async writeClipboardContents(txt) {
    const p = new Promise(resolve => {
      try {
        //write to workbook clipboard

        resolve(navigator.clipboard.writeText(txt));
      } catch (err) {
        this.createCopyPasteDialog(null, function(font) {});
      }
    });
    return p;
  }*/
}

