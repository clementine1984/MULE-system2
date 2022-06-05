import "./index.scss";
const osjs = require("osjs");
const applicationName = require("./metadata.json").name;
import React from "react";
import ReactDOM from "react-dom";
import TerminalWindow from "./TerminalWindow";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";



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

//-------------------------------------------------------------------------------
//
//--------------------------------------------------------------------------------

type AppProps = {
  term: any;
};

class App extends React.Component<AppProps, {}> {
  render() {
    return <TerminalWindow term={this.props.term} />;
  }
}

// Our launcher
const register = (core, args, options, metadata) => {
  console.log("LAUNCHING TERMINAL");
  console.log("ARGS:",args)

  const proc = core.make("osjs/application", { args, options, metadata });

  const term = new Terminal({ cursorBlink: false });

  var fit = new FitAddon();
  term.loadAddon(fit);

  term["fit"] = () => {
    fit.fit();
  };

  term.loadAddon(new SearchAddon());
  //term.loadAddon(new AttachAddon());

 

  //args.function = "Print";

  /*if (args.function === "Evaluate") {
    args.WebSocket.onmessage = async function(thisData) {
      if (thisData.data.startsWith("retrieve")) {
        const body2 = await jailServer.callJail(args["XMLgetresult"]);
        const xmlResult = await jailServer.getExecution(body2);
        const finalResult = xmlResult.execution.split("\n");

        for (let i in finalResult) term.writeln(finalResult[i]);
      }
    };
  } else if (args.function === "Print") {
    console.log("Print");
    setInterval(() => {
      term.writeln("This is the terminal application...");
    }, 1000);
  } else {*/

    //was a function to create the websocket passed in???
  if(args.webSocketLauncher)
  {
    //console.log("Using websocket launcher")
    args.webSocket=args.webSocketLauncher()
  }




  if (!args.webSocket) {
     args.webSocket=new DummyWebSocket()
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

    setTimeout(() => {
      args.webSocket.message("This is the basic terminal.\n\r");
      args.webSocket.close()
    }, 250);
  }

  const attachAddon = new AttachAddon(args.webSocket);

  term.loadAddon(attachAddon);

  var spaceToClose=false;

  args.webSocket.onclose = () =>{
    term.write("\nPress space to close window...");
    spaceToClose=true
  }

  var termElement=null;

    
  




  var win;
  win = proc
    .createWindow({
      id: "terminalWindow",
      title: metadata.title.en_EN,
      dimension: { width: 500, height: 400 },
      position: { left: 700, top: 200 }
    })
    //close terminal when user presses space bar
    .on("keypress", (ev, win) => {
      if ((ev.keyCode === 32 || ev.which === 32)&&spaceToClose) win.destroy();
    })
    .on("resized", () => {
      console.log("resized!");
      term["fit"]();
      term.focus();
    })
    .on("destroy", () => {
      proc.destroy()
      args.webSocket.close()
    })

  win.setIcon(`apps/${metadata.name}/icon.png`)

  win.render($content =>{
      termElement=ReactDOM.render(React.createElement(App, { term }), $content)
      return termElement
    }
    );

    proc["lock"]=()=>
  {
    win.setState("loading",true)
  }

  proc["unlock"]=()=>
  {
    win.setState("loading",false)
  }
  

  return proc;
};












osjs.register(applicationName, register);
