// routes/wfhRoutes.js
const express = require('express');
const router = express.Router();
const {
  applyForWFH,
  getMyWFH,
  getAllWFH,
  updateWFHStatus
} = require('../controllers/wfhController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, applyForWFH);
router.get('/my-wfh', protect, getMyWFH);
router.get('/', protect, admin, getAllWFH);
router.put('/:id/status', protect, admin, updateWFHStatus);

module.exports = router;