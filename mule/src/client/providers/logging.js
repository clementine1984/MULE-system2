"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingServiceProvider = void 0;
const common_1 = require("@osjs/common"); // Optional: Use the official base class
var pako = require("pako");
var axios = require("axios");
//=======================================================================================================================================================================================
class CacheBlock {
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
            });
            transport('/lass/log', {
                method: "post",
                data: payload,
                headers: { 'content-type': 'application/octet-stream' }
            });
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
            if (this.block.itemCount() == 0 && sendEmptyBlocks)
                this.log("idle");
            //call any prep functions
            for (var i in this.beforeFlush) {
                this.beforeFlush[i]();
            }
            if (this.block.itemCount() == 0 && !sendEmptyBlocks)
                return;
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
        this.isDirty = () => {
            var temp = this.dirty;
            this.dirty = false;
            return temp;
        };
        setTimeout(this.timeoutfun, this.timeout * 1000);
    }
}
//==================================================================================================================================
class LoggingServiceProvider extends common_1.ServiceProvider {
    provides() {
        return ["client/log/api"];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = new Logger(1024, 30, false);
            this["core"].singleton("client/log/api", () => ({
                log: data => {
                    console.log('request to log:', data);
                    this.logger.log(data);
                }
            }));
        });
    }
}
exports.LoggingServiceProvider = LoggingServiceProvider;
//# sourceMappingURL=logging.js.map