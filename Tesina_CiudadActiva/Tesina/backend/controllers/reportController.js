const Report = require('../models/Report');

// Obtener todos los reportes
const getAllReports = (req, res) => {

    const { search, status } = req.query;

    Report.filter(search, status, (err, reports) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo reportes',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
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
                error: err.sqlMessage || err.message || 'Error interno del servidor'
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

    // Los administradores gestionan reportes, no los cargan.
    if (req.user && req.user.role === 'admin') {

        return res.status(403).json({
            success: false,
            message: 'Los administradores no pueden crear reportes'
        });

    }

    const { type, title, description, location, lat, lng } = req.body;

    if (!type || !description || !location) {

        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos (tipo, descripción y ubicación son obligatorios)'
        });

    }

    // Imagen subida por multer (si se envió una)
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // El usuario se obtiene del token verificado por el middleware "auth",
    // no del body (el frontend nunca envía "user").
    const user_id = req.user ? req.user.id : null;

    Report.create({
        type,
        title: title || type,
        description,
        location,
        lat: lat || null,
        lng: lng || null,
        image,
        user_id
    }, (err, result) => {

        if (err) {
            console.error('Error creando reporte:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creando reporte',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
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
        'pendiente',
        'en_proceso',
        'resuelto'
    ];

    if (!status || !validStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: 'Estado inválido'
        });

    }

    Report.updateStatus(req.params.id, status, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error actualizando reporte',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
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
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            message: 'Reporte eliminado'
        });

    });

};

// Eliminar TODOS los reportes (solo admin)
const deleteAllReports = (req, res) => {

    Report.deleteAll((err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error eliminando los reportes',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            message: 'Todos los reportes fueron eliminados'
        });

    });

};

// Obtener los reportes de un usuario puntual
const getUserReports = (req, res) => {

    Report.findByUser(req.params.userId, (err, reports) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo los reportes del usuario',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            data: reports,
            total: reports.length
        });

    });

};

// Actualizar un reporte completo (solo admin)
const updateReport = (req, res) => {

    const { type, title, description, location, lat, lng, status } = req.body;

    if (!type || !description || !location) {

        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos (tipo, descripción y ubicación son obligatorios)'
        });

    }

    // Si se subió una imagen nueva, se reemplaza; si no, se conserva la que
    // vino en el body (por ejemplo la url actual enviada desde el formulario).
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || null);

    Report.update(req.params.id, {
        type,
        title: title || type,
        description,
        location,
        lat: lat || null,
        lng: lng || null,
        status: status || 'pendiente',
        image
    }, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error actualizando reporte',
                error: err.sqlMessage || err.message || 'Error interno del servidor'
            });
        }

        res.json({
            success: true,
            message: 'Reporte actualizado correctamente'
        });

    });

};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    updateReportStatus,
    deleteReport,
    deleteAllReports,
    getUserReports,
    updateReport
};