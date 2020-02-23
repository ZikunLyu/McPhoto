class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Call it here so the stack trace won't show the construtor call on line 3 (so we have a clean stack trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
