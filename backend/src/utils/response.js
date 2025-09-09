/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} [data] - Response data
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object|string} [error] - Error object or message
 * @param {number} [statusCode=500] - HTTP status code
 */
const sendError = (res, message, error = null, statusCode = 500) => {
  console.error(`[${statusCode}] ${message}`, error || '');
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? (error?.message || error) : undefined
  });
};

module.exports = {
  sendSuccess,
  sendError
};
