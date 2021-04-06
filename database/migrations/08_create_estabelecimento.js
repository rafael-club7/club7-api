exports.up = async function(database, utf8 = false) {
    return database.schema.hasTable('estabelecimento').then(function(exists) {
        if (!exists) {
            return database.schema.createTable('estabelecimento', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }

                table.string('id', 45).primary();
                table.string('nome', 45).notNullable();
                table.string('nome_normalizado', 45).notNullable();
                table.integer('cnpj', 14).notNullable();
                table.string('imagem', 50);
                table.string('email', 30).notNullable();
                table.string('senha', 30).notNullable();

                table.string('rua', 40).notNullable();
                table.string('numero', 10).notNullable();
                table.string('bairro', 30).notNullable();
                table.string('cidade', 30).notNullable();
                table.string('estado', 30).notNullable();
                table.string('cep', 10).notNullable();
                table.string('complemento', 50);

                table.string('latitude', 20).notNullable();
                table.string('longitude', 20).notNullable();

                table.string('categoria', 45).notNullable();
                table.foreign('categoria').references('id').inTable('categoria_estabelecimento');

                table.integer('status').defaultTo(1);
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