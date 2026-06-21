const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tesina_db'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando MySQL:', err);
        return;
    }

    console.log('✅ Conectado a MySQL');
});

module.exports = connection;