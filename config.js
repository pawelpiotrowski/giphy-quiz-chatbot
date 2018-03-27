'use strict';

let config = require('./config.json');
const quizConfig = require('./config-quiz');
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

config = Object.assign(config, secrets);
config.quiz = quizConfig;

module.exports = config;
