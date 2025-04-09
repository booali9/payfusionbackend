class ErrorResponse extends Error {
    constructor(message, statusCode, errors = []) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = new ErrorResponse(message, 404);
    }
  
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = new ErrorResponse(message, 400);
    }
  
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new ErrorResponse(message, 400, message);
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      errors: error.errors || []
    });
  };
  
  const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  module.exports = {
    ErrorResponse,
    errorHandler,
    asyncHandler
  };