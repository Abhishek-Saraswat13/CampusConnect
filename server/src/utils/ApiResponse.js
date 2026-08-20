/**
 * Sends a consistently-shaped success response:
 * { success: true, message, data }
 * Keeps every controller returning the same envelope the frontend expects.
 */
function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

module.exports = sendSuccess;
