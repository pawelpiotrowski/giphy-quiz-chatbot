'use strict';

const _ = require('lodash');
const config = require('../config');
const Log = require('./log');
const Bot = require('./bot');
const ChatUser = require('./chat-user');

const messageItemTypes = ['message','postback'];
const messageTypes = ['quick_reply', 'text', 'attachments'];
const messageAttachmentTypes = [];
const defaultDialog = 'main';
const defaultLanguage = config.locales[0];

module.exports = class Inbound {

    constructor(messagingItem) {
        this.cargo = null;
        this.nlp = null;
        this.threadKey = null;
        this.user = null;
        this.userId = messagingItem.sender.id;
        this.type = null;
        this.lang = defaultLanguage;
        this.dialogName = defaultDialog;
        this.preProcessed = messageItemTypes.some((type) => {
            if(messagingItem[type]) {
                this.cargo = messagingItem[type];
                this.type = type;
                return true;
            }
        });
    }

    getInboundItem() {
        return {
            cargo: this.cargo,
            nlp: this.nlp,
            threadKey: this.threadKey,
            user: this.user,
            type: this.type
        };
    }

    routine() {
        const inboundItem = this.getInboundItem();
        Log.info(['INBOUND -> Routine', [inboundItem]]);
        new Bot(inboundItem).processInboundItem();
    }

    location() {
        this.threadKey = 'location';
        return this.routine();
    }

    text() {
        return this.routine();
    }

    quickReply() {
        this.threadKey = this.cargo.payload;
        return this.routine();
    }

    postback() {
        this.threadKey = this.cargo.payload;
        return this.routine();
    }
    // extracting
    attachments() {
        // Log.info(['INBOUND -> Process attachments', [this.cargo]]);
        const cargo = _.cloneDeep(this.cargo);
        cargo.forEach(attachment => {
            if(messageAttachmentTypes.indexOf(attachment.type) > -1) {
                this.cargo = attachment.payload;
                this.type = attachment.type;
                this[_.camelCase(this.type)]();
            }
        });
    }
    // extracting
    message() {
        // Log.info(['INBOUND -> Process message', [this.cargo]]);
        return messageTypes.some((type) => {
            if(this.cargo[type]) {
                this.nlp = this.cargo.nlp;
                this.cargo = this.cargo[type];
                this.type = type;
                return true;
            }
        }) && this[_.camelCase(this.type)]();
    }
    async syncSenderData() {
        this.user = new ChatUser(this.userId);
        await this.user.init();
    }
    // starts processing
    processMessagingItem() {
        return this.preProcessed && this.syncSenderData().then(() => {
            return this[this.type] && this[this.type]();
        });
    }
}
