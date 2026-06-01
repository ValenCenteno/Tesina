const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rutas
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.post('/', reportController.createReport);
router.put('/:id/status', reportController.updateReportStatus);
router.delete('/:id', reportController.deleteReport);

module.exports = router;