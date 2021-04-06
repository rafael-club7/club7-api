require('dotenv').config();
const knex = require('knex');
const connection = require('../knexfile');
const PROD = process.env.PROD === 'true';
module.exports = knex(connection[PROD ? 'production' : 'development']);
