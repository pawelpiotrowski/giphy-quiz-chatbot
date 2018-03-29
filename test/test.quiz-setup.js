'use strict';

const messagesEN = require('../data/messages-en.json');
const quizSetup = require('../lib/quiz-setup.js');
const expect = require('chai').expect;

describe('QuizSetupTest', () => {

    describe('getOptionKey', () => {
        it('should return setup option key to store for given option slug', () => {
            const optionCategoryKey = quizSetup.getOptionKey('category');
            const optionDifficultyKey = quizSetup.getOptionKey('difficulty');

            expect(optionCategoryKey).to.equal('quiz_category');
            expect(optionDifficultyKey).to.equal('quiz_difficulty');
        });
    });

    describe('getOptionValue', () => {
        it('should return setup option value object to store for given slug and response', () => {
            // helper to format valid answer object
            const vao = (slug, response) => { return { slug, response } };

            const optionValueCategoryText = quizSetup.getOptionValue(vao('category', 'Books'));
            const optionValueCategoryPostback = quizSetup.getOptionValue(vao('category', 'comics'));
            const optionValueDifficultyText = quizSetup.getOptionValue(vao('difficulty', ' Easy'));
            const optionValueDifficultyPostback = quizSetup.getOptionValue(vao('difficulty', 'hard'));

            expect(optionValueCategoryText).to.have.property('id', 10);
            expect(optionValueCategoryPostback).to.have.property('id', 29);
            expect(optionValueDifficultyText).to.have.property('id', 'easy');
            expect(optionValueDifficultyPostback).to.have.property('id', 'hard');
        });
    });

    describe('getOption', () => {
        it('should return setup option object with key and value to store for given slug and response', () => {
            // helper to format valid answer object
            const vao = (slug, response) => { return { slug, response } };

            const optionCategoryText = quizSetup.getOption(vao('category', 'Celebrities'));
            const optionCategoryPostback = quizSetup.getOption(vao('category', 'computers'));
            const optionDifficultyText = quizSetup.getOption(vao('difficulty', ' Easy'));
            const optionDifficultyPostback = quizSetup.getOption(vao('difficulty', 'hard'));

            expect(optionCategoryText).to.have.property('key', 'quiz_category');
            expect(optionCategoryPostback).to.have.property('key', 'quiz_category');
            expect(optionCategoryText).to.nested.include({ 'value.id': 26 });
            expect(optionCategoryPostback).to.nested.include({ 'value.id': 18 });

            expect(optionDifficultyText).to.have.property('key', 'quiz_difficulty');
            expect(optionDifficultyPostback).to.have.property('key', 'quiz_difficulty');
            expect(optionDifficultyText).to.nested.include({ 'value.id': 'easy' });
            expect(optionDifficultyPostback).to.nested.include({ 'value.id': 'hard' });
        });
    });

    describe('validateAnswer', () => {
        // category
        const validCategoryText = quizSetup.validateAnswer({
            threadKey: '$setup.category',
            cargo: 'Film',
            thread: messagesEN['CATEGORY']
        });
        const invalidCategoryText = quizSetup.validateAnswer({
            threadKey: '$setup.category',
            cargo: 'Comodo Dragon',
            thread: messagesEN['CATEGORY']
        });
        const validCategoryPostback = quizSetup.validateAnswer({
            threadKey: '$setup.category.film',
            cargo: { payload: '$setup.category.film' },
            thread: messagesEN['CATEGORY']
        });

        it('should validate setup text answer and return validation object', () => {
            expect(validCategoryText).to.have.property('valid', true);
            expect(invalidCategoryText).to.have.property('valid', false);
        });

        it('should validate setup postback answer and return validation object', () => {
            expect(validCategoryPostback).to.have.property('valid', true);
        });

        it('should include option object to store if answer is valid', () => {
            expect(validCategoryText).to.nested.include({ 'option.value.id': 11 });
            expect(validCategoryPostback).to.nested.include({ 'option.value.id': 11 });
            expect(validCategoryText).to.nested.include({ 'option.key': 'quiz_category' });
            expect(validCategoryPostback).to.nested.include({ 'option.key': 'quiz_category' });
        });

        it('should not include option object if answer is invalid', () => {
            expect(invalidCategoryText).to.not.have.property('option');
        }); 
    });
});
