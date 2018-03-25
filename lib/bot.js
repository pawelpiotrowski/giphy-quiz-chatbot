'use strict';

const _ = require('lodash');
const Conversation = require('./conversation');
const Log = require('./log');
const Storage = require('./storage');
const Messenger = new (require('./messenger'))();

module.exports = class Bot extends Conversation {

    constructor(inbound) {
        /**
            cargo: this.cargo,
            nlp: this.nlp,
            threadKey: this.threadKey,
            senderData: this.senderData,
            senderId: this.senderId,
            type: this.type,
         */
        super(inbound.dialogName, inbound.lang);
        Object.assign(this, inbound.inboundItem);
    }

    async updateUser(property) {
        this.senderData = await Storage.updateUser(Object.assign({
            fbid: this.senderId
        }, property));
    }

    updateUserLanguage(lang = this.lang) {
        return this.updateUser({ lang });
    }

    updateUserDialog(dialogName = this.dialogName) {
        return this.updateUser({ dialogName });
    }

    async setUser() {
        this.senderData = await Storage.setUser({ fbid: this.senderId });
    }

    async processInboundItem() {
        Log.info(['BOT -> Process inbound item cargo', [this.cargo]]);
        Log.info(['BOT -> Process inbound item message nlp', [this.nlp]]);
        Log.info(['BOT -> Process inbound item message threadKey', [this.threadKey]]);

        // if no user create one
        if(!this.senderData) {
            await this.setUser();
        }
        // if no user lang set use lang from inbound
        if(!this.senderData.lang) {
            await this.updateUserLanguage();
        }
        // if no user dialog set use dialog from inbound
        if(!this.senderData.dialog) {
            await this.updateUserDialog();
        }

        Log.info(['BOT -> Process inbound item sender data', [this.senderData]]);
        Log.info(['BOT -> Process inbound item sender id', [this.senderId]]);
        Log.info(['BOT -> Process inbound item type', [this.type]]);
        Log.info(['BOT -> Process inbound item dialog name ', [this.dialogName]]);
        Log.info(['BOT -> Process inbound item dialog language ', [this.lang]]);
        
        //this.instruction = Conversation.instruction();
        //this.processInstruction();
    }

    static getUserProfileLanguage(fbid) {
        return Messenger.getProfileLang(fbid);
    }
}
