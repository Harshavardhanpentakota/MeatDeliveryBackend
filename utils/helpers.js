/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async wrapper for route handlers to catch errors
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Standard API response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  sendResponse(res, statusCode, true, message, data);
};

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
const sendError = (res, message = 'Error', statusCode = 400) => {
  sendResponse(res, statusCode, false, message);
};

/**
 * Pagination helper
 * @param {Object} query - Mongoose query object
 * @param {Object} req - Express request object
 * @returns {Object} Paginated results
 */
const paginate = async (query, req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Execute query
  const results = await query.skip(startIndex).limit(limit);

  // Get total count
  const total = await query.model.countDocuments(query.getQuery());

  // Pagination info
  const pagination = {
    current: page,
    pages: Math.ceil(total / limit),
    total,
    limit
  };

  // Add prev/next page info
  if (startIndex > 0) {
    pagination.prev = page - 1;
  }

  if (startIndex + limit < total) {
    pagination.next = page + 1;
  }

  return {
    data: results,
    pagination
  };
};

module.exports = {
  AppError,
  asyncHandler,
  sendResponse,
  sendSuccess,
  sendError,
  paginate
};