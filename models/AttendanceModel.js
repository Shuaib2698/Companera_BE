const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  punchIn: { type: Date },
  punchOut: { type: Date },
  isManual: { type: Boolean, default: false },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'], 
    default: 'present' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);