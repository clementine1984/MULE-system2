import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';
//import logo from './src/about.png'

// Our launcher
const register =  (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});
  const user=core.make('osjs/auth').user()
  const theme = core.make('osjs/theme');

  //console.log(args)
  //const logo = proc.resource('/src/about.png');




  //
  //console.log("CONSENT!:",consents)


  //var consents={}





  // Create  a new Window instance
  const window = proc.createWindow({
    id: 'Consent',
    title: metadata.title.en_EN,
    dimension: {width: 640, height: 480},
    position: {left: 0.5, top: 0.1},
    attributes:{
      closeable:true,
      ontop:true,
      clamp:true,
      minimizable: false,
      visibility: "restricted",
      minDimension: {width: 640, height: 480}
    }
  })
    .on('destroy', () => proc.destroy())
    //constrain to desktop (not great if desktop resizes!)
    .on('moved',(pos,win)=>{

      win.clampToViewport()
      var pos2=win.getState("position")
      if(pos2.left<0) {pos2.left=0; win.setPosition(pos2)};
    })

  window.setIcon(`apps/${metadata.name}/icon.png`);

  window.render(async ($content) =>
    {
      var consents=await proc.request('/consent')
      if(consents==null) consents={}


      //ensure default fields
      consents={
          interaction: false,
          performance: false,
          code: false,
          feedback: false,
          ...consents
        }

      ReactDOM.render(React.createElement(App,{dbconsents:consents,proc:proc,user:user,theme:theme,autoLaunch:args.auto}), $content);
    });


  // Creates a new WebSocket connection (see server.js)
  //const sock = proc.socket('/socket');
  //sock.on('message', (...args) => console.log(args))
  //sock.on('open', () => sock.send('Ping'));

  // Use the internally core bound websocket
  //proc.on('ws:message', (...args) => console.log(args))
  //proc.send('Ping')

  // Creates a HTTP call (see server.js)
  //proc.request('/test', {method: 'post'})
  //.then(response => console.log(response));

  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
