declare var require;
import {instance as db} from "./Database";

import {Exclude,Expose} from "class-transformer";
const assert = require('assert');
var moment = require('moment');

var Ajv = require('ajv');
var ajv = new Ajv();

import DatabaseModel from "./DatabaseModel"




class User extends DatabaseModel
{
  static validator:any=null;
  private username: string=null
  private name: string =null
  private groups: any = []
  private mounts: any = []








  //==============================================================================
  // Basic schema
  //==============================================================================

  static schema:any={
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
  }
  //===============================================================================


  static initialize() {
      User.validator=ajv.compile(this.schema)
  }


   static async validate(json)
  {
    return await User.validator(json);
  }


  static fromJSON(json):User
  {
    return db.fromJSON(User,json);
  }

  async validate()
  {
    return await User.validate(this.toJSON())
  }

  static async get(searchData)
  {
    var result=await User.getJSON(searchData)
    console.log("RESULT:",result)
    if(result==null) return null;

    return User.fromJSON(result);
  }



    //get all best attempt for a qid
    static async getUsers(course?,consumer?)
    {
      var result=null

      if(course!=null)
        if(consumer!=null) //replace with r.table("User").getAll(["2020.moodle.maynoothuniversity.ie","918"],{index:'consumerId-courseId'})
          //result=await db.r.table("User").filter({"consumerId":  consumer,"courseId":  course}).pluck('username','id','roles').run()
          result=await db.r.table("User").getAll([consumer,course],{index:'consumerId-courseId'}).pluck('username','id','roles').run()
        else //replace with r.table("User").getAll("918",{index:'courseId'})
          //result=await db.r.table("User").filter({"courseId":  course}).pluck('username','id','roles').run()
          result=await db.r.table("User").getAll(course,{index:'courseId'}).pluck('username','id','roles').run()
      else //this should **never** be run for performance reasons - consider removing
        result=await db.r.table("User").pluck('username','id','roles').run()
      
      
      return result;
    }












  static async getJSON(searchData)
  {
    var keys=Object.keys(searchData)
    assert(keys.length==1)

    var key=keys[0];
    var value=searchData[key];


    var result=await db.searchByField("User",key,value);

    if(result.length==0) return null;
    assert(result.length==1)

    return result[0];
  }

  async validateForNewUserCreation()
  {
    //var result=await db.isUnique("User","username",this.username);
    //if(!result) throw new Ajv.ValidationError("Error: username must be unique")
  }

  //===============================================================================
  //
  //===============================================================================

}

User.initialize();














export default User
