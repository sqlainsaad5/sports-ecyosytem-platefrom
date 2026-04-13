require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Stored so Mongoose `passwordHash` stays required; never used for admin login.
 * Admin auth is only `ADMIN_PASSWORD` in backend/.env (see authController.login).
 */
const ADMIN_DB_PLACEHOLDER = '__admin_login_uses_env_only__';

const resetPassword =
  process.argv.includes('--reset-password') || process.env.RESET_ADMIN_PASSWORD === 'true';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const email = (process.env.ADMIN_EMAIL || 'admin@sports-ecosystem.local').toLowerCase().trim();

  const existing = await User.findOne({ email });

  if (existing && existing.role !== 'admin') {
    console.error(
      `\nThis email is already used by a "${existing.role}" account, not an admin.\n` +
        `Fix: set ADMIN_EMAIL in backend/.env to a different address, or remove that user from MongoDB, then run seed again.\n`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const placeholderHash = await bcrypt.hash(ADMIN_DB_PLACEHOLDER, 12);

  if (existing && existing.role === 'admin') {
    if (resetPassword) {
      existing.passwordHash = placeholderHash;
      await existing.save();
      console.log('Admin user updated: DB holds a placeholder hash only.');
      console.log('Set ADMIN_PASSWORD in backend/.env and restart the API to log in.');
    } else {
      console.log('Admin already exists:', email);
      console.log('Password for login: ADMIN_PASSWORD in backend/.env (not stored in MongoDB).');
    }
    await mongoose.disconnect();
    return;
  }

  await User.create({
    email,
    passwordHash: placeholderHash,
    role: 'admin',
    verificationStatus: 'verified',
    isSuspended: false,
  });
  console.log('Admin created:', email);
  console.log('Set ADMIN_PASSWORD in backend/.env — that value is used for login (not saved in DB).');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
