const express = require('express');

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const registrationRoutes = require('./registrationRoutes');
const attendanceRoutes = require('./attendanceRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
// These two are nested under a specific event, e.g.
// POST /api/events/:eventId/register, GET /api/events/:eventId/attendance
router.use('/events/:eventId', registrationRoutes);
router.use('/events/:eventId/attendance', attendanceRoutes);

module.exports = router;
