const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  department: { type: String },
  position: { type: String },
  joiningDate: { type: Date, default: Date.now },
  contactNumber: { type: String },
  address: { type: String },
  profilePicture: { type: String }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create leave balance when new user is created
userSchema.post('save', async function(doc, next) {
  try {
    const LeaveBalance = require('./LeaveBalanceModel');
    await LeaveBalance.createForUser(doc._id);
  } catch (error) {
    console.error('Error creating leave balance:', error);
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);