/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const path = require('path');
const root = path.resolve(__dirname, '../../');
const rethinkdbdash=require('rethinkdbdash')

module.exports = {
  root,
  port: 8080,
  public: path.resolve(root, 'dist'),
  ws: { ping: 30000 },
  session: {
    /* Set a custom session storage */
    store: {
      moduleName: 'session-rethinkdb',
      module: require.resolve('session-rethinkdb'),
      r: rethinkdbdash({
        servers: [
            {host: 'rethinkdb', port: 28015}
        ]
      })
    },
    /* Set session secret */
    options: {
      name: 'connect.sid',
      secret:  process.env.SECRET || 'yoursupersecret',
      // This needs to be set for session-rethinkdb to work!
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: process.env.SECURE_COOKIES !== 'false',
        maxAge: 24 * 60 * 60 * 1000
      }// 24 hours
    }
  },
  storage: {
    root: path.join(process.cwd(), 'storage')
  },
  vfs: {
    root: path.join(process.cwd(), 'storage', 'vfs'),
    mountpoints: [
      {
        name: 'home',
        adapter: 'system', // You can leave this out as 'system' is default
        attributes: {
          root: '{vfs}/{consumer}/{course}/users/{username}/home'
        }
      },
      {
        name: 'desktop',
        adapter: 'system',
        attributes: {
          root: '{vfs}/{consumer}/{course}/users/{username}/home/.desktop'
        }
      },
      {
        name: 'osjs',
        adapter: 'system',
        attributes: {
          root: '{vfs}/{consumer}/{course}/users/{username}/home/.osjs'
        }
      },
      {
        name: 'shared',
        adapter: 'system',
        attributes: {
          root: '{vfs}/{consumer}/{course}/shared',
          groups: [
            {writefile: ['lecturer']},
            {copy: ['lecturer']},
            {rename: ['lecturer']},
            {mkdir: ['lecturer']},
            {unlink: ['lecturer']},
          ]
        }
      },
      {
        name: 'course',
        adapter: 'system',
        attributes: {
          root: '{vfs}/{consumer}/{course}',
          groups: ['lecturer']
        }
      }
    ]
  },
  cee: {
    httpUrl: process.env.CEE_BASE_URL,
    wsUrl: process.env.CEE_BASE_WS,
    type: process.env.CEE_TYPE || 'cee' , // 'cee' or 'jail'
    dataFormat: process.env.CEE_DATA_FORMAT || 'json', // 'json' or 'xml' ('json' for 'cee' only)
    limits: {
      maxMemory: process.env.CEE_MAX_MEMORY || 67108864
    },
    entryScriptsRootPath: path.join(process.cwd(), 'storage', 'runner-scripts'),
    languages: process.env.CEE_LANGUAGES || "java:JAVA,php:PHP,c:C,cpp:CPP,pl:PROLOG,",
    runners: process.env.CEE_RUNNERS || "JAVA:java8,PHP:php7.1"
  }
}

          
