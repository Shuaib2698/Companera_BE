// routes/assetRequestRoutes.js
const express = require('express');
const router = express.Router();
const AssetRequest = require('../models/AssetRequest');
const { protect, admin } = require('../middleware/authMiddleware'); // Updated to use authMiddleware

// Get all asset requests (admin only)
router.get('/all', protect, admin, async (req, res) => { // Added protect and admin middleware
  try {
    const requests = await AssetRequest.find()
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my asset requests
router.get('/my-requests', protect, async (req, res) => { // Added protect middleware
  try {
    const requests = await AssetRequest.find({ employee: req.user._id }) // Use req.user._id
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create asset request
router.post('/', protect, async (req, res) => { // Added protect middleware
  try {
    const request = new AssetRequest({
      ...req.body,
      employee: req.user._id // Use req.user._id
    });
    await request.save();
    await request.populate('employee', 'name email department');
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update asset request status (admin only)
router.patch('/:id/status', protect, admin, async (req, res) => { // Added protect and admin middleware
  try {
    const request = await AssetRequest.findByIdAndUpdate(
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

// Delete asset request
router.delete('/:id', protect, async (req, res) => { // Added protect middleware
  try {
    const request = await AssetRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only admin or the employee who created the request can delete it
    if (req.user.role !== 'admin' && request.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await AssetRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;