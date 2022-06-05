"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const assert = require('assert');
var moment = require('moment');
var Ajv = require('ajv');
var ajv = new Ajv();
const DatabaseModel_1 = require("./DatabaseModel");
class Log extends DatabaseModel_1.default {
    constructor() {
        super(...arguments);
        this.sessid = null;
        this.data = null;
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
        Log.validator = null; //ajv.compile(this.schema)
    }
    static async validate(json) {
        //return await User.validator(json);
        return true;
    }
    static fromJSON(json) {
        var temp = Database_1.instance.fromJSON(Log, json);
        temp["data"] = json["data"]; //TODO: this should not be required!
        return temp;
    }
    async validate() {
        //return await User.validate(this.toJSON())
        return true;
    }
    static async get(searchData) {
        var result = await Log.getJSON(searchData);
        console.log("RESULT:", result);
        if (result == null)
            return null;
        return Log.fromJSON(result);
    }
    //modified to get most recent match
    static async getJSON(searchData) {
        var keys = Object.keys(searchData);
        assert(keys.length == 1);
        var key = keys[0];
        var value = searchData[key];
        var result = await Database_1.instance.searchByMostRecentField("Log", key, value, 'modified');
        //console.log("Got result:",result);
        //if(result.length==0) return null;
        //assert(result.length==1)
        return result;
    }
}
Log.validator = null;
Log.initialize();
exports.default = Log;
//# sourceMappingURL=Log.js.map