'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.string('quiz_difficulty', 50);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.dropColumn('quiz_difficulty');
    });
};
