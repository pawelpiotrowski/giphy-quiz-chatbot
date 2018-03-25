'use strict';

const _ = require('lodash');
const config = require('../config');
const Log = require('./log');
const Bot = require('./bot');
const Storage = require('./storage');

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
        this.senderData = null;
        this.senderId = messagingItem.sender.id;
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
            senderData: this.senderData,
            senderId: this.senderId,
            type: this.type
        };
    }

    routine() {
        const inboundItem = this.getInboundItem();
        Log.info(['INBOUND -> Routine', [inboundItem]]);
        new Bot({ dialogName: this.dialogName, lang: this.lang, inboundItem }).processInboundItem();
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
        this.senderData = await Storage.getUser(this.senderId);
        // if user has stored dialog use this instead
        if(this.senderData && this.senderData.dialogName) {
            this.dialogName = this.senderData.dialogName;
        }
        // if user has stored lang use this instead
        if(this.senderData && this.senderData.lang) {
            this.lang = this.senderData.lang;
        } else {
            // no language stored try get it from profile
            let lang = await Bot.getUserProfileLanguage(this.senderId);
            if(lang.locale) {
                lang = lang.locale.split('_')[0];
                // if lang is supported set it
                if(config.locales.indexOf(lang) > -1) {
                    this.lang = lang;
                }
            }
        }
    }
    // starts processing
    processMessagingItem() {
        return this.preProcessed && this.syncSenderData().then(() => {
            return this[this.type] && this[this.type]();
        });
    }
}
