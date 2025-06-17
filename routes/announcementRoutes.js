const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createAnnouncement);
router.get('/', protect, getAllAnnouncements);
router.get('/:id', protect, getAnnouncementById);
router.put('/:id', protect, admin, updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);

module.exports = router;