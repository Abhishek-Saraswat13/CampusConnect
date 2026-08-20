const express = require('express');
const { createEvent, listEvents, getEvent, getEventStats } = require('../controllers/eventController');
const protect = require('../middleware/auth');
const { authorizeRoles, requireEventOwnership } = require('../middleware/authorize');

const router = express.Router();

router.get('/', listEvents);
router.get('/:eventId', getEvent);
router.post('/', protect, authorizeRoles('admin'), createEvent);
router.get('/:eventId/stats', protect, requireEventOwnership, getEventStats);

module.exports = router;
