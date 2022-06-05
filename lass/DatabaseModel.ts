declare var require;
import {instance as db} from "./Database";

import {Exclude,Expose} from "class-transformer";
const assert = require('assert');
var moment = require('moment');

var Ajv = require('ajv');
var ajv = new Ajv();


export default class DatabaseModel
{
  private id: string=null;
  private  created: any =null
  private  modified: any =null

  @Exclude()
  private modelClass:any=null;

  public getName() {
	    let comp:any = this.constructor;
			return comp.name;
	}


  async create()
  {
    //allow for auto-generation of ID where required
    if(this.id==null) delete this["id"];

    this.created=this.modified=moment().format()
    var result=await db.create(this)

    if(this.id!=result.id) this.id=result.id
    return result
  }

  async update()
  {
    //allow for auto-generation of ID where required
    //if(this.id==null) delete this["id"];

    this.modified=moment().format()
    var result=await db.update(this)

  //  if(this.id!=result.id) this.id=result.id
    return result
  }











  toJSON()
  {
    return db.toJSON(this);
  }
}
