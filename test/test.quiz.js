'use strict';

const _ = require('lodash');
const config = require('../config');
const Quiz = require('../lib/quiz.js');
const expect = require('chai').expect;
//const sinon = require('sinon');
//const DB = require('../lib/db');
//const knexCleaner = require('knex-cleaner');

describe('QuizTest', () => {

    describe('fetchQuestion', () => {
        it('should format api raw question to messages format', async () => {
            const QuizInstance = new Quiz({ 
                quiz_category: 18,
                quiz_difficulty: 'medium',
                lang: 'en'
            });
            const quizQuestion = await QuizInstance.fetchQuestion();
            expect(quizQuestion).to.have.property('difficulty', 'medium');
            expect(quizQuestion).to.have.property('category', 'Science: Computers');
            expect(quizQuestion).to.have.property('correct_answer');
            expect(quizQuestion).to.have.property('incorrect_answers').to.be.an('array');
        });
    });

    describe('questionModel', () => {
        it('should return question model for given language', () => {
            const QuizInstance = new Quiz({ lang: 'en' });
            const questionModel = QuizInstance.questionModel();
            expect(questionModel).to.have.deep.property('meta', { template: 'picture_url' });
            expect(questionModel).to.have.property('payload').to.be.an('object');
        });
    });

    describe('questionBuilder', () => {
        it('should return formatted question', async () => {
            const QuizInstance = new Quiz({ 
                quiz_category: 26,
                quiz_difficulty: 'easy',
                quiz_size: 3,
                quiz_question: null,
                question_number: null,
                quiz_result: null,
                lang: 'en'
            });
            const question = await QuizInstance.questionBuilder();
            expect(question).to.have.deep.property('meta', { template: 'picture_url' });
            expect(question).to.have.property('payload').to.be.an('object');
            expect(question).to.have.property('title').to.be.a('string').that.is.not.empty;
            expect(question.payload).to.have.property('buttons').to.be.an('array').to.have.lengthOf(3);
            expect(question).to.have.property('valid_keys').to.be.an('array').to.have.lengthOf(3);
            expect(question).to.have.property('correct_answer').to.be.an('array').to.have.lengthOf(1);
            
            const correctAnswerInAnswers = _.find(question.payload.buttons, { title: question.correct_answer[0] });

            expect(correctAnswerInAnswers).to.have.property('type', 'postback');
            expect(correctAnswerInAnswers).to.have.property('title', question.correct_answer[0]);
        });
    });

    describe('validateAnswer', () => {
        it('should validate quiz answer', async () => {
            
        });
    });

    describe('getQuestionThread', () => {
        const QuizInstance = new Quiz({ 
            quiz_category: 18,
            quiz_difficulty: 'easy',
            quiz_size: 3,
            quiz_question: null,
            question_number: null,
            quiz_result: null,
            lang: 'en'
        });
        it('should get next quiz question ready to send back', async () => {
            await QuizInstance.getQuestionThread();
        });
    });
});
