function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  } else if (status >= 500) {
    console.error(message);
  }
  res.status(status).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
}

module.exports = { errorHandler };
