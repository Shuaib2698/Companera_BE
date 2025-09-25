// models/AssetRequest.js
const mongoose = require('mongoose');

const assetRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    required: true,
    enum: ['Asset Request', 'Asset Repair Request', 'Asset Reimbursement Request']
  },
  assetType: {
    type: String,
    required: true,
    enum: [
      'Laptop',
      'Monitor',
      'Software License',
      'Development Tools',
      'Hardware Accessories',
      'Cloud Resources',
      'Testing Devices',
      'Other'
    ]
  },
  preferredModel: String,
  quantity: {
    type: Number,
    default: 1
  },
  purpose: {
    type: String,
    required: true
  },
  estimatedCost: Number,
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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

module.exports = mongoose.model('AssetRequest', assetRequestSchema);