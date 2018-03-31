'use strict';

const _ = require('lodash');
const config = require('../config');
const Quiz = require('../lib/quiz.js');
const expect = require('chai').expect;
const quizModelEN = require('../data/quizmodel-en.json');

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
            expect(questionModel).to.have.deep.property('meta', { template: 'quick_replies_attachment' });
            expect(questionModel).to.have.property('payload').to.be.an('object');
            expect(questionModel).to.have.property('attachment').to.be.an('object');
            expect(questionModel).to.have.property('title').to.be.an('object');
            expect(questionModel.title).to.have.property('payload').to.be.a('string');
            expect(questionModel.title).to.have.deep.property('meta', { template: 'text' });
        });
    });
    
    describe('questionButtonConvert', () => {
        it('should return question thread button for given model and answer', () => {
            const QuizInstance = new Quiz({});
            const buttonModel = _.cloneDeep(quizModelEN['QUESTION'].payload.quick_replies[0]);
            const questionButton = QuizInstance.questionButtonConvert(buttonModel, 'Hello there');
            expect(questionButton).to.have.property('content_type', 'text');
            expect(questionButton).to.have.property('title', 'Hello there');
            expect(questionButton).to.have.property('payload', '$quiz.hello_there');
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
            expect(question).to.have.deep.property('meta', { template: 'quick_replies_attachment' });
            expect(question).to.have.property('payload').to.be.an('object');
            expect(question.payload).to.have.property('quick_replies').to.be.an('array').to.have.lengthOf.above(1);
            expect(question).to.have.property('valid_keys').to.be.an('array').to.have.lengthOf.above(1);
            expect(question).to.have.property('correct_answer').to.be.an('array').to.have.lengthOf(1);
            expect(question).to.have.property('title').to.be.an('object');
            expect(question.title).to.have.deep.property('meta', { template: 'text' });
            expect(question.title).to.have.property('payload').to.be.a('string').that.is.not.empty;
            
            const correctAnswerInAnswers = _.find(question.payload.quick_replies, { title: question.correct_answer[0] });

            expect(correctAnswerInAnswers).to.have.property('content_type', 'text');
            expect(correctAnswerInAnswers).to.have.property('title', question.correct_answer[0]);
        });
    });

    describe('questionNlpSyntax', () => {
        it('should return main nouns for given question', async () => {
            const QuizInstance = new Quiz({});
            const questionNlp = await QuizInstance.questionNlpSyntax('Aubrey Graham is better known as');
            expect(questionNlp).to.equal('Aubrey Graham');
        });
    });

    describe('questionIllustration', () => {
        it('should return giphy gif url for given question', async () => {
            const QuizInstance = new Quiz({});
            const giphyUrl = await QuizInstance.questionIllustration('What is a meaning of life?');
            expect(giphyUrl).to.have.string('http');
            expect(giphyUrl).to.have.string('.gif');
        });
    });

    // describe('validateAnswer', () => {
    //     it('should validate quiz answer', async () => {
            
    //     });
    // });

    describe('getQuestionThread', () => {
        it('should get next quiz question ready to send back', async () => {
            const QuizInstance = new Quiz({ 
                quiz_category: 18,
                quiz_difficulty: 'easy',
                quiz_size: 3,
                quiz_question: null,
                question_number: null,
                quiz_result: null,
                lang: 'en'
            });
            const questionThread = await QuizInstance.getQuestionThread();
            expect(questionThread).to.have.property('payload').to.be.an('object');
            expect(questionThread).to.have.property('title').to.be.an('object');
            expect(questionThread).to.have.property('attachment').to.be.an('object');
            expect(questionThread.attachment).to.have.property('payload').to.be.an('object');
            expect(questionThread.attachment.payload).to.have.property('url').to.have.string('http');
            expect(questionThread.attachment.payload).to.have.property('url').to.have.string('.gif');
        });
    });
});
