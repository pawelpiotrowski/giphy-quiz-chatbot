'use strict';

const knexFile = require('../knexfile');

module.exports = require('knex')({
    client: knexFile.development.client,
    connection: knexFile.development.connection
});
