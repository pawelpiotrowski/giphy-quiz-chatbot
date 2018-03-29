'use strict';

const _ = require('lodash');
const config = require('../config');

const optionSlugs = {
    category: {
        configName: 'categories',
        dbUserColumnName: 'quiz_category'
    },
    difficulty: {
        configName: 'difficultyLevels',
        dbUserColumnName: 'quiz_difficulty'
    }
};

module.exports = {

    getOptionKey(validAnswerSlug) {
        return optionSlugs[validAnswerSlug].dbUserColumnName;
    },

    getOptionValue(validAnswer) {
        const slug = validAnswer.slug;
        const response = validAnswer.response;
        return _.find(config.quiz[optionSlugs[slug].configName], (configQuizOption) => {
            return configQuizOption.slug === _.snakeCase(response);
        });
    },

    getOption(validAnswer) {
        return {
            key: this.getOptionKey(validAnswer.slug),
            value: this.getOptionValue(validAnswer)
        }
    },

    validateAnswer(answer) {
        const splitThreadKey = answer.threadKey.split('.');
        const receivedAnswer = (splitThreadKey.length > 2) ? splitThreadKey[2] : _.trim(answer.cargo);
        const validKeyIndex = _.findIndex(answer.thread.valid_keys, (key) => {
            return key.toLowerCase() === receivedAnswer.toLowerCase();
        });
        const optionSlug = splitThreadKey[1];
        if(validKeyIndex > -1) {
            const option = this.getOption({
                slug: optionSlug, 
                response: receivedAnswer
            });
            return { valid: true, option };
        }
        return { valid: false };
    }

}
