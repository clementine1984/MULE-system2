"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var rp = require("request-promise");
var assert = require("assert");
var path = require("path");
var WebSocketWrapper_1 = require("../editor/WebSocketWrapper");
var NodeWebSocket = require('ws');
//==============================================================================================
// Support functions for API
//==============================================================================================
function getAttempt(data) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/getAttempt/" + data.uid,
                        method: "POST",
                        json: true,
                        body: data
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1.stack);
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getHistory(data) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/getAttemptHistory/" + data.uid,
                        method: "POST",
                        json: true,
                        body: data
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_2 = _a.sent();
                    console.log(err_2.stack);
                    throw err_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveAttempt(data) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/setAttempt/" + data.uid,
                        method: "POST",
                        json: true,
                        body: data
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_3 = _a.sent();
                    console.log(err_3.stack);
                    throw err_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getGrades(qid, type) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/getGrades/" + qid + "/" + type + "/",
                        method: "GET",
                        json: true
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_4 = _a.sent();
                    console.log(err_4.stack);
                    throw err_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUsers(course, consumer) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/users/" + course + "/" + consumer + "/",
                        method: "GET",
                        json: true
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_5 = _a.sent();
                    console.log(err_5.stack);
                    throw err_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var WebsocketServer = require("ws").Server;
function getNode(core, user, qid) {
    return __awaiter(this, void 0, void 0, function () {
        var workbook, scan;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkbookFile(core, user, "workbooks.json")];
                case 1:
                    workbook = _a.sent();
                    scan = function (node) {
                        if ((node.qid) && (node.qid == qid))
                            return node;
                        if ((node.children) && (node.children.length > 0)) {
                            for (var i = 0; i < node.children.length; i++) {
                                var x = scan(node.children[i]);
                                if (x != null)
                                    return x;
                            }
                        }
                        return null;
                    };
                    return [2 /*return*/, scan(workbook)];
            }
        });
    });
}
function handleEvalAttempt(core, user, data, adminUser) {
    if (adminUser === void 0) { adminUser = false; }
    return __awaiter(this, void 0, void 0, function () {
        var matchedNode, evalTo, requestedFiles, datap, result, files, evalScript, cee, availableResponse, submitResponse, executionUrl, result, sock, grade, results, maxlen, status, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("EVAL ADMIN:", adminUser);
                    return [4 /*yield*/, getNode(core, user, data.qid)];
                case 1:
                    matchedNode = _a.sent();
                    if (matchedNode == null)
                        throw "Unable to find problem in workbook with qid:" + data.qid;
                    evalTo = null;
                    if (!!adminUser) return [3 /*break*/, 3];
                    return [4 /*yield*/, canEvaluate(core, data.ip, user, matchedNode)];
                case 2:
                    evalTo = _a.sent();
                    if (evalTo == null)
                        throw "You don't have the right to eval. Check with your demonstrator if you think this is a mistake.";
                    assert(((evalTo == "ca") || (evalTo == "personal")), "unknown grade destination:" + evalTo);
                    _a.label = 3;
                case 3:
                    requestedFiles = matchedNode["Requested files"];
                    //if (requestedFiles.length > 2) throw "Multiple requested files >2 not yet supported"
                    if (requestedFiles.length == 0)
                        throw "No requested files";
                    datap = {
                        uid: data.uid,
                        qid: data.qid,
                        id: data.id //,
                        // grade: grade
                    };
                    return [4 /*yield*/, getAttempt(datap)];
                case 4:
                    result = _a.sent();
                    console.log("Evaluating:", result.files);
                    files = {};
                    result.files.forEach(function (element) {
                        files[element.name] = { content: element.contents };
                    });
                    evalScript = matchedNode['files']['vpl_evaluate.sh'];
                    files["vpl_run.sh"] = { content: evalScript };
                    cee = core.make('mule/cee');
                    return [4 /*yield*/, cee.available()];
                case 5:
                    availableResponse = _a.sent();
                    if (availableResponse.status !== 'ready') {
                        throw new Error("The service is busy! Try again later...");
                    }
                    return [4 /*yield*/, cee.submit({
                            command: 'evaluate',
                            files: files
                        }, {
                            maxTime: availableResponse.maxTime,
                            maxFileSize: availableResponse.maxFileSize,
                            maxMemory: availableResponse.maxMemory
                        })];
                case 6:
                    submitResponse = _a.sent();
                    executionUrl = cee.getExecutionUrl(submitResponse.executionTicket);
                    result = new NodeWebSocket(executionUrl);
                    sock = new WebSocketWrapper_1["default"](result);
                    grade = null;
                    results = "";
                    maxlen = 1024 * 16;
                    status = "ok";
                    //Watch out for compilation succeeding
                    sock["receiveFilter"] = function (msg) {
                        //console.log("CHECKING:",msg)
                        if (msg.trim() == "Jail: execution time limit reached.") {
                            console.log("Evaluation time limit exceeded - your program is taking too long to be evaluated");
                            status = "Evaluation time limit exceeded";
                            return "Evaluation time limit exceeded - your program is taking too long to be evaluated";
                        }
                        maxlen = maxlen - msg.length;
                        if (maxlen < 0) {
                            status = "Console output limit exceeded";
                            sock.close();
                            return "Console output limit exceeded - your program is printing too much to be evaluated";
                        }
                        var gradeExtractor = /^Grade\s\:\=\>\>\s([0-9]+)$/gm;
                        var match = gradeExtractor.exec(msg);
                        if ((match != null) && (match.length > 1)) {
                            grade = parseInt(match[1]);
                            console.log("GOT A GRADE:", grade);
                            //console.log("Should send an 'evaluated' message to user here. User is:",user)
                            //core.broadcastUser(user.username, 'evaluated', {acomplex: "object"}, 2 , 3);
                        }
                        if (grade != null) {
                            var newMessage = "You got a grade of " + grade;
                            if (adminUser)
                                newMessage += "\n===================================\nNote: You are an admin user - this grade has not been saved anywhere.\nTo change the grade for a student, you can edit it in the history panel.";
                            return msg.replace(gradeExtractor, newMessage);
                        }
                        else
                            return msg;
                    };
                    //We have to add an event listener in order for the filter to work TODO: fix this!
                    sock.addEventListener("message", function (d) {
                        results += d.data;
                    });
                    promise = new Promise(function (resolve, reject) {
                        sock.onclose = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var t, d, result, err_6;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!((!adminUser) && (status == "ok"))) return [3 /*break*/, 4];
                                            t = evalTo;
                                            d = {
                                                id: data.id,
                                                type: t,
                                                grade: grade
                                            };
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, setGrade(d)];
                                        case 2:
                                            result = _a.sent();
                                            assert(result.id == data.id, "Error saving grade item");
                                            return [3 /*break*/, 4];
                                        case 3:
                                            err_6 = _a.sent();
                                            console.log("ERROR:", err_6);
                                            return [2 /*return*/, reject(err_6)];
                                        case 4:
                                            console.log("RESOLVING: ", { raw: results, grade: grade });
                                            return [2 /*return*/, resolve({ raw: results, grade: grade })];
                                    }
                                });
                            });
                        };
                    });
                    return [2 /*return*/, promise];
            }
        });
    });
}
function getWorkbookFile(core, user, file) {
    return __awaiter(this, void 0, void 0, function () {
        var course;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert(user.consumerId != null);
                    assert(user.courseId != null);
                    assert(user.courseUserId != null);
                    course = core.make('mule/course');
                    return [4 /*yield*/, course.readFile(user, path.join('workbooks', file))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function putWorkbookFile(core, user, file, text) {
    return __awaiter(this, void 0, void 0, function () {
        var course;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert(user.consumerId != null);
                    assert(user.courseId != null);
                    assert(user.courseUserId != null);
                    course = core.make('mule/course');
                    return [4 /*yield*/, course.writeFile(user, path.join('workbooks', file), text)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getWorkbookDir(core, user, path) {
    return __awaiter(this, void 0, void 0, function () {
        var course;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert(user.consumerId != null);
                    assert(user.courseId != null);
                    assert(user.courseUserId != null);
                    course = core.make('mule/course');
                    return [4 /*yield*/, course.scanDir(user, path.join('workbooks', path))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function canRead(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    console.log(context);
                    console.log("TEST:", metadata["visible"]);
                    return [4 /*yield*/, core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["visible"], false)];
                case 1:
                    result = _a.sent();
                    console.log("RESULT:", result);
                    return [2 /*return*/, result];
            }
        });
    });
}
function setGrade(data) {
    return __awaiter(this, void 0, void 0, function () {
        var options, result, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        uri: "http://lass:8080/setGrade/" + data.id,
                        method: 'POST',
                        json: true,
                        body: data
                    };
                    return [4 /*yield*/, rp(options)];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/, result];
                case 2:
                    err_7 = _a.sent();
                    console.log(err_7.stack);
                    throw err_7;
                case 3: return [2 /*return*/];
            }
        });
    });
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
function processFolder(core, user, folder, inherited) {
    return __awaiter(this, void 0, void 0, function () {
        var inheritable, metadata, e_1, obj, k, inheritedFeatures, _i, inheritable_1, j, desc, e_2, files, _a, files_1, f, contents, subfolders, _b, subfolders_1, s, child;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("Processing ", folder);
                    inheritable = [
                        "visible",
                        "Run",
                        "Evaluate",
                        "Automatic grade",
                        "copy",
                        "paste"
                    ];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getWorkbookFile(core, user, path.join(folder, "metadata.json"))];
                case 2:
                    //console.log("Calling getfile");
                    metadata = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _c.sent();
                    //console.log("Error Calling getfile",e);
                    return [2 /*return*/, null];
                case 4:
                    obj = metadata;
                    //any inherited features?
                    if (inherited) {
                        for (k in inherited) {
                            if (!(k in obj))
                                obj[k] = inherited[k];
                        }
                    }
                    inheritedFeatures = {};
                    for (_i = 0, inheritable_1 = inheritable; _i < inheritable_1.length; _i++) {
                        j = inheritable_1[_i];
                        if (j in obj)
                            inheritedFeatures[j] = obj[j];
                    }
                    console.log("Inheriting:", inheritedFeatures);
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, getWorkbookFile(core, user, path.join(folder, "description.html"))];
                case 6:
                    desc = _c.sent();
                    obj["description"] = desc;
                    return [3 /*break*/, 8];
                case 7:
                    e_2 = _c.sent();
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, getWorkbookDir(core, user, folder)];
                case 9:
                    files = (_c.sent())
                        .filter(function (x) {
                        return x.type == "file";
                    })
                        .map(function (x) {
                        return x.basename;
                    });
                    files = files.filter(function (x) {
                        return x != "description.html";
                    });
                    files = files.filter(function (x) {
                        return x != "metadata.json";
                    });
                    obj["files"] = {};
                    _a = 0, files_1 = files;
                    _c.label = 10;
                case 10:
                    if (!(_a < files_1.length)) return [3 /*break*/, 13];
                    f = files_1[_a];
                    return [4 /*yield*/, getWorkbookFile(core, user, path.join(folder, f))];
                case 11:
                    contents = _c.sent();
                    obj["files"][f] = contents;
                    _c.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13: return [4 /*yield*/, getWorkbookDir(core, user, folder)];
                case 14:
                    subfolders = (_c.sent())
                        .filter(function (x) {
                        return x.type == "directory";
                    })
                        .map(function (x) {
                        return x.basename;
                    });
                    _b = 0, subfolders_1 = subfolders;
                    _c.label = 15;
                case 15:
                    if (!(_b < subfolders_1.length)) return [3 /*break*/, 18];
                    s = subfolders_1[_b];
                    return [4 /*yield*/, processFolder(core, user, path.join(folder, s), inheritedFeatures)];
                case 16:
                    child = _c.sent();
                    if (child != null) {
                        if (obj.children)
                            obj.children.push(child);
                        else
                            obj.children = [child];
                    }
                    _c.label = 17;
                case 17:
                    _b++;
                    return [3 /*break*/, 15];
                case 18:
                    if (obj.children != null)
                        obj.children.sort(function (a, b) {
                            if (a.title < b.title)
                                return -1;
                            if (a.title > b.title)
                                return 1;
                            return 0;
                        });
                    return [2 /*return*/, obj];
            }
        });
    });
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
function canEvaluate(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context, temp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    return [4 /*yield*/, core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["Evaluate"], false)];
                case 1:
                    temp = _a.sent();
                    console.log("CANEVALUATE:", temp);
                    return [2 /*return*/, temp];
            }
        });
    });
}
function canSubmit(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    return [4 /*yield*/, core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["Gradebook"], false)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function canRun(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    return [4 /*yield*/, core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["Run"], false)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
//Note this is inverted!
function canPaste(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    return [4 /*yield*/, (core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["paste"], null))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function canCopy(core, ip, user, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        user: user,
                        ip: ip
                    };
                    return [4 /*yield*/, (core
                            .make("server/constraints/api")
                            .evalConstraint(context, metadata["copy"], null))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getCourseConfig(core, user) {
    return __awaiter(this, void 0, void 0, function () {
        var courseConfig, course, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    courseConfig = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    course = core.make('mule/course');
                    return [4 /*yield*/, course.getConfig(user)];
                case 2:
                    courseConfig = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_8 = _a.sent();
                    console.log(err_8);
                    throw err_8;
                case 4: return [2 /*return*/, courseConfig];
            }
        });
    });
}
// Methods OS.js server requires
module.exports = function (core, proc) { return ({
    // When server initializes
    init: function () { return __awaiter(void 0, void 0, void 0, function () {
        var checkAdminAccess;
        return __generator(this, function (_a) {
            checkAdminAccess = function (user) { return __awaiter(void 0, void 0, void 0, function () {
                var cache, courseConfig, context, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cache = core.make('osjs/cache');
                            courseConfig = cache.get("course-config/" + user.consumerId + "/" + user.courseId);
                            if (!(courseConfig == null)) return [3 /*break*/, 2];
                            return [4 /*yield*/, getCourseConfig(core, user)];
                        case 1:
                            //throw "No course config cached"
                            //retrieve the course config - TODO: better way to do this? Maybe push work to cache
                            courseConfig = _a.sent();
                            cache.set("course-config/" + user.consumerId + "/" + user.courseId, courseConfig);
                            _a.label = 2;
                        case 2:
                            courseConfig = courseConfig["apps"];
                            if (courseConfig == null)
                                throw "No apps config in course config";
                            courseConfig = courseConfig["workbook"];
                            if (courseConfig == null)
                                throw "No apps/workbook config in course config";
                            context = {
                                user: user
                            };
                            return [4 /*yield*/, core.make("server/constraints/api").evalTree(context, courseConfig)];
                        case 3:
                            result = _a.sent();
                            result = ((result["admin"] != null) ? result["admin"] : false);
                            //console.log("ADMIN CHECK:",result)
                            return [2 /*return*/, result];
                    }
                });
            }); };
            core.app.post(proc.resource("/api"), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var method, args, user_1, uid, ip_1, qid, id, data, result, qid, files, data, result, s, u, course, consumer, result, result2, _i, result_1, r, workbook_1, id, type, grade, data, result, _a, _b, metadata, workbook, filter_1, checkRead, result_2, qid, data, result, qid, files, id, isAdmin, suppArgs, result_3, qid, node, _c, _d, _e, id, qids, type, results, _f, qids_1, qid, g, err_9;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 34, , 35]);
                            method = req.body.method;
                            args = req.body.args;
                            user_1 = req.session.user;
                            uid = user_1.id;
                            ip_1 = req.headers["x-real-ip"];
                            assert(uid != null, "uid is null");
                            if (!(method === "getAttempt")) return [3 /*break*/, 2];
                            qid = args.qid, id = args.id;
                            //var id = args.id;
                            assert(qid != null);
                            assert(id != null);
                            data = {
                                uid: uid,
                                qid: qid,
                                id: id //,
                                // grade: grade
                            };
                            //overriding uid?
                            if (args.uid) {
                                if (checkAdminAccess(user_1))
                                    data.uid = args.uid;
                                else
                                    return [2 /*return*/, res.status(500).json({ result: "error - not permitted" })];
                            }
                            return [4 /*yield*/, getAttempt(data)];
                        case 1:
                            result = _g.sent();
                            return [2 /*return*/, res.json(result)];
                        case 2:
                            if (!(method === "setAttempt")) return [3 /*break*/, 4];
                            qid = args.qid, files = args.files;
                            //var files = args.files;
                            assert(qid != null, "qid is null");
                            assert(files != null, "files is null");
                            data = {
                                uid: uid,
                                qid: qid,
                                files: files //,
                                // grade: grade
                            };
                            //overriding uid?
                            if (args.uid) {
                                if (checkAdminAccess(user_1))
                                    data.uid = args.uid;
                                else
                                    return [2 /*return*/, res.status(500).json({ result: "error - not permitted" })];
                            }
                            return [4 /*yield*/, saveAttempt(data)];
                        case 3:
                            result = _g.sent();
                            return [2 /*return*/, res.json(result)];
                        case 4:
                            if (!(method === "getUserList")) return [3 /*break*/, 6];
                            //if (user.groups && user.groups.indexOf("edit-workbooks") == -1) return []
                            if (!checkAdminAccess(user_1))
                                return [2 /*return*/, []];
                            s = uid.split(".");
                            u = s.shift();
                            course = s.shift();
                            consumer = s.join(".");
                            return [4 /*yield*/, getUsers(course, consumer)];
                        case 5:
                            result = _g.sent();
                            result2 = {};
                            for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                                r = result_1[_i];
                                result2[r.id] = r;
                            }
                            res.json(result2);
                            _g.label = 6;
                        case 6:
                            if (!(method === "compileWorkbooks")) return [3 /*break*/, 9];
                            if (!checkAdminAccess(user_1)) {
                                return [2 /*return*/, res.status(500).json({ result: "error - not permitted" })];
                            }
                            return [4 /*yield*/, processFolder(core, user_1, "source")];
                        case 7:
                            workbook_1 = _g.sent();
                            return [4 /*yield*/, putWorkbookFile(core, user_1, "/workbooks.json", JSON.stringify(workbook_1))];
                        case 8:
                            _g.sent();
                            return [2 /*return*/, res.json("ok")];
                        case 9:
                            if (!(method === "updateGrade")) return [3 /*break*/, 11];
                            //var user = await authenticator().checkSession(http);
                            if (!checkAdminAccess(user_1))
                                throw "Invalid action - you do not have sufficient rights";
                            id = args.id, type = args.type, grade = args.grade;
                            data = {
                                id: id,
                                type: type,
                                grade: grade
                            };
                            return [4 /*yield*/, setGrade(data)];
                        case 10:
                            result = _g.sent();
                            return [2 /*return*/, res.json(result)];
                        case 11:
                            if (!(method === "isAdmin")) return [3 /*break*/, 13];
                            _b = (_a = res).json;
                            return [4 /*yield*/, checkAdminAccess(user_1)];
                        case 12: return [2 /*return*/, _b.apply(_a, [_g.sent()])];
                        case 13:
                            if (!(method === "getFullWorkbook")) return [3 /*break*/, 16];
                            return [4 /*yield*/, getWorkbookFile(core, user_1, "workbooks.json")];
                        case 14:
                            metadata = _g.sent();
                            workbook = [metadata];
                            filter_1 = function (node) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!node.children) return [3 /*break*/, 2];
                                            _a = node;
                                            return [4 /*yield*/, node.children.filter(filter_1)];
                                        case 1:
                                            _a.children = _b.sent();
                                            _b.label = 2;
                                        case 2: return [4 /*yield*/, canRead(core, ip_1, user_1, node)];
                                        case 3: return [2 /*return*/, _b.sent()];
                                    }
                                });
                            }); };
                            checkRead = function (nodeList) { return __awaiter(void 0, void 0, void 0, function () {
                                var result, _i, nodeList_1, element, _a, result_4, element, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            result = [];
                                            _i = 0, nodeList_1 = nodeList;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < nodeList_1.length)) return [3 /*break*/, 4];
                                            element = nodeList_1[_i];
                                            return [4 /*yield*/, canRead(core, ip_1, user_1, element)];
                                        case 2:
                                            if (_c.sent()) {
                                                result.push(element);
                                            }
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4:
                                            _a = 0, result_4 = result;
                                            _c.label = 5;
                                        case 5:
                                            if (!(_a < result_4.length)) return [3 /*break*/, 8];
                                            element = result_4[_a];
                                            if (!element.children) return [3 /*break*/, 7];
                                            _b = element;
                                            return [4 /*yield*/, checkRead(element.children)];
                                        case 6:
                                            _b.children = _c.sent();
                                            _c.label = 7;
                                        case 7:
                                            _a++;
                                            return [3 /*break*/, 5];
                                        case 8: return [2 /*return*/, result];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, checkRead(workbook)];
                        case 15:
                            result_2 = _g.sent();
                            //console.log(JSON.stringify(result, null, 4))
                            //console.log("Returning:============================================================================================= ",typeof result)
                            res.json(result_2);
                            _g.label = 16;
                        case 16:
                            if (!(method === "getHistory")) return [3 /*break*/, 18];
                            qid = args.qid;
                            assert(qid != null);
                            data = {
                                uid: uid,
                                qid: qid
                            };
                            //overriding uid?
                            if (args.uid) {
                                if (checkAdminAccess(user_1))
                                    data.uid = args.uid;
                                else
                                    return [2 /*return*/, res.status(500).json({ result: "error - not permitted" })];
                            }
                            return [4 /*yield*/, getHistory(data)];
                        case 17:
                            result = _g.sent();
                            //console.log("CALLED- returning! ",result)
                            res.json(result);
                            _g.label = 18;
                        case 18:
                            if (!(method === "evalAttempt")) return [3 /*break*/, 20];
                            qid = args.qid, files = args.files, id = args.id;
                            assert(qid != null);
                            assert(files != null);
                            console.log("Server eval:", args);
                            isAdmin = false;
                            if (args.uid) {
                                if (checkAdminAccess(user_1))
                                    isAdmin = true; //this flag will allow evaluation but not stored in any workbook
                                else
                                    return [2 /*return*/, res.status(500).json({ result: "error - not permitted" })];
                            }
                            suppArgs = __assign(__assign({}, args), { ip: ip_1, id: id, uid: uid });
                            return [4 /*yield*/, handleEvalAttempt(core, user_1, suppArgs, isAdmin)];
                        case 19:
                            result_3 = _g.sent();
                            console.log("Have result from handler", result_3);
                            return [2 /*return*/, res.json(result_3)];
                        case 20:
                            if (!(method === "getRights")) return [3 /*break*/, 28];
                            qid = args.qid;
                            assert(qid != null);
                            return [4 /*yield*/, getNode(core, user_1, qid)];
                        case 21:
                            node = _g.sent();
                            _d = (_c = res).json;
                            _e = {};
                            return [4 /*yield*/, canEvaluate(core, ip_1, user_1, node)];
                        case 22:
                            _e.eval = _g.sent();
                            return [4 /*yield*/, canSubmit(core, ip_1, user_1, node)];
                        case 23:
                            _e.submit = _g.sent();
                            return [4 /*yield*/, canRead(core, ip_1, user_1, node)];
                        case 24:
                            _e.read = _g.sent();
                            return [4 /*yield*/, canRun(core, ip_1, user_1, node)];
                        case 25:
                            _e.run = _g.sent();
                            return [4 /*yield*/, canPaste(core, ip_1, user_1, node)];
                        case 26:
                            _e.paste = _g.sent();
                            return [4 /*yield*/, canCopy(core, ip_1, user_1, node)];
                        case 27: return [2 /*return*/, _d.apply(_c, [(_e.copy = _g.sent(), _e)])];
                        case 28:
                            if (!(method === "downloadGrades")) return [3 /*break*/, 33];
                            if (!checkAdminAccess(user_1))
                                throw "Invalid action - you do not have sufficient rights";
                            id = args.id, qids = args.qids, type = args.type;
                            results = {};
                            _f = 0, qids_1 = qids;
                            _g.label = 29;
                        case 29:
                            if (!(_f < qids_1.length)) return [3 /*break*/, 32];
                            qid = qids_1[_f];
                            return [4 /*yield*/, getGrades(qid, type)
                                //filter if id is defined
                            ];
                        case 30:
                            g = _g.sent();
                            //filter if id is defined
                            if (id != null) {
                                g = g.filter(function (x) { return x.uid == id; });
                            }
                            results[qid] = g;
                            _g.label = 31;
                        case 31:
                            _f++;
                            return [3 /*break*/, 29];
                        case 32: return [2 /*return*/, res.json(results)];
                        case 33: return [3 /*break*/, 35];
                        case 34:
                            err_9 = _g.sent();
                            console.log(err_9);
                            return [2 /*return*/, res.status(500).json({ result: err_9 })];
                        case 35: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); },
    // When server starts
    start: function () {
        console.log("hello");
    },
    // When server goes down
    destroy: function () {
        console.log("good bye");
    },
    // When using an internally bound websocket, messages comes here
    onmessage: function (ws, respond, args) {
        respond("Pong");
    }
}); };
