const multer = require('multer');

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large (max 8 MB).'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Invalid upload field. Please use the photo picker on the profile page.'
          : err.message;
    return res.status(400).json({ success: false, message });
  }
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
