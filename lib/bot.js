'use strict';

const _ = require('lodash');
const Conversation = require('./conversation');
const Outbound = require('./outbound');
const Log = require('./log');
const quizSetup = require('./quiz-setup');
const Quiz = require('./quiz');

// declare private method
// https://medium.com/front-end-hacking/private-methods-in-es6-and-writing-your-own-db-b2e30866521f
const _saveSetupOption = Symbol('saveSetupOption');

module.exports = class Bot extends Conversation {

    constructor(inbound) {
        super(inbound.user.data.dialog_name, inbound.user.data.lang);
        Object.assign(this, inbound);
        this.outbound = new Outbound(this.user.data.fbid);
    }

    completion() {
        return Log.status(['BOT -> Conversation end!']);
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
    // action quiz
    validateActionQuiz() {
        Log.status(['BOT -> Validate quiz reply action']);
    }

    async replyActionQuiz() {
        Log.status(['BOT -> Quiz reply action']);
        await this.user.sync();
        const quiz = new Quiz(this.user.data);
        return false;
    }
    // action setup
    async replyActionSetupInvalid() {
        //Log.info(['BOT -> Reply setup invalid answer']);
        const setupThread = super.threadByKey(this.threadKey.split('.')[1]);
        await this.replyThread(setupThread.invalid);
        await this.outbound.wait(2000);
        return this.replyThread(setupThread);
    }

    async [_saveSetupOption](option) {
        //Log.info(['BOT -> Private: save setup option', [option]]);
        await this.user.updateSetupOption(option);
        this.threadKey = _.pullAt(this.threadKey.split('.'), [0,1]).join('.');
        return this.processNextReplyThread();
    }

    validateActionSetup() {
        const validation = quizSetup.validateAnswer({ 
            threadKey: this.threadKey,
            cargo: this.cargo,
            thread: super.threadByKey(this.threadKey.split('.')[1])
        });
        //Log.info(['BOT -> Setup validation result', [validation]]);
        return (validation.valid) ? this[_saveSetupOption](validation.option) : this.replyActionSetupInvalid();
    }

    async replyActionSetup() {
        const setupThread = super.threadByKey(this.threadKey.split('.')[1]);
        await this.replyThread(setupThread);
        return false;
    }
    // action sequence
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
    
    async processNextReplyAction() {
        const action = _.startCase(this.threadKey.split('.')[0].substr(1));
        const hasNext = await this['replyAction' + action]();
        if(hasNext && hasNext.continue) {
            return this.processNextReplyThread();
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

    validateReplyAction() {
        // ignore input while executing a sequence
        if(this.threadKey.startsWith('$sequence')) {
            return;
        }
        const action = _.startCase(this.threadKey.split('.')[0].substr(1));
        return this['validateAction' + action]();
    }

    validateInboundItem() {
        //Log.info(['BOT -> Validate inbound item threadKey is ' + this.threadKey]);
        if(this.threadKey === super.endThreadKey()) {
            return this.completion();
        }
        if(this.threadKey.startsWith('$')) {
            return this.validateReplyAction();
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
