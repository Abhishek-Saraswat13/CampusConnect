const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const sendSuccess = require('../utils/ApiResponse');

// POST /api/events  (admin only)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, venue, startDate, endDate, capacity, registrationDeadline } =
    req.body;

  if (!title || !venue || !startDate || !endDate || !capacity || !registrationDeadline) {
    throw new ApiError(400, 'title, venue, startDate, endDate, capacity and registrationDeadline are required');
  }

  const event = await Event.create({
    title,
    description,
    venue,
    startDate,
    endDate,
    capacity,
    registrationDeadline,
    organizer: req.user._id,
  });

  sendSuccess(res, 201, 'Event created', event);
});

// GET /api/events  (public - browse events)
const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: { $ne: 'cancelled' } })
    .populate('organizer', 'name email')
    .sort({ startDate: 1 });
  sendSuccess(res, 200, 'Events fetched', events);
});

// GET /api/events/:eventId
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId).populate('organizer', 'name email');
  if (!event) throw new ApiError(404, 'Event not found');
  sendSuccess(res, 200, 'Event fetched', event);
});

// GET /api/events/:eventId/stats  (admin who owns the event)
const getEventStats = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const [totalRegistrations, totalAttended] = await Promise.all([
    Registration.countDocuments({ event: eventId, registrationStatus: 'confirmed' }),
    Registration.countDocuments({
      event: eventId,
      registrationStatus: 'confirmed',
      attendanceStatus: 'attended',
    }),
  ]);

  const pending = totalRegistrations - totalAttended;
  const attendancePercentage =
    totalRegistrations === 0 ? 0 : Math.round((totalAttended / totalRegistrations) * 1000) / 10;

  sendSuccess(res, 200, 'Event stats fetched', {
    totalRegistrations,
    totalAttended,
    pending,
    attendancePercentage,
  });
});

module.exports = { createEvent, listEvents, getEvent, getEventStats };
