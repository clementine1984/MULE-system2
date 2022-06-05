var rp = require("request-promise");
const assert = require("assert");
var path = require("path");
import WebSocketWrapper from "../editor/WebSocketWrapper";
var NodeWebSocket = require('ws');

//==============================================================================================
// Support functions for API
//==============================================================================================

async function getAttempt(data) {
  try {
    var options = {
      uri: "http://lass:8080/getAttempt/" + data.uid,
      method: "POST",
      json: true,
      body: data
    };

    var result = await rp(options);
    return result;
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

async function getHistory(data) {
  try {
    var options = {
      uri: "http://lass:8080/getAttemptHistory/" + data.uid,
      method: "POST",
      json: true,
      body: data
    };

    var result = await rp(options);
    return result;
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

async function saveAttempt(data) {
  try {
    var options = {
      uri: "http://lass:8080/setAttempt/" + data.uid,
      method: "POST",
      json: true,
      body: data
    };

    var result = await rp(options);
    return result;
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

async function getGrades(qid, type) {
  try {
    var options = {
      uri: "http://lass:8080/getGrades/" + qid + "/" + type + "/",
      method: "GET",
      json: true
    };

    var result = await rp(options);
    return result;
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

async function getUsers(course, consumer) {
  try {
    var options = {
      uri: "http://lass:8080/users/" + course + "/" + consumer + "/",
      method: "GET",
      json: true
    };

    var result = await rp(options);
    return result;
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

const WebsocketServer = require("ws").Server;


async function getNode(core,user,qid)
{
  //Find the appropriate node for qid.....
  var workbook = await getWorkbookFile(core, user, "workbooks.json");

  //TODO: this is urgent - this code is slow
  var scan = (node) => {
    if ((node.qid) && (node.qid == qid)) return node;
    if ((node.children) && (node.children.length > 0)) {
      for (var i = 0; i < node.children.length; i++) {
        var x = scan(node.children[i]);
        if (x != null) return x;
      }
    }
    return null;
  }


  return scan(workbook)
}


async function handleEvalAttempt(core,user,data,adminUser=false) {

  console.log("EVAL ADMIN:",adminUser)
  //Find the appropriate node for qid.....
  /* var workbook = await getWorkbookFile(core, user, "workbooks.json");

  //TODO: this is urgent - this code is slow
  var scan = (node) => {
    if ((node.qid) && (node.qid == data.qid)) return node;
    if ((node.children) && (node.children.length > 0)) {
      for (var i = 0; i < node.children.length; i++) {
        var x = scan(node.children[i]);
        if (x != null) return x;
      }
    }
    return null;
  }

  //OK - we have a matched node...maybe=================================================
  var matchedNode = scan(workbook);
*/
  var matchedNode=await getNode(core,user,data.qid)
  if (matchedNode == null) throw "Unable to find problem in workbook with qid:" + data.qid


  var evalTo=null;

  if(!adminUser)
  {
    evalTo=await canEvaluate(core,data.ip, user,matchedNode)
    if(evalTo==null) throw "You don't have the right to eval. Check with your demonstrator if you think this is a mistake."
    assert(((evalTo=="ca")||(evalTo=="personal")),"unknown grade destination:"+evalTo)
  }





  //console.log(JSON.stringify(matchedNode,null,2));
  //now make sure all requested files are available
  var requestedFiles = matchedNode["Requested files"]


  //if (requestedFiles.length > 2) throw "Multiple requested files >2 not yet supported"
  if (requestedFiles.length == 0) throw "No requested files"

  //assumption of 1 file from now on



  /*--------------------------------------

  files[path.substring(path.indexOf("/"))]={content: text}
}

var socketAddr = await jailServer.compileFile({
  lang: lang,
  files: files
})


  */



 //Now retrieve the files associated with ID from the DB - i.e. we don't take them directly from the client saide


            let datap = {
              uid: data.uid,
              qid: data.qid,
              id: data.id //,
              // grade: grade
            };

	    var result = await getAttempt(datap);
      console.log("Evaluating:",result.files)

      var files={}

      result.files.forEach(element => {
        files[element.name]={content: element.contents}
      });






  /*for (var i = 0; i < data.files.length; i++) {
    if (data.files[i].name == filename) {
      content = data.files[i].contents;
      break;
    }
  }

  if (content == null)
    throw "missing requested file:" + filename;
  */



  var evalScript = matchedNode['files']['vpl_evaluate.sh'];
  files["vpl_run.sh"]= {content: evalScript}
  //console.log("EVALSCRIPT:", matchedNode['files'])

  //Is there a second file?
 /* var includeFiles = {}

  if (requestedFiles.length > 1) {
    var filename2 = requestedFiles[1];
    var content2 = null;
    for (var i2 = 0; i2 < data.files.length; i2++) {
      if (data.files[i2].name == filename2) {
        content2 = data.files[i2].contents;
        break;
      }
    }
    includeFiles["name"] = filename2
    includeFiles["content"] = content2
  }
*/



  const cee = core.make('mule/cee');
  const availableResponse = await cee.available();
  if (availableResponse.status !== 'ready') {
    throw new Error("The service is busy! Try again later...")
  }

  const submitResponse = await cee.submit({
    command: 'evaluate',
    files: files
  }, {
    maxTime: availableResponse.maxTime,
    maxFileSize: availableResponse.maxFileSize,
    maxMemory: availableResponse.maxMemory
  });

  const executionUrl = cee.getExecutionUrl(submitResponse.executionTicket)

  var result= new NodeWebSocket(executionUrl);
  var sock =  new WebSocketWrapper(result);
  let grade=null
  let results=""
  var maxlen=1024*16
  var status="ok"



  //Watch out for compilation succeeding
  sock["receiveFilter"] =  msg => {

    //console.log("CHECKING:",msg)


    if(msg.trim()=="Jail: execution time limit reached.")
    {

      console.log("Evaluation time limit exceeded - your program is taking too long to be evaluated")
      status="Evaluation time limit exceeded"
      return "Evaluation time limit exceeded - your program is taking too long to be evaluated"
    }







    maxlen=maxlen-msg.length
    if(maxlen<0)
    {

      status="Console output limit exceeded"
      sock.close()
      return "Console output limit exceeded - your program is printing too much to be evaluated"
    }
    var gradeExtractor = /^Grade\s\:\=\>\>\s([0-9]+)$/gm
    var match = gradeExtractor.exec(msg);
    if ((match != null) && (match.length > 1)) {

      grade = parseInt(match[1]);
      console.log("GOT A GRADE:", grade);

      //console.log("Should send an 'evaluated' message to user here. User is:",user)
      //core.broadcastUser(user.username, 'evaluated', {acomplex: "object"}, 2 , 3);


    }



    if(grade!=null)
    {
      var newMessage="You got a grade of "+grade
      if(adminUser) newMessage+="\n===================================\nNote: You are an admin user - this grade has not been saved anywhere.\nTo change the grade for a student, you can edit it in the history panel."
      return msg.replace(gradeExtractor,newMessage);
    }

    else
      return msg
  };


  //We have to add an event listener in order for the filter to work TODO: fix this!
  sock.addEventListener("message",function (d) {
    results+=d.data
  });


  var promise = new Promise(function (resolve, reject) {
    sock.onclose = async function () {

      if((!adminUser)&&(status=="ok"))  //only save if not adminUser
      {
        var t=evalTo;

        var d = {
          id: data.id,
          type: t,
          grade: grade
        }

        try
        {
          var result:any = await setGrade(d);

          assert(result.id==data.id,"Error saving grade item")
        }catch(err)
        {
          console.log("ERROR:",err)
          return reject(err)
        }
      }

      console.log("RESOLVING: ",{ raw: results, grade: grade })

      return resolve({ raw: results, grade: grade });
    }
  });

  return promise;
}


async function getWorkbookFile(core, user, file) {
  assert(user.consumerId != null)
  assert(user.courseId != null)
  assert(user.courseUserId != null)

  const course = core.make('mule/course')
  return await course.readFile(user, path.join('workbooks', file))
}

async function putWorkbookFile(core, user, file, text) {
  assert(user.consumerId != null)
  assert(user.courseId != null)
  assert(user.courseUserId != null)

  const course = core.make('mule/course')
  return await course.writeFile(user, path.join('workbooks', file), text)
}

async function getWorkbookDir(core, user, path) {
  assert(user.consumerId != null)
  assert(user.courseId != null)
  assert(user.courseUserId != null)

  const course = core.make('mule/course')
  return await course.scanDir(user, path.join('workbooks', path))
}

async function canRead(core, ip, user, metadata) {
  var context = {
    user: user,
    ip: ip
  };
  console.log(context);
  console.log("TEST:", metadata["visible"]);
  var result = await core
    .make("server/constraints/api")
    .evalConstraint(context, metadata["visible"], false);
  console.log("RESULT:", result);
  return result;
}



async function setGrade(data) {

  try {

    var options = {
      uri: "http://lass:8080/setGrade/" + data.id,
      method: 'POST',
      json: true,
      body: data
    };

    var result = await rp(options);
    console.log(result)
    return result

  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

/*








async function getGrade(data) {

  try {

    var options = {
      uri: "http://lass:8080/getGrade/" + data.uid,
      method: 'POST',
      json: true,
      body: data
    };

    var result = await rp(options);

    if (result == null) return null;
    if (result['grade'] == null) return null;

    return result['grade'];

  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}


















async function getPersonalBest(data) {

  try {

    var options = {
      uri: "http://lass:8080/getPersonalBest/" + data.uid,
      method: 'POST',
      json: true,
      body: data
    };

    var result = await rp(options);

    if (result == null) return null;
    if (result['personal'] == null) return null;

    return result['personal'];

  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}








function getFile(client, pathname) {
  return client.getFileContents(pathname, { format: "text", "headers": { "Authorization": "Bearer " + superToken } });
}

*/

async function processFolder(core, user, folder, inherited?) {
  console.log("Processing ", folder);

  var inheritable = [
    "visible",
    "Run",
    "Evaluate",
    "Automatic grade",
    "copy",
    "paste"
  ];

  var metadata;
  try {
    //console.log("Calling getfile");
    metadata = await getWorkbookFile(
      core,
      user,
      path.join(folder, "metadata.json")
    );
    //console.log("Done Calling getfile");
  } catch (e) {
    //console.log("Error Calling getfile",e);

    return null;
  } //TODO: only file not found exceptions should be caught here

  //if(metadata["visible"]&&(metadata["visible"]==false)) return null;

  //console.log("Got Calling getfile data ",metadata["title"]);
  var obj = metadata; //already parsed

  //any inherited features?
  if (inherited) {
    for (var k in inherited) {
      if (!(k in obj)) obj[k] = inherited[k];
    }
  }

  //Now collect inheritable features
  var inheritedFeatures = {};
  for (var j of inheritable) {
    if (j in obj) inheritedFeatures[j] = obj[j];
  }

  console.log("Inheriting:", inheritedFeatures);

  //try get a description
  try {
    var desc = await getWorkbookFile(
      core,
      user,
      path.join(folder, "description.html")
    );
    obj["description"] = desc;
  } catch (e) {}

  //get subfolders
  var files = (await getWorkbookDir(core, user, folder))
    .filter(x => {
      return x.type == "file";
    })
    .map(x => {
      return x.basename;
    });

  files = files.filter(x => {
    return x != "description.html";
  });
  files = files.filter(x => {
    return x != "metadata.json";
  });

  obj["files"] = {};
  //console.log("files is",files)
  //include all other files as resources
  for (var f of files) {
    var contents = await getWorkbookFile(core, user, path.join(folder, f));
    obj["files"][f] = contents;
  }

  //get subfolders
  var subfolders = (await getWorkbookDir(core, user, folder))
    .filter(x => {
      return x.type == "directory";
    })
    .map(x => {
      return x.basename;
    });

  //iterate over subfolders
  for (var s of subfolders) {
    var child = await processFolder(
      core,
      user,
      path.join(folder, s),
      inheritedFeatures
    );
    if (child != null) {
      if (obj.children) obj.children.push(child);
      else obj.children = [child];
    }
  }

  if (obj.children != null)
    obj.children.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });

  return obj;
}







/*















async function getNode(qid, uid) {

  //Find the appropriate node for qid.....
  var workbook = await getWorkbookFile(uid)


  //console.log("Got workbook",workbook);

  //TODO: this is urgent - this code is slow
  var scan = (node) => {
    if ((node.qid) && (node.qid == qid)) return node;
    if ((node.children) && (node.children.length > 0)) {
      for (var i = 0; i < node.children.length; i++) {
        var x = scan(node.children[i]);
        if (x != null) return x;
      }
    }
    return null;
  }


  var matchedNode = scan(workbook);

  return matchedNode
}











*/








async function canEvaluate(core,ip, user, metadata) {

  var context = {
    user: user,
    ip: ip
  }
  var temp= await core
  .make("server/constraints/api")
  .evalConstraint(context, metadata["Evaluate"], false);

  console.log("CANEVALUATE:",temp)

  return temp
}


async function canSubmit(core,ip, user, metadata) {
  var context = {
    user: user,
    ip: ip
  }

  return await core
  .make("server/constraints/api")
  .evalConstraint(context, metadata["Gradebook"], false);
}





async function canRun(core,ip, user, metadata) {
  var context = {
    user: user,
    ip: ip
  }

  return await core
  .make("server/constraints/api")
  .evalConstraint(context, metadata["Run"], false);
}


//Note this is inverted!
async function canPaste(core,ip, user, metadata) {
  var context = {
    user: user,
    ip: ip
  }

  return await (core
  .make("server/constraints/api")
  .evalConstraint(context, metadata["paste"], null));
}

async function canCopy(core,ip, user, metadata) {
  var context = {
    user: user,
    ip: ip
  }

  return await (core
  .make("server/constraints/api")
  .evalConstraint(context, metadata["copy"], null));
}


async function getCourseConfig(core, user) {
  let courseConfig = null

  try {

    const course = core.make('mule/course')
    courseConfig = await course.getConfig(user)

  } catch (err) {

    console.log(err)
    throw err
  }

  return courseConfig
}


// Methods OS.js server requires
module.exports = (core, proc) => ({

  // When server initializes
  init: async () => {

    var checkAdminAccess=async (user)=>
    {
      var cache=core.make('osjs/cache')
      var courseConfig=cache.get("course-config/"+user.consumerId + "/" + user.courseId)
      if(courseConfig==null)
      {
        //throw "No course config cached"
        //retrieve the course config - TODO: better way to do this? Maybe push work to cache
        courseConfig = await getCourseConfig(core, user);
        cache.set("course-config/"+user.consumerId + "/" + user.courseId, courseConfig)
      }

      courseConfig=courseConfig["apps"]
      if(courseConfig==null) throw "No apps config in course config"
      courseConfig=courseConfig["workbook"]
      if(courseConfig==null) throw "No apps/workbook config in course config"

      var context = {
        user: user
      };

      //console.log("ADMIN CHECK ON:",courseConfig)

      var result = await core.make("server/constraints/api").evalTree(context, courseConfig);
      result=((result["admin"]!=null)?result["admin"]:false)

      //console.log("ADMIN CHECK:",result)
      return result
    }

    core.app.post(proc.resource("/api"), async (req, res) => {

      try
      {
        const method = req.body.method;
        const args = req.body.args;
        const user=req.session.user;
        const uid=user.id;
        const ip = req.headers["x-real-ip"];

        assert(uid != null, "uid is null");

        if (method === "getAttempt") {
            var { qid,id}  = args;
            //var id = args.id;


            assert(qid != null);
            assert(id != null);

            let data = {
              uid: uid,
              qid: qid,
              id: id //,
              // grade: grade
            };

	    //overriding uid?
        if (args.uid) {

          if (checkAdminAccess(user))
            data.uid = args.uid;
          else
            return res.status(500).json({ result: "error - not permitted" });
        }



            var result = await getAttempt(data);
           return res.json(result);
        }


        if (method === "setAttempt")
        {
          var { qid,files} = args;
          //var files = args.files;


          assert(qid != null, "qid is null");
          assert(files != null, "files is null");

          let data = {
            uid: uid,
            qid: qid,
            files: files //,
            // grade: grade
          };


	    //overriding uid?
        if (args.uid) {

          if (checkAdminAccess(user))
            data.uid = args.uid;
          else
            return res.status(500).json({ result: "error - not permitted" });
        }



          var result = await saveAttempt(data);

          return res.json(result);
        }

        if (method === "getUserList")
        {
          //if (user.groups && user.groups.indexOf("edit-workbooks") == -1) return []
          if(!checkAdminAccess(user)) return [];

          //parse UID
          let s = uid.split(".");
          let u = s.shift();
          let course = s.shift();
          let consumer = s.join(".");

          var result = await getUsers(course, consumer);

          //console.log(result);

          var result2 = {};
          for (var r of result) {
            result2[r.id] = r;
          }

          res.json(result2);
        }

        if (method ==="compileWorkbooks")
        {
          if (!checkAdminAccess(user)) {
            return res.status(500).json({ result: "error - not permitted" });
          }

          //===============================================================================================================================
          let workbook = await processFolder(core, user, "source");

          await putWorkbookFile(
            core,
            user,
            "/workbooks.json",
            JSON.stringify(workbook)
          );

          return res.json("ok");
        }

        if (method ==="updateGrade")
        {
          //var user = await authenticator().checkSession(http);
          if (!checkAdminAccess(user)) throw "Invalid action - you do not have sufficient rights"

          var {id,type,grade} = args;
          //var t=args.type;
          //var grade=args.grade;


          let data = {
            id,
            type,
            grade
          }

          var result:any = await setGrade(data);

          return res.json(result);
        }

        if (method ==="isAdmin")
        {
          return res.json(await checkAdminAccess(user));
        }

        if(method==="getFullWorkbook")
        {
          var metadata = await getWorkbookFile(core, user, "workbooks.json");

          //parse workbook file to hide invisible invisible items
          var workbook = [metadata];



          //read: canRead(ip,user,node),

          let filter = async node => {
            if (node.children) node.children = await node.children.filter(filter);
            return await canRead(core, ip, user, node);
          };

          var checkRead=async (nodeList)=> {
            var result = [];

            for (var element of nodeList) {
              if (await canRead(core, ip, user, element)) {
                result.push(element);
              }
            }

            for (var element of result) {
              if (element.children) {
                element.children = await checkRead(element.children);
              }
            }
            return result;
          }

          //console.log(JSON.stringify(workbook, null, 4))

          //var result=workbook.filter(filter)
          let result = await checkRead(workbook);
          //console.log(JSON.stringify(result, null, 4))
          //console.log("Returning:============================================================================================= ",typeof result)

          res.json(result);

      }


      if (method === "getHistory")
      {
        var { qid } = args;
        assert(qid != null);

        let data = {
          uid: uid,
          qid: qid
        };

        //overriding uid?
        if (args.uid) {

          if (checkAdminAccess(user))
            data.uid = args.uid;
          else
            return res.status(500).json({ result: "error - not permitted" });
        }

        //console.log("CALLING!")
        var result = await getHistory(data);
        //console.log("CALLED- returning! ",result)
        res.json(result);
      }

      if (method === "evalAttempt")
      {
        var { qid,files,id } = args;
        assert(qid != null);
        assert(files != null);
        console.log("Server eval:",args)

        var isAdmin=false;

        if (args.uid) {

          if (checkAdminAccess(user))
            isAdmin=true //this flag will allow evaluation but not stored in any workbook
          else
            return res.status(500).json({ result: "error - not permitted" });
        }

        //ADD IP TO ARGS
        const suppArgs={...args,ip,id,uid}

        let result= await handleEvalAttempt(core,user,suppArgs,isAdmin)
        console.log("Have result from handler",result)
        return res.json(result)
      }

      if (method === "getRights")
      {
        var { qid } = args;
        assert(qid != null);

        var node=await getNode(core,user,qid)


        return res.json({ eval: await canEvaluate(core,ip,user,node),

          submit: await canSubmit(core,ip,user,node),
          read: await canRead(core,ip,user,node),
          run: await canRun(core,ip,user,node),
          paste: await canPaste(core,ip,user,node),
          copy: await canCopy(core,ip,user,node)
       })
      }

      if (method === "downloadGrades")
      {

        if (!checkAdminAccess(user)) throw "Invalid action - you do not have sufficient rights"



        var {id,qids,type}=args;

        var results={}


        for(var qid of qids)
        {
          let g=await getGrades(qid,type)
    
          //filter if id is defined
          if(id!=null)
          {
            g=g.filter((x)=>{ return x.uid==id  })
          }
          results[qid]=g
        }
        return   res.json(results)
      }
    }catch (err) {
      console.log(err);
      return res.status(500).json({ result: err });
    }
  })},

  // When server starts
  start: () => {
    console.log("hello");
  },

  // When server goes down
  destroy: () => {
    console.log("good bye");
  },

  // When using an internally bound websocket, messages comes here
  onmessage: (ws, respond, args) => {
    respond("Pong");
  }
});
