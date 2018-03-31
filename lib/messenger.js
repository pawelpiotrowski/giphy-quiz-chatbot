'use strict';

const config = require('../config');
const axios = require('axios');
const Log = require('./log');

module.exports = class Messenger {
    constructor() {
        this.pageAccessToken = config.fb_access_token;
        this.apiVersion = '2.12';
        this.graphUri = `https://graph.facebook.com/v${this.apiVersion}`;
        this.uri = `${this.graphUri}/me/messages`;
        this.messagingType = {
            response: 'RESPONSE',
            update: 'UPDATE',
            messageTag: 'MESSAGE_TAG',
            nonPromotionalSubscription: 'NON_PROMOTIONAL_SUBSCRIPTION'
        };
        this.requestConfig = {
            params: {
                access_token: config.fb_access_token
            }
        };
    }
    
    send(data) {
        return axios.post(this.uri, data, this.requestConfig)
        .then(resp => {
            // Log.info(['MESSENGER -> Message sent', [data]]);
            return resp.data;
        })
        .catch(err => {
            Log.error(['MESSENGER -> Message not sent', [err]]);
        });
    }

    sendMessage(recipientId, message, messagingType = this.messagingType.response) {
        return this.send({
            messaging_type: messagingType,
            recipient: {
                id: recipientId
            },
            message: message
        });
    }

    sendAction(recipientId, action, messagingType = this.messagingType.response) {
        return this.send({
            messaging_type: messagingType,
            recipient: {
                id: recipientId
            },
            sender_action: action
        });
    }

    sendAttachment(recipientId, attachment, messagingType = this.messagingType.response) {
        return this.sendMessage(recipientId, { attachment }, messagingType);
    }

    sendTemplate(recipientId, template_type, payload, messagingType = this.messagingType.response) {
        return this.sendAttachment(recipientId, { type: 'template', payload: { template_type, ...payload }}, messagingType);
    }

    sendMedia(recipientId, media_type, media, buttons, messagingType = this.messagingType.response) {
        // media is an array with 0: source type name, 1: source
        // example ['url', 'https://example.com/asset.type'] or ['attachment_id', '123456789']
        const payload = { elements: [ { media_type, buttons, [media[0]]: media[1] } ] };
        return this.sendTemplate(recipientId, 'media', payload, messagingType);
    }

    // these are external
    getProfileLang(fbid) {
        const uri = `${this.graphUri}/${fbid}`;
        return axios.get(uri, {
            params: {
                access_token: config.fb_access_token,
                fields: 'locale'
            }
        })
        .then(resp => {
            Log.info(['MESSENGER -> Profile language ', [resp.data]]);
            return resp.data;
        })
        .catch(err => {
            Log.error(['MESSENGER -> Cannot get profile language']);
            throw err;
        });
    }

    replyTypingOn(recipientId, messagingType = this.messagingType.response) {
        return this.sendAction(recipientId, 'typing_on', messagingType);
    }

    replyTypingOff(recipientId, messagingType = this.messagingType.response) {
        return this.sendAction(recipientId, 'typing_off', messagingType);
    }

    replyPictureUrl(recipientId, picture, messagingType = this.messagingType.response) {
        Log.info(['MESSENGER -> Picture url', [recipientId, picture, messagingType]]);
        return this.sendMedia(recipientId, 'image', ['url', picture.url], picture.buttons, messagingType);
    }

    replyPicture(recipientId, picture, messagingType = this.messagingType.response) {
        return this.sendMedia(recipientId, 'image', ['attachment_id', picture.attachment_id], picture.buttons, messagingType);
    }

    replyGeneric(recipientId, elements, messagingType = this.messagingType.response) {
        return this.sendTemplate(recipientId, 'generic', { elements }, messagingType);
    }

    replyText(recipientId, text, messagingType = this.messagingType.response) {
        return this.sendMessage(recipientId, { text }, messagingType);
    }

    replyQuickReplies(recipientId, replies, messagingType = this.messagingType.response) {
        return this.sendMessage(recipientId, { text: replies.text, quick_replies: replies.quick_replies }, messagingType);
    }

    replyQuickRepliesAttachment(recipientId, replies, attachment, messagingType = this.messagingType.response) {
        return this.sendMessage(recipientId, { quick_replies: replies.quick_replies, attachment }, messagingType);
    }
}
