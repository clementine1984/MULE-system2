declare var process: any;
declare var require;
declare var Promise;
//==============================================================================
const thinkagain = require('thinkagain')({ "host": "rethinkdb" }/* rethinkdbdash options */);
//==============================================================================
/* TODO: For discussion: Not sure of the benefits of thinkagain.
  At the moment we are using the contained ajv validator and handling validation ourselves
*/


var RethinkdbWebsocketServer = require('rethinkdb-websocket-server');
var rws = RethinkdbWebsocketServer.r;
var RP = RethinkdbWebsocketServer.RP;
var jwt = require('jsonwebtoken');


import {plainToClass,classToPlain} from "class-transformer";


class Database
{
  private static instance: Database;




  models:any;

  thinkagain:any;
  r:any;
  ajv:any;
  Errors:any;
  httpServer: any;


  startSocketServer(httpServer)
  {
    this.httpServer=httpServer;
    //===============================================================================
    var JWT_SECRET = process.env.JWT_SECRET
    //===============================================================================
    var config = {
      httpServer: httpServer,
      httpPath: '/db',
      dbHost: 'rethinkdb',
      dbPort: 28015,
    }
    //===============================================================================
    // Configure rethinkdb-websocket-server to listen on the /db path and proxy
    // incoming WebSocket connections to the RethinkDB server running on localhost
    // port 28015.

    //only for development!
    config["unsafelyAllowAnyQuery"] = true;
    //===============================================================================
    config["sessionCreator"] = (urlQueryParams) => {
      console.log(urlQueryParams);
      return new Promise(function(resolve, reject) {
        jwt.verify(urlQueryParams.token, JWT_SECRET, function(err, decoded) {
          if (err) {
            console.log("JWT decode failue");
            return reject("JWT decode failue");
          }
          else {
            console.log(decoded);
            return resolve(decoded);
          }
        });
      });
    }
    //===============================================================================
    config["queryWhitelist"] = [
      rws.table(RP.ref('table'))
        .get(RP.ref('id'))
        .changes()
        .opt("db", rws.db("test"))
        .validate(function(refs, session) {
          console.log(refs.table + "/" + refs.id);
          //throw"Invalid Query - User auth incorrect";
          return session.user == "kevin.casey@mu.ie"
        }),
    ]
    //===============================================================================
    RethinkdbWebsocketServer.listen(config);
  }



  private constructor()
  {
    this.thinkagain=require('thinkagain')({ "host": "rethinkdb" })
    this.r=thinkagain.r;
    this.ajv=thinkagain.ajv;
    this.Errors=thinkagain.Errors;

    //================================================================================
    // Model info here (TODO: consider moving)
    //================================================================================
    this.models={}
    this.models["User"]={
      table:"User",
      indices:["username","courseId",{
        name:"consumerId-courseId",
        fields:["consumerId","courseId"]
      }],
      model: null
    }
    this.models["UserSettings"]={
      table:"UserSettings",
      indices:[],
      model: null
    }

    this.models["Consent"]={
      table:"Consent",
      indices:["uid"],
      model: null
    }


    this.models["Log"]={
      table:"Log",
      indices:[],
      model: null
    };





    this.models["Attempt"]={
      table:"Attempt",
      indices:["qid",{
        name:"uid-qid",
        fields:["uid","qid"]
      }],
      model: null
    };

    //================================================================================
    // end of model info
    //================================================================================

    //init models (async)
   
    (async ()=>{
    for(var k in this.models)
    {
      console.log("Creating model ",k,"in table",this.models[k].table);

      var m=this.thinkagain.createModel(this.models[k].table,{});
      this.models[k].model=m;
      for(var i of this.models[k].indices)
      {
        
        if(typeof i == "string")
        {
          console.log("    adding simple index:",i);
          m.ensureIndex(i)
        }
        else
        {
          console.log("    adding compound index:",i);
          var name=i.name;
          var tableName=this.models[k].table;
          var fields=i.fields;
          //from https://github.com/neumino/thinky/issues/17
          //TODO: test is hardcoded
          console.log("Creating index ",name,"in",tableName);

          var indices=await this.r.db('test').table(tableName).indexList().run();

          console.log(indices)

          if(indices.indexOf(name)!=-1)
              console.log("Already defined")
          else
            //TODO: We should wait for the index to be ready: https://www.rethinkdb.com/docs/secondary-indexes/javascript/
            this.r.db('test').table(tableName).indexCreate(name,fields.map((x)=>{ return this.r.row(x)})).run();
          }

        }
      }
    })();
    
  }

  async create(obj)
  {
    var name=obj.getName();
    var model=this.models[name].model;
    var json=this.toJSON(obj);


    //delete json['id']
    var instance=new model(json);
    var result= instance.saveAll();
    return result;
  }


  async update(obj)
  {
    var name=obj.getName();
    var model=this.models[name].model;
    var json=this.toJSON(obj);
    //delete json['id']
    var tableName=this.models[name].table;
    var result=await this.r.db('test').table(tableName).get(json['id']).update(json).run();
    return result;
  }





  fromJSON(classname,json):any
  {
    console.log(classname);
  

    return plainToClass(classname,json);
  }


  toJSON(obj)
  {
    return classToPlain(obj);
  }


  static getInstance() {
          if (!Database.instance) {
              Database.instance = new Database();
          }
          return Database.instance;
      }


  async searchByField(table,field,value)
  {
        var result=await this.r.table(table).getAll(value, { index: field }).run();
        return result;
  }

  async searchByMostRecentField(table,field,value,timefield)
  {
        var result=await this.r.table(table).getAll(value, { index: field }).orderBy(this.r.desc(timefield)).run();
        //console.log("returning",result);
        if(result.length>0) return result[0];
        else return null;
  }


async searchByHighestField(table,field,value,valuefield)
{
      var result=await this.r.table(table).getAll(value, { index: field }).orderBy(this.r.desc(valuefield)).run();
      //console.log("returning",result);
      if(result.length>0) return result[0];
      else return null;
}


  async isUnique(table,field,value)
  {
    var count=await this.r.table(table).getAll(value, { index: field }).count().run();
    return (count==0);
  }
}





export var instance= Database.getInstance();


/*
ajv.addKeyword('not_in', {
  modifying: true,
	errors: true,
  schema: true,
	async: true,

  validate:  async (data, dataPath, parentData, parentDataProperty, x, y, z) => {
    console.log(data, dataPath, parentData, parentDataProperty, x, y, z);
    var tablename = data["table"];
    var fieldname = y;
		if("field" in data) fieldname=data["field"];


    console.log("checking for " + dataPath + " in " + tablename + "/" + fieldname);

		var count=await r.table(tablename).getAll(dataPath, { index: fieldname }).count().run();

		if(count>0)
		{
			var err=new Errors.ValidationError(fieldname+' already exists');
			err.errors=[{
				keyword: "not_in",
				message: fieldname+' already exists',
				params: {
					keyword: "not_in"
				}
			}]

			throw err;
		}

		return true;
}});

*/
