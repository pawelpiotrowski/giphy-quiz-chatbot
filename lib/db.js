'use strict';

const knexFile = require('../knexfile');
const env = process.env.NODE_ENV || 'development';

module.exports = require('knex')({
    client: knexFile[env].client,
    connection: knexFile[env].connection
});
