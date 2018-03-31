'use strict';

const _ = require('lodash');
const Log = require('./log');
const Messenger = new (require('./messenger'))();

module.exports = class Outbound {

    constructor(recipientId) {
        this.recipientId = recipientId;
    }
    
    getReplyCommandString(template) {
        // produce string like replyText or replyQuickReplies
        // template can be in ex: text or quick_replies
        // with startCase quick_replies becomes Quick Replies
        // split and join will produce QuickReplies
        return 'reply' + _.startCase(template).split(' ').join('');
    }

    wait(time = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

    async reply(template, payload) {
        Log.info(['OUTBOUND -> Reply',[template, payload]]);
        await Messenger[this.getReplyCommandString(template)](this.recipientId, payload);
    }

    async typeon() {
        await Messenger.replyTypingOn(this.recipientId);
    }

    async typeoff() {
        await Messenger.replyTypingOff(this.recipientId);
    }
}
