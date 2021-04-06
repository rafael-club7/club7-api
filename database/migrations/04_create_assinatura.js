exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('assinatura').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('assinatura', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }
                table.string('id', 45).primary();

                table.string('usuario', 45).notNullable();
                table.string('plano', 45).notNullable();
                table.string('cartao', 45).notNullable();

                table.decimal('valor', 14, 2).defaultTo(0);
                table.string('data_inicio', 30).notNullable();

                table.foreign('usuario').references('id').inTable('usuario');
                table.foreign('plano').references('id').inTable('plano');
                table.foreign('cartao').references('id').inTable('cartao_credito');

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('assinatura').then(function(exists) {
        if (exists) { return database.schema.dropTable('assinatura'); }
    });
};