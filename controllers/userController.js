const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    
    if (req.body.personalInfo) updates.personalInfo = req.body.personalInfo;
    if (req.body.professionalInfo) updates.professionalInfo = req.body.professionalInfo;
    if (req.body.accountAccess) updates.accountAccess = req.body.accountAccess;
    if (req.body.bankDetails) updates.bankDetails = req.body.bankDetails;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'personalInfo.imageUrl': imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      imageUrl: user.personalInfo.imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading profile picture' });
  }
};

exports.getUsersCount = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const count = await User.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};