require('dotenv').config();
const PROD = process.env.PROD === 'true';

const fs = require('fs');
const path = require('path');
const knex = require('./connection');

const rollback = async() => {
    if (PROD) {
        await knex.raw(`DROP DATABASE IF EXISTS ${process.env.DB_BASE}`).catch(e => console.log(e));
    } else {
        fs.unlinkSync(path.join(__dirname, 'database.sqlite'));
    }

    console.log('Database droped successfully');
    process.exit();
};

rollback();