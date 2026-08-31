const db = require('../config/db');

class User {
    static create(data, callback) {
        const sql = 'INSERT INTO users (username, password, dni, phone, role) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [
            data.username,
            data.password,
            data.dni,
            data.phone,
            data.role || 'user'
        ], callback);
    }

    static findByUsername(username, callback) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.query(sql, [username], (err, results) => {
            callback(err, results[0]);
        });
    }

    static findByDni(dni, callback) {
        const sql = 'SELECT * FROM users WHERE dni = ?';
        db.query(sql, [dni], (err, results) => {
            callback(err, results[0]);
        });
    }

    static findById(id, callback) {
        const sql = 'SELECT id, username, dni, phone, role FROM users WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            callback(err, results ? results[0] : null);
        });
    }
}

module.exports = User;