const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const upload = require('../config/multer');
const { auth, isAdmin } = require('../middleware/auth');

// Públicas
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

// Usuario
router.post('/', auth, upload.single('image'), reportController.createReport);
router.get('/user/:userId', auth, reportController.getUserReports);

// Admin
router.patch('/:id/status', auth, isAdmin, reportController.updateReportStatus);
router.put('/:id', auth, isAdmin, upload.single('image'), reportController.updateReport);
router.delete('/all', auth, isAdmin, reportController.deleteAllReports);
router.delete('/:id', auth, isAdmin, reportController.deleteReport);

module.exports = router;