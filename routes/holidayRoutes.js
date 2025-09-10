// routes/holidayRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  isHoliday,
  getHolidaysInRange,
  initializeGovernmentHolidays
} = require('../controllers/holidayController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllHolidays);
router.get('/:id', getHolidayById);
router.get('/check/:date', isHoliday);
router.get('/range/:startDate/:endDate', getHolidaysInRange);

// Admin routes
router.post('/', protect, admin, createHoliday);
router.put('/:id', protect, admin, updateHoliday);
router.delete('/:id', protect, admin, deleteHoliday);
router.post('/initialize', protect, admin, initializeGovernmentHolidays);

module.exports = router;