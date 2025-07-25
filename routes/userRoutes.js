const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateProfilePicture,
  getUsersCount,
  getCurrentUser // Add this import
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, admin, getAllUsers);
router.get('/count', protect, admin, getUsersCount);
router.get('/:id', protect, getUserById);
router.get('/me', protect, getCurrentUser); // This will now work
router.put('/profile', protect, updateProfile);
router.put('/profile-picture', protect, upload.single('image'), updateProfilePicture);

module.exports = router;