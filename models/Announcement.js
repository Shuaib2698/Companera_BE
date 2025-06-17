const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: { 
    type: String, 
    enum: ['all', 'admin', 'employee'], 
    default: 'all' 
  },
  isImportant: { type: Boolean, default: false },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);