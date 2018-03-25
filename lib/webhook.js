'use strict';

const config = require('../config');
const crypto = require('crypto');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const Inbound = require('./inbound');
const Log = require('./log');

module.exports = {

    validateXHubSignature(request, h) {
        let hmac = crypto.createHmac('sha1', config.fb_app_secret);
        hmac.update(request.payload, 'utf-8');
        let calculatedHash = 'sha1=' + hmac.digest('hex');
        let providedHash = request.headers['x-hub-signature'];
        if(calculatedHash !== providedHash) {
            return Boom.unauthorized('Not authorized');
        }
        return h.continue;
    },
    
    parsePayload(request) {
        let parsed;
        try {
            parsed = JSON.parse(request.payload.toString('utf-8'));
        } catch(err) {
            return Boom.badData('Error parsing the payload');
        }
        return parsed;
    },

    validatePayload(request) {
        const schema = Joi.object().unknown().keys({
            object: Joi.string().valid('page').required(),
            entry: Joi.array().required()
        });
        const validation = schema.validate(request.pre.parsed);
        // TODO
        // return h.response('EVENT_RECEIVED').code(200);
        // on error - fb requirements
        if(validation.error) {
            return Boom.notFound();
        }
        return request.pre.parsed;
    },

    payloadHandler(entry, h) {
        entry.forEach(entryItem => {
            // Log.info(['WEBHOOK - payload handler entryItem', [entryItem]]);
            if(entryItem.messaging) {
                entryItem.messaging.forEach(messagingItem => {
                    // Log.info(['WEBHOOK -> payload handler messagingItem', [messagingItem]]);
                    new Inbound(messagingItem).processMessagingItem();
                });
            }
        });
        return h.response('EVENT_RECEIVED').code(200);
    }
};
