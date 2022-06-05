"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
// Import third-party libraries (managed by npm and webpack)
var RethinkdbWebsocketClient = require('rethinkdb-websocket-client');
var r = RethinkdbWebsocketClient.rethinkdb;
var appDiv;
var RethinkdbConn = null;
var token;
(async function () {
    jQuery.ajax({ url: "http://127.0.0.1:8015/token", success: async function (result) {
            var token = result;
            // Obtain reference to our <div id="app"> element
            appDiv = document.getElementById('app');
            appDiv.innerHTML = "Waiting for changes...";
            await connect(token);
            //Automatic reconnect --- maybe add some backoff here?
            setInterval(function () {
                console.log(RethinkdbConn);
                if ((RethinkdbConn == null) ||
                    (RethinkdbConn.open == false)) {
                    connect(token);
                }
            }, 5000);
            await doQuery();
        } });
})();
async function connect(token) {
    // Open a WebSocket connection to the server to send RethinkDB queries over
    var options = {
        host: 'localhost',
        port: 8015,
        path: '/db?token=' + token,
        secure: false,
        db: 'test',
    };
    console.log("Connecting to db");
    RethinkdbConn = await RethinkdbWebsocketClient.connect(options);
}
async function doQuery() {
    var query = r.table('messages').getAll("1", { index: "group" });
    try {
        console.log("conn:", RethinkdbConn);
        var cursor = await query.changes().run(RethinkdbConn);
        console.log(cursor);
        return cursor.each(function (err, row) {
            if (err) {
                alert(err);
                throw err;
            }
            appDiv.innerHTML += "<br>" + JSON.stringify(row, null, 2);
        });
    }
    catch (err) {
        console.log(err);
    }
}
//# sourceMappingURL=app.js.map