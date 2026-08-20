const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
