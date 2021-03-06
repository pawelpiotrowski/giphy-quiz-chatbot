'use strict';

const _ = require('lodash');
const config = require('../config');
const Messenger = new (require('./messenger'))();
const DB = require('./db');
const defaultDialog = config.defaultDialog;
const defaultLanguage = config.locales[0];

module.exports = class ChatUser {

    constructor(fbid) {
        this.data = {
            fbid: fbid
        };
    }

    async sync() {
        const data = await DB('users').where({ fbid: this.data.fbid });
        this.data = data[0];
    }

    update(property) {
        return DB('users').where({ fbid: this.data.fbid }).update(property).then(() => {
            return this.sync();
        });
    }

    updateResult(result) {
        return this.update({ quiz_result: _.isNull(result) ? result : JSON.stringify(result) });
    }

    updateQuiz(question, questionNumber) {
        return this.update({ 
            quiz_question: _.isNull(question) ? question : JSON.stringify(question),
            quiz_question_number: questionNumber 
        });
    }

    updateSetupOption(option) {
        return this.update({ [option.key]: option.value });
    }

    updateThreadKey(threadKey) {
        return this.update({ thread_key: threadKey });
    }

    updateDialog(dialogName) {
        dialogName = dialogName || defaultDialog;
        return this.update({ dialog_name: dialogName });
    }

    updateLang(lang) {
        lang = lang || defaultLanguage;
        return this.update({ lang });
    }

    removeThreadKey() {
        return this.updateThreadKey(null);
    }

    setData() {
        return DB('users').returning('fbid').insert({ fbid: this.data.fbid }).then(() => {
            return this.sync();
        });
    }

    async setLang() {
        try {
            let profileLang = await Messenger.getProfileLang(this.data.fbid);
            if(profileLang.locale) {
                profileLang = profileLang.locale.split('_')[0];
                profileLang = (config.locales.indexOf(profileLang) > -1) ? profileLang : null;
                await this.updateLang(profileLang);
            }
        } catch(err) {
            await this.updateLang();
        }
    }
    
    async init() {
        const data = await DB('users').where({ fbid: this.data.fbid });

        if(data.length) {
            this.data = data[0];
        } else {
            await this.setData();
        }

        if(!this.data.dialog_name) {
            await this.updateDialog();
        }
        if(!this.data.lang) {
            await this.setLang();
        }
    }
}
