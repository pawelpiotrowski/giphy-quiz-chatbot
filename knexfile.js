'use strict';

const config = require('./config');

module.exports = {
    development: {
        migrations: { tableName: 'knex_migrations' },
        seeds: { tableName: './seeds' },
        client: 'mysql',
        connection: config.db.dev
    }
};
