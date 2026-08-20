/**
 * Custom error type that carries an HTTP status code and optional extra
 * data. Controllers throw this; the central error handler middleware reads
 * .statusCode and .data off it to build a consistent JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
