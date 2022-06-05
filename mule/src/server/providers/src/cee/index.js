"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const WebSocket = require("ws");
const libxml = require("libxmljs");
/** Supported types of code execution engines */
var CeeType;
(function (CeeType) {
    CeeType["CEE"] = "cee";
    CeeType["JAIL"] = "jail";
})(CeeType || (CeeType = {}));
/** Data format to use for communication with the server */
var CeeDataFormat;
(function (CeeDataFormat) {
    CeeDataFormat["JSON"] = "json";
    CeeDataFormat["XML"] = "xml";
})(CeeDataFormat || (CeeDataFormat = {}));
/**
 * CEE service
 */
class CEE {
    /**
     * CEE constructor
     *
     * @param config
     */
    constructor(config) {
        this.COMMAND_AVAILABLE = 'available';
        this.COMMAND_REQUEST = 'request';
        this.HEADER_APPLICATION_JSON = 'application/json';
        this.HEADER_APPLICATION_XML = 'application/xml';
        /** Key - file extension (e.g. java), value - language name (e.g. JAVA) */
        this.languages = {};
        /** Key - language name (e.g. JAVA), value - runner name (e.g. java8) */
        this.runners = {};
        /**
         * Cached templates
         */
        this.xmlBodyTemplates = {};
        this.runnerScriptTemplates = {};
        this.httpUrl = config.httpUrl.replace(/\/$/, "");
        this.wsUrl = config.wsUrl.replace(/\/$/, "");
        this.type = (config.type === 'jail') ? CeeType.JAIL : CeeType.CEE;
        this.dataFormat = (config.dataFormat === 'json') ? CeeDataFormat.JSON : CeeDataFormat.XML;
        if (this.type === CeeType.JAIL && this.dataFormat === CeeDataFormat.JSON) {
            throw new Error("The Jail Server does not support JSON as a format for data transfer!");
        }
        this.limits = config.limits;
        this.entryScriptsRootPath = config.entryScriptsRootPath;
        config.languages.split(',').forEach((extensionLang) => {
            let extension, lang;
            [extension, lang] = extensionLang.split(':');
            this.languages[extension] = lang;
        });
        config.runners.split(',').forEach((langRunner) => {
            let lang, runner;
            [lang, runner] = langRunner.split(':');
            this.runners[lang] = runner;
        });
    }
    /**
     * Checks if the CEE is available
     */
    available() {
        return __awaiter(this, void 0, void 0, function* () {
            let requestBody = yield this.prepareBody({
                command: this.COMMAND_AVAILABLE,
                params: this.limits
            });
            const response = yield axios_1.default.post(this.httpUrl, requestBody, {
                headers: { 'Content-Type': this.getContentTypeHeader() }
            });
            return this.parseResponse(response, this.COMMAND_AVAILABLE);
        });
    }
    /**
     * Submit code to the code execution engine
     *
     * @param data
     * @param limits
     */
    submit(data, limits) {
        return __awaiter(this, void 0, void 0, function* () {
            const lang = this.detectLanguage(data.files);
            const entryScript = this.getEntryScript(data.command) || "vpl_run.sh";
            const submissionUrl = this.httpUrl + (this.type === CeeType.CEE ? `/${this.getRunner(lang)}` : "");
            let requestBody = yield this.prepareBody({
                command: this.COMMAND_REQUEST,
                params: {
                    maxTime: limits.maxTime,
                    maxFileSize: limits.maxFileSize,
                    maxMemory: limits.maxMemory,
                    execute: entryScript,
                    interactive: true,
                    files: yield this.prepareFiles(this.getRunner(lang), data.files, entryScript)
                }
            });
            const response = yield axios_1.default.post(submissionUrl, requestBody, {
                headers: { 'Content-Type': this.getContentTypeHeader() }
            });
            return this.parseResponse(response, this.COMMAND_REQUEST);
        });
    }
    /**
     * Execute the previously submitted code
     *
     * @param executionTicket
     * @param clientWs
     */
    execute(executionTicket, clientWs) {
        const ws = new WebSocket(this.getExecutionUrl(executionTicket));
        ws.on('message', (message) => {
            clientWs.send(message);
        });
        ws.on('close', () => {
            clientWs.close();
        });
        clientWs.on('message', (message) => {
            ws.send(message);
        });
        clientWs.on('close', () => {
            ws.close();
        });
    }
    /**
     * Get execution URL
     *
     * @param executionTicket
     */
    getExecutionUrl(executionTicket) {
        return `${this.wsUrl}/${executionTicket}/execute`;
    }
    /**
     * Get runner name for a language
     *
     * @param lang
     */
    getRunner(lang) {
        if (!this.runners.hasOwnProperty(lang)) {
            throw new Error("The language is nto supported!");
        }
        return this.runners[lang];
    }
    /**
     * Get an entry script name for the passed command
     *
     * @param command
     */
    getEntryScript(command) {
        const commandsToEntryScripts = {
            compile: 'vpl_compile.sh',
            run: 'vpl_run.sh',
            evaluate: null
        };
        if (!commandsToEntryScripts.hasOwnProperty(command)) {
            throw new Error(`The "${command}" command is not supported!`);
        }
        return commandsToEntryScripts[command];
    }
    /**
     * Prepare the files
     *
     * @param runner
     * @param filesToPrepare
     * @param entryScript
     */
    prepareFiles(runner, filesToPrepare, entryScript) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = Object.entries(filesToPrepare).map(([fileName, fileData]) => {
                return {
                    name: fileName,
                    content: fileData.content
                };
            });
            if (entryScript) {
                const fileName = "./" + files[0].name.replace(/^\/+/, '');
                const className = fileName.substring(fileName.lastIndexOf('/') + 1).split(".")[0];
                const dirName = path.dirname(fileName);
                const scriptId = `${runner}.${entryScript}`;
                if (!this.runnerScriptTemplates.hasOwnProperty(scriptId)) {
                    const scriptTemplatePath = path.join(this.entryScriptsRootPath, runner, entryScript);
                    this.runnerScriptTemplates[scriptId] = yield fs.promises.readFile(scriptTemplatePath, 'utf-8');
                }
                const script = ejs.render(this.runnerScriptTemplates[scriptId], {
                    FILENAME: fileName,
                    CLASSNAME: className,
                    DIRNAME: dirName
                });
                files.push({
                    name: entryScript,
                    content: script
                });
            }
            return files;
        });
    }
    /**
     * Get 'Content-Type' header value
     */
    getContentTypeHeader() {
        if (this.dataFormat === CeeDataFormat.JSON) {
            return this.HEADER_APPLICATION_JSON;
        }
        return this.HEADER_APPLICATION_XML;
    }
    /**
     * Prepare request body
     *
     * @param data
     */
    prepareBody(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = data;
            if (this.dataFormat === CeeDataFormat.XML) {
                const templateName = `${data.command}.xml`;
                if (!this.xmlBodyTemplates.hasOwnProperty(templateName)) {
                    const bodyTemplatePath = path.join(__dirname, 'xml-body-templates', templateName);
                    this.xmlBodyTemplates[templateName] = yield fs.promises.readFile(bodyTemplatePath, 'utf-8');
                }
                body = ejs.render(this.xmlBodyTemplates[templateName], data);
            }
            return body;
        });
    }
    /**
     * Parse response
     *
     * @param response
     * @param command
     */
    parseResponse(response, command) {
        let data = response.data;
        if (this.dataFormat === CeeDataFormat.XML) {
            const xmlDoc = libxml.parseXmlString(data);
            switch (command) {
                case this.COMMAND_AVAILABLE: {
                    data = {
                        status: xmlDoc.get(`//member[name='status']/value/string`).text(),
                        load: parseInt(xmlDoc.get(`//member[name='load']/value/int`).text()),
                        maxTime: parseInt(xmlDoc.get(`//member[name='maxtime']/value/int`).text()),
                        maxFileSize: parseInt(xmlDoc.get(`//member[name='maxfilesize']/value/int`).text()),
                        maxMemory: parseInt(xmlDoc.get(`//member[name='maxmemory']/value/int`).text()),
                        maxProcesses: parseInt(xmlDoc.get(`//member[name='maxprocesses']/value/int`).text()),
                        securePort: parseInt(xmlDoc.get(`//member[name='secureport']/value/int`).text()),
                    };
                    break;
                }
                case this.COMMAND_REQUEST: {
                    data = {
                        adminTicket: xmlDoc.get(`//member[name='adminticket']/value/string`).text(),
                        monitorTicket: xmlDoc.get(`//member[name='monitorticket']/value/string`).text(),
                        executionTicket: xmlDoc.get(`//member[name='executionticket']/value/string`).text(),
                        port: parseInt(xmlDoc.get(`//member[name='port']/value/int`).text()),
                        securePort: parseInt(xmlDoc.get(`//member[name='secureport']/value/int`).text()),
                    };
                    break;
                }
            }
        }
        return data;
    }
    /**
     * Detect language by file extension
     *
     * @param files
     */
    detectLanguage(files) {
        const firstFileName = Object.entries(files)[0][0];
        const firstFileExtension = firstFileName.substring(firstFileName.lastIndexOf(".") + 1);
        console.log(firstFileExtension);
        console.log(this.languages);
        if (!this.languages.hasOwnProperty(firstFileExtension)) {
            throw "Unsupported language/file extension!";
        }
        return this.languages[firstFileExtension];
    }
}
exports.default = CEE;
//# sourceMappingURL=index.js.map