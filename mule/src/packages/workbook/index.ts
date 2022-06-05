import './index.scss';
const osjs =require('osjs');
//import {name as applicationName} from './metadata.json';
const applicationName=require('./metadata.json').name
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';
import * as State from './src/state'
import { Provider } from "react-redux";
//import logo from './src/about.png'

//const Server=require('./server')
import EditorBehaviourWorkbook from "../editor/EditorBehaviourWorkbook"
import { ServerResponse } from 'http';

let {store,setUsers,setWorkbookContents,workbookSelectItem,setRights}=State



function buildAPI(proc,methods)
{
  let server={}
  for(var k of methods)
  {
    server[k]=((method)=>{  //IIFE
      return async (args)=>
      {
        //console.log("Calling"+method)
        return await proc.request('/api',{method: 'post',body: {method:method,args}})
      }})(k)
  }
  return server
}





// Our launcher
const register =   (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});
  const user=core.make('osjs/auth').user()
  const theme = core.make('osjs/theme');




//Server methods=====================================================================
const server:any=buildAPI(proc,["setAttempt","getAttempt","compileWorkbooks","getFullWorkbook","getUserList","downloadGrades","isAdmin","evalAttempt","getRights"])


core.on('evaluated', (a, b, c) => console.log(a, b, c)) // => 1 2 3




//END Server methods=====================================================================


  var compileWorkbook=(process)=> async ()=>
  {
      process.windows.map((x)=>{  x.setState("loading",true,true) })
      try
      {
        //var result: any = await proc.request('compileWorkbooks',{method: 'post'})
        var result: any = await server.compileWorkbooks({})
        alert("OK - restart app to see changes");
      }
      catch(err)
      {
        alert(err)
        console.log(err);
        process.windows.map((x)=>{  x.setState("loading",false,true) })
        throw err
      }
      process.windows.map((x)=>{  x.setState("loading",false,true) })
 }



 var saveCallback = async (data) => {
  try {
    var qid = data.qid;
    var files = data.files;

    var params={ qid: data.qid, files: data.files }

    //acting as user
    var acting_id=store.getState().workbook.selectedUser.id
    if(acting_id)
    {
      params['uid']=acting_id
    }

    //var result = await proc.request('/setAttempt',{method: 'post',body: params})

    var result = await server.setAttempt(params)



    //console.log(result)

    //only update the history if the qid is the same as the one in the history
    if(State.getNode().qid==qid) store.dispatch(State.updateGrade(State.rewriteHistoryItem(result)));


    //savedId = result.id
    //the evalCallback above should update the correct grade
    //id=result.id
    return result

  } catch (err) {
    console.log(err);
    alert("Error saving - file not saved")
    //window.localStorage.setItem("workbook-rescue-" + data.qid, JSON.stringify({ qid: data.qid, files: data.files }))
    //this.createSaveErrorDialog(null, function(font) { }, "A copy of your work has been retained locally. If the problem persists - login to the system again immediately and launch the workbook. You will then be offered the option to rescue your work.");
  }

}



var downloadGrades=async (gradebook)=>
  {
    var qids=State.getQids()
  
	
    var data={qids:qids,type:gradebook}

    let id=store.getState().workbook.selectedUser.id



    if(id!=null) data["id"]=id

    var result: any = await server.downloadGrades(data)

    //console.log(result);
    //create a master list of users
    var users={};
    var byUser={}

    for(var qid of qids)
    {

      result[qid].forEach((x)=>{
        users[x.uid]=true
        if(byUser[x.uid]==null) byUser[x.uid]={}
        byUser[x.uid][qid]=x.grade
      })
    }




    //now we have a list of users - lets sort them
    let userList=Object.keys(users);

    userList.sort()
    let usermap=store.getState().workbook.users

    let fullUserList=Object.keys(usermap)
    fullUserList.sort()

    //sort the qids
    qids.sort()

    let table="id\tusername\t"

    //Header row
    for(var qid of qids)
    {
      table=table+qid+"\t"
    }
    table+="\n"



    //are we only showing results for one user?
      if(id!=null)
      {
        fullUserList=[id]
      }


    for(var u of fullUserList)
    {
      table+=u+"\t"+usermap[u].username+"\t"
      for(var qid of qids)
      {
        var grade=null;

        if((byUser[u])&&(qid in byUser[u])) grade=byUser[u][qid]
        table+=((grade==null)?"\t":grade+"\t")
      }
      table+="\n"
    }

    table+="\n"


  var element = document.createElement("a");
   var file = new Blob([table], {type: 'text/plain'});
   element.href = URL.createObjectURL(file);
   element.download = "grades.csv";
   element.click();
 }





//===============================================================================================



var handleEvaluate=async (args)=>
{
  //console.log(args)
  var perms=await server.getRights(args)
  //console.log(perms)
  //perms.eval=false

  if (perms.eval == null) {
    var msg = "You don't have the right to eval. Check with your demonstrator if you think this is a mistake."
    throw(msg);
  }

  var result=await server.evalAttempt(args)

  //console.log("RESULT:",result)


  store.dispatch(State.updateGrade({ id: args.id, grade: result['grade'],type: perms.eval }));
  return result
}





 var launchEditor=async (o)=>
 {
  //console.log(o.id,o.qid)
  var node=State.getNode()
  console.log("NODE IS:::",node)
  

   var saveFirst=true




  var systemClipboard=(node["Disable external file upload, paste and drop external content"]===false)
  var userFiles=node["Requested files"]
  var files=JSON.parse(JSON.stringify(node.files)) //don't want to mess up original





  var canEvaluate=node.Evaluate
  
  var isGradebookOpen=node.Gradebook
  var title=node.title
  var isVisible=node.visible
  var qid=node.qid 
  var rights=await server.getRights({qid})


  
    //Need to load pervious attempt??
  if(o.id!=null)
  {
	  saveFirst=false
	console.log("LOADING PREVIOUS");
    try
    {
      var data={qid,id:o.id}
      let uid=store.getState().workbook.selectedUser.id

      console.log("STORE UID:",uid);
      if(uid!=null) 
      {
	      console.log('Acting as uid:',)
	      data["uid"]=uid
      }
      
      var fileData = await server.getAttempt(data) //await proc.request('/api',{method: 'post',body: {method:"getAttempt",args:{qid,id:o.id}}})

      var storedFiles=fileData.files
      for(var storedFile of storedFiles)
      {
        
        files[storedFile.name]=storedFile.contents
      }
    }
    catch(err)
    {
      console.log(err)
      alert("Could not load item")
      return
    }

  }
  
  

/*
  //Need to load pervious attempt??
  if(o.id!=null)
  {
    try
    {
      var fileData = await server.getAttempt({qid,id:o.id}) //await proc.request('/api',{method: 'post',body: {method:"getAttempt",args:{qid,id:o.id}}})

      var storedFiles=fileData.files
      for(var storedFile of storedFiles)
      {
        
        files[storedFile.name]=storedFile.contents
      }
    }
    catch(err)
    {
      console.log(err)
      alert("Could not load item")
      return
    }

  }
*/




  const args={
    systemClipboard,
    userFiles,
    files,
    canEvaluate,
    rights,
    isGradebookOpen,
    title,
    isVisible,
    qid,
    saveFirst,
    attemptId: (o?o.id:null),
    saveHandler: saveCallback,
    evalHandler: handleEvaluate
  }


  //console.log(args)


  var o = core.make("osjs/packages");
  o.core.run("editor", { editorBehaviour: EditorBehaviourWorkbook, editorArgs:args });
 }














  //console.log(args)
  //const logo = proc.resource('/src/about.png');


  //await proc.request('/test', {method: 'post'});

  //
  //console.log("CONSENT!:",consents)


  //var consents={}



  

  // Create  a new Window instance
  const window = proc.createWindow({
    id: 'Workbook',
    title: metadata.title.en_EN,
    dimension: {width: 640, height: 480},
    position: {left: 0.5, top: 0.1},
    attributes:{
      closeable:true,
      ontop:false,
      clamp:true,
      minimizable: false,
      visibility: "restricted",
      minDimension: {width: 640, height: 480}
    }
  })
    .on('destroy', () => {
      //console.log("DESTROYING")
      proc.destroy(true)
    })
    .on('destroy-window', (w,p) => {
     //console.log("WDESTROYING")
      p.destroy(true)
    })
    .on('attention',(args, options)=>{
     // console.log("ATTENTION!")
    })
    //constrain to desktop (not great if desktop resizes!)
    .on('moved',(pos,win)=>{

      win.clampToViewport()
      var pos2=win.getState("position")
      if(pos2.left<0) {pos2.left=0; win.setPosition(pos2)};
    })

  window.setIcon(`apps/${metadata.name}/icon.png`)

  window.render(async ($content) =>
    {

      {
        //var res = await proc.request('getFullWorkbook',{method: 'post'})
        var res = await server.getFullWorkbook({})
        var workbook=res
       // console.log(res)
       // console.log("DONE---------------------------------------------------------------------------")
    
        //var userlist=await proc.request('getUserList')
        var userlist=await server.getUserList({})
    
        store.dispatch(setUsers(userlist))
        store.dispatch(setWorkbookContents(workbook))
      //console.log("!!!!!!!!!!!!!!!!!!!!!",workbook[0])
        store.dispatch(workbookSelectItem([workbook[0].title]))
    
        var isAdmin=await server.isAdmin()

       // console.log("**************************************************")
       // console.log("Is admin?",isAdmin)

      var edit = false;
      var view = false;
      if (user.roles && user.roles.indexOf("lecturer") != -1) { edit = true; view = true; }
      view=true
      store.dispatch(setRights({edit:edit,view:view}))
    }
    





      /*var consents=await proc.request('/consent')
      if(consents==null) consents={}


      //ensure default fields
      consents={
          interaction: false,
          performance: false,
          code: false,
          feedback: false,
          ...consents
        }*/

      ReactDOM.render(React.createElement(Provider,{store:store},React.createElement(App,{proc:proc,launchEditor: launchEditor, downloadGrades,compileWorkbook: compileWorkbook(proc),user:user,theme:theme,autoLaunch:args.auto})), $content);
    });


  // Creates a new WebSocket connection (see server.js)
  //const sock = proc.socket('/socket');
  //sock.on('message', (...args) => console.log(args))
  //sock.on('open', () => sock.send('Ping'));

  // Use the internally core bound websocket
  //proc.on('ws:message', (...args) => console.log(args))
  //proc.send('Ping')

  // Creates a HTTP call (see server.js)
  //proc.request('/test', {method: 'post'})
  //.then(response => console.log(response));


    //new EditorBehaviourWorkbook(core,proc)

  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
