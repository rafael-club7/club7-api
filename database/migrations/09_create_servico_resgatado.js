exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('servico_resgatado').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('servico_resgatado', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('data', 25).notNullable();

                table.string('usuario', 45).notNullable();
                table.foreign('usuario').references('id').inTable('usuario');

                table.string('codigo', 10).notNullable();

                table.string('servico', 45).notNullable();
                table.foreign('servico').references('id').inTable('servico');

                table.string('parceiro', 45).notNullable();
                table.foreign('parceiro').references('id').inTable('usuario');

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('servico_resgatado').then(function(exists) {
        if (exists) { return database.schema.dropTable('servico_resgatado'); }
    });
};