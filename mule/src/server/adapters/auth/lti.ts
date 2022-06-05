/** Import dependencies */
const lti = require("ims-lti")
const util = require("util")
const fs = require('fs')
const path = require("path")
const assert = require('assert')
const decomment = require('decomment')

/** Import environment variables */
const LTI_SECRET = process.env.LTI_SECRET
const LTI_KEY = process.env.LTI_KEY
const JWT_SECRET = process.env.JWT_SECRET

/**
 * LTI Auth adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
module.exports = (core, options) => {

  /** Declare helper functions */
  let getUrlForUser = (uid?) => {
    if (uid !== undefined) return "/user/" + uid
    return "/user"
  }

  async function createUser(data) {
    let api = await core.make("server/database/api")
    let userId = await api.post(getUrlForUser(), data)

    // Ensure user basic directories and files
    const storageRoot = core.config('storage.root')
    const vfs = core.make('osjs/vfs')
    const userHomePath = await vfs.realpath('home:/', data)
    await fs.promises.mkdir(userHomePath, {recursive: true})

    const userOsJsPath = await vfs.realpath('osjs:/', data)
    await fs.promises.mkdir(userOsJsPath, {recursive: true})
    const userSettingsFilePath = await vfs.realpath('osjs:/settings.json', data)
    await fs.promises.copyFile(`${storageRoot}/default-user-settings.json`, userSettingsFilePath)

    const userDesktopPath = await vfs.realpath('desktop:/', data)
    await fs.promises.mkdir(userDesktopPath, {recursive: true})
    const shortcutsFilePath = await vfs.realpath('desktop:/.shortcuts.json', data)
    await fs.promises.writeFile(shortcutsFilePath, JSON.stringify([]))

    if (! await vfs.call({method: 'exists', user: data}, 'shared:/')) {
      const sharedDirectoryPath = await vfs.realpath('shared:/', data)
      await fs.promises.mkdir(sharedDirectoryPath, {recursive: true})
    }

    if (data['groups'].includes('lecturer') && ! await vfs.call({method: 'exists', user: data}, 'course:/config.json')) {
      const courseConfigPath = await vfs.realpath('course:/config.json', data)
      await fs.promises.copyFile(`${storageRoot}/default-course-config.json`, courseConfigPath)
      const workbooksPath = await vfs.realpath('course:/workbooks', data)
      await fs.promises.mkdir(workbooksPath, {recursive: true})
    }

    return userId
  }

  async function getUser(id) {
    let api = await core.make("server/database/api")
    return await api.get(getUrlForUser(id))
  }

  async function verifyLTI(req) {
    const data = req.body
    const provider = new lti.Provider(LTI_KEY, LTI_SECRET)
    const valid_request = util.promisify(provider.valid_request)

    if (data["oauth_consumer_key"] !== LTI_KEY) throw "LTI KEY NOT MATCHED"

    const isValid = await valid_request(req)
    if (!isValid) throw "Invalid LTI launch"
  }

  async function ensureUser(data) {
    let user: any = {}

    //patch roles - it should be an array
    if (!Array.isArray(data["roles"])) {
      if (data["roles"] == null) data["roles"] = []
      else data["roles"] = [data["roles"]]
    }

    //patch custom_role - it should be an array
    if (!Array.isArray(data["custom_role"])) {
      if (data["custom_role"] == null) data["custom_role"] = []
      else data["custom_role"] = [data["custom_role"]]
    }

    const remaps = {
      username: "lis_person_contact_email_primary",
      courseId: "context_id",
      courseTitle: "context_title",
      courseEmail: "lis_person_contact_email_primary",
      roles: "roles",
      groups: "roles",
      courseUserId: "user_id",
      name: "lis_person_name_full",
      customRole: "custom_role",
      consumerId: "tool_consumer_instance_guid"
    }

    for (let k of Object.keys(remaps)) {
      user[k] = data[remaps[k]]
    }
    user["groups"] = user["groups"].map((x) => x.toLowerCase())

    //create the uid
    const {courseUserId, courseId, consumerId, customRole} = user
    user.id = courseUserId + "." + courseId + "." + consumerId

    //Does this user exist in the DB already?
    //Is there already a user with this ID? Get their record if so.
    let storedUser = null
    try {
      storedUser = await getUser(user.id)

      //TODO: clobbering roles from DB with roles from LTI - is this wise?
      storedUser["roles"] = user["roles"]
    } catch (e) {
      if (e["response"] && (e["response"]["status"] == 404)) {
        let result = await createUser(user)
        assert(result == user.id)
        storedUser = user
      } else throw(e)
    }

    //==========================================================
    // If there is an override in this LTI login, apply it
    //==========================================================
    if (customRole) {
      storedUser["roles"] = storedUser["roles"].concat(customRole)
      storedUser["groups"] = storedUser["groups"].concat(customRole)
    }

    //patch all rows to be lowercase
    storedUser["roles"] = storedUser["roles"].map((x) => x.toLowerCase())

    return storedUser
  }

  async function getCourseConfig(consumerId, courseId) {
    let courseConfig = null
    const configPath = `${core.config('vfs.root')}/${consumerId}/${courseId}/config.json`

    try {
      courseConfig = await fs.promises.readFile(configPath, 'utf8')
    } catch (err) {
      console.log(err)
    }

    return courseConfig
  }

  function sendNotification(core, uid, notification) {
    let message = null
    message = (c) => {
      let id = (c._osjs_client ? c._osjs_client.id : null)

      if (id === uid) {
        core.broadcast('notification', [notification], client => {
          return client._osjs_client.id === uid
        })

        //remove the listener - we only want this to happen on login, not if websocket connection is re-established
        core.wss.removeListener('connection', message)
      }
    }
    //wait for connection to be opened before sending a message=============================
    //cannot use .once because another user's connection could open up in the meantime...?
    core.wss.on("connection", message)
  }

  /** Return the adapter */
  return {
    init: async () => true,
    destroy: async () => true,
    login: async (req, res) => {

      // Destroy the previous session if any
      if (req.session.user) {
        req.session.regenerate()
      }

      // Verify the LTI key
      await verifyLTI(req)

      // Get a user from DB (create if they don't exist)
      let user: any = await ensureUser(req.body)

      // Process course config
      const cache = core.make('osjs/cache')
      let courseConfig = null
      // let courseConfig = cache.get(`course-config/${user.consumerId}/${user.courseId}`)
      if (courseConfig === null) {

        courseConfig = await getCourseConfig(user.consumerId, user.courseId)
        if (courseConfig === null) {

          sendNotification(core, user["id"],
            {
              title: "Not yet set up",
              type: "info",
              message: "Using default course config (default-course-config.json). Copy to <coursebase>/config.json and edit to your requirements"
            })

          courseConfig = await fs.promises.readFile(`${core.config('vfs.root')}/default-course-config.json`, 'utf8')
        }

        courseConfig = decomment(courseConfig) // removing comments
        courseConfig = JSON.parse(courseConfig)
        cache.set(`course-config/${user.consumerId}/${user.courseId}`, courseConfig)

      }

      // Evaluate config
      const context = {
        lti: req.body,
        user: user
      }
      const parsedConfig = await core.make('server/constraints/api').evalTree(context, courseConfig)

      user["whitelist"] = parsedConfig.whitelist

      if (parsedConfig['login'] !== true) {
        throw "Invalid user"
      }

      //=====================================================================================================
      // Startup apps setup
      //=====================================================================================================

      user["startupApps"] = []
      if (parsedConfig["startupApps"] != null) {
        if (typeof parsedConfig["startupApps"] == "string") user["startupApps"] = JSON.parse(parsedConfig["startupApps"])
        else user["startupApps"] = parsedConfig["startupApps"]
      }

      //=====================================================================================================
      // Mounts setup
      //=====================================================================================================

      user["mounts"] = user["mounts"] || []

      //Allow instructors read only access to the instructors folder
      if (user["roles"].indexOf("instructor") != -1) { // @TODO check how it works
        user["mounts"].push(
          {
            name: "instructors",
            label: "Instructors",
            adapter: "system",
            icon: {
              name: "folder-publicshare"
            },
            attributes: {
              readOnly: true,
            }
          })
      }

      //=====================================================================================================
      // Resolve user
      //=====================================================================================================

      return user
    },
    logout: async (req, res) => true
  }
}