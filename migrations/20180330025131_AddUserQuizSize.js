'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.integer('quiz_size');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.dropColumn('quiz_size');
    });
};
