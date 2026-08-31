const express = require('express');
const router = express.Router();

const solutionController = require('../controllers/solutionController');
const upload = require('../config/multer');
const { auth, isAdmin } = require('../middleware/auth');

// Públicas
router.get('/recent', solutionController.getRecent);
router.get('/report/:reportId', solutionController.getByReportId);

// Admin
router.post('/report/:reportId', auth, isAdmin, upload.single('image'), solutionController.createSolution);
router.put('/:id', auth, isAdmin, upload.single('image'), solutionController.updateSolution);
router.delete('/:id', auth, isAdmin, solutionController.deleteSolution);

module.exports = router;
