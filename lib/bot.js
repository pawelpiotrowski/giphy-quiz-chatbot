'use strict';

const _ = require('lodash');
const Conversation = require('./conversation');
const Outbound = require('./outbound');
const Log = require('./log');

module.exports = class Bot extends Conversation {

    constructor(inbound) {
        super(inbound.user.data.dialogName, inbound.user.data.lang);
        Object.assign(this, inbound);
        this.outbound = new Outbound(this.user.data.fbid);
    }

    startThread() {
        Log.info(['BOT -> Process start thread']);
        this.outbound.reply('text', 'hello');
    }

    async processInboundItem() {
        Log.info(['BOT -> Process inbound item cargo', [this.cargo]]);
        Log.info(['BOT -> Process inbound item message nlp', [this.nlp]]);
        Log.info(['BOT -> Process inbound item message threadKey', [this.threadKey]]);
        Log.info(['BOT -> Process inbound item user data', [this.user.data]]);
        Log.info(['BOT -> Process inbound item user id', [this.user.data.fbid]]);
        Log.info(['BOT -> Process inbound item type', [this.type]]);
        Log.info(['BOT -> Process inbound item dialog name ', [this.dialogName]]);
        Log.info(['BOT -> Process inbound item dialog language ', [this.lang]]);

        if(this.threadKey === this.startKey()) {
            return this.startThread();
        }
    }
}
