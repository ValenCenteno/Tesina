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

// Admin
router.patch('/:id/status', auth, isAdmin, reportController.updateReportStatus);
router.delete('/:id', auth, isAdmin, reportController.deleteReport);

// COMENTADAS PORQUE TODAVÍA NO EXISTEN
// router.get('/user/:userId', auth, reportController.getUserReports);
// router.put('/:id', auth, isAdmin, upload.single('image'), reportController.updateReport);

module.exports = router;