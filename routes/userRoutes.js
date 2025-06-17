const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateProfilePicture
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/profile-picture', protect, upload.single('image'), updateProfilePicture);

module.exports = router;