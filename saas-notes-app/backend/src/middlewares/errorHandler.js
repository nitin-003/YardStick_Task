// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle specific Mongoose/JWT errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors ? { errors: Object.values(err.errors).map(e => e.message) } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

// 404 handler
const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' });

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFound, asyncHandler };