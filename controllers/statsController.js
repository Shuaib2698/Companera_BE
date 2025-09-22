// controllers/statsController.js
const Attendance = require('../models/AttendanceModel');
const Leave = require('../models/LeaveModel');
const Holiday = require('../models/HolidayModel');
const moment = require('moment');

// Get employee statistics for dashboard
// In statsController.js, update the getEmployeeStats function:
exports.getEmployeeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get attendance records for current month
    const attendance = await Attendance.find({
      user: userId,
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lte: new Date(currentYear, currentMonth, 0)
      }
    });
    
    // Calculate worked days (days with at least one punch)
    const workedDays = attendance.filter(record => 
      record.punches && record.punches.length > 0
    ).length;
    
    // Calculate working days (excluding weekends)
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    let workingDays = 0;
    let currentDateIter = new Date(startDate);
    
    while (currentDateIter <= endDate) {
      const dayOfWeek = currentDateIter.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays++;
      }
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    // Get approved leaves for current month
    const approvedLeaves = await Leave.countDocuments({
      employee: userId,
      status: 'approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } }
      ]
    });
    
    // Get holidays for current month
    const holidays = await Holiday.countDocuments({
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate absent days
    const absentDays = workingDays - workedDays - approvedLeaves;
    
    res.json({
      workingDays,
      absentDays: Math.max(0, absentDays), // Ensure not negative
      approvedLeaves,
      holidays,
      workedDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    let startDate, endDate;
    
    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      // Default to current month
      const currentDate = new Date();
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }
    
    // Get all attendance records for the period
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('user', 'name department');
    
    // Get all holidays for the period
    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate working days (excluding weekends and holidays)
    let workingDays = 0;
    let currentDateIter = new Date(startDate);
    
    while (currentDateIter <= endDate) {
      const dayOfWeek = currentDateIter.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const isHoliday = holidays.some(holiday => 
          holiday.date.toDateString() === currentDateIter.toDateString()
        );
        if (!isHoliday) {
          workingDays++;
        }
      }
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    // Get all leaves for the period
    const leaves = await Leave.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } }
      ]
    }).populate('employee', 'name department');
    
    // Calculate statistics by department and employee
    const statsByDepartment = {};
    const statsByEmployee = {};
    
    attendanceRecords.forEach(record => {
      const department = record.user.department || 'Unknown';
      const employeeId = record.user._id.toString();
      const employeeName = record.user.name;
      
      // Initialize department stats if not exists
      if (!statsByDepartment[department]) {
        statsByDepartment[department] = {
          present: 0,
          absent: 0,
          leaves: 0,
          totalEmployees: new Set()
        };
      }
      
      // Initialize employee stats if not exists
      if (!statsByEmployee[employeeId]) {
        statsByEmployee[employeeId] = {
          name: employeeName,
          department: department,
          present: 0,
          absent: 0,
          leaves: 0
        };
      }
      
      // Count present days
      if (record.punches && record.punches.length > 0) {
        statsByDepartment[department].present++;
        statsByEmployee[employeeId].present++;
        statsByDepartment[department].totalEmployees.add(employeeId);
      }
    });
    
    // Process leaves
    leaves.forEach(leave => {
      const employeeId = leave.employee._id.toString();
      const department = leave.employee.department || 'Unknown';
      const status = leave.status;
      
      if (status === 'approved') {
        const start = new Date(Math.max(new Date(leave.startDate), startDate));
        const end = new Date(Math.min(new Date(leave.endDate), endDate));
        
        let leaveDays = 0;
        let current = new Date(start);
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const isHoliday = holidays.some(holiday => 
              holiday.date.toDateString() === current.toDateString()
            );
            if (!isHoliday) {
              leaveDays++;
            }
          }
          current.setDate(current.getDate() + 1);
        }
        
        if (statsByEmployee[employeeId]) {
          statsByEmployee[employeeId].leaves += leaveDays;
        }
        
        if (statsByDepartment[department]) {
          statsByDepartment[department].leaves += leaveDays;
        }
      }
    });
    
    // Calculate absent days
    Object.keys(statsByDepartment).forEach(department => {
      const totalDays = workingDays * statsByDepartment[department].totalEmployees.size;
      statsByDepartment[department].absent = totalDays - 
        statsByDepartment[department].present - 
        statsByDepartment[department].leaves;
    });
    
    Object.keys(statsByEmployee).forEach(employeeId => {
      statsByEmployee[employeeId].absent = workingDays - 
        statsByEmployee[employeeId].present - 
        statsByEmployee[employeeId].leaves;
    });
    
    res.json({
      period: { startDate, endDate },
      workingDays,
      holidays: holidays.length,
      byDepartment: statsByDepartment,
      byEmployee: statsByEmployee,
      summary: {
        totalPresent: Object.values(statsByEmployee).reduce((sum, emp) => sum + emp.present, 0),
        totalAbsent: Object.values(statsByEmployee).reduce((sum, emp) => sum + emp.absent, 0),
        totalLeaves: Object.values(statsByEmployee).reduce((sum, emp) => sum + emp.leaves, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};