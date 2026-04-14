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
const { effectiveProductPrice, inSaleWindow } = require('../utils/pricing');
const { buildProductOrderContext } = require('../utils/productOrder');
const {
  getStripe,
  isStripeEnabled,
  dollarsToCents,
  retrieveSucceededPaymentIntent,
  assertAmountMatches,
} = require('../utils/stripePayments');

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
  /** SRS UC-P5 — players only see published weekly plans */
  const list = await TrainingPlan.find({ player: req.user.id, status: 'published' })
    .sort({ weekStartDate: -1 })
    .lean();
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

const createGroundBookingPaymentIntent = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured on the server.' });
  }
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
  const amountCents = dollarsToCents(booking.amount);
  if (amountCents < 50) {
    return res.status(400).json({
      success: false,
      message: 'Set booking amount to at least 0.50 USD for card payment.',
    });
  }
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      purpose: 'ground_booking',
      playerId: String(req.user.id),
      bookingId: String(booking._id),
      amountCents: String(amountCents),
    },
  });
  res.json({
    success: true,
    data: { clientSecret: pi.client_secret, amount: booking.amount, currency: 'usd' },
  });
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

  let externalRef = 'mock-gateway';
  if (isStripeEnabled()) {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId is required after card payment.' });
    }
    const pi = await retrieveSucceededPaymentIntent(paymentIntentId);
    if (
      pi.metadata.purpose !== 'ground_booking' ||
      pi.metadata.playerId !== String(req.user.id) ||
      pi.metadata.bookingId !== String(booking._id)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid payment for this booking.' });
    }
    assertAmountMatches(pi, dollarsToCents(booking.amount));
    externalRef = paymentIntentId;
  }

  const payment = await Payment.create({
    payer: req.user.id,
    type: 'ground_booking',
    amount: booking.amount,
    status: 'completed',
    externalRef,
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
  const filter = {
    isActive: true,
    businessOwner: { $in: ownerIds },
  };
  if (req.query.sport) filter.sportType = req.query.sport;
  if (req.query.q) filter.name = new RegExp(String(req.query.q).trim(), 'i');
  if (req.query.category) filter.category = new RegExp(String(req.query.category).trim(), 'i');
  const list = await Product.find(filter).sort({ createdAt: -1 }).lean();
  const data = list.map((p) => ({
    ...p,
    effectivePrice: effectiveProductPrice(p),
    onSale: inSaleWindow(p) && (p.salePrice != null || (p.discountPercent != null && p.discountPercent > 0)),
  }));
  res.json({ success: true, data });
});

const createOrderPaymentIntent = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured on the server.' });
  }
  const { items } = req.body;
  let ctx;
  try {
    ctx = await buildProductOrderContext(items);
  } catch (e) {
    const code = e.statusCode || 400;
    return res.status(code).json({ success: false, message: e.message });
  }
  const totalCents = dollarsToCents(ctx.total);
  if (totalCents < 50) {
    return res.status(400).json({
      success: false,
      message: 'Order total is below the minimum card charge (0.50 USD).',
    });
  }
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      purpose: 'product_order',
      playerId: String(req.user.id),
      itemHash: ctx.itemHash,
      payee: String(ctx.ownerId),
      totalCents: String(totalCents),
    },
  });
  res.json({
    success: true,
    data: { clientSecret: pi.client_secret, amount: ctx.total, currency: 'usd' },
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, customerNote, cardLast4, paymentIntentId } = req.body;
  let ctx;
  try {
    ctx = await buildProductOrderContext(items);
  } catch (e) {
    const code = e.statusCode || 400;
    return res.status(code).json({ success: false, message: e.message });
  }

  let externalRef = 'mock-gateway';
  let meta = {
    cardLast4: cardLast4 || 'mock',
    invoiceRef: `INV-${Date.now()}`,
  };

  if (isStripeEnabled()) {
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId is required. Complete Stripe payment first.',
      });
    }
    const pi = await retrieveSucceededPaymentIntent(paymentIntentId);
    if (pi.metadata.purpose !== 'product_order' || pi.metadata.playerId !== String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment for this order.' });
    }
    if (pi.metadata.itemHash !== ctx.itemHash) {
      return res.status(400).json({ success: false, message: 'Cart does not match completed payment.' });
    }
    if (pi.metadata.payee !== String(ctx.ownerId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment recipient.' });
    }
    assertAmountMatches(pi, dollarsToCents(ctx.total));
    externalRef = paymentIntentId;
    meta = {
      ...meta,
      stripePaymentIntentId: paymentIntentId,
      invoiceRef: `INV-${Date.now()}`,
    };
  }

  const payment = await Payment.create({
    payer: req.user.id,
    payee: ctx.ownerId,
    type: 'product',
    amount: ctx.total,
    status: 'completed',
    externalRef,
    meta,
  });

  for (let i = 0; i < items.length; i++) {
    const line = items[i];
    const qty = line.quantity || 1;
    const updated = await Product.findByIdAndUpdate(
      line.productId,
      { $inc: { stock: -qty } },
      { new: true }
    );
    const th = updated.lowStockThreshold ?? 5;
    if (updated.stock <= th) {
      await notifyUser(ctx.ownerId, {
        title: 'Low stock alert',
        body: `${updated.name} is at or below threshold (${th} left).`,
        category: 'inventory',
      });
    }
  }

  const order = await Order.create({
    player: req.user.id,
    businessOwner: ctx.ownerId,
    items: ctx.lineDocs,
    totalAmount: ctx.total,
    status: 'paid',
    payment: payment._id,
    shippingAddress: shippingAddress || undefined,
    customerNote: customerNote || undefined,
  });

  await notifyUser(ctx.ownerId, {
    title: 'New order',
    body: `Order received — total ${ctx.total}`,
    category: 'order',
  });

  res.status(201).json({ success: true, data: order });
});

const createCoachPaymentIntent = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured on the server.' });
  }
  const { coachId, amount } = req.body;
  if (!coachId || !(amount > 0)) {
    return res.status(400).json({ success: false, message: 'coachId and amount are required' });
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
  const amountCents = dollarsToCents(amount);
  if (amountCents < 50) {
    return res.status(400).json({ success: false, message: 'Amount must be at least 0.50 USD for card payment.' });
  }
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      purpose: 'coach_fee',
      playerId: String(req.user.id),
      coachId: String(coachId),
      amountCents: String(amountCents),
    },
  });
  res.json({
    success: true,
    data: { clientSecret: pi.client_secret, amount: Number(amount), currency: 'usd' },
  });
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
  const { coachId, amount, paymentIntentId } = req.body;
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

  let externalRef = 'mock-gateway';
  let meta = {
    cardLast4: req.body.cardLast4 || 'mock',
    invoiceRef: `COACH-${Date.now()}`,
  };

  if (isStripeEnabled()) {
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId is required. Complete Stripe payment first.',
      });
    }
    const pi = await retrieveSucceededPaymentIntent(paymentIntentId);
    if (
      pi.metadata.purpose !== 'coach_fee' ||
      pi.metadata.playerId !== String(req.user.id) ||
      pi.metadata.coachId !== String(coachId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid payment for this coach.' });
    }
    assertAmountMatches(pi, dollarsToCents(amount));
    externalRef = paymentIntentId;
    meta = { ...meta, stripePaymentIntentId: paymentIntentId };
  }

  const payment = await Payment.create({
    payer: req.user.id,
    payee: coachId,
    type: 'coach_fee',
    amount,
    status: 'completed',
    externalRef,
    meta,
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
  createGroundBookingPaymentIntent,
  confirmGroundPayment,
  listMyGroundBookings,
  cancelGroundBooking,
  getPerformance,
  browseProducts,
  createOrderPaymentIntent,
  createOrder,
  listMyOrders,
  submitCoachFeedback,
  createCoachPaymentIntent,
  payCoach,
  listNotifications,
  markNotificationRead,
  fileComplaint,
};
