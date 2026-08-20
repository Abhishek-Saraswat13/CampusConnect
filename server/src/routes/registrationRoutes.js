const express = require('express');
const { registerForEvent, getTicket } = require('../controllers/registrationController');
const protect = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// mergeParams so :eventId from the parent mount path is visible here
const router = express.Router({ mergeParams: true });

router.post('/register', protect, authorizeRoles('student'), registerForEvent);
router.get('/ticket', protect, authorizeRoles('student'), getTicket);

module.exports = router;
