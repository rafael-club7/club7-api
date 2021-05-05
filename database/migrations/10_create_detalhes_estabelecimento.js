exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('estabelecimento').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('estabelecimento', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();

                table.integer('tem_wifi').notNullable();

                table.string('wifi_nome', 45);
                table.string('wifi_senha', 45);

                table.integer('tem_banheiro').notNullable();
                table.integer('tem_local_descanso').notNullable();
                table.integer('tem_local_carregar_celular').notNullable();

                table.string('parceiro', 45).notNullable();
                table.foreign('parceiro').references('id').inTable('usuario');

                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('estabelecimento').then(function(exists) {
        if (exists) { return database.schema.dropTable('estabelecimento'); }
    });
};