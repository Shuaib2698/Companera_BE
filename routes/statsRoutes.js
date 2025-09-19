// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getEmployeeStats,
  getAdminStats
} = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/employee', protect, getEmployeeStats);
router.get('/admin', protect, admin, getAdminStats);

module.exports = router;