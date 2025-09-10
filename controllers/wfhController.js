// controllers/wfhController.js
const WFH = require('../models/WFHModel');

exports.applyForWFH = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const wfh = new WFH({
      employee: req.user.id,
      date,
      reason
    });

    await wfh.save();
    res.status(201).json(wfh);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyWFH = async (req, res) => {
  try {
    const wfhRequests = await WFH.find({ employee: req.user.id })
      .sort({ date: -1 })
      .populate('approvedBy', 'name');

    res.json(wfhRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllWFH = async (req, res) => {
  try {
    const wfhRequests = await WFH.find()
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json(wfhRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWFHStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const updateData = { 
      status,
      approvedBy: req.user.id,
      approvedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const wfh = await WFH.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('employee', 'name email department');

    if (!wfh) {
      return res.status(404).json({ message: 'WFH request not found' });
    }

    res.json(wfh);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the applyForWFH function in wfhController.js
exports.applyForWFH = async (req, res) => {
  try {
    const { date, reason } = req.body;

    // Check if the requested date is a holiday
    const holiday = await Holiday.findOne({ date: new Date(date) });
    if (holiday) {
      return res.status(400).json({ 
        message: `Cannot apply for WFH on ${holiday.name} (holiday)` 
      });
    }
    
    // Check if the requested date is a weekend
    const requestedDate = new Date(date);
    const isWeekend = requestedDate.getDay() === 0 || requestedDate.getDay() === 6;
    if (isWeekend) {
      return res.status(400).json({ 
        message: 'Cannot apply for WFH on weekends' 
      });
    }

    const wfh = new WFH({
      employee: req.user.id,
      date,
      reason
    });

    await wfh.save();
    res.status(201).json(wfh);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};