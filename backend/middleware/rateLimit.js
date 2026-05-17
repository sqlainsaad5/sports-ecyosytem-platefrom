const rateLimit = require('express-rate-limit');

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';
/** Off in local dev so coach/admin panels are not blocked during testing. */
const skipLimiter = () => !isProduction || process.env.RATE_LIMIT_DISABLED === 'true';

const apiMax = Number(process.env.RATE_LIMIT_API_MAX) || (isProduction ? 2000 : 0);
const authMax = Number(process.env.RATE_LIMIT_AUTH_MAX) || (isProduction ? 100 : 0);

const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLimiter,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLimiter,
  message: { success: false, message: 'Too many authentication attempts.' },
});

module.exports = { apiLimiter, authLimiter };
