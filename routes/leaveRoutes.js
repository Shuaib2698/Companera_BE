const express = require('express');
const router = express.Router();
const {
  applyForLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, applyForLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/', protect, admin, getAllLeaves);
router.put('/:id/status', protect, admin, updateLeaveStatus);

module.exports = router;