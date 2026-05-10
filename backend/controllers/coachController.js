const { validationResult } = require('express-validator');
const User = require('../models/User');
const CoachProfile = require('../models/CoachProfile');
const PlayerProfile = require('../models/PlayerProfile');
const TrainingRequest = require('../models/TrainingRequest');
const TrainingSession = require('../models/TrainingSession');
const TrainingPlan = require('../models/TrainingPlan');
const AttendanceRecord = require('../models/AttendanceRecord');
const PerformanceEvaluation = require('../models/PerformanceEvaluation');
const IndoorGround = require('../models/IndoorGround');
const GroundBooking = require('../models/GroundBooking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const VerificationDocument = require('../models/VerificationDocument');
const CoachFeedback = require('../models/CoachFeedback');
const { asyncHandler } = require('../utils/asyncHandler');
const { hasOverlap } = require('../utils/groundBookings');
const { notifyUser } = require('../utils/notify');
const {
  getStripe,
  isStripeEnabled,
  dollarsToCents,
  retrieveSucceededPaymentIntent,
  assertAmountMatches,
  paymentIntentMethodSpec,
} = require('../utils/stripePayments');
const { generateTrainingPlanDraft, providerConfig } = require('../services/aiCoachEngine');
const {
  coachPlatformSubscriptionActive,
  getCoachPlatformSubscriptionPriceUsd,
} = require('../utils/coachPlatformSubscription');

async function verifyCoachPlatformSubscriptionPI(paymentIntentId, userId, action, amountUsd) {
  const pi = await retrieveSucceededPaymentIntent(paymentIntentId);
  if (pi.metadata.purpose !== 'coach_platform_subscription' || pi.metadata.userId !== String(userId)) {
    const err = new Error('Invalid payment');
    err.statusCode = 400;
    throw err;
  }
  if (pi.metadata.action !== action) {
    const err = new Error('Invalid payment action');
    err.statusCode = 400;
    throw err;
  }
  assertAmountMatches(pi, dollarsToCents(amountUsd));
}

async function extendCoachPlatformPeriod(userId) {
  const cp = await CoachProfile.findOne({ user: userId });
  if (!cp) return null;
  const base = new Date();
  const current = cp.platformSubscriptionRenewsAt ? new Date(cp.platformSubscriptionRenewsAt) : null;
  if (current && current.getTime() > base.getTime()) {
    base.setTime(current.getTime());
  }
  base.setMonth(base.getMonth() + 1);
  cp.platformSubscriptionRenewsAt = base;
  await cp.save();
  return cp;
}

/** SRS UC-C5 — avoid overlapping coach sessions */
const SESSION_GAP_MS = 90 * 60 * 1000;

async function sessionConflicts(coachId, scheduledAt) {
  const t = new Date(scheduledAt).getTime();
  const sessions = await TrainingSession.find({
    coach: coachId,
    status: { $in: ['scheduled'] },
  })
    .select('scheduledAt')
    .lean();
  return sessions.some((s) => Math.abs(new Date(s.scheduledAt).getTime() - t) < SESSION_GAP_MS);
}

function mondayOfDate(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const n = new Date(date);
  n.setDate(diff);
  n.setHours(0, 0, 0, 0);
  return n;
}

function aiTrainingPlanEnabled() {
  return String(process.env.AI_TRAINING_PLAN_ENABLED || 'true') !== 'false';
}

function classifyAiFallbackReason(message) {
  const m = String(message || '').toLowerCase();
  if (!m) return 'unknown';
  if (m.includes('(401)') || m.includes('incorrect api key') || m.includes('missing')) return 'auth_failed';
  if (m.includes('(429)') || m.includes('rate limit') || m.includes('quota')) return 'rate_limited';
  if (m.includes('abort') || m.includes('timeout')) return 'timeout';
  if (m.includes('invalid ai training plan payload') || m.includes('json')) return 'invalid_payload';
  if (m.includes('(400)') || m.includes('model')) return 'bad_request_or_model';
  if (m.includes('(5')) return 'provider_server_error';
  return 'provider_error';
}

const populatePlayerBrief = {
  path: 'player',
  select: 'email',
  populate: { path: 'playerProfile', select: 'fullName city sportPreference skillLevel' },
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('coachProfile').lean();
  if (!user?.coachProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
  const priceUsd = await getCoachPlatformSubscriptionPriceUsd();
  const subscriptionActive = priceUsd <= 0 || coachPlatformSubscriptionActive(user.coachProfile);
  res.json({
    success: true,
    data: {
      ...user.coachProfile,
      subscriptionActive,
      platformSubscriptionPriceUsd: priceUsd,
    },
  });
});

const getCoachSubscriptionStatus = asyncHandler(async (req, res) => {
  const cp = await CoachProfile.findOne({ user: req.user.id }).lean();
  if (!cp) return res.status(404).json({ success: false, message: 'Profile not found' });
  const priceUsd = await getCoachPlatformSubscriptionPriceUsd();
  res.json({
    success: true,
    data: {
      active: priceUsd <= 0 || coachPlatformSubscriptionActive(cp),
      priceUsd,
      renewsAt: cp.platformSubscriptionRenewsAt || null,
    },
  });
});

const createCoachSubscriptionPaymentIntent = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured on the server.' });
  }
  const { action } = req.body;
  if (!['subscribe', 'renew'].includes(action)) {
    return res.status(400).json({ success: false, message: 'action must be subscribe or renew' });
  }
  const amountUsd = await getCoachPlatformSubscriptionPriceUsd();
  if (amountUsd <= 0) {
    return res.status(400).json({ success: false, message: 'Platform price is zero — no payment required.' });
  }
  const amountCents = dollarsToCents(amountUsd);
  if (amountCents < 50) {
    return res.status(400).json({
      success: false,
      message: 'Amount below Stripe minimum ($0.50). Increase coach_platform_subscription_usd in Admin → Settings.',
    });
  }
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    ...paymentIntentMethodSpec(),
    metadata: {
      purpose: 'coach_platform_subscription',
      action,
      userId: String(req.user.id),
      amountCents: String(amountCents),
    },
  });
  res.json({
    success: true,
    data: { clientSecret: pi.client_secret, amount: amountUsd, action, currency: 'usd' },
  });
});

const subscribeCoachPlatform = asyncHandler(async (req, res) => {
  const { paymentIntentId, cardLast4 } = req.body;
  const amountUsd = await getCoachPlatformSubscriptionPriceUsd();
  if (amountUsd <= 0) {
    const profile = await extendCoachPlatformPeriod(req.user.id);
    return res.json({
      success: true,
      data: { profile, skippedPayment: true },
    });
  }
  if (isStripeEnabled()) {
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId is required when Stripe is enabled.' });
    }
    try {
      await verifyCoachPlatformSubscriptionPI(paymentIntentId, req.user.id, 'subscribe', amountUsd);
    } catch (e) {
      return res.status(e.statusCode || 400).json({ success: false, message: e.message });
    }
  }
  await Payment.create({
    payer: req.user.id,
    type: 'subscription',
    amount: amountUsd,
    status: 'completed',
    externalRef: isStripeEnabled() ? paymentIntentId : 'mock-coach-platform-sub',
    meta: { context: 'coach_platform', cardLast4: cardLast4 || 'mock', invoiceRef: `COACH-SUB-${Date.now()}` },
  });
  const profile = await extendCoachPlatformPeriod(req.user.id);
  await notifyUser(req.user.id, {
    title: 'Coach platform subscription',
    body: `Monthly access active until ${new Date(profile.platformSubscriptionRenewsAt).toLocaleDateString()}.`,
    category: 'subscription',
  });
  res.json({ success: true, data: { profile } });
});

const renewCoachPlatform = asyncHandler(async (req, res) => {
  const { paymentIntentId, cardLast4 } = req.body;
  const amountUsd = await getCoachPlatformSubscriptionPriceUsd();
  if (amountUsd <= 0) {
    const profile = await extendCoachPlatformPeriod(req.user.id);
    return res.json({ success: true, data: { profile, skippedPayment: true } });
  }
  if (isStripeEnabled()) {
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId is required when Stripe is enabled.' });
    }
    try {
      await verifyCoachPlatformSubscriptionPI(paymentIntentId, req.user.id, 'renew', amountUsd);
    } catch (e) {
      return res.status(e.statusCode || 400).json({ success: false, message: e.message });
    }
  }
  await Payment.create({
    payer: req.user.id,
    type: 'subscription',
    amount: amountUsd,
    status: 'completed',
    externalRef: isStripeEnabled() ? paymentIntentId : 'mock-coach-platform-renew',
    meta: { context: 'coach_platform', cardLast4: cardLast4 || 'mock', invoiceRef: `COACH-REN-${Date.now()}` },
  });
  const profile = await extendCoachPlatformPeriod(req.user.id);
  await notifyUser(req.user.id, {
    title: 'Subscription renewed',
    body: `Extended until ${new Date(profile.platformSubscriptionRenewsAt).toLocaleDateString()}.`,
    category: 'subscription',
  });
  res.json({ success: true, data: { profile } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const profile = await CoachProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true });
  res.json({ success: true, data: profile });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;
  const profile = await CoachProfile.findOneAndUpdate(
    { user: req.user.id },
    { availability: availability || [] },
    { new: true }
  );
  res.json({ success: true, data: profile });
});

const listTrainingRequests = asyncHandler(async (req, res) => {
  const list = await TrainingRequest.find({ coach: req.user.id })
    .populate(populatePlayerBrief)
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
});

const updateTrainingRequest = asyncHandler(async (req, res) => {
  const { status, scheduledAt } = req.body;
  const tr = await TrainingRequest.findOne({ _id: req.params.id, coach: req.user.id });
  if (!tr) return res.status(404).json({ success: false, message: 'Request not found' });
  if (status === 'accepted') {
    if (tr.status === 'accepted') {
      return res.json({ success: true, data: { request: tr, session: null, schedulingNote: 'Request is already accepted.' } });
    }
    tr.status = 'accepted';
    await tr.save();
    let session = null;
    let schedulingNote = null;
    let draftDate = tr.preferredStart ? new Date(tr.preferredStart) : new Date(Date.now() + 86400000);
    if (scheduledAt) {
      const when = new Date(scheduledAt);
      draftDate = when;
      if (await sessionConflicts(req.user.id, when)) {
        schedulingNote = 'Request approved. Session was not scheduled due to a 90-minute conflict.';
      } else {
        const cp = await CoachProfile.findOne({ user: req.user.id });
        const active = await TrainingSession.countDocuments({ coach: req.user.id, status: 'scheduled' });
        const cap = cp?.maxStudents ?? 40;
        if (active >= cap) {
          schedulingNote = `Request approved. Session was not scheduled because maximum concurrent students (${cap}) was reached.`;
        } else {
          session = await TrainingSession.create({
            coach: req.user.id,
            player: tr.player,
            trainingRequest: tr._id,
            scheduledAt: when,
            status: 'scheduled',
          });
        }
      }
    }
    /** SRS UC-C6 — auto draft weekly plan for coach review (even when approval happens without immediate scheduling). */
    const weekStart = mondayOfDate(draftDate);
    const existingDraft = await TrainingPlan.findOne({
      coach: req.user.id,
      player: tr.player,
      weekStartDate: weekStart,
      status: 'draft',
      isAutoGenerated: true,
    }).lean();
    if (!existingDraft) {
      let aiDraft = null;
      let fallbackReasonCode = 'none';
      if (aiTrainingPlanEnabled()) {
        try {
          const [playerUser, playerProfile, recentPerf, recentAttendance] = await Promise.all([
            User.findById(tr.player).select('email').lean(),
            PlayerProfile.findOne({ user: tr.player }).lean(),
            PerformanceEvaluation.find({ player: tr.player }).sort({ weekStartDate: -1 }).limit(4).lean(),
            AttendanceRecord.find({ player: tr.player }).sort({ createdAt: -1 }).limit(6).lean(),
          ]);
          aiDraft = await generateTrainingPlanDraft({
            weekStartDate: weekStart.toISOString(),
            player: {
              email: playerUser?.email || '',
              fullName: playerProfile?.fullName || '',
              sportPreference: playerProfile?.sportPreference || '',
              skillLevel: playerProfile?.skillLevel || '',
              city: playerProfile?.city || '',
            },
            performance: recentPerf.map((r) => ({
              weekStartDate: r.weekStartDate,
              technique: r.technique,
              fitness: r.fitness,
              attitude: r.attitude,
              comments: r.comments || '',
            })),
            attendance: recentAttendance.map((r) => ({
              present: r.present,
              notes: r.notes || '',
              at: r.createdAt,
            })),
          });
        } catch (e) {
          fallbackReasonCode = classifyAiFallbackReason(e.message);
          const cfg = providerConfig();
          console.warn(
            `[ai][training-plan] fallback to static draft: reason=${fallbackReasonCode} provider=${cfg.provider} model=${cfg.planModel} msg=${e.message}`
          );
        }
      }
      await TrainingPlan.create({
        coach: req.user.id,
        player: tr.player,
        weekStartDate: weekStart,
        title: aiDraft?.title || 'Weekly plan (draft)',
        goals: aiDraft?.goals || 'Edit goals after assessing the player this week.',
        exercises:
          aiDraft?.exercises ||
          'System draft: warm-up, sport-specific drills, strength block, cool-down, recovery notes.',
        status: 'draft',
        isAutoGenerated: true,
        coachReviewed: false,
        generationMethod: aiDraft ? 'ai' : 'rules',
        generationMeta: aiDraft
          ? { provider: aiDraft.provider, model: aiDraft.model, generatedAt: new Date(), latencyMs: aiDraft.latencyMs }
          : { provider: 'none', model: 'fallback', generatedAt: new Date(), reasonCode: fallbackReasonCode },
      });
    }
    try {
      await notifyUser(tr.player, {
        title: 'Training accepted',
        body: 'Your coach accepted the training request.',
        category: 'training',
      });
    } catch (e) {
      console.warn('[notify][training-accepted] failed:', e.message);
    }
    return res.json({ success: true, data: { request: tr, session, schedulingNote } });
  }
  tr.status = status;
  await tr.save();
  if (status === 'rejected') {
    try {
      await notifyUser(tr.player, { title: 'Training declined', body: 'Your request was declined.', category: 'training' });
    } catch (e) {
      console.warn('[notify][training-rejected] failed:', e.message);
    }
  }
  res.json({ success: true, data: tr });
});

const listTrainingSessions = asyncHandler(async (req, res) => {
  const list = await TrainingSession.find({ coach: req.user.id })
    .populate(populatePlayerBrief)
    .sort({ scheduledAt: 1 })
    .lean();
  res.json({ success: true, data: list });
});

const createTrainingPlan = asyncHandler(async (req, res) => {
  const rel = await TrainingSession.findOne({
    coach: req.user.id,
    player: req.body.player,
    status: { $in: ['scheduled', 'completed'] },
  });
  if (!rel) {
    return res.status(400).json({
      success: false,
      message: 'You must have an active training session with this player before publishing a weekly plan.',
    });
  }
  const plan = await TrainingPlan.create({
    ...req.body,
    coach: req.user.id,
    weekStartDate: new Date(req.body.weekStartDate),
    status: req.body.status || 'published',
    isAutoGenerated: false,
    coachReviewed: true,
    generationMethod: 'rules',
    generationMeta: { provider: 'manual', model: 'manual', generatedAt: new Date() },
  });
  await notifyUser(plan.player, {
    title: 'New training plan',
    body: plan.title || 'Weekly plan updated',
    category: 'training',
  });
  res.status(201).json({ success: true, data: plan });
});

const listTrainingPlans = asyncHandler(async (req, res) => {
  const list = await TrainingPlan.find({ coach: req.user.id }).sort({ weekStartDate: -1 }).lean();
  res.json({ success: true, data: list });
});

const updateTrainingPlan = asyncHandler(async (req, res) => {
  const prev = await TrainingPlan.findOne({ _id: req.params.id, coach: req.user.id });
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  const body = { ...req.body };
  if (body.status === 'published') body.coachReviewed = true;
  const plan = await TrainingPlan.findOneAndUpdate({ _id: req.params.id, coach: req.user.id }, body, {
    new: true,
  });
  if (prev.status === 'draft' && plan.status === 'published') {
    await notifyUser(plan.player, {
      title: 'Training plan published',
      body: plan.title || 'Your coach published a weekly plan.',
      category: 'training',
    });
  }
  res.json({ success: true, data: plan });
});

const markAttendance = asyncHandler(async (req, res) => {
  const session = await TrainingSession.findOne({ _id: req.params.sessionId, coach: req.user.id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  const { present, notes } = req.body;
  const rec = await AttendanceRecord.findOneAndUpdate(
    { session: session._id },
    { session: session._id, coach: req.user.id, player: session.player, present, notes },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: rec });
});

const addPerformance = asyncHandler(async (req, res) => {
  const { playerId, weekStartDate, technique, fitness, attitude, comments } = req.body;
  const session = await TrainingSession.findOne({ coach: req.user.id, player: playerId });
  if (!session) {
    return res.status(400).json({ success: false, message: 'No training relationship with this player' });
  }
  const ev = await PerformanceEvaluation.create({
    coach: req.user.id,
    player: playerId,
    weekStartDate: new Date(weekStartDate),
    technique: technique != null ? technique : 0,
    fitness: fitness != null ? fitness : 0,
    attitude: attitude != null ? attitude : 0,
    comments,
  });
  await notifyUser(playerId, {
    title: 'Performance update',
    body: 'Your coach posted a weekly evaluation.',
    category: 'performance',
  });
  res.status(201).json({ success: true, data: ev });
});

const getPlayerProgress = asyncHandler(async (req, res) => {
  const playerId = req.params.playerId;
  const rel = await TrainingSession.findOne({ coach: req.user.id, player: playerId });
  if (!rel) return res.status(403).json({ success: false, message: 'Not your player' });
  const perf = await PerformanceEvaluation.find({ player: playerId }).sort({ weekStartDate: -1 }).lean();
  const att = await AttendanceRecord.find({ coach: req.user.id, player: playerId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { performance: perf, attendance: att } });
});

const listCoachGroundBookings = asyncHandler(async (req, res) => {
  const list = await GroundBooking.find({
    bookedBy: req.user.id,
    bookedByRole: 'coach',
    status: { $in: ['held', 'confirmed'] },
  })
    .populate('ground')
    .sort({ startTime: -1 })
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
    bookedBy: req.user.id,
    bookedByRole: 'coach',
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
    bookedBy: req.user.id,
    bookedByRole: 'coach',
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
    ...paymentIntentMethodSpec(),
    metadata: {
      purpose: 'ground_booking',
      bookedById: String(req.user.id),
      bookedByRole: 'coach',
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
    bookedBy: req.user.id,
    bookedByRole: 'coach',
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
      pi.metadata.bookedById !== String(req.user.id) ||
      pi.metadata.bookedByRole !== 'coach' ||
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

const cancelGroundBooking = asyncHandler(async (req, res) => {
  const booking = await GroundBooking.findOne({
    _id: req.params.id,
    bookedBy: req.user.id,
    bookedByRole: 'coach',
  });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status === 'cancelled') return res.json({ success: true, data: booking });
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, data: booking });
});

const listFeedback = asyncHandler(async (req, res) => {
  const list = await CoachFeedback.find({ coach: req.user.id })
    .sort({ createdAt: -1 })
    .populate('player', 'email')
    .lean();
  list.forEach((f) => {
    if (f.anonymous) {
      delete f.player;
      f.playerDisplay = 'Anonymous player';
    }
  });
  res.json({ success: true, data: list });
});

const replyFeedback = asyncHandler(async (req, res) => {
  const fb = await CoachFeedback.findOneAndUpdate(
    { _id: req.params.id, coach: req.user.id },
    { coachReply: req.body.reply },
    { new: true }
  );
  if (!fb) return res.status(404).json({ success: false, message: 'Not found' });
  await notifyUser(fb.player, { title: 'Coach replied to your feedback', body: req.body.reply, category: 'feedback' });
  res.json({ success: true, data: fb });
});

async function coachAvailableBalance(coachId) {
  const income = await Payment.find({ payee: coachId, type: 'coach_fee', status: 'completed' }).lean();
  const gross = income.reduce((s, p) => s + p.amount, 0);
  const withdrawals = await Payment.find({
    payer: coachId,
    type: 'withdrawal',
    status: { $in: ['pending', 'completed'] },
  }).lean();
  const withdrawn = withdrawals.reduce((s, p) => s + p.amount, 0);
  return { gross, withdrawn, available: gross - withdrawn };
}

const listPayments = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const received = await Payment.find({ payee: coachId, type: 'coach_fee', status: 'completed' })
    .sort({ createdAt: -1 })
    .lean();
  const withdrawals = await Payment.find({ payer: coachId, type: 'withdrawal' }).sort({ createdAt: -1 }).lean();
  const { gross, available } = await coachAvailableBalance(coachId);
  const transactions = [...received, ...withdrawals].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({
    success: true,
    data: {
      transactions,
      totalReceived: gross,
      availableBalance: available,
    },
  });
});

/** SRS UC-C12 — prototype bank withdrawal (records payout; integrate real gateway per SDD) */
const requestWithdrawal = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const { available } = await coachAvailableBalance(req.user.id);
  if (amount > available) {
    return res.status(400).json({ success: false, message: 'Amount exceeds available balance' });
  }
  const payment = await Payment.create({
    payer: req.user.id,
    type: 'withdrawal',
    amount,
    status: 'completed',
    externalRef: 'mock-bank-withdrawal',
    meta: { note: 'Prototype settlement — replace with payout integration' },
  });
  await notifyUser(req.user.id, {
    title: 'Withdrawal processed',
    body: `Your withdrawal of ${amount} was recorded (prototype).`,
    category: 'payment',
  });
  res.status(201).json({ success: true, data: payment });
});

const listNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: list });
});

const uploadDocumentMeta = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
  const doc = await VerificationDocument.create({
    user: req.user.id,
    roleContext: 'coach',
    filePath: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    docType: req.body.docType,
    issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    status: 'pending',
  });
  const user = await User.findById(req.user.id);
  user.verificationStatus = 'pending_review';
  await user.save();
  res.status(201).json({ success: true, data: doc });
});

const listDocuments = asyncHandler(async (req, res) => {
  const list = await VerificationDocument.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

module.exports = {
  getProfile,
  getCoachSubscriptionStatus,
  createCoachSubscriptionPaymentIntent,
  subscribeCoachPlatform,
  renewCoachPlatform,
  updateProfile,
  updateAvailability,
  listTrainingRequests,
  updateTrainingRequest,
  listTrainingSessions,
  createTrainingPlan,
  listTrainingPlans,
  updateTrainingPlan,
  markAttendance,
  addPerformance,
  getPlayerProgress,
  listCoachGroundBookings,
  holdGroundBooking,
  createGroundBookingPaymentIntent,
  confirmGroundPayment,
  cancelGroundBooking,
  listFeedback,
  replyFeedback,
  listPayments,
  requestWithdrawal,
  listNotifications,
  uploadDocumentMeta,
  listDocuments,
};
