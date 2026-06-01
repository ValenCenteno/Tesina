const db = require('../config/db');

class User {

    static create(data, callback) {

        const sql = `
            INSERT INTO users
            (username, password, role)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            data.username,
            data.password,
            data.role || 'user'
        ], callback);
    }

    static findByUsername(username, callback) {

        const sql = `
            SELECT * FROM users
            WHERE username = ?
        `;

        db.query(sql, [username], (err, results) => {
            callback(err, results[0]);
        });
    }
}

module.exports = User;

