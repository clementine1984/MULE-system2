/*
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const consola = require('consola');
const logger = consola.withTag('Auth');
const nullAdapter = require('./adapters/auth/null.js');
/**
 * Authentication Handler
 */
class Auth {
    /**
     * Creates a new instance
     * @param {Core} core Core instance reference
     * @param {Object} [options={}] Service Provider arguments
     */
    constructor(core, options = {}) {
        const { requiredGroups, denyUsers } = core.configuration.auth;
        this.core = core;
        this.options = Object.assign({
            adapter: nullAdapter,
            requiredGroups,
            denyUsers
        }, options);
        try {
            this.adapter = this.options.adapter(core, this.options.config);
        }
        catch (e) {
            this.core.logger.warn(e);
            this.adapter = nullAdapter(core, this.options.config);
        }
    }
    /**
     * Destroys instance
     */
    destroy() {
        if (this.adapter.destroy) {
            this.adapter.destroy();
        }
    }
    /**
     * Initializes adapter
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.adapter.init) {
                return yield this.adapter.init();
            }
            return true;
        });
    }
    /**
     * Performs a login request
     * @param {Object} req HTTP request
     * @param {Object} res HTTP response
     */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //console.log("---------------------LOGIN ",req.method)
                //console.log(req.body.lti_version)
                //TODO: this is called multiple times in a successful login. Fix this.
                //If this is an LTI call ensure we proceed to the adapter
                if (req.body.lti_version == null) {
                    //console.log("LOGIN COMPLETE",req.session.user)       
                    if (req.is('application/json'))
                        return res.status(200).json(req.session.user);
                    return res.redirect(302, "/");
                }
                //attempt login
                const result = yield this.adapter.login(req, res);
                if (result) {
                    const profile = this.createUserProfile(req.body, result);
                    if (profile && this.checkLoginPermissions(profile)) {
                        req.session.user = profile;
                        req.session.save(() => {
                            if (req.is('application/json'))
                                return res.status(200).json(profile);
                            return res.redirect(302, "/");
                        });
                        return;
                    }
                }
            }
            catch (err) {
                console.log(err);
                if (req.is('application/json'))
                    return res.status(403).json({ error: 'Invalid login or permission denied' });
                return res.redirect(302, "/");
            }
        });
    }
    /**
     * Performs a logout request
     * @param {Object} req HTTP request
     * @param {Object} res HTTP response
     */
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.adapter.logout(req, res);
            try {
                req.session.destroy();
            }
            catch (e) {
                logger.warn(e);
            }
            res.json({});
        });
    }
    /**
     * Performs a register request
     * @param {Object} req HTTP request
     * @param {Object} res HTTP response
     */
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.adapter.register) {
                const result = yield this.adapter.register(req, res);
                return res.json(result);
            }
            return res.status(403)
                .json({ error: 'Registration unavailable' });
        });
    }
    /**
     * Checks if login is allowed for this user
     * @param {object} profile User profile
     * @return {boolean}
     */
    checkLoginPermissions(profile) {
        const { requiredGroups, denyUsers } = this.options;
        if (denyUsers.indexOf(profile.username) !== -1) {
            return false;
        }
        if (requiredGroups.length > 0) {
            const passes = requiredGroups.every(name => {
                return profile.groups.indexOf(name) !== -1;
            });
            return passes;
        }
        return true;
    }
    /**
     * Creates user profile object
     * @param {object} fields Input fields
     * @param {object} result Login result
     * @return {object}
     */
    createUserProfile(fields, result) {
        const ignores = ['password'];
        const required = ['username', 'id'];
        const template = {
            id: 0,
            username: fields.username,
            name: fields.username,
            groups: this.core.config('auth.defaultGroups', [])
        };
        const missing = required
            .filter(k => typeof result[k] === 'undefined');
        if (missing.length) {
            logger.warn('Missing user attributes', missing);
        }
        else {
            return Object.assign({}, template, Object.keys(result)
                .filter(k => ignores.indexOf(k) === -1)
                .reduce((o, k) => Object.assign(o, { [k]: result[k] }), {}));
        }
        return false;
    }
}
module.exports = Auth;
//# sourceMappingURL=auth.js.map