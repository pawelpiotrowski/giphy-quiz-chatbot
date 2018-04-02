'use strict';

const config = require('../config');
const Hapi = require('hapi');
const ip = require('ip');
const Log = require('./log');
const auth = require('./auth');

let serverOptions = {
    port: process.env.PORT || config.http_port//,
    //routes: { cors: true }
};
if(process.env.NODE_ENV === 'production') {
    serverOptions.debug = false;
}

const server = new Hapi.Server(serverOptions);

module.exports = class Server {
    async start() {
        await server.register(require('hapi-auth-basic'));
        server.auth.scheme('ip-whitelist', auth.ipWhiteListSchema);
        // testing auth strategies
        server.auth.strategy('localhost', 'ip-whitelist', { list: ['127.0.0.1' ]});
        server.auth.strategy('localhost-with-simple', 'ip-whitelist', { basic_auth: true, list: ['127.0.0.1'] });
        // whitelist facebook servers
        // https://developers.facebook.com/docs/graph-api/webhooks#access
        // whois -h whois.radb.net -- '-i origin AS32934' | grep ^route
        server.auth.strategy('simple', 'basic', { validate: auth.basicValidate });
        server.auth.default('simple');
        server.route(require('./routes'));
        await server.start();
        Log.success(['Server started at: ' + ip.address() + ':' + server.info.port]);
    }
}
