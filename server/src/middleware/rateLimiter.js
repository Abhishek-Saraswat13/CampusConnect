const rateLimit = require('express-rate-limit');

/**
 * Rate limits the attendance scan endpoint per IP. This isn't about
 * defending against a slow human with a scanner (a real check-in gate
 * might do a few scans per second) - it's about capping how fast someone
 * could brute-force attendanceTokens or hammer the endpoint if a JWT
 * leaks. 100 requests/minute comfortably covers a busy physical gate with
 * room to spare, while still bounding abuse.
 */
const scanRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many scan requests from this device. Please slow down.',
    data: null,
  },
});

/**
 * Stricter limiter for login, to slow down credential-stuffing/brute-force
 * attempts against the auth endpoint.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    data: null,
  },
});

module.exports = { scanRateLimiter, loginRateLimiter };
