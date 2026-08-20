const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');

/**
 * Marks a registration as attended, given a scanned QR token.
 *
 * This function is the security-critical path of the whole feature - see
 * the numbered checks below, which mirror the verification flow described
 * in the architecture doc. Every one of these runs server-side; the
 * frontend scanner is never trusted for anything beyond "here is a string
 * I read off a QR code".
 */
async function markAttendance({ eventId, attendanceToken, organizerId }) {
  if (!attendanceToken || typeof attendanceToken !== 'string') {
    throw new ApiError(400, 'attendanceToken is required');
  }
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, 'Invalid event id');
  }

  // 1. Event must exist.
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  // 2. Token must resolve to a real registration. We look it up with
  //    minimal population first so we can give a precise error message
  //    (wrong event / cancelled / etc.) before attempting the write.
  const registration = await Registration.findOne({ attendanceToken }).populate(
    'student',
    'name email'
  );

  if (!registration) {
    throw new ApiError(404, 'Invalid or unrecognized QR code');
  }

  // 3. The registration must belong to the event currently being scanned
  //    at - this is what stops a token from a different event's ticket
  //    (even a completely genuine one) from being accepted here.
  if (registration.event.toString() !== eventId.toString()) {
    throw new ApiError(409, 'This registration does not belong to this event');
  }

  // 4. A cancelled registration can never be scanned in.
  if (registration.registrationStatus === 'cancelled') {
    throw new ApiError(400, 'This registration has been cancelled and is not valid for entry');
  }

  // 5. Already attended? Report the ORIGINAL timestamp, don't touch it.
  //    This check here is for a fast, friendly response on the common
  //    case (organizer accidentally scans the same person twice a few
  //    seconds apart) - but it is NOT what actually prevents the race
  //    condition. That guarantee comes from step 6 below.
  if (registration.attendanceStatus === 'attended') {
    throw new ApiError(409, 'Attendance already marked', {
      attendedAt: registration.attendedAt,
      studentName: registration.student.name,
      registrationId: registration.registrationId,
    });
  }

  // 6. Atomic, race-safe write. The condition `attendanceStatus:
  //    'not_attended'` is part of the QUERY FILTER, not a separate `if`
  //    checked in application code. MongoDB guarantees that a single
  //    document's writes are serialized, so if two scan requests for the
  //    same registration arrive at essentially the same instant, only ONE
  //    of these findOneAndUpdate calls can match a document still in the
  //    'not_attended' state - the other will match zero documents and get
  //    `null` back, even though both requests passed the check in step 5.
  //    This is the actual fix for the classic
  //    "if (!attended) { attended = true }" race condition.
  const updated = await Registration.findOneAndUpdate(
    { _id: registration._id, attendanceStatus: 'not_attended' },
    {
      $set: {
        attendanceStatus: 'attended',
        attendedAt: new Date(),
        scannedBy: organizerId,
      },
    },
    { new: true }
  ).populate('student', 'name email');

  if (!updated) {
    // We lost the race: another request marked it attended between step 5
    // and step 6. Re-fetch to report the timestamp the WINNING request set.
    const latest = await Registration.findById(registration._id);
    throw new ApiError(409, 'Attendance already marked', {
      attendedAt: latest.attendedAt,
      studentName: registration.student.name,
      registrationId: registration.registrationId,
    });
  }

  return {
    studentName: updated.student.name,
    studentEmail: updated.student.email,
    registrationId: updated.registrationId,
    eventName: event.title,
    attendedAt: updated.attendedAt,
  };
}

module.exports = { markAttendance };
