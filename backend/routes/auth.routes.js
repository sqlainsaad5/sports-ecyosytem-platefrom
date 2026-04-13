const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { emailField } = require('./validators');

const r = Router();

r.post(
  '/register',
  authLimiter,
  [
    emailField('email'),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['player', 'coach', 'business_owner']),
    body('profile').isObject(),
  ],
  auth.register
);
r.post('/login', authLimiter, [emailField('email'), body('password').notEmpty()], auth.login);
r.get('/me', authenticate, auth.me);
r.post(
  '/password-reset-request',
  authLimiter,
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail({ allow_utf8_local_part: true, require_tld: false })
    .customSanitizer((v) => (v == null || v === '' ? v : String(v).toLowerCase())),
  auth.passwordResetRequest
);

module.exports = r;
