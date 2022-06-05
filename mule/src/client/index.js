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

import {
    Core,
    CoreServiceProvider,
    DesktopServiceProvider,
    VFSServiceProvider,
    NotificationServiceProvider,
    SettingsServiceProvider,
    AuthServiceProvider
} from "@osjs/client"

import {PanelServiceProvider} from "@osjs/panels"
import {GUIServiceProvider} from "@osjs/gui"
import {DialogServiceProvider} from "@osjs/dialogs"
import * as config from "./config.js"

import MyCustomLogin from "./custom-login.js"

import {LoggingServiceProvider} from "./providers/logging"
import {UsernameItem} from './panels/UsernameItem'

const init = () => {
    const osjs = new Core(config, {
        omit: ['desktop.settings.panels']
    })

    // Register your service providers
    osjs.register(CoreServiceProvider)
    osjs.register(DesktopServiceProvider)
    osjs.register(VFSServiceProvider)
    osjs.register(NotificationServiceProvider)
    osjs.register(SettingsServiceProvider, {
        before: true,
        args: {
            adapter: 'server'
        }
    })

    osjs.register(AuthServiceProvider, {
        before: true,
        args: {
            login: (core, options) => new MyCustomLogin(core, options)
        }
    })

    osjs.register(PanelServiceProvider, {
        args: {
            registry: {
                'username-item': UsernameItem
            }
        }
    })


    osjs.register(DialogServiceProvider)
    osjs.register(GUIServiceProvider)

    //============================================
    // Custom service providers
    //============================================
    osjs.register(LoggingServiceProvider)
    //============================================

    osjs.boot()

    //===============================================
    // Setup listener once websocket connection is up
    //===============================================

    osjs.once('osjs/core:connect', () => {
        //Relay all notifications to user TODO: move to service?
        osjs.on('notification', (a) => {
            osjs.make('osjs/dialog', "alert", a, (btn, value) => {
            })
        })
    })

    //TODO: Move this to a configurable location
    osjs.once('osjs/core:started', async () => {

        window.addEventListener('beforeunload', (event) => {
            event.returnValue = 'Are you sure you want to leave?'
        })

        console.log(osjs.make('osjs/auth').user())

        const startupApps = osjs.make('osjs/auth').user()["startupApps"]
        if (startupApps != null) {
            for (let a of startupApps) {
                osjs.run(a.app, a.params)
            }
        }

    })

    return osjs
}

window.addEventListener("DOMContentLoaded", () => {
    init()
})
