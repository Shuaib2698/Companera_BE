// models/TripRequest.js
const mongoose = require('mongoose');

const tripRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripPurpose: {
    type: String,
    required: true,
    enum: [
      'Client Meeting',
      'Business Development',
      'Project Work',
      'On-site Visit',
      'Training',
      'Workshop',
      'Conference',
      'Audit',
      'Compliance Check',
      'Team Offsite',
      'Retreat'
    ]
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true
  },
  country: String,
  zipCode: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documentUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('TripRequest', tripRequestSchema);