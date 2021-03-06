import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';


//import logo from './src/about.png' 

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});


  //const logo = proc.resource('/src/about.png');

  //core.make('client/peer/api').greet('World');
  core.make('client/log/api').log('Hello from About App');

  // Create  a new Window instance
  const window = proc.createWindow({
    id: 'About-MULE',
    title: metadata.title.en_EN, 
    dimension: {width: 400, height: 400},
    position: {left: 700, top: 200}
  });

  window.setIcon(`apps/${metadata.name}/icon.png`);

  window.on('destroy', () => proc.destroy())
    .render($content => ReactDOM.render(React.createElement(App,{proc:proc}), $content));

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
