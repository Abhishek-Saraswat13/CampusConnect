const registrationService = require('../services/registrationService');
const asyncHandler = require('../utils/asyncHandler');
const sendSuccess = require('../utils/ApiResponse');

// POST /api/events/:eventId/register  (student)
const registerForEvent = asyncHandler(async (req, res) => {
  const registration = await registrationService.registerForEvent(
    req.user._id,
    req.params.eventId
  );
  sendSuccess(res, 201, 'Registered successfully', {
    registrationId: registration.registrationId,
  });
});

// GET /api/events/:eventId/ticket  (student - view/re-view own ticket + QR)
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await registrationService.getTicket(req.user._id, req.params.eventId);
  sendSuccess(res, 200, 'Ticket fetched', ticket);
});

module.exports = { registerForEvent, getTicket };
