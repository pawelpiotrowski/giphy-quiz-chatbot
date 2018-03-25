'use strict';

const api = require('./api');
const pckg = require('../package.json');

const apiPrefix = '/api'
const apiPrefixFacebook = apiPrefix + '/fb';

let routes = [
    {
        method: 'GET',
        path: apiPrefix,
        config: {
            handler: function(request, h) {
                return h.response({ 'api' : pckg.version }).code(200);
            },
            auth: false
        }
    }
];

const routesFacebook = [
    {
        method: 'GET',
        path: apiPrefixFacebook + '/webhook',
        config: api.facebook.verify
    },
    {
        method: 'POST',
        path: apiPrefixFacebook + '/webhook',
        config: api.facebook.webhook
    }
];

routes = routes.concat(routesFacebook);

module.exports = routes;
