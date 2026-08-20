const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Restricts a route to the given roles. Must run after `protect`, since it
 * reads req.user. Usage: authorizeRoles('admin')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not permitted to do this`));
    }
    next();
  };
}

/**
 * Ensures the authenticated admin is actually the organizer of the event
 * in the URL (:eventId). This is what stops one admin account from
 * managing an event created by a different admin account - relevant if
 * you ever provision more than one admin login. Attaches the loaded
 * event to req.event so downstream handlers don't have to fetch it again.
 */
const requireEventOwnership = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner) {
    throw new ApiError(403, 'You are not authorized to manage this event');
  }

  req.event = event;
  next();
});

module.exports = { authorizeRoles, requireEventOwnership };
