const db = require('../config/db');

const Report = {
    create: (reportData, callback) => {
        const query = `
            INSERT INTO reports (type, title, description, location, status, image, user_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        db.query(query, [
            reportData.type,
            reportData.title,
            reportData.description,
            reportData.location,
            'pendiente',
            reportData.image || null,
            reportData.user_id || null
        ], callback);
    },

    findAll: (callback) => {
        const query = `
            SELECT r.*, u.username 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `;
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = `
            SELECT r.*, u.username 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `;
        db.query(query, [id], callback);
    },

    update: (id, reportData, callback) => {
        const query = `
            UPDATE reports 
            SET type = ?, title = ?, description = ?, location = ?, status = ?, image = ?, updated_at = NOW()
            WHERE id = ?
        `;
        db.query(query, [
            reportData.type,
            reportData.title,
            reportData.description,
            reportData.location,
            reportData.status,
            reportData.image,
            id
        ], callback);
    },

    updateStatus: (id, status, callback) => {
        const query = 'UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?';
        db.query(query, [status, id], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM reports WHERE id = ?';
        db.query(query, [id], callback);
    },

    findByUser: (userId, callback) => {
        const query = 'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC';
        db.query(query, [userId], callback);
    }
};

module.exports = Report;