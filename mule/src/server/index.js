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

/** Import the core and providers */
const {
    Core,
    CoreServiceProvider,
    PackageServiceProvider,
    VFSServiceProvider,
    AuthServiceProvider,
    SettingsServiceProvider
} = require('./.server/index');
const DatabaseServiceProvider = require('./providers/database');
const ConstraintServiceProvider = require('./providers/constraint');
const CacheServiceProvider = require('./providers/cache');
const {CEEServiceProvider} = require('./providers/cee');
const {CourseServiceProvider} = require('./providers/course');

/** Import adapters */
const systemVfsAdapter = require('./adapters/vfs/system');
const ltiAuthAdapter = require('./adapters/auth/lti');

/** Create app instance */
const config = require('./config.js');
const osjs = new Core(config, {});
osjs.app.enable('trust proxy');

/** Register the providers */
osjs.register(AuthServiceProvider, {
    args: {
        adapter: ltiAuthAdapter,
        config: {}
    }
});
osjs.register(DatabaseServiceProvider);
osjs.register(ConstraintServiceProvider);
osjs.register(CacheServiceProvider, {before: true});
osjs.register(CEEServiceProvider);
osjs.register(CourseServiceProvider);
osjs.register(CoreServiceProvider, {before: true});
osjs.register(PackageServiceProvider);
osjs.register(VFSServiceProvider, {
    args: {
        adapters: {
            system: systemVfsAdapter
        }
    }
});
osjs.register(SettingsServiceProvider, {
    args: {
        adapter: 'fs',
    }
});

/** Set event handlers */
process.on('SIGTERM', () => osjs.destroy());
process.on('SIGINT', () => osjs.destroy());
process.on('exit', () => osjs.destroy());
process.on('uncaughtException', e => console.error(e));
process.on('unhandledRejection', e => console.error(e));

/** Boot the app */
osjs.boot()
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
