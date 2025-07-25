// routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const leaveRoutes = require('./leaveRoutes');
const wfhRoutes = require('./wfhRoutes');
const attendanceRoutes = require('./attendanceRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leaves', leaveRoutes);
router.use('/wfh', wfhRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;