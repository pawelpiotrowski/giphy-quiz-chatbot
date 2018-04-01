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
const _updateQuizResult = Symbol('updateQuizResult');
const _resetQuizProgress = Symbol('resetQuizProgress');
const _resetQuizSetup = Symbol('resetQuizSetup');
const _resetQuiz = Symbol('resetQuiz');

module.exports = class Bot extends Conversation {

    constructor(inbound) {
        super(inbound.user.data.dialog_name, inbound.user.data.lang);
        Object.assign(this, inbound);
        this.outbound = new Outbound(this.user.data.fbid);
        this.ignoreInbound = false;
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
    // RESET QUIZ
    async [_resetQuizProgress]() {
        await this.user.updateResult(null);
        await this.user.updateQuiz(null, null);
    }

    async [_resetQuizSetup]() {
        for(let setupProperty of quizSetup.getOptionsColumnNames()) {
            await this.user.updateSetupOption({ key: setupProperty, value: null });
        }
    }

    async [_resetQuiz]() {
        await this[_resetQuizProgress]();
        await this[_resetQuizSetup]();
    }
    // ACTION RESULT
    async replyActionResult() {
        this.ignoreInbound = true; // reply sequence will switch it back to false
        await this.user.sync();
        const quiz = new Quiz(this.user.data);
        const resultThread = await quiz.getResultThread();
        Log.info(['BOT -> Reply action resultThread:', [resultThread]]);
        //await this.replyQuiz(quizThread);
        return false;
    }

    async [_updateQuizResult](result) {
        // first check if result exist if not create it as empty array
        let userQuizResult = this.user.data.quiz_result;
        userQuizResult = (_.isNull(this.user.data.quiz_result)) ? [] : JSON.parse(userQuizResult);
        userQuizResult.push(result);
        await this.user.updateResult(userQuizResult);
        // update and then proceed to next step either result or next question
        if(this.user.data.quiz_question_number === this.user.data.quiz_size) {
            // make sure threadKey is clean = $quiz
            this.threadKey = this.threadKey.split('.')[0];
            this.ignoreInbound = false;
            return this.processNextReplyThread();
        }
        return this.replyActionQuiz();
    }

    // ACTION QUIZ
    async replyActionQuizInvalid() {
        const userQuestionThread = JSON.parse(this.user.data.question);
        await this.replyThread(userQuestionThread.invalid);
        await this.outbound.wait(2000);
        await this.replyThread(userQuestionThread.title);
        return this.replyThread(userQuestionThread);
    }
    async validateActionQuiz() {
        this.ignoreInbound = true;
        await this.user.sync();
        const quiz = new Quiz(this.user.data);
        const quizValidation = await quiz.validateAnswer(this.cargo);
        return (validation.valid) ? this[_updateQuizResult](validation.result) : this.replyActionQuizInvalid();
    }
    // replyActionQuizHelper
    // here always increase question number as quiz final will be checked in validateActionQuiz
    async replyQuiz(quizThread) {
        await this.user.updateQuiz(quizThread.thread, _.add(this.user.data.quiz_question_number, 1));
        await this.replyActionSequence(quizThread.sequence);
        this.ignoreInbound = true;
        await this.outbound.reply(quizThread.thread.meta.template, quizThread.thread.payload, quizThread.thread.attachment);
        this.ignoreInbound = false;
    }

    async replyActionQuiz() {
        this.ignoreInbound = true; // reply sequence will switch it back to false
        await this.user.sync();
        const quiz = new Quiz(this.user.data);
        const quizThread = await quiz.getQuestionThread();
        await this.replyQuiz(quizThread);
        return false;
    }
    // ACTION SETUP
    async replyActionSetupInvalid() {
        const setupThread = super.threadByKey(this.threadKey.split('.')[1]);
        await this.replyThread(setupThread.invalid);
        await this.outbound.wait(2000);
        return this.replyThread(setupThread);
    }
    // private
    async [_saveSetupOption](option) {
        await this.user.updateSetupOption(option);
        // pull two first words from thread key to get something like $setup.category
        this.threadKey = _.pullAt(this.threadKey.split('.'), [0,1]).join('.');
        return this.processNextReplyThread();
    }

    validateActionSetup() {
        const validation = quizSetup.validateAnswer({ 
            threadKey: this.threadKey,
            cargo: this.cargo,
            thread: super.threadByKey(this.threadKey.split('.')[1])
        });
        return (validation.valid) ? this[_saveSetupOption](validation.option) : this.replyActionSetupInvalid();
    }

    async replyActionSetup() {
        const setupThread = super.threadByKey(this.threadKey.split('.')[1]);
        await this.replyThread(setupThread);
        return false;
    }
    // ACTION SEQUENCE
    async replyActionSequence(threadSequence) {
        this.ignoreInbound = true;
        threadSequence = threadSequence || super.threadByKey(this.threadKey.split('.')[1]);
        for(let thread of threadSequence.payload) {
            if(thread.meta.template === 'action') {
                await this.outbound[thread.payload.name](thread.payload.args);
            } else {
                await this.replyThread(thread);
            }
        }
        this.ignoreInbound = false;
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
        const action = _.startCase(this.threadKey.split('.')[0].substr(1));
        return this['validateAction' + action]();
    }

    validateInboundItem() {
        if(this.threadKey === super.endThreadKey()) {
            return this.completion();
        }
        if(this.threadKey.startsWith('$')) {
            return this.validateReplyAction();
        }
        return this.processNextReplyThread();
    }

    async processInboundItem() {
        if(this.ignoreInbound) {
            return Log.warning(['BOT -> Ignoring inbound threadKey and cargo are ', [this.threadKey, this.cargo]]);
        }
        // start key skip validation
        if(this.threadKey === super.startThreadKey()) {
            await this[_resetQuiz]();
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
