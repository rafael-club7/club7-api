exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('plano').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('plano', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }
                table.string('id', 45).primary();
                table.string('nome', 80).notNullable();
                table.string('nome_normalizado', 80).notNullable();

                table.decimal('valor', 14, 2).notNullable();

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function(database) {
    return database.schema.hasTable('plano').then(function(exists) {
        if (exists) { return database.schema.dropTable('plano'); }
    });
};