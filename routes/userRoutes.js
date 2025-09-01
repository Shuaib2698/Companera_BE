const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Define routes
router.get('/', protect, admin, userController.getAllUsers);
router.get('/count', protect, admin, userController.getUsersCount);
router.get('/me', protect, userController.getCurrentUser);
router.get('/:id', protect, userController.getUserById);
router.get('/me', protect, userController.getCurrentUser);
router.put('/profile', protect, userController.updateProfile);
router.post(
  '/upload-profile-picture', 
  protect, 
  upload.single('image'),
  userController.updateProfilePicture
);

module.exports = router;