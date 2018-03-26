'use strict';

const _ = require('lodash');
const config = require('../config');
const Log = require('./log');

const dialogs = require('../data/dialogs.json');
const messages = {};

// remove commented out threads from JSON
_.toPairsIn(dialogs).forEach(pair => {
    dialogs[pair[0]].threadKeys = _.remove(pair[1].threadKeys, val => !val.startsWith('//'));
});
// get all localised messages
config.locales.forEach(locale => {
    messages[locale] = require(`../data/messages-${locale}.json`);
});

module.exports = class Conversation {

    constructor(dialogName, lang) {
        this.dialogName = dialogName;
        this.lang = lang;
        this.dialog = dialogs[dialogName];
        this.messages = messages[lang];
    }

    firstKey() {
        return this.dialog.threadKeys[1];
    }

    startKey() {
        return this.dialog.threadKeys[0];
    }
    
    start() {
        return this.messages[this.firstThreadKey()];
    }
}
