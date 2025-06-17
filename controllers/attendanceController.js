const Attendance = require('../models/AttendanceModel');
const moment = require('moment');

exports.punchIn = async (req, res) => {
  try {
    const today = moment().startOf('day');
    
    // Check if already punched in today
    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate()
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'You have already punched in today' });
    }

    const attendance = new Attendance({
      user: req.user.id,
      date: today.toDate(),
      punchIn: new Date(),
      status: 'present'
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.punchOut = async (req, res) => {
  try {
    const today = moment().startOf('day');
    
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate()
      }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'You have not punched in today' });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ message: 'You have already punched out today' });
    }

    attendance.punchOut = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.manualPunch = async (req, res) => {
  try {
    const { date, punchIn, punchOut, reason } = req.body;
    
    // Only allow manual punch for previous days
    if (moment(date).isSameOrAfter(moment(), 'day')) {
      return res.status(400).json({ message: 'Manual punch only allowed for previous days' });
    }

    // Check if already has attendance for that day
    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: moment(date).startOf('day').toDate()
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already exists for this day' });
    }

    const attendance = new Attendance({
      user: req.user.id,
      date: moment(date).startOf('day').toDate(),
      punchIn: new Date(punchIn),
      punchOut: new Date(punchOut),
      reason,
      isManual: true,
      status: 'present'
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let startDate, endDate;
    
    if (month && year) {
      startDate = moment().month(month - 1).year(year).startOf('month').toDate();
      endDate = moment().month(month - 1).year(year).endOf('month').toDate();
    } else {
      // Default to current month
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
    }

    const attendance = await Attendance.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
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

    const attendance = await Attendance.find(query)
      .populate('user', 'name email department')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};