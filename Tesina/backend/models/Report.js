const db = require('../config/db');

class Report {

    static getAll(callback) {
        const sql = 'SELECT * FROM reports ORDER BY createdAt DESC';

        db.query(sql, (err, results) => {
            callback(err, results);
        });
    }

    static getById(id, callback) {
        const sql = 'SELECT * FROM reports WHERE id = ?';

        db.query(sql, [id], (err, results) => {
            callback(err, results[0]);
        });
    }

    static create(data, callback) {
        const sql = `
            INSERT INTO reports
            (user, type, title, description, location, status, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.user || 'Usuario Anónimo',
            data.type,
            data.title || data.description.substring(0, 50),
            data.description,
            data.location,
            data.status || 'pending',
            data.image || data.type
        ];

        db.query(sql, values, (err, result) => {
            callback(err, result);
        });
    }

    static update(id, updates, callback) {
        const sql = `
            UPDATE reports
            SET status = ?, updatedAt = NOW()
            WHERE id = ?
        `;

        db.query(sql, [updates.status, id], (err, result) => {
            callback(err, result);
        });
    }

    static delete(id, callback) {
        const sql = 'DELETE FROM reports WHERE id = ?';

        db.query(sql, [id], (err, result) => {
            callback(err, result);
        });
    }

    static filter(query, status, callback) {

        let sql = 'SELECT * FROM reports WHERE 1=1';
        let values = [];

        if (query) {
            sql += `
                AND (
                    user LIKE ?
                    OR location LIKE ?
                    OR description LIKE ?
                )
            `;

            const search = `%${query}%`;

            values.push(search, search, search);
        }

        if (status && status !== '') {
            sql += ' AND status = ?';
            values.push(status);
        }

        sql += ' ORDER BY createdAt DESC';

        db.query(sql, values, (err, results) => {
            callback(err, results);
        });
    }
}

module.exports = Report;

