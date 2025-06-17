const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, isImportant, expiryDate } = req.body;

    const announcement = new Announcement({
      title,
      content,
      author: req.user.id,
      targetAudience,
      isImportant,
      expiryDate
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAnnouncements = async (req, res) => {
  try {
    let query = {};
    
    // For employees, don't show admin-only announcements
    if (req.user.role === 'employee') {
      query = { 
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'employee' }
        ]
      };
    }

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'name');

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};