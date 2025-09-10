// controllers/holidayController.js
const Holiday = require('../models/HolidayModel');

// Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    let query = {};
    
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get holiday by ID
exports.getHolidayById = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new holiday
exports.createHoliday = async (req, res) => {
  try {
    const { name, date, type, description, recurring } = req.body;
    
    // Check if holiday already exists on this date
    const existingHoliday = await Holiday.findOne({ date });
    if (existingHoliday) {
      return res.status(400).json({ message: 'Holiday already exists on this date' });
    }
    
    const holiday = new Holiday({
      name,
      date,
      type,
      description,
      recurring
    });
    
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { name, date, type, description, recurring } = req.body;
    
    // Check if another holiday exists on this date (excluding current holiday)
    if (date) {
      const existingHoliday = await Holiday.findOne({ 
        date, 
        _id: { $ne: req.params.id } 
      });
      if (existingHoliday) {
        return res.status(400).json({ message: 'Another holiday already exists on this date' });
      }
    }
    
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { name, date, type, description, recurring },
      { new: true, runValidators: true }
    );
    
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if a date is a holiday
exports.isHoliday = async (req, res) => {
  try {
    const { date } = req.params;
    const holiday = await Holiday.findOne({ date: new Date(date) });
    res.json({ isHoliday: !!holiday, holiday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get holidays between two dates
exports.getHolidaysInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const holidays = await Holiday.find({
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    }).sort({ date: 1 });
    
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Initialize default government holidays for a year
exports.initializeGovernmentHolidays = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }
    
    // Common government holidays (adjust based on your country)
    const governmentHolidays = [
      { name: "New Year's Day", date: new Date(`${year}-01-01`), type: "government", recurring: true },
      { name: "Republic Day", date: new Date(`${year}-01-26`), type: "government", recurring: true },
      { name: "Good Friday", date: calculateGoodFriday(year), type: "government", recurring: true },
      { name: "Independence Day", date: new Date(`${year}-08-15`), type: "government", recurring: true },
      { name: "Gandhi Jayanti", date: new Date(`${year}-10-02`), type: "government", recurring: true },
      { name: "Christmas Day", date: new Date(`${year}-12-25`), type: "government", recurring: true },
    ];
    
    // Add additional holidays based on your country's calendar
    
    const results = [];
    for (const holidayData of governmentHolidays) {
      // Check if holiday already exists
      const existingHoliday = await Holiday.findOne({ date: holidayData.date });
      if (!existingHoliday) {
        const holiday = new Holiday(holidayData);
        await holiday.save();
        results.push(holiday);
      } else {
        results.push(existingHoliday);
      }
    }
    
    res.json({ message: 'Government holidays initialized', holidays: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate Good Friday (example for India)
function calculateGoodFriday(year) {
  // This is a simplified calculation - you might want to use a proper library for accurate dates
  const easterSunday = calculateEasterSunday(year);
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  return goodFriday;
}

// Helper function to calculate Easter Sunday (simplified)
function calculateEasterSunday(year) {
  // This is a simplified calculation - use a proper library for accurate dates
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}