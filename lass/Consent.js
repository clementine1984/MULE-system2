"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const assert = require('assert');
var moment = require('moment');
var Ajv = require('ajv');
var ajv = new Ajv();
const DatabaseModel_1 = require("./DatabaseModel");
class Consent extends DatabaseModel_1.default {
    constructor() {
        super(...arguments);
        this.uid = null;
        this.source = null;
        this.code = false;
        this.feedback = false;
        this.interaction = false;
        this.performance = false;
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
        Consent.validator = null; //ajv.compile(this.schema)
    }
    static async validate(json) {
        //return await User.validator(json);
        return true;
    }
    static fromJSON(json) {
        return Database_1.instance.fromJSON(Consent, json);
    }
    async validate() {
        //return await User.validate(this.toJSON())
        return true;
    }
    static async get(searchData) {
        var result = await Consent.getJSON(searchData);
        console.log("RESULT:", result);
        if (result == null)
            return null;
        return Consent.fromJSON(result);
    }
    //modified to get most recent match
    static async getJSON(searchData) {
        var keys = Object.keys(searchData);
        assert(keys.length == 1);
        var key = keys[0];
        var value = searchData[key];
        var result = await Database_1.instance.searchByMostRecentField("Consent", key, value, 'modified');
        //console.log("Got result:",result);
        //if(result.length==0) return null;
        //assert(result.length==1)
        return result;
    }
}
Consent.validator = null;
Consent.initialize();
exports.default = Consent;
//# sourceMappingURL=Consent.js.map