const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  _id: false // Disable automatic _id generation for subdocuments
});

const attendanceSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  // Keep original fields for backward compatibility
  punchIn: { type: Date },
  punchOut: { type: Date },
  // New field for multiple punches
  punches: [punchSchema],
  isManual: { type: Boolean, default: false },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'], 
    default: 'present' 
  }
}, { timestamps: true });

// Add index for efficient querying
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Middleware to maintain backward compatibility
attendanceSchema.pre('save', function(next) {
  // If we have punches but no punchIn/punchOut, set them for backward compatibility
  if (this.punches && this.punches.length > 0) {
    const firstPunchIn = this.punches.find(p => p.type === 'in');
    const lastPunchOut = [...this.punches].reverse().find(p => p.type === 'out');
    
    if (firstPunchIn && !this.punchIn) {
      this.punchIn = firstPunchIn.time;
    }
    
    if (lastPunchOut && !this.punchOut) {
      this.punchOut = lastPunchOut.time;
    }
  }
  
  // If we have punchIn/punchOut but no punches, create punches array for new functionality
  if ((this.punchIn || this.punchOut) && (!this.punches || this.punches.length === 0)) {
    this.punches = [];
    
    if (this.punchIn) {
      this.punches.push({ type: 'in', time: this.punchIn });
    }
    
    if (this.punchOut) {
      this.punches.push({ type: 'out', time: this.punchOut });
    }
  }
  
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);