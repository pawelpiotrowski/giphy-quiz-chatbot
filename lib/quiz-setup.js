'use strict';

const _ = require('lodash');
const config = require('../config');
const safeEval = require('safe-eval');

const optionSlugs = {
    category: {
        configName: 'categories',
        dbUserColumnName: 'quiz_category'
    },
    difficulty: {
        configName: 'difficultyLevels',
        dbUserColumnName: 'quiz_difficulty'
    },
    size: {
        configName: 'size',
        dbUserColumnName: 'quiz_size'
    }
};

module.exports = {

    getAnswerThreadValidKeys(answerThreadValidKeys) {
        if(_.isString(answerThreadValidKeys) && _.startsWith(answerThreadValidKeys, '_.')) {
            return safeEval(answerThreadValidKeys, {_: _});
        }
        return answerThreadValidKeys;
    },

    getAnswerValidKeyIndex(answerThreadValidKeys, receivedAnswer) {
        return _.findIndex(this.getAnswerThreadValidKeys(answerThreadValidKeys), (key) => {
            return _.lowerCase(key) === _.lowerCase(receivedAnswer);
        });
    },

    getOptionKey(validAnswerSlug) {
        return optionSlugs[validAnswerSlug].dbUserColumnName;
    },

    getOptionValue(validAnswer) {
        const slug = validAnswer.slug;
        const response = validAnswer.response;
        return _.find(config.quiz[optionSlugs[slug].configName], (configQuizOption) => {
            return _.toString(configQuizOption.slug) === _.snakeCase(response);
        });
    },

    getOption(validAnswer) {
        return {
            key: this.getOptionKey(validAnswer.slug),
            value: this.getOptionValue(validAnswer).id
        }
    },

    validateAnswer(answer) {
        const splitThreadKey = answer.threadKey.split('.');
        const receivedAnswer = (splitThreadKey.length > 2) ? splitThreadKey[2] : _.trim(answer.cargo);
        const validKeyIndex = this.getAnswerValidKeyIndex(answer.thread.valid_keys, receivedAnswer);
        if(validKeyIndex > -1) {
            const option = this.getOption({
                slug: splitThreadKey[1], 
                response: receivedAnswer
            });
            return { valid: true, option };
        }
        return { valid: false };
    }

}
