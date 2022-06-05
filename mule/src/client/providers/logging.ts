import {ServiceProvider} from "@osjs/common"; // Optional: Use the official base class

var pako = require("pako");
var axios = require("axios");

//=======================================================================================================================================================================================
class CacheBlock {
  //start:number;
  //finish:any;
  items: any;

  constructor() {
    //this.start=(new Date()).getTime();
    this.items = [];
  }

  addItem(item) {
    this.items.push({ time: new Date().getTime(), data: item });
  }

  close() {
    //this.finish=(new Date()).getTime();
  }

  itemCount() {
    return this.items.length;
  }
}

//=======================================================================================================================================================================================
class Logger {
  maxlength: number;
  timeout: number;
  sendEmptyBlocks: boolean;
  block: CacheBlock;
  timeoutfun: any;
  flush: any;
  flushfun: any;
  beforeFlush: any;
  dirty: boolean;
  log: any;
  registerFlushFun: any;
  registerBeforeFlushFun: any;
  isDirty: any;

  constructor(maxlength, timeout, sendEmptyBlocks) {
    this.beforeFlush = [];
    this.block = new CacheBlock();
    this.maxlength = maxlength;
    this.timeout = timeout;
    this.sendEmptyBlocks = sendEmptyBlocks;
    this.dirty = true;

    this.flushfun = payload => {
      /*jquery.ajax({
        type: "POST",
        contentType: "application/octet-stream",
        processData: false,
        url: "/lass/log",
        data: payload
      });*/
      const transport = axios.create({
        withCredentials: true
      })

      transport('/lass/log',{
        method: "post",
        data: payload,
        headers: { 'content-type': 'application/octet-stream' }
      })

      /*fetch('/lass/log', {
        method: 'post',
        body: payload,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })*/

      console.log("Dumping log", payload);
    };

    this.flush = () => {
      if (this.block.itemCount() == 0 && sendEmptyBlocks) this.log("idle");

      //call any prep functions
      for (var i in this.beforeFlush) {
        this.beforeFlush[i]();
      }


      if (this.block.itemCount() == 0 && !sendEmptyBlocks) return;

      this.block.close();

      var tempblock = this.block.items;
      this.block = new CacheBlock();

      var strdata = JSON.stringify(tempblock);

      var strdataz = pako.gzip(strdata);
      this.flushfun(strdataz);
    };

    this.timeoutfun = () => {
      this.flush();
      setTimeout(this.timeoutfun, this.timeout * 1000);
    };

    this.log = str => {
      this.dirty = true;
      this.block.addItem(str);
    };

    this.registerFlushFun = fun => {
      this.flushfun = fun;
    };

    this.registerBeforeFlushFun = fun => {
      this.beforeFlush.push(fun);
    };

    //has there been any logging since the last call to isDirty????
    this.isDirty = () =>
      //TODO: this is just for one client (since the flag gets cleared when called)
      {
        var temp = this.dirty;
        this.dirty = false;
        return temp;
      };

    setTimeout(this.timeoutfun, this.timeout * 1000);
  }
}

//==================================================================================================================================




export class LoggingServiceProvider extends ServiceProvider {
  logger:any

  provides() {
    return ["client/log/api"];
  }

  async init() {
    this.logger=new Logger(1024,30,false);

    this["core"].singleton("client/log/api", () => ({
      log: data => 
      {
        console.log('request to log:',data)
        this.logger.log(data)
      }
    }));
  }
}
