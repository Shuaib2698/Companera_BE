// models/HolidayModel.js
const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['government', 'company', 'religious'],
    default: 'government'
  },
  description: { 
    type: String 
  },
  recurring: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient date queries
holidaySchema.index({ date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);