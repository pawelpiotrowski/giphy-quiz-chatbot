'use strict';

const _ = require('lodash');
const Conversation = require('./conversation');
const Outbound = require('./outbound');
const Log = require('./log');

module.exports = class Bot extends Conversation {

    constructor(inbound) {
        super(inbound.user.data.dialog_name, inbound.user.data.lang);
        Object.assign(this, inbound);
        this.outbound = new Outbound(this.user.data.fbid);
    }

    syncThreadKey() {
        return this.user.updateThreadKey(this.threadKey);
    }

    async assignNewThreadKey() {
        const nextKey = super.nextThreadKey(this.threadKey);
        this.threadKey = nextKey;
        await this.syncThreadKey();
    }

    async replyThread(thread) {
        thread = thread || super.threadByKey(this.threadKey);
        await this.outbound.reply(thread.meta.template, thread.payload);
    }

    async replyActionSequence() {
        const threadSequence = super.threadByKey(this.threadKey.split('.')[1]);
        for(let thread of threadSequence.payload) {
            if(thread.meta.template === 'action') {
                await this.outbound[thread.payload.name](thread.payload.args);
            } else {
                await this.replyThread(thread);
            }
        }
        return { continue: true };
    }

    completion() {
        return Log.status(['BOT -> Conversation end!']);
    }
    
    async processNextReplyAction() {
        const action = _.startCase(this.threadKey.split('.')[0].substr(1));
        const hasNext = await this['replyAction' + action]();
        if(hasNext && hasNext.continue) {
            this.processNextReplyThread();
        }
    }

    async processNextReplyThread() {
        await this.assignNewThreadKey();
        if(this.threadKey === super.endThreadKey()) {
            return this.completion();
        }
        if(this.threadKey.startsWith('$')) {
            return this.processNextReplyAction();
        }
        return this.replyThread();
    }

    validateInboundItem() {
        Log.info(['BOT -> Validate inbound item threadKey is ' + this.threadKey]);
        if(this.threadKey === super.endThreadKey()) {
            return this.completion();
        }
        if(this.threadKey.startsWith('$sequence')) {
            return; // ignore input while executing a sequence
        }
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
        // start key skip validation
        if(this.threadKey === super.startThreadKey()) {
            return this.processNextReplyThread();
        }
        // this is text input
        if(!this.threadKey) {
            if(!this.user.data.thread_key) {
                this.threadKey = super.startThreadKey();
                return this.processNextReplyThread();
            }
            this.threadKey = this.user.data.thread_key;
        }
        return this.validateInboundItem();
    }
}
