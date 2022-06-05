import assert from "assert";
import WebSocketWrapper from "./WebSocketWrapper";
import {
  EditorBehaviourStandalone,
  //ModelWrapper,
  fileTypes
} from "./EditorBehaviourStandalone";
//import store from "./store";

//========================================================
interface MyWindow extends Window {
  monaco: any;
}

declare var window: MyWindow;
//========================================================


//Useful for communicating with Terminal...
class DummyWebSocket {
  url: string;
  onMessage: any;
  onclose: any;
  onError: any;

  constructor(url?) { 
    this.url = url;
  }

  addEventListener(evt, fun) {
    if (evt == "message") this.onMessage = fun;
    else if (evt === "close") this.onclose = fun;
    else if (evt === "error") this.onError = fun;
  }

  close()
  {
    this.onclose()
  }

  removeEventListener(evt) {  }  

  message(s) {
    this.onMessage({ data: s });
  }
}

//=========================================================



 



class EditorBehaviourWorkbook extends EditorBehaviourStandalone {
  userFiles: any;
  current: number;
  questionTitle: any;
  args: any
  windowTitle: any
  qid: any
  evalHandler:any
  id:any


  constructor(store, core, proc, args) {
    super(store, core, proc, args);
    //setInterval(()=> console.log(this.store.getState()),1000)
    console.log(args);


    //assert(args.userFiles.length == 1);
    //autosave new attempts to DB. TODO: refactor this!
    if((args!=null) && (args.saveFirst==true))  setTimeout(()=>{ this.handleSave() },500)	  



    //this.userFiles = args.userFiles;
    this.current=0
    this.questionTitle = args.title;
    this.qid=args.qid
    this.args=args
    this.rights=this.args.rights
    this.windowTitle="Untitled"
    this.evalHandler=args.evalHandler
    //this.win.setTitle(this.userFile)

    this.menu = [
      {
        name: "File",
        enabled: true,
        children: [
          {
            name: "Save",
            enabled: true,
            action: "save",
            themeIcon: "document-save.png"
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
          },
          {
            name: "Evaluate",
            enabled: true,
            action: "evaluate",
            themeIcon: "x-office-presentation-template.png"
          }
        ]
      }
    ];

      

      console.log("RIGHTS ARE: ",this.rights)
    //TODO: make these more resiliant to change in the menu structure above
    if(this.rights.eval==null) { this.enableEvaluate(false) }
    if(this.rights.run==false) {this.enableEvaluate(false); this.enableExecute(false) }

    this.store.dispatch({
      type: "HACK_STATE",
      path: "menu",
      value: this.menu
    });

    //Handler for the additional menu item
    this.actions["evaluate"]=this.handleEvaluate.bind(this)


    if(args.attemptId)
    {
        //console.log("LOAD ATTEMPT HERE!!!!",args.attemptId)
        this.id=args.attemptId
    }
  }


  //Override default clipboard source/dest
  async writeToClipboard(text) {
    //console.log("Writing to cb: ",text)
    //console.log("USING",this.rights.copy)
    
    if(this.rights.copy=="system")
    {
      await navigator.clipboard.writeText(text);
    } 
    if(this.rights.copy=="workbook")
    {
      sessionStorage.setItem("workbook", text);
    } 
    if(this.rights.copy=="question")
    {
      //store under this.qid
      sessionStorage.setItem("cb-"+this.qid, text);
    }
    

  }

  async readFromClipboard() {
    //console.log("Reading from cb ")

    if(this.rights.paste=="system")
    {
      return await navigator.clipboard.readText();
    } 
    if(this.rights.paste=="workbook")
    {
      return (sessionStorage.getItem("workbook") || "")
    }    
    if(this.rights.paste=="question")
    {
      return (sessionStorage.getItem("cb-"+this.qid) || "")
    }
    return ""
  }



















  async handleSave() {
    //var path = this.editor.getModel().path;

    
    //=======================================================
    //var text = this.editor.getModel().getValue();
    
    this.lock()
    setTimeout(()=>{ this.unlock() },250)

    var files=[]

    this.editorFiles.forEach(e => {
      files.push({name: e.path, contents:e.getContent()})
    });

    var params={ qid: this.qid, files: files}
    this.id=(await this.args.saveHandler(params)).id
    //acting as user
    /*
    var acting_id=this.store.getState().workbook.selectedUser.id
    if(acting_id)
    {
      params['uid']=acting_id
    }*/

   /* try{
        
    }
    catch(err)
    {
        
    }*/
    

    //only update the history if the qid is the same as the one in the history
    //if(State.getNode().qid==qid) store.dispatch(updateGrade(rewriteHistoryItem(result)));





    //await this.core.make("osjs/vfs").writefile(path, text);
    
    this.clearDirty();

    this.doStateChange("CLEAN");
  }


/*


  {
    "qid": this.qid,
    "files": [{
      name: fileToSendName,
      contents: editor.getFileData(fileToSendName)
    }


*/
/*

async handleCompile() {
  if (this.isDirty()) {
    alert("Changes not saved. Save file first.");
    return;
  }

  var model = this.editor.getModel();

  var text = model.getValue();
  var path = model.path;

  //var fileToSendName = this.workFiles[0].name
  var lang = this.checkFileType(path);

  const name = model.getFilename();

  var socket = await jailServer.compileFile(
    lang,
    { name: name, content: text, path: path },
    {}
  ); //TODO: This is hacky

  var wrapped = new WebSocketWrapper(socket);

  //Watch out for compilation succeeding
  wrapped["receiveFilter"] = msg => {
    if (msg.startsWith("compiled: ==> true")) {
      msg = "Compilation succeeded with no errors.\r\n";
      this.doStateChange("COMPILED");
    }
    return msg;
  };

  var o = this.core.make("osjs/packages");
  o.core.run("terminal", { webSocket: wrapped });
}

async handleRun() {
  var model = this.editor.getModel();
  var text = model.getValue();
  var path = model.path;
  const name = model.getFilename();

  var lang = this.checkFileType(path);

  var socket = await jailServer.runFile(
    lang,
    { name: name, content: text, path: path },
    {}
  ); //TODO: This is hacky

  var wrapped = new WebSocketWrapper(socket);

  var o = this.core.make("osjs/packages");
  o.core.run("terminal", { webSocket: wrapped });
  this.doStateChange("RAN");
}
*/

  async handleEvaluate() {
    //var filename=this.userFiles[this.current]
    var qid=this.qid
   // var contents=this.editor.getModel().getValue();


   const isDirty = this.isDirty();
   //console.log("ISDIRTY", isDirty);
   if (isDirty)
   {

    const dialogOptions = {
      title: "Save changes first",
      message: "You have unsaved changes. You must save them before evaluation."
    };


    this.core.make(
      "osjs/dialog",
      "alert",
      dialogOptions,
      async (btn, value) => {
        return true;
      }
    );
      return;

   }














   var files=[]

   this.editorFiles.forEach(e => {
     files.push({name: e.path, contents:e.getContent()})
   });


    var args={
      files: files,
      qid,
      id: this.id
    }

    console.log("Submitting ",args)


    console.log()


    var webSocket = new DummyWebSocket()
    // setInterval(()=>{ args.webSocket.message("hello\n\r")},1000)

    /*args.webSocket = new WebSocketProxy("wss://echo.websocket.org");

    //A hook to allow an incoming message be filtered
    args.webSocket.receiveFilter = msg => {
      if (msg.startsWith("hello ")) msg = msg.substring("hello ".length);
      return "filtered " + msg;
    };

    //A hook to allow an outgoing message be filtered
    args.webSocket.sendFilter = msg => {
      return msg + " decorated";
    };*/

    
    var o = this.core.make("osjs/packages");
    var term=await o.core.run("terminal", { webSocket });
    
    term.lock()

    try
    {
      var {raw,grade}=await this.evalHandler(args)

      //the terminal needs time to attach the onmessage handler
      setTimeout(()=>{
        webSocket.message(raw+"\n\r");
        webSocket.close()  
      },500);
    }catch(err)
    {
      term.unlock()
      webSocket.message(err+"\n\r");
      webSocket.close()  
      throw err
    }

    
    term.unlock()
    //No need to do anythin different here - RAN is OK after evaluation
    this.doStateChange("RAN");
  }


  /*setTitle(fname)
  {
    this.win.setTitle(
      "Workbook: " + this.questionTitle //+ " [" + fname +"]"
    );
  }*/

  /*setWindow(win) {
    this.win = win;
    //this.setTitle(this.userFiles[this.current]);
  }*/





  // the stateChange method in the parent already looks after compile and execute
  doStateChange(fileState: string) {
    var oldState = this.optionState;

    super.doStateChange(fileState)

    if (this.optionState != oldState) {
      this.enableEvaluate(this.enabledOptions["evaluate"] && (this.rights.eval!=false)&&(this.rights.eval!=null));
    }
  }


  enableEvaluate(v) {
    try //the menu item doesn't always exist when this method is called, hence the try..catch
    {
            this.store.dispatch({
        type: "HACK_STATE",
        path: this.getMenuPath("Code/Evaluate") + ".enabled",
        value: v
            });
    }catch(err)
    {}
    
  }
  


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















}

export default EditorBehaviourWorkbook;
