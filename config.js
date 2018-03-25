'use strict';

let config = require('./config.json');
const Log = require('./lib/log');
let secrets;

try {
    secrets = require('./secrets.json');
} catch(err) {
    Log.warning(['secrets.json not available, falling back to fake values']);
    secrets = {
        fb_verify_token: '123token',
        fb_app_secret: '123secret'
    };
}

module.exports = Object.assign(config, secrets);
