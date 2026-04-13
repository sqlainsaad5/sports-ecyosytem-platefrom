const { validationResult } = require('express-validator');
const User = require('../models/User');
const PlayerProfile = require('../models/PlayerProfile');
const CoachProfile = require('../models/CoachProfile');
const TrainingRequest = require('../models/TrainingRequest');
const TrainingSession = require('../models/TrainingSession');
const TrainingPlan = require('../models/TrainingPlan');
const PerformanceEvaluation = require('../models/PerformanceEvaluation');
const IndoorGround = require('../models/IndoorGround');
const GroundBooking = require('../models/GroundBooking');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const CoachFeedback = require('../models/CoachFeedback');
const Complaint = require('../models/Complaint');
const { asyncHandler } = require('../utils/asyncHandler');
const { hasOverlap } = require('../utils/groundBookings');
const { notifyUser } = require('../utils/notify');
const { verifiedBusinessOwnerIds } = require('../utils/verifiedSellers');

const populateCoachBrief = {
  path: 'coach',
  select: 'email verificationStatus',
  populate: { path: 'coachProfile', select: 'fullName city specialties' },
};
const populatePlayerBrief = {
  path: 'player',
  select: 'email',
  populate: { path: 'playerProfile', select: 'fullName city sportPreference skillLevel' },
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('playerProfile');
  if (!user.playerProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: user.playerProfile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const profile = await PlayerProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true });
  res.json({ success: true, data: profile });
});

/** UC-P3 — automated coach recommendation (sport, skill, location); verified coaches only */
const getRecommendations = asyncHandler(async (req, res) => {
  const start = Date.now();
  const user = await User.findById(req.user.id).populate('playerProfile');
  const p = user.playerProfile;
  if (!p) return res.status(400).json({ success: false, message: 'Complete player profile first' });

  const coaches = await User.find({
    role: 'coach',
    verificationStatus: 'verified',
    isSuspended: false,
  })
    .populate('coachProfile')
    .lean();

  const scored = coaches
    .filter((c) => c.coachProfile && (c.coachProfile.specialties || []).includes(p.sportPreference))
    .map((c) => {
      let score = 50;
      const city = (p.city || '').toLowerCase();
      const ccity = (c.coachProfile.city || '').toLowerCase();
      if (city && ccity && city === ccity) score += 30;
      else if (city && ccity && ccity.includes(city)) score += 15;
      const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      score += (c.coachProfile.averageRating || 0) * 5;
      score += levelOrder[p.skillLevel] || 0;
      return { coachUser: c, profile: c.coachProfile, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const elapsed = Date.now() - start;
  res.set('X-Recommendation-ms', String(elapsed));
  res.json({ success: true, data: scored.map((s) => ({ userId: s.coachUser._id, profile: s.profile, matchScore: s.matchScore })) });
});

const createTrainingRequest = asyncHandler(async (req, res) => {
  const { coachId, message, preferredStart } = req.body;
  const coach = await User.findOne({ _id: coachId, role: 'coach', verificationStatus: 'verified' });
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not available' });
  const pending = await TrainingRequest.findOne({
    player: req.user.id,
    coach: coachId,
    status: 'pending',
  });
  if (pending) {
    return res.status(409).json({
      success: false,
      message: 'You already have a pending request for this coach.',
    });
  }
  const tr = await TrainingRequest.create({
    player: req.user.id,
    coach: coachId,
    message,
    preferredStart: preferredStart ? new Date(preferredStart) : undefined,
  });
  await notifyUser(coachId, {
    title: 'New training request',
    body: 'A player requested a training session.',
    category: 'training',
  });
  res.status(201).json({ success: true, data: tr });
});

const listMyTrainingRequests = asyncHandler(async (req, res) => {
  const list = await TrainingRequest.find({ player: req.user.id })
    .populate(populateCoachBrief)
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
});

const listTrainingSessions = asyncHandler(async (req, res) => {
  const list = await TrainingSession.find({ player: req.user.id })
    .populate(populateCoachBrief)
    .sort({ scheduledAt: 1 })
    .lean();
  res.json({ success: true, data: list });
});

const listTrainingPlans = asyncHandler(async (req, res) => {
  const list = await TrainingPlan.find({ player: req.user.id }).sort({ weekStartDate: -1 }).lean();
  res.json({ success: true, data: list });
});

const holdGroundBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { groundId, startTime, endTime, amount } = req.body;
  const ground = await IndoorGround.findById(groundId);
  if (!ground || !ground.isActive) return res.status(404).json({ success: false, message: 'Ground not found' });

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) return res.status(400).json({ success: false, message: 'Invalid time range' });

  const conflict = await hasOverlap(groundId, start, end);
  if (conflict) return res.status(409).json({ success: false, message: 'Slot unavailable' });

  const holdMins = parseInt(process.env.HOLD_MINUTES || '5', 10);
  const holdExpiresAt = new Date(Date.now() + holdMins * 60 * 1000);

  const booking = await GroundBooking.create({
    ground: groundId,
    player: req.user.id,
    startTime: start,
    endTime: end,
    status: 'held',
    holdExpiresAt,
    amount: amount ?? 0,
  });
  res.status(201).json({ success: true, data: booking });
});

const confirmGroundPayment = asyncHandler(async (req, res) => {
  const booking = await GroundBooking.findOne({
    _id: req.params.id,
    player: req.user.id,
    status: 'held',
  });
  if (!booking) return res.status(404).json({ success: false, message: 'Hold not found' });
  if (booking.holdExpiresAt < new Date()) {
    booking.status = 'cancelled';
    await booking.save();
    return res.status(410).json({ success: false, message: 'Hold expired' });
  }
  const conflict = await hasOverlap(booking.ground, booking.startTime, booking.endTime, booking._id);
  if (conflict) {
    booking.status = 'cancelled';
    await booking.save();
    return res.status(409).json({ success: false, message: 'Slot no longer available' });
  }

  const payment = await Payment.create({
    payer: req.user.id,
    type: 'ground_booking',
    amount: booking.amount,
    status: 'completed',
    externalRef: 'mock-gateway',
  });
  booking.payment = payment._id;
  booking.status = 'confirmed';
  booking.holdExpiresAt = undefined;
  await booking.save();
  res.json({ success: true, data: booking });
});

const listMyGroundBookings = asyncHandler(async (req, res) => {
  const list = await GroundBooking.find({ player: req.user.id })
    .populate('ground')
    .sort({ startTime: -1 })
    .lean();
  res.json({ success: true, data: list });
});

const cancelGroundBooking = asyncHandler(async (req, res) => {
  const b = await GroundBooking.findOne({ _id: req.params.id, player: req.user.id });
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (b.status === 'cancelled') return res.json({ success: true, data: b });
  b.status = 'cancelled';
  await b.save();
  res.json({ success: true, data: b });
});

const getPerformance = asyncHandler(async (req, res) => {
  const evals = await PerformanceEvaluation.find({ player: req.user.id }).sort({ weekStartDate: -1 }).lean();
  res.json({ success: true, data: evals });
});

const browseProducts = asyncHandler(async (req, res) => {
  const ownerIds = await verifiedBusinessOwnerIds();
  const list = await Product.find({
    isActive: true,
    businessOwner: { $in: ownerIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
});

const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ success: false, message: 'items required' });
  }
  let total = 0;
  const lineDocs = [];
  let ownerId;
  for (const line of items) {
    const prod = await Product.findById(line.productId);
    if (!prod || !prod.isActive) return res.status(400).json({ success: false, message: `Invalid product ${line.productId}` });
    const qty = line.quantity || 1;
    if (prod.stock < qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${prod.name}` });
    if (ownerId && ownerId.toString() !== prod.businessOwner.toString()) {
      return res.status(400).json({ success: false, message: 'All items must be from the same store' });
    }
    const seller = await User.findById(prod.businessOwner);
    if (
      !seller ||
      seller.role !== 'business_owner' ||
      seller.verificationStatus !== 'verified' ||
      seller.isSuspended
    ) {
      return res.status(400).json({
        success: false,
        message: `Product "${prod.name}" is not from a verified store.`,
      });
    }
    ownerId = prod.businessOwner;
    const sub = prod.price * qty;
    total += sub;
    lineDocs.push({ product: prod._id, name: prod.name, unitPrice: prod.price, quantity: qty });
  }

  const payment = await Payment.create({
    payer: req.user.id,
    payee: ownerId,
    type: 'product',
    amount: total,
    status: 'completed',
    externalRef: 'mock-gateway',
  });

  for (let i = 0; i < items.length; i++) {
    const line = items[i];
    const qty = line.quantity || 1;
    await Product.findByIdAndUpdate(line.productId, { $inc: { stock: -qty } });
  }

  const order = await Order.create({
    player: req.user.id,
    businessOwner: ownerId,
    items: lineDocs,
    totalAmount: total,
    status: 'paid',
    payment: payment._id,
  });

  await notifyUser(ownerId, {
    title: 'New order',
    body: `Order received — total ${total}`,
    category: 'order',
  });

  res.status(201).json({ success: true, data: order });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const list = await Order.find({ player: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

const submitCoachFeedback = asyncHandler(async (req, res) => {
  const { rating, comment, anonymous } = req.body;
  const coachId = req.params.coachId;
  const coach = await User.findOne({ _id: coachId, role: 'coach', verificationStatus: 'verified' });
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
  const trained = await TrainingSession.findOne({ coach: coachId, player: req.user.id });
  if (!trained) {
    return res.status(400).json({
      success: false,
      message: 'You can only rate coaches you have (or had) a training session with.',
    });
  }
  const fb = await CoachFeedback.create({
    player: req.user.id,
    coach: coachId,
    rating,
    comment,
    anonymous: !!anonymous,
  });
  const agg = await CoachFeedback.aggregate([
    { $match: { coach: coach._id } },
    { $group: { _id: '$coach', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await CoachProfile.findOneAndUpdate(
      { user: coachId },
      { averageRating: Math.round(agg[0].avg * 10) / 10, ratingCount: agg[0].cnt }
    );
  }
  await notifyUser(coachId, {
    title: 'New player feedback',
    body: `Rating: ${rating}`,
    category: 'feedback',
  });
  res.status(201).json({ success: true, data: fb });
});

const payCoach = asyncHandler(async (req, res) => {
  const { coachId, amount } = req.body;
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
  }
  const coach = await User.findOne({
    _id: coachId,
    role: 'coach',
    verificationStatus: 'verified',
    isSuspended: false,
  });
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not available for payment' });
  const rel = await TrainingSession.findOne({ coach: coachId, player: req.user.id });
  if (!rel) {
    return res.status(400).json({
      success: false,
      message: 'Payments are only allowed to coaches you have a training session with.',
    });
  }
  const payment = await Payment.create({
    payer: req.user.id,
    payee: coachId,
    type: 'coach_fee',
    amount,
    status: 'completed',
    externalRef: 'mock-gateway',
  });
  await notifyUser(coachId, {
    title: 'Payment received',
    body: `Training fee: ${amount}`,
    category: 'payment',
  });
  res.status(201).json({ success: true, data: payment });
});

const listNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: list });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  if (!n) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: n });
});

const fileComplaint = asyncHandler(async (req, res) => {
  const { subject, description, againstUserId } = req.body;
  const c = await Complaint.create({
    filedBy: req.user.id,
    againstUser: againstUserId || undefined,
    subject,
    description,
  });
  res.status(201).json({ success: true, data: c });
});

module.exports = {
  getProfile,
  updateProfile,
  getRecommendations,
  createTrainingRequest,
  listMyTrainingRequests,
  listTrainingSessions,
  listTrainingPlans,
  holdGroundBooking,
  confirmGroundPayment,
  listMyGroundBookings,
  cancelGroundBooking,
  getPerformance,
  browseProducts,
  createOrder,
  listMyOrders,
  submitCoachFeedback,
  payCoach,
  listNotifications,
  markNotificationRead,
  fileComplaint,
};
