const Report = require('../models/report');

// Obtener todos los reportes
const getAllReports = (req, res) => {

    const { search, status } = req.query;

    Report.filter(search, status, (err, reports) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo reportes',
                error: err
            });
        }

        res.json({
            success: true,
            data: reports,
            total: reports.length
        });

    });
};

// Obtener reporte por ID
const getReportById = (req, res) => {

    Report.getById(req.params.id, (err, report) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo reporte',
                error: err
            });
        }

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.json({
            success: true,
            data: report
        });

    });
};

// Crear reporte
const createReport = (req, res) => {

    const { type, description, location, user } = req.body;

    if (!type || !description || !location) {

        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos'
        });

    }

    Report.create({
        type,
        description,
        location,
        user: user || 'Usuario Anónimo'
    }, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error creando reporte',
                error: err
            });
        }

        res.status(201).json({
            success: true,
            message: 'Reporte creado correctamente',
            id: result.insertId
        });

    });

};

// Actualizar estado
const updateReportStatus = (req, res) => {

    const { status } = req.body;

    const validStatuses = [
        'pending',
        'in-progress',
        'resolved'
    ];

    if (!status || !validStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: 'Estado inválido'
        });

    }

    Report.update(req.params.id, { status }, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error actualizando reporte',
                error: err
            });
        }

        res.json({
            success: true,
            message: 'Reporte actualizado'
        });

    });

};

// Eliminar reporte
const deleteReport = (req, res) => {

    Report.delete(req.params.id, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error eliminando reporte',
                error: err
            });
        }

        res.json({
            success: true,
            message: 'Reporte eliminado'
        });

    });

};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    updateReportStatus,
    deleteReport
};