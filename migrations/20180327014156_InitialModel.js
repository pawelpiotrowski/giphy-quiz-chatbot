'use strict';

exports.up = (knex, Promise) => {
    return knex.schema.createTable('users', usersTable => {
        // Primary Key
        usersTable.increments();
        // Data
        usersTable.string('fbid', 50).notNullable();
        usersTable.string('thread_key', 100);
        usersTable.string('dialog_name', 50);
        usersTable.string('lang', 2);
        // Timestamp
        usersTable.timestamp('created_at').notNullable();
    });
};

exports.down = (knex, Promise) => {
    return knex.schema.dropTableIfExists('users');
};
