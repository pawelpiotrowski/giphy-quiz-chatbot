'use strict';

const config = require('../config');
const Quiz = require('../lib/quiz.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const DB = require('../lib/db');
const knexCleaner = require('knex-cleaner');

describe('QuizTest', () => {

    describe('questionBuilder', () => {
        it('should fetch api raw question', async () => {
            
        });
    });

    describe('fetchQuestion', () => {
        it('should format api raw question to messages format', async () => {
            const QuizInstance = new Quiz({ 
                quiz_category: 18,
                quiz_difficulty: 'medium',
                quiz_size: 3,
                quiz_question: null,
                question_number: null,
                quiz_result: null,
                lang: 'en'
            });
            const quizQuestion = await QuizInstance.fetchQuestion();
            expect(quizQuestion).to.have.property('difficulty', 'medium');
            expect(quizQuestion).to.have.property('category', 'Science: Computers');
            expect(quizQuestion).to.have.property('correct_answer');
            expect(quizQuestion).to.have.property('incorrect_answers');
            expect(quizQuestion.incorrect_answers).to.be.an('array');
        });
    });

    describe('validateAnswer', () => {
        it('should validate quiz answer', async () => {
            
        });
    });

    describe('getQuestion', () => {
        it('should get next quiz question ready to send back', async () => {
            
        });
    });
});
