'use strict';

const config = require('../config');

exports.seed = (knex, Promise) => {
    const tableName = 'users';
    const rows = [
        {
            fbid: config.dbTestUserFbid,
            thread_key: 'test',
            dialog_name: 'test',
            lang: 'en'
        }
    ];

    return knex(tableName).del().then(() => {
        return knex.insert(rows).into(tableName);
    });
};
