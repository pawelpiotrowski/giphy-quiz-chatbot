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
    }

    validateResetKeyword(keyword) {
        return this.messages().helpers.resetKeyword === _.toLower(_.trim(keyword));
    }

    helpers() {
        return this.messages().helpers;
    }

    dialog() {
        return _.cloneDeep(dialogs[this.dialogName]);
    }

    dialogThreadKeys() {
        return this.dialog().threadKeys;
    }

    dialogLength() {
        return this.dialogThreadKeys().length;
    }

    messages() {
        return _.cloneDeep(messages[this.lang]);
    }

    endThreadKey() {
        return this.dialog().endKey;
    }

    firstThreadKey() {
        return this.dialogThreadKeys()[1];
    }

    startThreadKey() {
        return this.dialogThreadKeys()[0];
    }

    nextThreadKey(threadKey) {
        const keyIndex = this.threadKeyIndex(threadKey);
        if(keyIndex === this.dialogLength() - 1) {
            return this.endThreadKey();
        }
        if(keyIndex < 0) {
            Log.error(['CONVERSATION -> Key ' + threadKey + ' not found!']);
            return this.endThreadKey();
        }
        return this.dialogThreadKeys()[keyIndex + 1];
    }

    threadKeyIndex(threadKey) {
        return this.dialogThreadKeys().indexOf(threadKey);
    }

    threadByKey(threadKey) {
        const thread = this.messages()[threadKey.toUpperCase()];
        if(!thread) {
            Log.error(['CONVERSATION -> Cannot get thread by Key ' + threadKey]);
        }
        return thread;
    }

    nextThread(threadKey) {
        const nextKey = this.nextKey(threadKey);
        return (nextKey === this.endThreadKey()) ? nextKey : this.threadByKey(nextKey);
    }
}
