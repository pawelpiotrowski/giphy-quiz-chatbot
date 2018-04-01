'use strict';

const _ = require('lodash');
const config = require('../config');
const axios = require('axios');
const Log = require('./log');
const language = require('@google-cloud/language');
const path = require('path');
const nlpTokenPath = path.resolve('./secrets/' + config.nlp_api_token);
const nlpClient = new language.LanguageServiceClient({ keyFilename: nlpTokenPath });
const HtmlEntities = new (require('html-entities').AllHtmlEntities)();
const GiphyApiClient = require('giphy-js-sdk-core');
const giphy = GiphyApiClient(config.giphy_api_token);

const quizModel = {};
// get all localised models
config.locales.forEach(locale => {
    quizModel[locale] = require(`../data/quizmodel-${locale}.json`);
});

module.exports = class Quiz {

    constructor(quizUserData) {
        this.category = quizUserData.quiz_category;
        this.difficulty = quizUserData.quiz_difficulty;
        this.size = quizUserData.quiz_size;
        this.question = quizUserData.quiz_question;
        this.questionNumber = quizUserData.question_number;
        this.result = quizUserData.quiz_result;
        this.lang = quizUserData.lang;
        this.uri = config.quiz.apiUrl;
        this.nlpApiToken = config.nlp_api_token;
    }

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
                //Log.info(['Quiz -> Fetched question ', [resp.data]]);
                const qq = resp.data.results[0];
                // fix encoding stuff like &#039; will be &apos;
                qq.question = HtmlEntities.encode(HtmlEntities.decode(qq.question));
                qq.correct_answer = HtmlEntities.encode(HtmlEntities.decode(qq.correct_answer));
                _.forEach(qq.incorrect_answers, (answer, ind) => {
                    qq.incorrect_answers[ind] = HtmlEntities.encode(HtmlEntities.decode(answer));
                });
                return qq;
            }
            throw new Error('Quiz fetch data problem');
        })
        .catch(err => {
            Log.error(['MESSENGER -> Cannot fetch question', [err]]);
            throw err;
        });
    }

    questionModel() {
        return _.cloneDeep(quizModel[this.lang].QUESTION);
    }

    resultModel() {
        return { answer: '', correct: false };
    }

    questionButtonConvert(model, answer) {
        model.title = answer;
        model.payload = '$quiz.' + _.snakeCase(HtmlEntities.decode(answer));
        return model;
    }

    async questionBuilder() {
        const rawQuestion = await this.fetchQuestion();
        const model = this.questionModel();
        // create buttons array with first item to be correct answer button
        const replies = [ this.questionButtonConvert(_.clone(model.payload.quick_replies[0]), rawQuestion.correct_answer) ];
        // add invalid answers buttons
        _.forEach(rawQuestion.incorrect_answers, invalidAnswer => {
            replies.push(this.questionButtonConvert(_.clone(model.payload.quick_replies[0]), invalidAnswer));
        });
        // add question
        model.title.payload = rawQuestion.question;
        // add buttons
        model.payload.quick_replies = _.shuffle(replies);
        // add correct answer
        model.correct_answer.push(rawQuestion.correct_answer);
        // add question number and total
        model.intro.payload = _.replace(model.intro.payload, '$number', _.isNumber(this.questionNumber) ? this.questionNumber : 1);
        model.intro.payload = _.replace(model.intro.payload, '$total', _.isNumber(this.size) ? this.size : 1);
        // add each button title to valid keys
        _.forEach(model.payload.quick_replies, reply => {
            model.valid_keys.push(reply.title);
        });
        return model;
    }

    async questionNlpSyntax(questionTitle) {
        Log.info(['QUIZ -> NLP questionTitle ',[ HtmlEntities.decode(questionTitle) ]]);
        const nlpResult = await nlpClient.analyzeSyntax({
            document: { content: HtmlEntities.decode(questionTitle), type: 'PLAIN_TEXT' }
        });
        let labels = ['NSUBJPASS','NN','TITLE','POSS','DOBJ','POBJ'];
        const labelsShortQuestion = ['NSUBJ','NSUBJPASS','NN','TITLE','POSS','DOBJ','POBJ'];
        labels = (_.words(questionTitle).length < 5) ? labelsShortQuestion : labels;
        const nouns = [];
        _.forEach(nlpResult[0].tokens, token => {
            if(token.partOfSpeech.tag === 'NOUN' && labels.indexOf(token.dependencyEdge.label) > -1) {
                nouns.push(token.text.content);
            }
        });
        return _.take(nouns, 3).join(' ');
    }

    async questionIllustration(questionTitle) {
        let questionNlp = await this.questionNlpSyntax(questionTitle);
        questionNlp = _.isEmpty(questionNlp) ? _.find(config.quiz.categories, { id: this.category }).slug : questionNlp;
        const illustrations = await giphy.search('gifs', {
            q: questionNlp,
            limit: 1,
            sort: 'relevant'
        });
        Log.info(['QUIZ -> NLP',[questionNlp]]);
        Log.info(['QUIZ -> Illustration',[illustrations.data[0].images.original.gif_url]]);
        return illustrations.data[0].images.original.gif_url;
    }

    async getResultThread() {
        Log.info(['QUIZ -> Result is', [this.result]]);
    }

    async validateAnswer(answer) {
        const question = JSON.parse(this.question);
        Log.info(['QUIZ -> Validate quiz, question is:', [question]]);
        const receivedAnswer = _.isObject(answer) ? answer.payload.split('.')[1] : _.snakeCase(HtmlEntities.decode(answer));
        Log.info(['QUIZ -> Validate quiz, received answer is:', [receivedAnswer]]);
        const validKeyIndex = _.findIndex(question.valid_keys, vKey => {
            return _.snakeCase(HtmlEntities.decode(vKey)) === receivedAnswer;
        });
        Log.info(['QUIZ -> Validate quiz, validKeyIndex is:', [validKeyIndex]]);
        if(validKeyIndex > -1) {
            const result = this.resultModel();
            result.answer = _.startCase(receivedAnswer);
            result.correct = (receivedAnswer === _.snakeCase(HtmlEntities.decode(question.correct_answer[0])));
            return { valid: true, result };
        }
        return { valid: false };
    }

    async getQuestionThread() {
        const questionThread = await this.questionBuilder();
        questionThread.attachment.payload.url = await this.questionIllustration(questionThread.title.payload);
        // create a sequence
        const questionThreadSequence = { meta: { template: 'sequence' }, payload: [] };
        questionThreadSequence.payload.push(questionThread.intro);
        questionThreadSequence.payload.push({ meta: { template: 'action' }, payload: { name: 'wait', args: 1000 } });
        questionThreadSequence.payload.push({ meta: { template: 'action' }, payload: { name: 'typeon', args: '' } });
        questionThreadSequence.payload.push({ meta: { template: 'action' }, payload: { name: 'wait', args: 1000 } });
        questionThreadSequence.payload.push(questionThread.title);
        return { thread: questionThread, sequence: questionThreadSequence };
    }
}
