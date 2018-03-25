'use strict';

const config = require('../config');
const _ = require('lodash');
const ip = require('ip');
const Boom = require('boom');

module.exports = {
    ipWhiteListSchema(server, options) {
        const list = _.castArray(options.list);
        return {
            authenticate: async (request, h) => {
                // in case you are behind a proxy, use Hapi plugin `therealyou`
                const remoteAddress = request.info.remoteAddress;
                if(_.some(list, address => { return ip.isEqual(remoteAddress, address); })) {
                    if(!options.basic_auth) {
                        return h.continue;
                    }
                    try {
                        await request.server.auth.test('simple', request);
                        return h.continue;
                    }
                    catch (err) {
                        return Boom.unauthorized('Not authorized');
                    }
                } else {
                    return Boom.unauthorized('Not authorized');
                }
            }
        };
    },
    async basicValidate(request, username, password) {
        return { isValid: (username === config.usr && password === config.pwd), credentials: {} };
    }
}
