// routes/tripRequestRoutes.js
const express = require('express');
const router = express.Router();
const TripRequest = require('../models/TripRequest');
const auth = require('../middleware/auth');

// Get all trip requests (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const requests = await TripRequest.find()
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my trip requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await TripRequest.find({ employee: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip request
router.post('/', auth, async (req, res) => {
  try {
    const request = new TripRequest({
      ...req.body,
      employee: req.user.userId
    });
    await request.save();
    await request.populate('employee', 'name email department');
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update trip request status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const request = await TripRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('employee', 'name email department');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete trip request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await TripRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only admin or the employee who created the request can delete it
    if (req.user.role !== 'admin' && request.employee.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await TripRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;