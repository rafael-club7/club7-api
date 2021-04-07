exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('usuario').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('usuario', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('nome', 80).notNullable();
                table.string('nome_normalizado', 80).notNullable();
                table.string('email', 80).notNullable();
                table.string('senha', 80).notNullable();
                table.string('cpf', 11).notNullable();

                table.integer('tipo').notNullable();
                table.string('data_criacao', 35).notNullable();

                table.string('indicado', 45);
                table.foreign('indicado').references('id').inTable('usuario');

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('usuario').then(function(exists) {
        if (exists) { return database.schema.dropTable('usuario'); }
    });
};