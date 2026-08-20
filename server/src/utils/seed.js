require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ensureAdminAccount = require('./ensureAdmin');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

/**
 * OPTIONAL dev convenience script - NOT required for deployment. The
 * admin account is already auto-provisioned every time the server boots
 * (see ensureAdmin.js / server.js), from ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * This script additionally wipes the database and adds one demo student
 * + one demo event, so you have something to click around immediately
 * without registering an account or filling in the "create event" form
 * by hand. Run with: npm run seed
 */
async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  const admin = await ensureAdminAccount();

  const student = await User.create({
    name: 'Rahul Sharma',
    email: 'student@campusconnect.test',
    password: 'password123',
    role: 'student',
  });

  const event = await Event.create({
    title: 'Annual Tech Fest 2026',
    description: 'A full day of workshops, talks, and hackathon finals.',
    organizer: admin._id,
    venue: 'Main Auditorium',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 60 * 60 * 1000),
    capacity: 200,
    registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    status: 'published',
  });

  console.log('\nSeed complete.\n');
  console.log(`Admin login    -> email: ${admin.email}  (password: whatever ADMIN_PASSWORD is set to)`);
  console.log('Student login  -> email: student@campusconnect.test  password: password123');
  console.log(`Demo event ID  -> ${event._id}`);
  console.log('\nLog in as the student, register for the event, then log in as admin to scan it.\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
