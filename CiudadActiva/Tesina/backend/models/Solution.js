const db = require('../config/db');

const Solution = {

    // Crear solución para un reporte
    create: (data, callback) => {

        const query = `
            INSERT INTO solutions
            (report_id, title, description, solved_date, image, created_by, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(query, [
            data.report_id,
            data.title,
            data.description,
            data.solved_date,
            data.image || null,
            data.created_by || null
        ], callback);
    },


    // Obtener la solución de un reporte puntual
    findByReportId: (reportId, callback) => {

        const query = `
            SELECT *
            FROM solutions
            WHERE report_id = ?
        `;

        db.query(query, [reportId], (err, rows) => {

            if (err) {
                return callback(err);
            }

            callback(null, rows[0] || null);
        });
    },


    // Obtener solución por su propio ID
    findById: (id, callback) => {

        const query = `
            SELECT *
            FROM solutions
            WHERE id = ?
        `;

        db.query(query, [id], (err, rows) => {

            if (err) {
                return callback(err);
            }

            callback(null, rows[0] || null);
        });
    },


    // Últimas soluciones registradas (para "Soluciones recientes" del inicio)
    findRecent: (limit, callback) => {

        const query = `
            SELECT
                s.*,
                r.type      AS report_type,
                r.title     AS report_title,
                r.location  AS report_location,
                r.status    AS report_status
            FROM solutions s
            INNER JOIN reports r ON r.id = s.report_id
            ORDER BY s.solved_date DESC, s.createdAt DESC
            LIMIT ?
        `;

        db.query(query, [limit], callback);
    },


    // Actualizar una solución existente
    update: (id, data, callback) => {

        const query = `
            UPDATE solutions
            SET
                title = ?,
                description = ?,
                solved_date = ?,
                image = ?,
                updatedAt = NOW()
            WHERE id = ?
        `;

        db.query(query, [
            data.title,
            data.description,
            data.solved_date,
            data.image || null,
            id
        ], callback);
    },


    // Eliminar una solución
    delete: (id, callback) => {

        const query = `
            DELETE FROM solutions
            WHERE id = ?
        `;

        db.query(query, [id], callback);
    }

};

module.exports = Solution;
