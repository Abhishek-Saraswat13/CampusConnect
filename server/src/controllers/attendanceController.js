const Registration = require('../models/Registration');
const attendanceService = require('../services/attendanceService');
const { buildAttendanceCsv } = require('../services/csvService');
const asyncHandler = require('../utils/asyncHandler');
const sendSuccess = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// POST /api/events/:eventId/attendance/scan  (admin who owns the event)
const scanAttendance = asyncHandler(async (req, res) => {
  const { attendanceToken } = req.body;
  const result = await attendanceService.markAttendance({
    eventId: req.params.eventId,
    attendanceToken,
    organizerId: req.user._id,
  });
  sendSuccess(res, 200, 'Attendance marked successfully', result);
});

// GET /api/events/:eventId/attendance  (dashboard table, supports ?status=&search=)
const listAttendance = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status, search } = req.query;

  const filter = { event: eventId, registrationStatus: 'confirmed' };
  if (status === 'attended' || status === 'not_attended') {
    filter.attendanceStatus = status;
  }

  let registrations = await Registration.find(filter)
    .populate('student', 'name email')
    .sort({ attendedAt: -1, createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    registrations = registrations.filter(
      (r) =>
        r.student.name.toLowerCase().includes(term) ||
        r.registrationId.toLowerCase().includes(term) ||
        r.student.email.toLowerCase().includes(term)
    );
  }

  sendSuccess(
    res,
    200,
    'Attendance list fetched',
    registrations.map((r) => ({
      registrationId: r.registrationId,
      studentName: r.student.name,
      studentEmail: r.student.email,
      attendanceStatus: r.attendanceStatus,
      attendedAt: r.attendedAt,
    }))
  );
});

// GET /api/events/:eventId/attendance/export  (CSV download)
const exportAttendance = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registrations = await Registration.find({
    event: eventId,
    registrationStatus: 'confirmed',
  })
    .populate('student', 'name email')
    .sort({ 'student.name': 1 });

  if (!req.event) {
    throw new ApiError(404, 'Event not found');
  }

  const csv = buildAttendanceCsv(registrations, req.event.title);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="attendance-${req.event.title.replace(/\s+/g, '_')}.csv"`
  );
  res.status(200).send(csv);
});

module.exports = { scanAttendance, listAttendance, exportAttendance };
