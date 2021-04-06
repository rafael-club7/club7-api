require('dotenv').config();
const PROD = process.env.PROD === 'true';
const fs = require('fs');
const path = require('path');
const database = require('./connection');

const migrationsDir = path.join(__dirname, 'migrations');

const createDB = async() => {
    if (PROD) {
        const conn = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            charset: 'utf8'
        };

        try {
            const knex = require('knex')({ client: 'mysql', connection: conn });

            await knex.raw(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_BASE}`).catch(e => console.log(e));
        } catch (e) {
            console.log(e);
        }
    }

    await database.schema.hasTable('script_runned').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('script_runned', table => {
                if (PROD) { table.collate('utf8_unicode_ci'); }

                table.increments('id').notNullable();
                table.string('name', 50).notNullable();
            });
        }
    });

    return true;
};

const isRunned = async(name) => {
    const data = await database('script_runned').whereRaw(`name = '${name}'`);
    return data.length > 0;
};

const setRunned = async(name) => {
    return await database('script_runned').insert({ name });
};

const migrate = async() => {
    await createDB();

    const migrations = fs.readdirSync(migrationsDir);

    for (const file of migrations) {
        const migration = require(`${migrationsDir}/${file}`);

        if (!(await isRunned(file))) {
            let error = false;
            try {
                await migration.up(database, PROD);
                await setRunned(file);
            } catch (E) {
                error = true;
                console.log(E);
            }
            if (!error) {
                console.log(`Runned ${file} successfully!`);
            }
        }
    }

    console.log('Database generated successfully');
    await seed();
    process.exit();
};

const seed = async() => {
    const seedsDir = path.join(__dirname, 'seeds');

    const seeds = fs.readdirSync(seedsDir);

    for (const file of seeds) {
        const seed = require(`${seedsDir}/${file}`);

        if (!(await isRunned(file))) {
            let error = false;
            try {
                await database(seed.table).insert(seed.values);
                await setRunned(file);
            } catch (E) {
                error = true;
                console.log(E);
            }
            if (!error) {
                console.log(`Runned ${file} successfully!`);
            }
        }
    }

    console.log('Done!');
};

migrate();