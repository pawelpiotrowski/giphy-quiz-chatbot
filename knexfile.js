'use strict';

const config = require('./config');

module.exports = {
    development: {
        migrations: { tableName: 'knex_migrations' },
        seeds: { tableName: './seeds' },
        client: 'mysql2',
        connection: config.db.dev
    },
    test: {
        migrations: { tableName: 'knex_migrations' },
        seeds: { tableName: './seeds' },
        client: 'mysql2',
        connection: config.db.test
    },
    production: {
        migrations: { tableName: 'knex_migrations' },
        seeds: { tableName: './seeds' },
        client: 'mysql2',
        connection: config.db.live
    }
};
