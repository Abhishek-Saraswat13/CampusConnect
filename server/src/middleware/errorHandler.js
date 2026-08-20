const ApiError = require('../utils/ApiError');

/**
 * Catches 404s for routes that don't exist at all.
 */
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place where every error in the app is turned into a consistent
 * JSON response: { success: false, message, data }.
 * Handles our own ApiError, Mongoose validation/cast errors, and falls
 * back to a generic 500 for anything unexpected (never leaking stack
 * traces to the client in production).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let data = err.data || null;

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }

  // Mongoose bad ObjectId cast (e.g. malformed :eventId in the URL)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // Duplicate key error not already handled by a service layer
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}

module.exports = { notFound, errorHandler };
