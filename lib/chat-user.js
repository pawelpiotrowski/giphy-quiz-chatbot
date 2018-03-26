'use strict';

const config = require('../config');
const Log = require('./log');
const Messenger = new (require('./messenger'))();
const Storage = require('./storage');
const defaultDialog = config.defaultDialog;
const defaultLanguage = config.locales[0];

module.exports = class ChatUser {

    constructor(fbid) {
        this.data = {
            fbid: fbid
        };
    }

    async update(property) {
        this.data = await Storage.updateUser(Object.assign({ fbid: this.data.fbid }, property));
    }

    updateThreadKey(threadKey) {
        return this.update({ threadKey });
    }

    updateDialog(dialogName = defaultDialog) {
        return this.update({ dialogName });
    }

    updateLang(lang = defaultLanguage) {
        return this.update({ lang });
    }

    removeThreadKey() {
        return this.updateThreadKey(null);
    }

    async setLang() {
        let profileLang = await Messenger.getProfileLang(this.data.fbid);
        if(profileLang.locale) {
            profileLang = profileLang.locale.split('_')[0];
            profileLang = (config.locales.indexOf(profileLang) > -1) ? profileLang : null;
            await this.updateLang(profileLang);
        }
    }

    async setData() {
        this.data = await Storage.setUser({ fbid: this.data.fbid });
    }
    
    async sync() {
        const data = await Storage.getUser(this.data.fbid);

        if(data) {
            this.data = data;
        } else {
            await this.setData();
        }

        if(!this.data.dialogName) {
            await this.updateDialog();
        }
        if(!this.data.lang) {
            await this.setLang();
        }
    }
}
