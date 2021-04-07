const path = require('path');

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: path.resolve(__dirname, 'database', 'database.sqlite')
        },
        migrations: {
            directory: path.resolve(__dirname, 'database', 'migrations')
        },
        seeds: {
            directory: path.resolve(__dirname, 'database', 'seeds')
        },
        useNullAsDefault: true
    },
    production: {
        client: 'mysql',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_BASE,
        },
        migrations: {
            directory: path.resolve(__dirname, 'database', 'migrations')
        },
        seeds: {
            directory: path.resolve(__dirname, 'database', 'seeds')
        },
        useNullAsDefault: true
    }
};