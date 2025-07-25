const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  casual: { type: Number, default: 7 },
  sick: { type: Number, default: 7 },
  earned: { type: Number, default: 15 },
  bereavement: { type: Number, default: 3 },
  compOff: { type: Number, default: 0 },
  unpaid: { type: Number, default: 0 },
  paternity: { type: Number, default: 1 },
  maternity: { type: Number, default: 0 },
  wfh: { type: Number, default: 7 }
}, { timestamps: true });

// Create balance record when a new user is created
leaveBalanceSchema.statics.createForUser = async function(userId) {
  return this.create({ user: userId });
};

// Update balance when leave is approved
leaveBalanceSchema.methods.updateBalance = function(leaveType, days) {
  if (this[leaveType] !== undefined) {
    this[leaveType] -= days;
  }
  return this.save();
};

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);