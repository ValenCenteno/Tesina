const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../config/multer');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

// Rutas protegidas
router.post('/', auth, upload.single('image'), reportController.createReport);
router.put('/:id', auth, upload.single('image'), reportController.updateReport);
router.patch('/:id/status', auth, reportController.updateReportStatus);
router.delete('/:id', auth, reportController.deleteReport);
router.get('/user/:userId', auth, reportController.getUserReports);

module.exports = router;