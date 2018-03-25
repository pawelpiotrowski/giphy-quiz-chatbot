'use strict';

const config = require('../config');
const Joi = require('joi');
const Webhook = require('./webhook');

exports.facebook = {
    verify: {
        auth: false,
        handler: (request, h) => {
            return h.response(request.query['hub.challenge']).code(200);
        },
        validate: {
            query: {
                'hub.mode': Joi.string().required().valid('subscribe'),
                'hub.verify_token': Joi.string().required().valid(config.fb_verify_token),
                'hub.challenge': Joi.any().optional()
            }
        }
    },
    webhook: {
        auth: false,
        pre: [
            {
                method: Webhook.validateXHubSignature
            },
            {
                method: Webhook.parsePayload,
                assign: 'parsed'
            },
            {
                method: Webhook.validatePayload,
                assign: 'payload'
            }
        ],
        handler: (request, h) => {
            return Webhook.payloadHandler(request.pre.payload.entry, h);
        },
        payload: {
            output: 'data',
            parse: false
        }
    }
};

