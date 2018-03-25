'use strict';

const Server = new (require('./lib/server'))();
const Log = require('./lib/log');

Log.status(['Starting Giphy Quiz Chatbot Server']);

Server.start().catch(err => {
    Log.error(['Error starting server', [err]]);
});
