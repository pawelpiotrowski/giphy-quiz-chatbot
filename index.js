'use strict';

const Server = new (require('./lib/server'))();
const Log = require('./lib/log');
const DB = require('./lib/db');
const config = require('./config');

Log.status(['Starting Giphy Quiz Chatbot Server']);

(function testDBConnection() {
    Log.info(['Testing DB connection...']);
    return DB('users').where({ fbid: config.dbTestUserFbid });
})()
.then(() => {
    Log.ok(['DB connected']);
    Server.start().catch(err => {
        Log.error(['Error starting server', [err]]);
    });
})
.catch(err => {
    Log.error(['DB connection problem', [err]]);
});
