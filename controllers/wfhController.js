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
    const { status } = req.body;

    const wfh = await WFH.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!wfh) {
      return res.status(404).json({ message: 'WFH request not found' });
    }

    res.json(wfh);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};