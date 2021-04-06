exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('sessao').then(function (exists) {
        if (!exists) {
            return database.schema.createTable('sessao', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('usuario', 45).notNullable();

                table.string('data_inicio', 25).notNullable();
                table.string('ultima_data', 25);

                table.foreign('usuario').references('id').inTable('usuario');
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function (database) {
    return database.schema.hasTable('sessao').then(function (exists) {
        if (exists) { return database.schema.dropTable('sessao'); }
    });
};
