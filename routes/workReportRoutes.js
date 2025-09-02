// routes/workReportRoutes.js
const express = require('express');
const router = express.Router();
const workReportController = require('../controllers/workReportController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', workReportController.createOrUpdateWorkReport);
router.get('/my-reports', workReportController.getMyWorkReports);
router.get('/:id', workReportController.getWorkReportById);
router.delete('/:id', workReportController.deleteWorkReport);

// Admin routes
router.post('/:id/comment', workReportController.addComment);
router.get('/', workReportController.getAllWorkReports);

module.exports = router;