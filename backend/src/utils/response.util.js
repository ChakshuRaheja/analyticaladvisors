/**
 * Utility functions to standardize API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
exports.sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} error - Error details (only included in development)
 * @param {number} statusCode - HTTP status code (default: 400)
 */
exports.sendError = (res, message, error = null, statusCode = 400) => {
  const response = {
    status: 'error',
    message,
  };

  // Only include error details in development
  if (error !== null && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
}; 