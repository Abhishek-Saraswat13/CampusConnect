const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Short, human-readable identifier shown on the ticket/dashboard
    // (e.g. "REG-4F9A2C"). NOT secret, and NOT used to mark attendance -
    // that's what attendanceToken is for. Safe to display or print.
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
    // Long, cryptographically random, unguessable token. This is the ONLY
    // thing encoded in the QR code. It is the sole credential that can
    // mark this registration's attendance, so it must be unique and
    // effectively impossible to brute-force.
    attendanceToken: {
      type: String,
      required: true,
      unique: true,
    },
    // Whether the registration itself is valid. A cancelled registration
    // can never be scanned in, even if the token still resolves.
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    // Whether the student has actually been scanned in at the event.
    // Kept separate from registrationStatus so the two concerns (did they
    // sign up / did they show up) never get conflated.
    attendanceStatus: {
      type: String,
      enum: ['not_attended', 'attended'],
      default: 'not_attended',
    },
    attendedAt: {
      type: Date,
      default: null,
    },
    // Which organizer account performed the scan - useful for an audit
    // trail if a dispute ever comes up ("who marked me present?").
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// A student can register for a given event at most once. This is enforced
// at the database level (not just in application code) so it holds even
// under concurrent requests.
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

// Note: attendanceToken already gets a unique index from `unique: true`
// on the field above - it's declared there rather than here because it's
// looked up on every single scan and deserves the fast unique lookup.

registrationSchema.index({ event: 1, attendanceStatus: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
