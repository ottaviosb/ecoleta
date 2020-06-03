//Arquivo responsável por criar a conexão com o banco de dados

import knex from 'knex'; //necessário para escrever as queries para busca no banco de dados com javascript
import path from 'path';

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true,
});

export default connection;
