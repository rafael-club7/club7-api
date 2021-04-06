exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('cartao_credito').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('cartao_credito', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }
                table.string('id', 45).primary();
                table.string('usuario', 45).notNullable();

                table.string('nome', 60).notNullable();
                table.string('numero', 20).notNullable();
                table.string('mes', 2).notNullable();
                table.string('ano', 4).notNullable();
                table.string('cvv', 4).notNullable();

                table.integer('status').defaultTo(1);

                table.foreign('usuario').references('id').inTable('usuario');

                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('cartao_credito').then(function(exists) {
        if (exists) { return database.schema.dropTable('cartao_credito'); }
    });
};