// utils/dateUtils.js
const Holiday = require('../models/HolidayModel');

exports.calculateWorkingDays = async (startDate, endDate) => {
  try {
    // Get all holidays in the date range
    const holidays = await Holiday.find({
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    });
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Check if current date is a holiday
      const isHoliday = holidays.some(holiday => 
        holiday.date.toDateString() === currentDate.toDateString()
      );
      
      // Check if current date is a weekend (Saturday or Sunday)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      if (!isHoliday && !isWeekend) {
        workingDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  } catch (error) {
    throw new Error('Error calculating working days: ' + error.message);
  }
};