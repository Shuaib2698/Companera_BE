const express = require('express');
const router = express.Router();
const {
  punchIn,
  punchOut,
  manualPunch,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.post('/manual', protect, manualPunch);
router.get('/my-attendance', protect, getMyAttendance);
router.get('/', protect, admin, getAllAttendance);

module.exports = router;