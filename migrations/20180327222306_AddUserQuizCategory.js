'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.string('quiz_category', 50);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', usersTable => {
        usersTable.dropColumn('quiz_category');
    });
};
