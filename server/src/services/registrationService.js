const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const { generateAttendanceToken, generateRegistrationId } = require('./tokenService');
const { generateQrDataUrl } = require('./qrService');

/**
 * Registers a student for an event.
 * - Validates the event exists, is open for registration, and has capacity.
 * - Relies on the unique (event, student) index as the final safety net
 *   against duplicate registrations under concurrent requests; a duplicate
 *   key error (Mongo code 11000) is caught and turned into a clean 409.
 */
async function registerForEvent(studentId, eventId) {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  if (event.status === 'cancelled') {
    throw new ApiError(400, 'This event has been cancelled');
  }
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new ApiError(400, 'Registration deadline has passed for this event');
  }

  const confirmedCount = await Registration.countDocuments({
    event: eventId,
    registrationStatus: 'confirmed',
  });
  if (confirmedCount >= event.capacity) {
    throw new ApiError(400, 'This event is at full capacity');
  }

  try {
    const registration = await Registration.create({
      event: eventId,
      student: studentId,
      registrationId: generateRegistrationId(),
      attendanceToken: generateAttendanceToken(),
      registrationStatus: 'confirmed',
      attendanceStatus: 'not_attended',
    });
    return registration;
  } catch (err) {
    // 11000 = MongoDB duplicate key error. Given our indexes, this means
    // either (event, student) or the token/registrationId collided.
    // A student/token collision is what we actually expect to happen
    // occasionally under concurrent double-submits; token/regId collisions
    // are astronomically unlikely given 256 bits of randomness.
    if (err.code === 11000) {
      throw new ApiError(409, 'You are already registered for this event');
    }
    throw err;
  }
}

/**
 * Builds the full ticket payload for a student viewing their own
 * registration: event details, registration status, and a freshly
 * regenerated QR code (the QR image itself is never stored - only the
 * token is, so it's cheap to regenerate on every view).
 */
async function getTicket(studentId, eventId) {
  const registration = await Registration.findOne({ event: eventId, student: studentId })
    .populate('event', 'title venue startDate endDate status')
    .populate('student', 'name email');

  if (!registration) {
    throw new ApiError(404, 'No registration found for this event');
  }

  const qrCodeDataUrl = await generateQrDataUrl(registration.attendanceToken);

  return {
    registrationId: registration.registrationId,
    registrationStatus: registration.registrationStatus,
    attendanceStatus: registration.attendanceStatus,
    attendedAt: registration.attendedAt,
    event: registration.event,
    student: registration.student,
    qrCodeDataUrl,
  };
}

module.exports = { registerForEvent, getTicket };
