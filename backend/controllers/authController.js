const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const PlayerProfile = require('../models/PlayerProfile');
const CoachProfile = require('../models/CoachProfile');
const BusinessProfile = require('../models/BusinessProfile');
const { asyncHandler } = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/** Admin accounts never use passwordHash for login — only ADMIN_PASSWORD in .env. */
function adminLoginPasswordOk(provided) {
  const expected = process.env.ADMIN_PASSWORD;
  if (expected == null || expected === '') return false;
  return String(provided) === expected;
}

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, password, role, profile } = req.body;
  if (role === 'admin') {
    return res.status(403).json({ success: false, message: 'Cannot register as admin via public API' });
  }
  if (role === 'coach') {
    const specs = profile?.specialties;
    if (!Array.isArray(specs) || specs.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Coach registration requires at least one specialty (cricket or badminton).',
      });
    }
    const allowed = ['cricket', 'badminton'];
    if (!specs.every((s) => allowed.includes(s))) {
      return res.status(400).json({
        success: false,
        message: 'Specialties must be cricket and/or badminton only (SRS scope).',
      });
    }
  }
  if (role === 'business_owner' && (!profile?.businessName || String(profile.businessName).trim() === '')) {
    return res.status(400).json({ success: false, message: 'Business name is required.' });
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  let verificationStatus = 'pending_review';
  if (role === 'player') verificationStatus = 'verified';

  const user = await User.create({
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    verificationStatus,
  });

  if (role === 'player') {
    const pp = await PlayerProfile.create({
      user: user._id,
      fullName: profile.fullName,
      phone: profile.phone,
      sportPreference: profile.sportPreference,
      skillLevel: profile.skillLevel || 'beginner',
      city: profile.city,
      address: profile.address,
    });
    user.playerProfile = pp._id;
    await user.save();
  } else if (role === 'coach') {
    const cp = await CoachProfile.create({
      user: user._id,
      fullName: profile.fullName,
      phone: profile.phone,
      specialties: profile.specialties || [],
      academyLocation: profile.academyLocation,
      city: profile.city,
      bio: profile.bio,
      yearsExperience: profile.yearsExperience || 0,
      availability: profile.availability || [],
      locationMapUrl: profile.locationMapUrl,
    });
    user.coachProfile = cp._id;
    await user.save();
  } else if (role === 'business_owner') {
    const bp = await BusinessProfile.create({
      user: user._id,
      businessName: profile.businessName,
      phone: profile.phone,
      storeName: profile.storeName || profile.businessName,
      storeDescription: profile.storeDescription,
      listingSlotsRemaining: 0,
    });
    user.businessProfile = bp._id;
    await user.save();
  }

  const token = signToken(user);
  res.status(201).json({
    success: true,
    data: { token, user: { id: user._id, email: user.email, role: user.role, verificationStatus: user.verificationStatus } },
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const ok =
    user.role === 'admin'
      ? adminLoginPasswordOk(password)
      : await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'Account suspended' });
  }
  const token = signToken(user);
  res.json({
    success: true,
    data: {
      token,
      user: { id: user._id, email: user.email, role: user.role, verificationStatus: user.verificationStatus },
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('playerProfile')
    .populate('coachProfile')
    .populate('businessProfile')
    .lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  delete user.passwordHash;
  res.json({ success: true, data: user });
});

const passwordResetRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message:
      'If an account exists for this email, password reset instructions would be sent (integrate SMTP per SDD Notification Service).',
    data: { email },
  });
});

module.exports = { register, login, me, passwordResetRequest, signToken };
