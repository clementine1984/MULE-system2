import "./index.scss";
const osjs = require("osjs");
const applicationName = require("./metadata.json").name;
import React from "react";
import ReactDOM from "react-dom";
import App from "./containers/App";
import { Provider } from "react-redux";
import store from "./store";
import axios from "axios";
import { EditorBroadcast } from "./editorBroadcast";
import { EditorBehaviourStandalone } from "./EditorBehaviourStandalone";
import TriggerBehaviour from "./TriggerBehaviour";
import hotkeys from 'hotkeys-js';
var Mousetrap = require('mousetrap');





type AppProps = {
  logger: any;
  triggerBehaviour: any;
  editorBehaviour: any
};
//==============================================================
class Package extends React.Component<AppProps, {}> {
  render() {
    return (
      <Provider store={store}>
        <App
          logger={this.props.logger}
          triggerBehaviour={this.props.triggerBehaviour}
          editorBehaviour={this.props.editorBehaviour}
        />
      </Provider>
    );
  }
}
//==============================================================
const register = (core, args, options, metadata) => {
  const proc = core.make("osjs/application", { args, options, metadata });


  //====================================================================
  //TODO: Find a neater way to do settings loading
  const settings = core.make('osjs/settings');
  settings.load();
  var s=settings.get('osjs/application/'+applicationName);
  
  s=Object.assign( {
    fontSize: 14,
    theme: "vs-dark"
  },s)
  
  console.log("Loaded settings",s)
  proc.settings=s

  //TODO - find a nicer way to do this
  store.dispatch(
    { type: 'SET_THEME', payload: s.theme }
  )
  //======================================================================

  const logger = core.make("client/log/api");

  const editorBehaviour = args.editorBehaviour
    ? new args.editorBehaviour(store,core, proc,args.editorArgs)
    : new EditorBehaviourStandalone(store,core, proc,args.editorArgs);
  const triggerBehaviour = new TriggerBehaviour(core, editorBehaviour);


  var win = proc
    .createWindow({
      id: "editorWindow",
      title: metadata.title.en_EN,
      dimension: {width: 1200, height: 800},
      position: {left: 0, top: 0},
      ondestroy: () => {
        return editorBehaviour.shouldDestroy()
      }

    })
    .on("close", editorBehaviour.closeWindow.bind(editorBehaviour))
    .on("keydown", editorBehaviour.keyDown.bind(editorBehaviour))

  win.setIcon(`apps/${metadata.name}/icon.png`)

  win = win.render($content =>
    ReactDOM.render(
      React.createElement(Package, {
        logger,
        triggerBehaviour,
        editorBehaviour
      }),
      $content
    )
  )
        /*
    console.log("REGISTERING SHORTCUT")
    hotkeys('ctrl+s,command+s,ctrl+S,command+S',{
      //keyup: true,
      "element": win.$element,
    }, function(event, handler){
      // Prevent the default refresh event under WINDOWS system
      event.preventDefault() 
      //console.log("Calling save!")
      editorBehaviour.handleSave() 
      return false
    });*/
    /*Mousetrap(win.$element).bind('ctrl+s', function(e, combo) {
      alert("T")
      return false
    })*/

  editorBehaviour.setWindow(win)
  
  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
 