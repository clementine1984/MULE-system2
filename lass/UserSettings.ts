declare var require;
import {instance as db} from "./Database";

import {Exclude,Expose} from "class-transformer";
const assert = require('assert');
var moment = require('moment');

var Ajv = require('ajv');
var ajv = new Ajv();

import DatabaseModel from "./DatabaseModel"




class UserSettings extends DatabaseModel
{
  static validator:any=null;
  private VFS: any=null;









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
      UserSettings.validator=null;//ajv.compile(this.schema)
  }


   static async validate(json)
  {
    //return await User.validator(json);
    return true;
  }


  static fromJSON(json):UserSettings
  {
    return db.fromJSON(UserSettings,json);
  }

  async validate()
  {
    //return await User.validate(this.toJSON())
    return true;
  }

  static async get(searchData)
  {
    var result=await UserSettings.getJSON(searchData)
    console.log("RESULT:",result)
    if(result==null) return null;

    return UserSettings.fromJSON(result);
  }

  static async getJSON(searchData)
  {
    var keys=Object.keys(searchData)
    assert(keys.length==1)

    var key=keys[0];
    var value=searchData[key];


    var result=await db.searchByField("UserSettings",key,value);

    if(result.length==0) return null;
    assert(result.length==1)

    return result[0];
  }

  //===============================================================================
  //
  //===============================================================================

}

UserSettings.initialize();














export default UserSettings
