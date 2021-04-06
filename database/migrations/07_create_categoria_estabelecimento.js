exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('categoria_estabelecimento').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('categoria_estabelecimento', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('nome', 45).notNullable();
                table.string('nome_normalizado', 45).notNullable();
                table.string('icone', 50).notNullable();

                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('categoria_estabelecimento').then(function(exists) {
        if (exists) { return database.schema.dropTable('categoria_estabelecimento'); }
    });
};