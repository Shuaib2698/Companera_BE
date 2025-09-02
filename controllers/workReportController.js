// controllers/workReportController.js
const WorkReport = require('../models/WorkReportModel');
const moment = require('moment');

// Create or update work report
exports.createOrUpdateWorkReport = async (req, res) => {
  try {
    const { date, workReport } = req.body;
    
    // Check if date is today or in the past
    const reportDate = moment(date);
    const today = moment().startOf('day');
    
    if (reportDate.isAfter(today)) {
      return res.status(400).json({ message: 'Cannot create report for future dates' });
    }
    
    // Check if report already exists and if it can be edited (within 1 day)
    const existingReport = await WorkReport.findOne({
      user: req.user.id,
      date: reportDate.startOf('day').toDate()
    });
    
    if (existingReport) {
      // Check if report was submitted more than 1 day ago
      const now = moment();
      const reportCreated = moment(existingReport.createdAt);
      const hoursDiff = now.diff(reportCreated, 'hours');
      
      if (hoursDiff > 24 && existingReport.status === 'submitted') {
        return res.status(400).json({ message: 'Cannot edit report after 24 hours of submission' });
      }
      
      // Update existing report
      existingReport.workReport = workReport;
      existingReport.updatedAt = new Date();
      await existingReport.save();
      
      return res.json(existingReport);
    }
    
    // Create new report
    const newReport = new WorkReport({
      user: req.user.id,
      date: reportDate.startOf('day').toDate(),
      workReport,
      status: 'submitted'
    });
    
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Create work report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's work reports
exports.getMyWorkReports = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let startDate, endDate;
    
    if (month && year) {
      startDate = moment().month(month - 1).year(year).startOf('month').toDate();
      endDate = moment().month(month - 1).year(year).endOf('month').toDate();
    } else {
      // Default to last 30 days if no month/year specified
      startDate = moment().subtract(30, 'days').startOf('day').toDate();
      endDate = moment().endOf('day').toDate();
    }

    const reports = await WorkReport.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get work reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get work report by ID
exports.getWorkReportById = async (req, res) => {
  try {
    const report = await WorkReport.findById(req.params.id)
      .populate('user', 'name email department')
      .populate('comments.user', 'name role');
    
    if (!report) {
      return res.status(404).json({ message: 'Work report not found' });
    }
    
    // Check if user has access to this report
    if (req.user.role !== 'admin' && report.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Get work report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete work report
exports.deleteWorkReport = async (req, res) => {
  try {
    const report = await WorkReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Work report not found' });
    }
    
    // Check if user owns this report or is admin
    if (req.user.role !== 'admin' && report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if report was created more than 1 day ago
    const now = moment();
    const reportCreated = moment(report.createdAt);
    const hoursDiff = now.diff(reportCreated, 'hours');
    
    if (hoursDiff > 24 && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete report after 24 hours' });
    }
    
    await WorkReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Work report deleted successfully' });
  } catch (error) {
    console.error('Delete work report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to work report (admin only)
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add comments' });
    }
    
    const report = await WorkReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Work report not found' });
    }
    
    report.comments.push({
      user: req.user.id,
      comment
    });
    
    await report.save();
    
    // Populate the new comment with user details
    await report.populate('comments.user', 'name role');
    
    res.json(report);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all work reports (admin only)
exports.getAllWorkReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { month, year, userId } = req.query;
    
    let startDate, endDate;
    
    if (month && year) {
      startDate = moment().month(month - 1).year(year).startOf('month').toDate();
      endDate = moment().month(month - 1).year(year).endOf('month').toDate();
    } else {
      // Default to current month
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
    }

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (userId) {
      query.user = userId;
    }

    const reports = await WorkReport.find(query)
      .populate('user', 'name email department')
      .sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get all work reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};