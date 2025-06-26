const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: { type: String, required: true },
  department: { type: String, required: true },
  purpose: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  requiredByDate: { type: Date, required: true },
  documentUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hold'],
    default: 'pending'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
