exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('servico').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('servico', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('nome', 45).notNullable();
                table.string('nome_normalizado', 45).notNullable();

                table.text('descricao');

                table.decimal('desconto', 14, 2).notNullable();
                table.integer('tipo_desconto').notNullable();
                table.integer('tipo_resgate').notNullable();
                table.string('validade');

                table.string('parceiro', 45).notNullable();
                table.foreign('parceiro').references('id').inTable('usuario');

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('servico').then(function(exists) {
        if (exists) { return database.schema.dropTable('servico'); }
    });
};