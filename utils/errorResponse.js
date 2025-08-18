// utils/errorResponse.js
class ErrorResponse extends Error {
  /**
   * Create a custom ErrorResponse
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    
    // Capture stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
    
    // Additional properties for debugging
    this.timestamp = new Date().toISOString();
    
    // Set the prototype explicitly (for TypeScript compatibility)
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }

  /**
   * Serialize error for sending in response
   * @returns {Object} - Serialized error object
   */
  serialize() {
    return {
      success: false,
      error: {
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
      }
    };
  }

  /**
   * Create a not found error
   * @param {string} resource - Name of resource not found
   * @returns {ErrorResponse} - Custom not found error
   */
  static notFound(resource = 'Resource') {
    return new ErrorResponse(`${resource} not found`, 404);
  }

  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @returns {ErrorResponse} - Custom bad request error
   */
  static badRequest(message = 'Bad Request') {
    return new ErrorResponse(message, 400);
  }

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @returns {ErrorResponse} - Custom unauthorized error
   */
  static unauthorized(message = 'Not authorized') {
    return new ErrorResponse(message, 401);
  }

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @returns {ErrorResponse} - Custom forbidden error
   */
  static forbidden(message = 'Forbidden') {
    return new ErrorResponse(message, 403);
  }

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @returns {ErrorResponse} - Custom conflict error
   */
  static conflict(message = 'Conflict') {
    return new ErrorResponse(message, 409);
  }

  /**
   * Create a validation error
   * @param {string|Array} errors - Validation errors
   * @returns {ErrorResponse} - Custom validation error
   */
  static validationError(errors = 'Validation failed') {
    if (Array.isArray(errors)) {
      return new ErrorResponse('Validation failed', 422).setErrors(errors);
    }
    return new ErrorResponse(errors, 422);
  }

  /**
   * Add validation errors to the response
   * @param {Array} errors - Array of validation errors
   * @returns {ErrorResponse} - Current instance
   */
  setErrors(errors) {
    this.errors = errors;
    return this;
  }
}

module.exports = ErrorResponse;