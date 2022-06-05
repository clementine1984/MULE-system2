"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pako = require('pako');
const assert = require('assert');
// Import third-party libraries (managed by npm)
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var jwt = require('jsonwebtoken');
const Database_1 = require("./Database");
var util = require("util");
var cookieParser = require('cookie-parser');
var session = require('express-session');
const fs = require('fs');
var JWT_SECRET = process.env.JWT_SECRET;
var SECRET = process.env.SECRET;
process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', promise, 'reason:', reason.stack || reason);
});
//===============================================================================
var app = express();
app.use(bodyParser.json({ type: 'application/json', limit: '4mb' }));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '4mb' }));
//TODO: we rely on the session ID being served up by the mule server
app.use(cookieParser(SECRET));
//No static assets
//app.use('/', express.static('assets'));
var httpServer = http.createServer(app);
Database_1.instance.startSocketServer(httpServer);
//===============================================================================
// Some logging
//===============================================================================
const logRequestStart = (req, res, next) => {
    console.info(`${req.method} ${req["originalUrl"]}`);
    next();
};
app.use(logRequestStart);
//================================================================================
// Middleware
//================================================================================
function isJSON(req, res, next) {
    //only accept json posts
    var contype = req.headers['content-type'];
    if (!contype || contype.indexOf('application/json') !== 0)
        return res.send(415);
    next();
}
//===============================================================================
function checkToken(req, res, next) {
    var token = null;
    var parts;
    try {
        try {
            parts = req.headers.authorization.split(' ');
        }
        catch (err) {
            throw { "name": "JsonWebTokenError", "message": "Missing auth header" };
        }
        assert(parts.length == 2, { "name": "JsonWebTokenError", "message": "Malformed auth header" });
        var scheme = parts[0];
        var credentials = parts[1];
        assert(/^Bearer$/i.test(scheme), { "name": "JsonWebTokenError", "message": "Malformed auth header" });
        token = credentials;
        req.decoded = jwt.verify(token, JWT_SECRET);
        return next();
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
}
;
//===============================================================================
const User_1 = require("./User");
const UserSettings_1 = require("./UserSettings");
const Consent_1 = require("./Consent");
const Attempt_1 = require("./Attempt");
//===============================================================================
app.get("/ping", async function (req, res) {
    try {
        res.status(200).end();
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
//==============================================================================
app.get("/user/:id", async function (req, res) {
    try {
        //assert(req.decoded.id == req.params.id, { "name": "JsonWebTokenError", "message": "Cannot get data for user of different id" });
        var result = await User_1.default.getJSON({ id: req.params.id });
        console.log(result);
        if (result == null)
            return res.status(404).json({ "message": "not found" });
        res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
//===============================================================================
//This route should be protected....
app.get("/search/user/username/:username", async function (req, res) {
    try {
        //assert(req.decoded.id == req.params.id, { "name": "JsonWebTokenError", "message": "Cannot get data for user of different id" });
        var result = await User_1.default.getJSON({ username: req.params.username });
        res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
//===============================================================================
app.get("/user/:id/settings", async function (req, res) {
    try {
        //assert(req.decoded.id == req.params.id, { "name": "JsonWebTokenError", "message": "Cannot get data for user of different id" });
        var result = await UserSettings_1.default.getJSON({ id: req.params.id });
        res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
//===============================================================================
app.post("/user/:id/settings", async function (req, res) {
    try {
        //assert(req.decoded.id == req.params.id, { "name": "JsonWebTokenError", "message": "Cannot get data for user of different id" });
        var settings = UserSettings_1.default.fromJSON(req.body);
        settings["id"] = req.params.id;
        await settings.create();
        return res.status(200).json(settings["id"]);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/user/:id/consent", async function (req, res) {
    try {
        var consent = Consent_1.default.fromJSON(req.body);
        assert(req.params.id === req.body.uid);
        assert(req.body.id == null);
        await consent.create();
        return res.status(200).json(consent["id"]);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.get("/user/:uid/consent", async function (req, res) {
    try {
        var result = await Consent_1.default.getJSON({ uid: req.params.uid });
        console.log(result);
        console.log("sending consent data");
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.get("/getGrades/:qid/:type", async function (req, res) {
    try {
        let type = req.params.type;
        if (type === "ca")
            type = "grade"; //mapping of names (ca uis stored as grade in DB)
        var results = await Attempt_1.default.getGrades(req.params.qid, type);
        return res.status(200).json(results);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.get("/users/:course/:consumer", async function (req, res) {
    try {
        var result = await User_1.default.getUsers(req.params.course, req.params.consumer);
        console.log(result);
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.get("/users/:course", async function (req, res) {
    try {
        var result = await User_1.default.getUsers(req.params.course);
        console.log(result);
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.get("/users", async function (req, res) {
    try {
        var result = await User_1.default.getUsers();
        console.log(result);
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/setGrade/:id", async function (req, res) {
    try {
        var grade = req.body.grade;
        var type = req.body.type;
        var result = await Attempt_1.default.setGrade(req.params.id, grade, type);
        console.log(result);
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/setAttempt/:uid", async function (req, res) {
    try {
        var attempt = Attempt_1.default.fromJSON(req.body);
        assert(req.params.uid === req.body.uid);
        //there is a policy that if the last stored assignment has no grade, and this also has no grade, then the old stored assignment is removed
        //if this has a grade, then any assignments with no grade are removed too
        //so - just remove all assignments with a grade of null and a personal grade of null before storing this one
        //Attempt.clearUngradedAttempts(req.body.uid,req.body.qid);
        console.log(JSON.stringify(attempt, null, 4));
        var result;
        if (req.body.id != null)
            result = await attempt.update();
        else
            result = await attempt.create();
        return res.status(200).json(result);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/getAttempt/:uid", async function (req, res) {
    try {
        assert(req.params.uid === req.body.uid);
        //are we getting a sepcific attempt by ID?
        if (req.body.id != null) {
            var attempt = await Attempt_1.default.getJSON({ "id": req.body.id });
            assert(attempt.uid === req.body.uid);
            return res.status(200).json(attempt);
        }
        var attempt = await Attempt_1.default.getJSON({ "uid-qid": [req.body.uid, req.body.qid] });
        console.log(attempt);
        return res.status(200).json(attempt);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/getAttemptHistory/:uid", async function (req, res) {
    try {
        assert(req.params.uid === req.body.uid);
        var attempt = await Attempt_1.default.getHistory(req.body.uid, req.body.qid);
        console.log(attempt);
        return res.status(200).json(attempt);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/getGrade/:uid", async function (req, res) {
    try {
        assert(req.params.uid === req.body.uid);
        var attempt = await Attempt_1.default.getBest({ "uid-qid": [req.body.uid, req.body.qid] });
        console.log(attempt);
        return res.status(200).json(attempt);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
app.post("/getPersonalBest/:uid", async function (req, res) {
    try {
        assert(req.params.uid === req.body.uid);
        var attempt = await Attempt_1.default.getPersonalBest({ "uid-qid": [req.body.uid, req.body.qid] });
        console.log(attempt);
        return res.status(200).json(attempt);
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
});
//===============================================================================
app.post("/user", isJSON, async function (req, res) {
    var user;
    try {
        await User_1.default.validate(req.body);
        //var result=await User.get({username:req.body.username})
        user = User_1.default.fromJSON(req.body);
        //await user.validate();
        await user.validateForNewUserCreation();
        //await UserValidator(user);
        await user.create();
        return res.status(200).json(user.id);
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});
//===============================================================================
app.put("/user/:uid", isJSON, async function (req, res) {
    var user;
    try {
        await User_1.default.validate(req.body);
        //var result=await User.get({username:req.body.username})
        user = User_1.default.fromJSON(req.body);
        //await user.validate();
        //await user.validateForNewUserCreation()
        //await UserValidator(user);
        await user.create();
        return res.status(200).json(user.id);
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});
//===============================================================================
var fileStream = fs.createWriteStream('logs' + (Date.now()) + '.dat', { flags: 'a' });
var logEntries = 0;
app.post("/external/log", async function (req, res) {
    try {
        //var sessid=req.session.id
        var buff = req.body;
        console.log(buff);
        var arr = new Uint8Array(buff);
        if (req.signedCookies == null)
            throw "not permitted";
        if (req.signedCookies['connect.sid'] == null)
            throw "not permitted";
        if (req.signedCookies['connect.sid'] == false)
            throw "not permitted";
        var sessid = req.signedCookies['connect.sid'];
        console.log(sessid);
        logEntries++;
        if (logEntries > 9) {
            fileStream.close();
            fileStream = fs.createWriteStream('logs-' + (Date.now()) + '.dat', { flags: 'a' });
            logEntries = 0;
        }
        //console.log(pako.ungzip(arr,{ to: 'string' }));
        var json = { "sessid": sessid, "data": arr };
        var dataBuffer = Buffer.from(sessid, 'utf8');
        fileStream.write("\n" + sessid + "\n");
        //dataBuffer =new Buffer(arr, 'base64');
        fileStream.write(arr);
        //await Log.validate(json);
        //var result=await User.get({username:req.body.username})
        //  console.log("JSON2: ",json)
        //var log = Log.fromJSON(json);
        //await UserValidator(user);
        //await log.create();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});
//===============================================================================
// Look up userID from username
/*
app.get("/token/:username", async function(req, res) {
  try {
        var result=await User.getJSON({username:req.params.username})
        console.log(JSON.stringify(result,null,4))

    var mounts={}

    //get the mounts that are permitted
    for(var k in result["mounts"])
    {
      var m=result["mounts"][k]

      if((m["options"]!=null)&&(m["options"]["host"])!=null)
      {
        var ro=false;
        if(m["readOnly"]!=null) ro=m["readOnly"]

        mounts[m["options"]["host"]]=(ro?"ro":"rw")
      }
    }



    console.log(JSON.stringify(mounts,null,4))



        if(result==null) return res.status(404).json({"message":"not found"});
    var token = jwt.sign(
            {
                username: result['username'],
                id: result['id'],
        mounts: mounts
            }, JWT_SECRET,{expiresIn:60*60});
    res.status(200).send(token)
}
    catch (err) {
    console.log(err)
    return res.status(401).json(err);
  }

});
*/
//===============================================================================
// Start the HTTP server on port 8080
httpServer.listen(8080);
console.log('Server started');
//# sourceMappingURL=index.js.map