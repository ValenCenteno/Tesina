const Report = require('../models/Report');
const path = require('path');
const fs = require('fs');

const reportController = {
    createReport: (req, res) => {
        const { type, title, description, location, user_id } = req.body;
        
        // Procesar imagen si existe
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        const reportData = {
            type,
            title,
            description,
            location,
            image: imagePath,
            user_id: user_id || null
        };

        Report.create(reportData, (err, result) => {
            if (err) {
                console.error('Error al crear reporte:', err);
                return res.status(500).json({ error: 'Error al crear el reporte' });
            }
            
            res.status(201).json({ 
                message: 'Reporte creado exitosamente', 
                reportId: result.insertId,
                image: imagePath
            });
        });
    },

    getAllReports: (req, res) => {
        Report.findAll((err, reports) => {
            if (err) {
                console.error('Error al obtener reportes:', err);
                return res.status(500).json({ error: 'Error al obtener los reportes' });
            }
            res.json(reports);
        });
    },

    getReportById: (req, res) => {
        const { id } = req.params;
        Report.findById(id, (err, report) => {
            if (err || !report || report.length === 0) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }
            res.json(report[0]);
        });
    },

    updateReport: (req, res) => {
        const { id } = req.params;
        const { type, title, description, location, status } = req.body;
        
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        // Obtener reporte actual para eliminar imagen vieja si es necesario
        Report.findById(id, (err, existingReport) => {
            if (err || !existingReport || existingReport.length === 0) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }

            const finalImage = imagePath || existingReport[0].image;
            
            // Si hay imagen nueva y existía una vieja, eliminar la vieja
            if (imagePath && existingReport[0].image) {
                const oldImagePath = path.join(__dirname, '../../uploads', path.basename(existingReport[0].image));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            const reportData = {
                type,
                title,
                description,
                location,
                status,
                image: finalImage
            };

            Report.update(id, reportData, (err, result) => {
                if (err) {
                    console.error('Error al actualizar reporte:', err);
                    return res.status(500).json({ error: 'Error al actualizar el reporte' });
                }
                res.json({ message: 'Reporte actualizado exitosamente', image: finalImage });
            });
        });
    },

    updateReportStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        Report.updateStatus(id, status, (err, result) => {
            if (err) {
                console.error('Error al actualizar estado:', err);
                return res.status(500).json({ error: 'Error al actualizar el estado' });
            }
            res.json({ message: 'Estado actualizado exitosamente' });
        });
    },

    deleteReport: (req, res) => {
        const { id } = req.params;

        // Obtener el reporte para eliminar la imagen asociada
        Report.findById(id, (err, report) => {
            if (err || !report || report.length === 0) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }

            // Eliminar imagen si existe
            if (report[0].image) {
                const imagePath = path.join(__dirname, '../../uploads', path.basename(report[0].image));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            Report.delete(id, (err, result) => {
                if (err) {
                    console.error('Error al eliminar reporte:', err);
                    return res.status(500).json({ error: 'Error al eliminar el reporte' });
                }
                res.json({ message: 'Reporte eliminado exitosamente' });
            });
        });
    },

    getUserReports: (req, res) => {
        const { userId } = req.params;
        Report.findByUser(userId, (err, reports) => {
            if (err) {
                console.error('Error al obtener reportes del usuario:', err);
                return res.status(500).json({ error: 'Error al obtener los reportes' });
            }
            res.json(reports);
        });
    }
};

module.exports = reportController;