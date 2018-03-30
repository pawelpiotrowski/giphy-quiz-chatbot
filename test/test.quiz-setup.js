'use strict';

const config = require('../config');
const messagesEN = require('../data/messages-en.json');
const quizSetup = require('../lib/quiz-setup.js');
const expect = require('chai').expect;

describe('QuizSetupTest', () => {
    describe('getAnswerThreadValidKeys', () => {
        it('should convert setup thread valid keys to an array if gets a string', () => {
            const optionCategoryThread = quizSetup.getAnswerThreadValidKeys(messagesEN['CATEGORY'].valid_keys);
            const optionDifficultyThread = quizSetup.getAnswerThreadValidKeys(messagesEN['DIFFICULTY'].valid_keys);
            const optionSizeThread = quizSetup.getAnswerThreadValidKeys(messagesEN['SIZE'].valid_keys);

            expect(optionCategoryThread).to.be.an('array');
            expect(optionCategoryThread).to.have.lengthOf(5);
            expect(optionDifficultyThread).to.be.an('array');
            expect(optionDifficultyThread).to.have.lengthOf(3);
            expect(optionSizeThread).to.be.an('array');
            expect(optionSizeThread).to.have.lengthOf(config.quiz.maxSize);
        });
    });

    describe('getAnswerValidKeyIndex', () => {
        it('should return setup option valid key for given array of valid keys and answer', () => {
            const optionCategoryThreadValidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['CATEGORY'].valid_keys, 'books');
            const optionDifficultyThreadValidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['DIFFICULTY'].valid_keys, 'Medium');
            const optionSizeThreadValidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['SIZE'].valid_keys, 3);
            const optionCategoryThreadInvalidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['CATEGORY'].valid_keys, 'hello there');
            const optionDifficultyThreadInvalidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['DIFFICULTY'].valid_keys, 'Extra');
            const optionSizeThreadInvalidKey = quizSetup.getAnswerValidKeyIndex(messagesEN['SIZE'].valid_keys, '100000');
            
            expect(optionCategoryThreadValidKey).to.equal(0);
            expect(optionDifficultyThreadValidKey).to.equal(1);
            expect(optionSizeThreadValidKey).to.equal(2);
            expect(optionCategoryThreadInvalidKey).to.equal(-1);
            expect(optionDifficultyThreadInvalidKey).to.equal(-1);
            expect(optionSizeThreadInvalidKey).to.equal(-1);
        });
    });

    describe('getOptionKey', () => {
        it('should return setup option key to store for given option slug', () => {
            const optionCategoryKey = quizSetup.getOptionKey('category');
            const optionDifficultyKey = quizSetup.getOptionKey('difficulty');
            const optionSizeKey = quizSetup.getOptionKey('size');

            expect(optionCategoryKey).to.equal('quiz_category');
            expect(optionDifficultyKey).to.equal('quiz_difficulty');
            expect(optionSizeKey).to.equal('quiz_size');
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
            const optionValueSizeNumber = quizSetup.getOptionValue(vao('size', 1));
            const optionValueSizeText = quizSetup.getOptionValue(vao('size', '6'));

            expect(optionValueCategoryText).to.have.property('id', 10);
            expect(optionValueCategoryPostback).to.have.property('id', 29);
            expect(optionValueDifficultyText).to.have.property('id', 'easy');
            expect(optionValueDifficultyPostback).to.have.property('id', 'hard');
            expect(optionValueSizeNumber).to.have.property('id', 1);
            expect(optionValueSizeText).to.have.property('id', 6);
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
            const optionSizeNumber = quizSetup.getOption(vao('size', 1));
            const optionSizeText = quizSetup.getOption(vao('size', '6'));

            expect(optionCategoryText).to.have.property('key', 'quiz_category');
            expect(optionCategoryPostback).to.have.property('key', 'quiz_category');
            expect(optionCategoryText).to.have.property('value', 26);
            expect(optionCategoryPostback).to.have.property('value', 18);

            expect(optionDifficultyText).to.have.property('key', 'quiz_difficulty');
            expect(optionDifficultyPostback).to.have.property('key', 'quiz_difficulty');
            expect(optionDifficultyText).to.have.property('value', 'easy');
            expect(optionDifficultyPostback).to.have.property('value', 'hard');

            expect(optionSizeNumber).to.have.property('key', 'quiz_size');
            expect(optionSizeText).to.have.property('key', 'quiz_size');
            expect(optionSizeNumber).to.have.property('value', 1);
            expect(optionSizeText).to.have.property('value', 6);
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
        // difficulty level
        const validDifficultyText = quizSetup.validateAnswer({
            threadKey: '$setup.difficulty',
            cargo: 'Easy',
            thread: messagesEN['DIFFICULTY']
        });
        const invalidDifficultyText = quizSetup.validateAnswer({
            threadKey: '$setup.difficulty',
            cargo: 'Super extra hard',
            thread: messagesEN['DIFFICULTY']
        });
        const validDifficultyPostback = quizSetup.validateAnswer({
            threadKey: '$setup.difficulty.medium',
            cargo: { payload: '$setup.difficulty.medium' },
            thread: messagesEN['DIFFICULTY']
        });
        // size
        const validSizeText = quizSetup.validateAnswer({
            threadKey: '$setup.size',
            cargo: '1 ',
            thread: messagesEN['SIZE']
        });
        const validSizeNumber = quizSetup.validateAnswer({
            threadKey: '$setup.size',
            cargo: 7,
            thread: messagesEN['SIZE']
        });
        const invalidSizeText = quizSetup.validateAnswer({
            threadKey: '$setup.size',
            cargo: 'whatever',
            thread: messagesEN['SIZE']
        });
        const invalidSizeNumber = quizSetup.validateAnswer({
            threadKey: '$setup.size',
            cargo: 20,
            thread: messagesEN['SIZE']
        });

        it('should validate setup text answer and return validation object', () => {
            expect(validCategoryText).to.have.property('valid', true);
            expect(invalidCategoryText).to.have.property('valid', false);
            expect(validDifficultyText).to.have.property('valid', true);
            expect(invalidDifficultyText).to.have.property('valid', false);
            expect(validSizeText).to.have.property('valid', true);
            expect(validSizeNumber).to.have.property('valid', true);
            expect(invalidSizeText).to.have.property('valid', false);
            expect(invalidSizeNumber).to.have.property('valid', false);
        });

        it('should validate setup postback answer and return validation object', () => {
            expect(validCategoryPostback).to.have.property('valid', true);
            expect(validDifficultyPostback).to.have.property('valid', true);
        });

        it('should include option object to store if answer is valid', () => {
            expect(validCategoryText).to.nested.include({ 'option.value': 11 });
            expect(validCategoryPostback).to.nested.include({ 'option.value': 11 });
            expect(validCategoryText).to.nested.include({ 'option.key': 'quiz_category' });
            expect(validCategoryPostback).to.nested.include({ 'option.key': 'quiz_category' });
            expect(validDifficultyText).to.nested.include({ 'option.value': 'easy' });
            expect(validDifficultyPostback).to.nested.include({ 'option.value': 'medium' });
            expect(validDifficultyText).to.nested.include({ 'option.key': 'quiz_difficulty' });
            expect(validDifficultyPostback).to.nested.include({ 'option.key': 'quiz_difficulty' });
            expect(validSizeText).to.nested.include({ 'option.value': 1 });
            expect(validSizeNumber).to.nested.include({ 'option.value': 7 });
            expect(validSizeText).to.nested.include({ 'option.key': 'quiz_size' });
            expect(validSizeNumber).to.nested.include({ 'option.key': 'quiz_size' });
        });

        it('should not include option object if answer is invalid', () => {
            expect(invalidCategoryText).to.not.have.property('option');
            expect(invalidDifficultyText).to.not.have.property('option');
            expect(invalidSizeText).to.not.have.property('option');
            expect(invalidSizeNumber).to.not.have.property('option');
        }); 
    });
});
