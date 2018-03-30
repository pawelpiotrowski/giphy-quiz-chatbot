'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.json('quiz_question');
        usersTable.integer('quiz_question_number');
        usersTable.json('quiz_result');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.dropColumn('quiz_question');
        usersTable.dropColumn('quiz_question_number');
        usersTable.dropColumn('quiz_result');
    });
};
