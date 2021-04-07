exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('pagamento').then(function (exists) {
        if (!exists) {
            return database.schema.createTable('pagamento', table => {
                if (utf8) { table.collate('utf8_unicode_ci'); }
                table.string('id', 45).primary();
                table.string('assinatura', 45).notNullable();

                table.string('codigo', 80).notNullable();
                table.string('referencia', 7).notNullable();
                table.string('tipo_pagamento', 30).notNullable();
                table.decimal('valor', 14, 2).notNullable();
                table.string('data', 30).notNullable();

                table.foreign('assinatura').references('id').inTable('assinatura');

                table.integer('status').defaultTo(1);
                table.integer('deleted').defaultTo(0);
            });
        }
    });
};

exports.down = async function (database) {
    return database.schema.hasTable('pagamento').then(function (exists) {
        if (exists) { return database.schema.dropTable('pagamento'); }
    });
};
