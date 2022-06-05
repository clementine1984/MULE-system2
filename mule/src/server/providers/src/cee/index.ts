import axios from 'axios'
import * as path from 'path'
import * as fs from 'fs'
import * as ejs from 'ejs'
import * as WebSocket from 'ws'
import * as libxml from 'libxmljs'

/** Supported types of code execution engines */
enum CeeType {
  CEE = 'cee',
  JAIL = 'jail'
}

/** Data format to use for communication with the server */
enum CeeDataFormat {
  JSON = 'json',
  XML = 'xml'
}

/**
 * CEE service
 */
class CEE {

  protected readonly COMMAND_AVAILABLE = 'available'
  protected readonly COMMAND_REQUEST = 'request'

  protected readonly HEADER_APPLICATION_JSON = 'application/json'
  protected readonly HEADER_APPLICATION_XML = 'application/xml'

  /**
   * Config properties
   */
  protected httpUrl: string
  protected wsUrl: string
  protected type: CeeType
  protected dataFormat: CeeDataFormat
  protected limits: any
  protected entryScriptsRootPath: string

  /** Key - file extension (e.g. java), value - language name (e.g. JAVA) */
  protected languages = {}
  /** Key - language name (e.g. JAVA), value - runner name (e.g. java8) */
  protected runners = {}

  /**
   * Cached templates
   */
  protected xmlBodyTemplates = {}
  protected runnerScriptTemplates = {}

  /**
   * CEE constructor
   *
   * @param config
   */
  public constructor(config: any) {
    this.httpUrl = config.httpUrl.replace(/\/$/, "")
    this.wsUrl = config.wsUrl.replace(/\/$/, "")
    this.type = (config.type === 'jail') ? CeeType.JAIL : CeeType.CEE
    this.dataFormat = (config.dataFormat === 'json') ? CeeDataFormat.JSON : CeeDataFormat.XML

    if (this.type === CeeType.JAIL && this.dataFormat === CeeDataFormat.JSON) {
      throw new Error("The Jail Server does not support JSON as a format for data transfer!")
    }

    this.limits = config.limits
    this.entryScriptsRootPath = config.entryScriptsRootPath

    config.languages.split(',').forEach((extensionLang) => {
      let extension, lang
      [extension, lang] = extensionLang.split(':')
      this.languages[extension] = lang
    })
    config.runners.split(',').forEach((langRunner) => {
      let lang, runner
      [lang, runner] = langRunner.split(':')
      this.runners[lang] = runner
    })
  }

  /**
   * Checks if the CEE is available
   */
  public async available(): Promise<any> {
    let requestBody = await this.prepareBody({
      command: this.COMMAND_AVAILABLE,
      params: this.limits
    })

    const response = await axios.post(this.httpUrl, requestBody, {
      headers: {'Content-Type': this.getContentTypeHeader()}
    })
    return this.parseResponse(response, this.COMMAND_AVAILABLE)
  }

  /**
   * Submit code to the code execution engine
   *
   * @param data
   * @param limits
   */
  public async submit(data: any, limits: any): Promise<any> {
    const lang = this.detectLanguage(data.files)
    const entryScript: string | null = this.getEntryScript(data.command) || "vpl_run.sh"
    const submissionUrl = this.httpUrl + (this.type === CeeType.CEE ? `/${this.getRunner(lang)}` : "")

    let requestBody = await this.prepareBody({
      command: this.COMMAND_REQUEST,
      params: {
        maxTime: limits.maxTime,
        maxFileSize: limits.maxFileSize,
        maxMemory: limits.maxMemory,
        execute: entryScript,
        interactive: true,
        files: await this.prepareFiles(this.getRunner(lang), data.files, entryScript)
      }
    })

    const response = await axios.post(submissionUrl, requestBody, {
      headers: {'Content-Type': this.getContentTypeHeader()}
    })
    return this.parseResponse(response, this.COMMAND_REQUEST)
  }

  /**
   * Execute the previously submitted code
   *
   * @param executionTicket
   * @param clientWs
   */
  public execute(executionTicket: string | number, clientWs: any): void {

    const ws = new WebSocket(this.getExecutionUrl(executionTicket))
    ws.on('message', (message) => {
      clientWs.send(message)
    })

    ws.on('close', () => {
      clientWs.close()
    })

    clientWs.on('message', (message) => {
      ws.send(message)
    })

    clientWs.on('close', () => {
      ws.close()
    })
  }

  /**
   * Get execution URL
   *
   * @param executionTicket
   */
  public getExecutionUrl(executionTicket: string | number): string {
    return `${this.wsUrl}/${executionTicket}/execute`
  }

  /**
   * Get runner name for a language
   *
   * @param lang
   */
  protected getRunner(lang: string): string {
    if (!this.runners.hasOwnProperty(lang)) {
      throw new Error("The language is nto supported!")
    }

    return this.runners[lang]
  }

  /**
   * Get an entry script name for the passed command
   *
   * @param command
   */
  protected getEntryScript(command: string): string | null {
    const commandsToEntryScripts = {
      compile: 'vpl_compile.sh',
      run: 'vpl_run.sh',
      evaluate: null
    }

    if (!commandsToEntryScripts.hasOwnProperty(command)) {
      throw new Error(`The "${command}" command is not supported!`)
    }

    return commandsToEntryScripts[command]
  }

  /**
   * Prepare the files
   *
   * @param runner
   * @param filesToPrepare
   * @param entryScript
   */
  protected async prepareFiles(runner: string, filesToPrepare: any[], entryScript: string | null ): Promise<any> {

    let files = Object.entries(filesToPrepare).map(([fileName, fileData]) => {
      return {
        name: fileName,
        content: fileData.content
      }
    })

    if (entryScript) {
      const fileName = "./" + files[0].name.replace(/^\/+/, '')
      const className = fileName.substring(fileName.lastIndexOf('/') + 1).split(".")[0]
      const dirName = path.dirname(fileName)

      const scriptId = `${runner}.${entryScript}`
      if (!this.runnerScriptTemplates.hasOwnProperty(scriptId)) {
        const scriptTemplatePath = path.join(this.entryScriptsRootPath, runner, entryScript)
        this.runnerScriptTemplates[scriptId] = await fs.promises.readFile(scriptTemplatePath, 'utf-8')
      }

      const script = ejs.render(this.runnerScriptTemplates[scriptId], {
        FILENAME: fileName,
        CLASSNAME: className,
        DIRNAME: dirName
      })

      files.push({
        name: entryScript,
        content: script
      })
    }

    return files
  }

  /**
   * Get 'Content-Type' header value
   */
  protected getContentTypeHeader(): string {
    if (this.dataFormat === CeeDataFormat.JSON) {
      return this.HEADER_APPLICATION_JSON
    }

    return this.HEADER_APPLICATION_XML
  }

  /**
   * Prepare request body
   *
   * @param data
   */
  protected async prepareBody(data: any): Promise<any> {
    let body = data

    if (this.dataFormat === CeeDataFormat.XML) {

      const templateName = `${data.command}.xml`
      if (!this.xmlBodyTemplates.hasOwnProperty(templateName)) {
        const bodyTemplatePath = path.join(__dirname, 'xml-body-templates', templateName)
        this.xmlBodyTemplates[templateName] = await fs.promises.readFile(bodyTemplatePath, 'utf-8')
      }

      body = ejs.render(this.xmlBodyTemplates[templateName], data)
    }

    return body
  }

  /**
   * Parse response
   *
   * @param response
   * @param command
   */
  protected parseResponse(response: any, command: string): any {
    let data = response.data

    if (this.dataFormat === CeeDataFormat.XML) {

      const xmlDoc = libxml.parseXmlString(data)

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
          }
          break
        }

        case this.COMMAND_REQUEST: {
          data = {
            adminTicket: xmlDoc.get(`//member[name='adminticket']/value/string`).text(),
            monitorTicket: xmlDoc.get(`//member[name='monitorticket']/value/string`).text(),
            executionTicket: xmlDoc.get(`//member[name='executionticket']/value/string`).text(),
            port: parseInt(xmlDoc.get(`//member[name='port']/value/int`).text()),
            securePort: parseInt(xmlDoc.get(`//member[name='secureport']/value/int`).text()),
          }
          break
        }

      }
    }

    return data
  }

  /**
   * Detect language by file extension
   *
   * @param files
   */
  protected detectLanguage(files): string {

    const firstFileName = Object.entries(files)[0][0]
    const firstFileExtension = firstFileName.substring(firstFileName.lastIndexOf(".") + 1)
    console.log(firstFileExtension)
    console.log(this.languages)

    if (!this.languages.hasOwnProperty(firstFileExtension)) {
      throw "Unsupported language/file extension!"
    }

    return this.languages[firstFileExtension];
  }
}

export default CEE