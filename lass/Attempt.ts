declare var require;
import {instance as db} from "./Database";

import {Exclude,Expose} from "class-transformer";
const assert = require('assert');
var moment = require('moment');

var Ajv = require('ajv');
var ajv = new Ajv();

import DatabaseModel from "./DatabaseModel"




class Attempt extends DatabaseModel
{
  static validator:any=null;
  private uid: string =null
  private qid: string = null;
  private files: any = null;
  private grade: number = null;
  private personal: number = null;

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
      Attempt.validator=null;//ajv.compile(this.schema)
  }


   static async validate(json)
  {
    //return await User.validator(json);
    return true;
  }


  static fromJSON(json):Attempt
  {
    return db.fromJSON(Attempt,json);
  }

  async validate()
  {
    //return await User.validate(this.toJSON())
    return true;
  }

  static async get(searchData)
  {
    var result=await Attempt.getJSON(searchData)
    console.log("RESULT:",result)
    if(result==null) return null;

    return Attempt.fromJSON(result);
  }


  //modified to get most recent match - need to supply uid and qid
  static async getHistory(uid,qid)
  {
    var result=await db.r.table("Attempt").getAll([uid,qid], { index: "uid-qid" }).without("files","qid","uid","created").orderBy(db.r.desc("modified"))

    //console.log("Got result:",result);

    //if(result.length==0) return null;
    //assert(result.length==1)

    return result;
  }





  //modified to get most recent match - need to supply uid and qid
  static async getJSON(searchData)
  {
    var keys=Object.keys(searchData)
    assert(keys.length==1)

    var key=keys[0];
    var value=searchData[key];


    var result=await db.searchByMostRecentField("Attempt",key,value,'modified');

    //console.log("Got result:",result);

    //if(result.length==0) return null;
    //assert(result.length==1)

    return result;
  }





    //modified to get most recent match - need to supply uid and qid
    static async getBest(searchData)
    {
      var keys=Object.keys(searchData)
      assert(keys.length==1)

      var key=keys[0];
      var value=searchData[key];

      var result=await db.searchByHighestField("Attempt",key,value,'grade');


      //console.log("Got result:",result);

      //if(result.length==0) return null;
      //assert(result.length==1)

      return result;
    }


    //modified to get most recent match - need to supply uid and qid
    static async getPersonalBest(searchData)
    {
      var keys=Object.keys(searchData)
      assert(keys.length==1)

      var key=keys[0];
      var value=searchData[key];

      var result=await db.searchByHighestField("Attempt",key,value,'personal');


      //console.log("Got result:",result);

      //if(result.length==0) return null;
      //assert(result.length==1)

      return result;
    }



  //clear any items that have no grade - need to supply uid and qid
  static async clearUngradedAttempts(uid,qid)
  {
    var result=await db.r.table("Attempt").getAll([uid,qid], { index: "uid-qid" }).filter({grade:null,personal:null}).delete().run();

    //console.log("Got result:",result);

    //if(result.length==0) return null;
    //assert(result.length==1)

    return result;
  }


  //get all best attempt for a qid
  static async getGrades(qid,type)
  {
    var result=await db.r.table('Attempt').getAll(qid,{index:"qid"}).group('uid').max(type).ungroup().map(function(x) { return {uid:x('group'),grade:x('reduction')(type)}}).run();
    return result;
  }



  //set a grade by id
  static async setGrade(id,grade,type)
  {
    if(type==="ca")
    {
      await db.r.table('Attempt').get(id).update({'grade':grade,'personal':null}).run();
    }
    else if(type==="personal")
    {
      await db.r.table('Attempt').get(id).update({'grade':null,'personal':grade}).run();
    }
    else if(type===null)
    {
      await db.r.table('Attempt').get(id).update({'grade':null,'personal':null}).run();
    }
    else
    {
      throw ("Unknown grade type:"+type);
    }

    var result=await db.r.table('Attempt').get(id)
    return result;
  }








  //===============================================================================
  //
  //===============================================================================

}

Attempt.initialize();














export default Attempt
