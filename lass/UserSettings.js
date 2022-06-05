"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const assert = require('assert');
var moment = require('moment');
var Ajv = require('ajv');
var ajv = new Ajv();
const DatabaseModel_1 = require("./DatabaseModel");
class UserSettings extends DatabaseModel_1.default {
    constructor() {
        super(...arguments);
        this.VFS = null;
        //===============================================================================
        //
        //===============================================================================
    }
    //==============================================================================
    // Basic schema
    //==============================================================================
    /*static schema:any={
      "$async": true,
      type: 'object',
      properties: {
        "id": { "type": ["string","null"]},
        "username": {
          "type": "string",
        },
        "name": { "type": "string" },
        //"name": {"anyOf": [{ "type": "string" },{ "type": "number" }]},
        "groups": {
          "type": "array",
          "items": [ { "type": "string" } ]
        },
      },
      required: ['username', 'name']
    }*/
    //===============================================================================
    static initialize() {
        UserSettings.validator = null; //ajv.compile(this.schema)
    }
    static async validate(json) {
        //return await User.validator(json);
        return true;
    }
    static fromJSON(json) {
        return Database_1.instance.fromJSON(UserSettings, json);
    }
    async validate() {
        //return await User.validate(this.toJSON())
        return true;
    }
    static async get(searchData) {
        var result = await UserSettings.getJSON(searchData);
        console.log("RESULT:", result);
        if (result == null)
            return null;
        return UserSettings.fromJSON(result);
    }
    static async getJSON(searchData) {
        var keys = Object.keys(searchData);
        assert(keys.length == 1);
        var key = keys[0];
        var value = searchData[key];
        var result = await Database_1.instance.searchByField("UserSettings", key, value);
        if (result.length == 0)
            return null;
        assert(result.length == 1);
        return result[0];
    }
}
UserSettings.validator = null;
UserSettings.initialize();
exports.default = UserSettings;
//# sourceMappingURL=UserSettings.js.map