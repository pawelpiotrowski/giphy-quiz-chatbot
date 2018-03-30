'use strict';

const config = require('../config');
const axios = require('axios');
const Log = require('./log');

module.exports = class Quiz {

    constructor(quizUserData) {
        this.category = quizUserData.quiz_category,
        this.difficulty = quizUserData.quiz_difficulty,
        this.size = quizUserData.quiz_size,
        this.question = quizUserData.quiz_question,
        this.questionNumber = quizUserData.question_number,
        this.result = quizUserData.quiz_result,
        this.lang = quizUserData.lang,
        this.uri = config.quiz.apiUrl
    }

    async questionBuilder() {}

    fetchQuestion() {
        return axios.get(this.uri, {
            params: {
                amount: 1,
                category: this.category,
                difficulty: this.difficulty,
                type: 'multiple'
            }
        })
        .then(resp => {
            if(resp.data && resp.data.response_code === 0) {
                Log.info(['Quiz -> Fetched question ', [resp.data]]);
                return resp.data.results[0];
            }
            throw new Error('Quiz fetch data problem');
        })
        .catch(err => {
            Log.error(['MESSENGER -> Cannot fetch question', [err]]);
            throw err;
        });
    }

    async validateAnswer() {}

    async getQuestion() {}
}
