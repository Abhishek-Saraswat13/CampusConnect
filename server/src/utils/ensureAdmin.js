const User = require('../models/User');

/**
 * Ensures exactly one admin account exists, created from environment
 * variables rather than through the public /register endpoint. This is
 * what "deployment ready" means here: set ADMIN_EMAIL / ADMIN_PASSWORD in
 * your hosting provider's env vars, deploy, and the admin login exists
 * automatically on first boot - no manual seed step required.
 *
 * Idempotent: if the account already exists, this does nothing (in
 * particular, it never resets a password that was already changed).
 */
async function ensureAdminAccount() {
  const email = (process.env.ADMIN_EMAIL || 'admin@campusconnect.com').toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account ready (${email})`);
    return existing;
  }

  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'Event Admin';

  const admin = await User.create({ name, email, password, role: 'admin' });
  console.log(`Admin account created -> ${email}`);
  return admin;
}

module.exports = ensureAdminAccount;
