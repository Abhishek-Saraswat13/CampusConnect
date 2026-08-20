const crypto = require('crypto');

/**
 * Generates the secure, unguessable token that goes inside the QR code.
 * 32 random bytes = 256 bits of entropy, hex-encoded to 64 characters.
 * This is long enough that brute-forcing or guessing a valid token is
 * computationally infeasible - the only realistic way to obtain one is to
 * actually be the registered student viewing their own ticket.
 */
function generateAttendanceToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a short, human-friendly registration ID for display purposes
 * (ticket page, dashboard table, CSV export). This is NOT a security
 * credential - it's fine for it to be short and semi-guessable, because it
 * cannot be used to mark attendance. Format: REG-XXXXXX (6 hex chars).
 */
function generateRegistrationId() {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REG-${suffix}`;
}

module.exports = { generateAttendanceToken, generateRegistrationId };
