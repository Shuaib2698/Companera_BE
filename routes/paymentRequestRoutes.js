const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  getMyPaymentRequests,
  getAllPaymentRequests,
  updatePaymentRequestStatus
} = require('../controllers/paymentRequestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createPaymentRequest);
router.get('/my-requests', protect, getMyPaymentRequests);
router.get('/', protect, admin, getAllPaymentRequests);
router.put('/:id/status', protect, admin, updatePaymentRequestStatus);

module.exports = router;