const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Bank details schema
const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: String,
  accountNumber: { type: String, maxlength: 16 },
  bankName: String,
  branchName: String,
  branchAddress: String,
  ifscCode: String,
  accountType: String,
  isPrimary: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
  verifiedBy: String
});

// Personal information schema
const personalInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other", "NA"], required: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  imageUrl: String,
  maritalStatus: String,
  nationality: String,
  emergencyContactName: String,
  emergencyContactPhone: String,
  emergencyContactRelation: String,
  address: String,
  city: String,
  state: String,
  zipCode: String
});

// Professional information schema
const professionalInfoSchema = new mongoose.Schema({
  designation: String,
  department: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  linkedinUrl: String,
  employeeType: { type: String, required: true },
  workMode: String,
  workType: String,
  workingDays: {
    type: [Number],
    validate: {
      validator: function(array) {
        return array.every(num => num >= 0 && num <= 6);
      },
      message: "Working days must be numbers between 0 (Sunday) and 6 (Saturday)"
    },
    required: true
  },
  shiftStart: { type: String, default: "09:00" },
  shiftEnd: { type: String, default: "17:00" }
});

// Document URLs schema
const documentsSchema = new mongoose.Schema({
  idProof: String,
  addressProof: String,
  educationCertificates: String,
  experienceCertificates: String,
  photograph: String,
  offerLetter: String,
  joiningLetter: String,
  salarySlip: String,
  resume: String
});

// Account access schema
const accountAccessSchema = new mongoose.Schema({
  slackId: String,
  skypeId: String,
  githubId: String
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  personalInfo: personalInfoSchema,
  professionalInfo: professionalInfoSchema,
  accountAccess: accountAccessSchema,
  documents: documentsSchema,
  bankDetails: [bankDetailsSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);