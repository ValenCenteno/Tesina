const db = require('../config/db');

const Report = {

    // Crear reporte
    create: (reportData, callback) => {

        const query = `
            INSERT INTO reports
            (type, title, description, location, lat, lng, status, image, user_id, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, NOW(), NOW())
        `;

        db.query(query, [
            reportData.type,
            reportData.title,
            reportData.description,
            reportData.location,
            reportData.lat || null,
            reportData.lng || null,
            reportData.image || null,
            reportData.user_id || null
        ], callback);
    },


    // Obtener todos los reportes
    findAll: (callback) => {

        const query = `
            SELECT
                r.*, u.username,
                s.id            AS solution_id,
                s.title         AS solution_title,
                s.description   AS solution_description,
                s.solved_date   AS solution_date,
                s.image         AS solution_image
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN solutions s ON s.report_id = r.id
            ORDER BY r.createdAt DESC
        `;

        db.query(query, callback);
    },


    // Obtener reporte por ID
    findById: (id, callback) => {

        const query = `
            SELECT
                r.*, u.username,
                s.id            AS solution_id,
                s.title         AS solution_title,
                s.description   AS solution_description,
                s.solved_date   AS solution_date,
                s.image         AS solution_image
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN solutions s ON s.report_id = r.id
            WHERE r.id = ?
        `;

        db.query(query, [id], (err, rows) => {

            if (err) {
                return callback(err);
            }

            callback(null, rows[0] || null);
        });
    },


    // Alias usado por el controller
    getById: (id, callback) => {
        Report.findById(id, callback);
    },


    // Buscar y filtrar reportes
    filter: (search, status, callback) => {

        let query = `
            SELECT
                r.*, u.username,
                s.id            AS solution_id,
                s.title         AS solution_title,
                s.description   AS solution_description,
                s.solved_date   AS solution_date,
                s.image         AS solution_image
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN solutions s ON s.report_id = r.id
            WHERE 1 = 1
        `;

        const params = [];

        if (search) {

            query += `
                AND (
                    r.title LIKE ?
                    OR r.description LIKE ?
                    OR r.location LIKE ?
                )
            `;

            const like = `%${search}%`;

            params.push(like, like, like);
        }

        if (status) {

            query += ` AND r.status = ?`;

            params.push(status);
        }

        query += ` ORDER BY r.createdAt DESC`;

        db.query(query, params, callback);
    },


    // Actualizar reporte completo
    update: (id, reportData, callback) => {

        const query = `
            UPDATE reports
            SET
                type = ?,
                title = ?,
                description = ?,
                location = ?,
                lat = ?,
                lng = ?,
                status = ?,
                image = ?,
                updatedAt = NOW()
            WHERE id = ?
        `;

        db.query(query, [
            reportData.type,
            reportData.title,
            reportData.description,
            reportData.location,
            reportData.lat || null,
            reportData.lng || null,
            reportData.status,
            reportData.image || null,
            id
        ], callback);
    },


    // Actualizar solamente el estado
    updateStatus: (id, status, callback) => {

        const query = `
            UPDATE reports
            SET
                status = ?,
                updatedAt = NOW()
            WHERE id = ?
        `;

        db.query(query, [status, id], callback);
    },


    // Eliminar reporte
    delete: (id, callback) => {

        const query = `
            DELETE FROM reports
            WHERE id = ?
        `;

        db.query(query, [id], callback);
    },


    // Eliminar TODOS los reportes
    deleteAll: (callback) => {

        const query = `DELETE FROM reports`;

        db.query(query, callback);
    },


    // Obtener reportes de un usuario
    findByUser: (userId, callback) => {

        const query = `
            SELECT *
            FROM reports
            WHERE user_id = ?
            ORDER BY createdAt DESC
        `;

        db.query(query, [userId], callback);
    }

};

module.exports = Report;