//==============================================================================
const thinkagain = require('thinkagain')({ "host": "rethinkdb" }/* rethinkdbdash options */);
//==============================================================================
/* TODO: For discussion: Not sure of the benefits of thinkagain.
  At the moment we are using the contained ajv validator and handling validation ourselves
*/





class Database
{
  private static instance: Database;

  thinkagain:any;
  r:any;
  ajv:any;
  Errors:any;


  private constructor()
  {
    this.thinkagain=require('thinkagain')({ "host": "rethinkdb" })
    this.r=thinkagain.r;
    this.ajv=thinkagain.ajv;
    this.Errors=thinkagain.Errors;
  }




  static getInstance() {
          if (!Database.instance) {
              Database.instance = new Database();
          }
          return Database.instance;
      }


  async function isUnique(table,field,value)
  {
    var count=await this.r.table(tablename).getAll(dataPath, { index: fieldname }).count().run();
    return (count==0);
  }
}



export Database.getInstance();
