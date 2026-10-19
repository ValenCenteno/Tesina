const Solution = require('../models/Solution');
const Report   = require('../models/Report');

// Obtener la solución de un reporte (pública)
const getByReportId = (req, res) => {

    Solution.findByReportId(req.params.reportId, (err, solution) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo la solución',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: 'Este reporte todavía no tiene una solución registrada'
            });
        }

        res.json({
            success: true,
            data: solution
        });

    });

};


// Últimas soluciones registradas (pública, para el inicio)
const getRecent = (req, res) => {

    const limit = Math.min(
        parseInt(req.query.limit) || 6,
        20
    );

    Solution.findRecent(limit, (err, solutions) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo las soluciones recientes',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            data: solutions,
            total: solutions.length
        });

    });

};


// Registrar una solución (solo admin)
const createSolution = (req, res) => {

    const reportId = req.params.reportId;
    const { title, description, solved_date } = req.body;

    if (!title || !description || !solved_date) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos (título, descripción y fecha son obligatorios)'
        });
    }

    // Un reporte solo puede tener una solución activa
    Report.getById(reportId, (err, report) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error verificando el reporte',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        if (report.status !== 'resuelto') {
            return res.status(400).json({
                success: false,
                message: 'Solo se puede registrar una solución para un reporte en estado "resuelto"'
            });
        }

        Solution.findByReportId(reportId, (err, existing) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error verificando soluciones existentes',
                    error: err.sqlMessage || err.message || 'Error interno del servidor'
                });
            }

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Este reporte ya tiene una solución registrada. Editala en vez de crear una nueva.'
                });
            }

            const image = req.file ? `/uploads/${req.file.filename}` : null;
            const created_by = req.user ? req.user.id : null;

            Solution.create({
                report_id: reportId,
                title,
                description,
                solved_date,
                image,
                created_by
            }, (err, result) => {

                if (err) {
                    console.error('Error creando solución:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error registrando la solución',
                        error: err.sqlMessage || err.message || 'Error interno del servidor'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Solución registrada correctamente',
                    id: result.insertId
                });

            });

        });

    });

};


// Editar una solución existente (solo admin)
const updateSolution = (req, res) => {

    const { title, description, solved_date } = req.body;

    if (!title || !description || !solved_date) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos (título, descripción y fecha son obligatorios)'
        });
    }

    Solution.findById(req.params.id, (err, existing) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo la solución',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Solución no encontrada'
            });
        }

        // Si se subió una imagen nueva, se reemplaza; si no, se conserva la actual.
        const image = req.file ? `/uploads/${req.file.filename}` : existing.image;

        Solution.update(req.params.id, {
            title,
            description,
            solved_date,
            image
        }, (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error actualizando la solución',
                    error: err.sqlMessage || err.message || 'Error interno del servidor'
                });
            }

            res.json({
                success: true,
                message: 'Solución actualizada correctamente'
            });

        });

    });

};


// Eliminar una solución (solo admin)
const deleteSolution = (req, res) => {

    Solution.delete(req.params.id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error eliminando la solución',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            message: 'Solución eliminada'
        });

    });

};


module.exports = {
    getByReportId,
    getRecent,
    createSolution,
    updateSolution,
    deleteSolution
};
