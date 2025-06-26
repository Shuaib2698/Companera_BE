const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  getMyPaymentRequests,
  getAllPaymentRequests,
  updatePaymentRequestStatus,
  deletePaymentRequest
} = require('../controllers/paymentRequestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createPaymentRequest); // Employee
router.get('/my-requests', protect, getMyPaymentRequests); // Employee
router.get('/all', protect, admin, getAllPaymentRequests); // Admin
router.patch('/:id/status', protect, admin, updatePaymentRequestStatus); // Admin updates status
router.delete('/:id', protect, admin, deletePaymentRequest); // Admin deletes a request

module.exports = router;
