const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: '',
    database: 'tesina_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err.message);
        console.error('   Verificá que XAMPP esté corriendo y la base de datos "tesina_db" exista.');
        process.exit(1);
    }
    console.log('Conectado a MySQL — base de datos: tesina_db');
});

// Reconectar automáticamente si se cae la conexión
connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn(' Conexión MySQL perdida. Reconectando...');
        connection.connect();
    } else {
        console.error('Error MySQL:', err);
    }
});

module.exports = connection;