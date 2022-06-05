import { createStore, combineReducers } from "redux";
import { createSelector } from 'reselect'
var moment = require('moment');


export const panelReducer = (state={}, { type }) => {
  var newstate=JSON.parse(JSON.stringify(state));
  console.log(type, state);
  switch (type) {
    case "OPEN_ADMIN":
    {
      newstate['admin']=true;
      newstate['iframe']=false;
      newstate['history']=false;
      return newstate;
    }
    case "OPEN_IFRAME":
    {
      newstate['admin']=false;
      newstate['iframe']=true;
      newstate['history']=false;
      return newstate;
    }
    case "OPEN_HISTORY":
    {
      newstate['admin']=false;
      newstate['iframe']=false;
      newstate['history']=true;
      return newstate;
    }
    case "CLOSE_DRAWER":
    {
      newstate['drawer']=false;
      return newstate;
    }
    case "OPEN_DRAWER":
    {
      newstate['drawer']=true;
      return newstate;
    }
    case "TOGGLE_DRAWER":
    {
      newstate['drawer']=!newstate['drawer'];
      return newstate;
    }
    default:
      return state;
  }
};

export const iframeReducer = (state ={}, { type, payload }) => {
  console.log("IFRAME",type, payload);
  switch (type) {
    case "SET_IFRAME":
      return { contents: payload };
    default:
      return state;
  }
};




export const workbookReducer = (state ={}, { type, payload }) => {
  var newstate=JSON.parse(JSON.stringify(state));
  switch (type) {
    case "SET_WORKBOOK":
    {
      newstate.contents=payload
      return newstate
    }
    case "SET_USERS_WORKBOOK":
    {
      newstate.users=payload
      return newstate
    }
    case "SELECT_WORKBOOK":
    {
      newstate.selected=payload;
      return newstate
    }
    case "SELECT_USER_WORKBOOK":
    {
      console.log("REDUCER SETTING:",payload)
      newstate["selectedUser"]=payload
      console.log("newstate:",newstate)
      return newstate
    }
    case "SET_RIGHTS":
    {
      newstate["rights"]=payload
      return newstate
    }

    default:
      return state;
  }
};





export const historyReducer = (state ={}, { type, payload }) => {
  var newstate=JSON.parse(JSON.stringify(state));



  switch (type) {
    case "SET_GRADEDIALOG_STATE":
    {
      newstate.gradeDialog=payload
      return newstate
    }
    case "UPDATE_GRADE":
    {
      console.log("UPdating hotory with",payload)
      if(newstate.table[payload.id]==null) newstate.table[payload.id]={}
      Object.keys(payload).map((x)=> newstate.table[payload.id][x]=payload[x])
      return newstate
    }
    case "SET_HISTORY":
    {
      newstate.table=payload
      return newstate
    }
    default:
      return state;
  }

};








export const navlistReducer = (state={}, { type,payload }) => {
  console.log(type, state);
  switch (type) {
    case "CLOSE_NAVLIST":
    {
      let key=payload.join(".");
      let newstate=JSON.parse(JSON.stringify(state));
      newstate.expanded[key]=false;
      return newstate;
    }
    case "OPEN_NAVLIST":
    {
      let key=payload.join(".");
      let newstate=JSON.parse(JSON.stringify(state));
      newstate.expanded[key]=true;
      return newstate;
    }
    case "SET_NAVLIST":
    {
      let key=payload.join(".");
      let newstate=JSON.parse(JSON.stringify(state));
      newstate.expanded[key]=payload;
      return newstate;
    }
    case "TOGGLE_NAVLIST":
    {
      let key=payload;
      let newstate=JSON.parse(JSON.stringify(state));
      let newval=true;
      if(newstate.expanded[key]===true) newval=false;
      newstate.expanded[key]=newval;
      return newstate;
    }
    default:
      return state;
  }
};


const reducers = combineReducers({
  panels: panelReducer,
  navlist: navlistReducer,
  iframe: iframeReducer,
  workbook: workbookReducer,
  history: historyReducer
});

export const store = createStore(reducers, {
  panels: { drawer: false, iframe: true, admin: false, attempts: false },
  navlist: {expanded: {}},
  iframe: { contents: [] },
  workbook: { rights: {}, contents: [], selected: [], users: {}, selectedUser: "", bestCA:null, bestPersonal:null },
  history: { table: {}, gradeDialog: { id: null, open: false, type: null, grade: null }}
},window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export const openDrawer = () => {
  return { type: "OPEN_DRAWER" };
};

export const openAdmin = () => {
  return { type: "OPEN_ADMIN" };
};
export const openHistory = () => {
  return { type: "OPEN_HISTORY" };
};


export const openIframe = () => {
  return { type: "OPEN_IFRAME" };
};


export const closeDrawer = () => {
  return { type: "CLOSE_DRAWER" };
};
export const toggleDrawer = () => {
  return { type: "TOGGLE_DRAWER" };
};

export const setIframeContents = contents => {
  return { type: "SET_IFRAME", payload: contents };
};

export const setWorkbookContents = contents => {
  return { type: "SET_WORKBOOK", payload: contents };
};

export const workbookSelectItem = wpath => {
  return { type: "SELECT_WORKBOOK", payload: wpath };
};

export const setUsers = contents => {
  return { type: "SET_USERS_WORKBOOK", payload: contents };
};

export const selectUser = contents => {
  console.log("SELECT USER:",contents)
  return { type: "SELECT_USER_WORKBOOK", payload: contents };
};

export const setRights= contents => {
  return { type: "SET_RIGHTS", payload: contents };
};

export const setGradeDialog = contents => {
  return { type: "SET_GRADEDIALOG_STATE", payload: contents };
};

export const updateGrade = contents => {
  return { type: "UPDATE_GRADE", payload: contents };
};



export const setHistory = contents => {
  return { type: "SET_HISTORY", payload: contents };
};



export const setQid = contents => {
  return { type: "SET_QID", payload: {} };
};



/*const setNavList = open => {
  return { type: "SET_NAVLIST", payload: open };
};*/
export const toggleNavList = (payload) => {
  return { type: "TOGGLE_NAVLIST", payload: payload.join(".") };
};





export function getMostRecentAttempt()
{
  var s=store.getState()
  var rows=s.history.table
  var keys=Object.keys(s.history.table)
  if(keys.length==0) return null

  var order=[]
  keys.forEach((k)=>{
      order.push(rows[k])
  })
  order.sort((a,b) => {return b.order-a.order });

  return order[0].id
}




const qid=(state)=>{
  return getNode(state).qid
}


export const getQid = createSelector(
  [ qid, ],
  (qid) => {
    return qid } )








export function getNode(st)
  {
    console.log("ST IS:",st)
    var s=null
    if(st==null)
      s=store.getState().workbook
    else {
      s=st.workbook
    }
    var path=s.selected
    var contents=s.contents

      var current=contents;
      var finder=(x)=>{ return (x.title===path[i])}
      for(var i=0;i<path.length;i++)
      {
        current=(current.find(finder))
        if(i<path.length-1) current=current.children;
      }
      return current;

  }



//get all qids under the current path
export function getQids()
{
  let collected=[]
  let process=(x)=>
  {
    if(x.qid!=null) collected.push(x.qid)
    if(x.children)
    {
      x.children.forEach(process);
    }
  }


  var n=getNode()
  process(n)
  return collected
}














export function rewriteHistoryItem(x)
{
  x.created=moment(x.modified).format('MMM DD, YYYY, h:mm A');
  x.order=moment(x.modified).valueOf();
  x.type=null


  if(x.grade!=null)
  {
    x.type="ca"
  }
  else if(x.personal!=null)
  {
    x.type="personal"
    x.grade=x.personal
  }

  //only allow certain fields
  for(var k of Object.keys(x))
  {
    if(["order","grade","id","modified","personal","created","type","personal"].indexOf(k)==-1) delete x[k]
  }


  return x
}
