const { body } = require('express-validator');

/** Supports internal/dev domains like `@*.local` and avoids normalizeEmail side-effects. */
const emailField = (field = 'email') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail({ allow_utf8_local_part: true, require_tld: false })
    .withMessage('Invalid email')
    .customSanitizer((v) => String(v).toLowerCase());

module.exports = { emailField };
