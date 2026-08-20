const express = require('express');
const {
  scanAttendance,
  listAttendance,
  exportAttendance,
} = require('../controllers/attendanceController');
const protect = require('../middleware/auth');
const { authorizeRoles, requireEventOwnership } = require('../middleware/authorize');
const { scanRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router({ mergeParams: true });

router.post(
  '/scan',
  protect,
  authorizeRoles('admin'),
  requireEventOwnership,
  scanRateLimiter,
  scanAttendance
);

router.get(
  '/',
  protect,
  authorizeRoles('admin'),
  requireEventOwnership,
  listAttendance
);

router.get(
  '/export',
  protect,
  authorizeRoles('admin'),
  requireEventOwnership,
  exportAttendance
);

module.exports = router;
