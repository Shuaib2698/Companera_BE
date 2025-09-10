const Leave = require('../models/LeaveModel');
const LeaveBalance = require('../models/LeaveBalanceModel');

// Leave Controller Functions
exports.applyForLeave = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;

    const leave = new Leave({
      employee: req.user.id,
      startDate,
      endDate,
      type,
      reason
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
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

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('employee', 'name email department');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // If leave is approved, deduct from leave balance
    if (status === 'approved') {
      await this.deductFromLeaveBalance(leave.employee, leave.type, calculateLeaveDays(leave.startDate, leave.endDate));
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave Balance Controller Functions
exports.getLeaveBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({ employee: req.user.id });
    if (!balance) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }
    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveBalance = async (req, res) => {
  try {
    const { annual, sick, casual } = req.body;
    
    const balance = await LeaveBalance.findOneAndUpdate(
      { employee: req.user.id },
      { annual, sick, casual },
      { new: true, upsert: true }
    );

    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetAllLeaveBalances = async (req, res) => {
  try {
    // This would typically be called annually to reset all balances
    await LeaveBalance.updateMany(
      {},
      { $set: { annual: 20, sick: 10, casual: 5 } } // Default values
    );
    
    res.json({ message: 'All leave balances reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper Functions
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
};

exports.deductFromLeaveBalance = async (employeeId, leaveType, days) => {
  const balance = await LeaveBalance.findOne({ employee: employeeId });
  if (!balance) {
    throw new Error('Leave balance not found');
  }

  if (balance[leaveType] < days) {
    throw new Error('Insufficient leave balance');
  }

  balance[leaveType] -= days;
  await balance.save();
  return balance;
};

// Update the applyForLeave function in leaveController.js
exports.applyForLeave = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;

    // Check for holidays in the requested date range
    const holidays = await Holiday.find({
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    });
    
    // Calculate actual leave days (excluding holidays)
    const start = new Date(startDate);
    const end = new Date(endDate);
    let leaveDays = 0;
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Check if current date is a holiday
      const isHoliday = holidays.some(holiday => 
        holiday.date.toDateString() === currentDate.toDateString()
      );
      
      // Check if current date is a weekend (Saturday or Sunday)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      if (!isHoliday && !isWeekend) {
        leaveDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (leaveDays === 0) {
      return res.status(400).json({ 
        message: 'No working days in the selected date range (excluding holidays and weekends)' 
      });
    }

    const leave = new Leave({
      employee: req.user.id,
      startDate,
      endDate,
      type,
      reason,
      calculatedDays: leaveDays // Store calculated days excluding holidays
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};