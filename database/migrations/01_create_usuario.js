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
                table.string('celular', 11);
                table.string('cpf', 11);

                table.integer('tipo').notNullable();
                table.string('data_criacao', 35).notNullable();

                table.string('indicado', 45);
                table.foreign('indicado').references('id').inTable('usuario');
                table.integer('mudar_senha').defaultTo(0);


                // INFO de Estabelecimento
                table.integer('cnpj', 14);
                // table.string('imagem', 50);

                // table.string('rua', 40);
                // table.string('numero', 10);
                // table.string('bairro', 30);
                // table.string('cidade', 30);
                // table.string('estado', 30);
                // table.string('cep', 10);
                // table.string('complemento', 50);

                // table.string('latitude', 20);
                // table.string('longitude', 20);

                table.string('categoria', 45);
                table.foreign('categoria').references('id').inTable('categoria_estabelecimento');

                table.integer('confirmacao_email').defaultTo(0);
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