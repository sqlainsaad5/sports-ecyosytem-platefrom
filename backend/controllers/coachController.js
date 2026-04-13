const { validationResult } = require('express-validator');
const User = require('../models/User');
const CoachProfile = require('../models/CoachProfile');
const TrainingRequest = require('../models/TrainingRequest');
const TrainingSession = require('../models/TrainingSession');
const TrainingPlan = require('../models/TrainingPlan');
const AttendanceRecord = require('../models/AttendanceRecord');
const PerformanceEvaluation = require('../models/PerformanceEvaluation');
const GroundBooking = require('../models/GroundBooking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const VerificationDocument = require('../models/VerificationDocument');
const CoachFeedback = require('../models/CoachFeedback');
const { asyncHandler } = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

const populatePlayerBrief = {
  path: 'player',
  select: 'email',
  populate: { path: 'playerProfile', select: 'fullName city sportPreference skillLevel' },
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('coachProfile');
  if (!user.coachProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: user.coachProfile });
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
  tr.status = status;
  await tr.save();
  if (status === 'accepted') {
    const when = scheduledAt ? new Date(scheduledAt) : tr.preferredStart || new Date(Date.now() + 86400000);
    const session = await TrainingSession.create({
      coach: req.user.id,
      player: tr.player,
      trainingRequest: tr._id,
      scheduledAt: when,
      status: 'scheduled',
    });
    await notifyUser(tr.player, {
      title: 'Training accepted',
      body: 'Your coach accepted the training request.',
      category: 'training',
    });
    return res.json({ success: true, data: { request: tr, session } });
  }
  if (status === 'rejected') {
    await notifyUser(tr.player, { title: 'Training declined', body: 'Your request was declined.', category: 'training' });
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
  const plan = await TrainingPlan.findOneAndUpdate(
    { _id: req.params.id, coach: req.user.id },
    req.body,
    { new: true }
  );
  if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
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
  const sessions = await TrainingSession.find({ coach: req.user.id, groundBooking: { $ne: null } })
    .populate('groundBooking')
    .lean();
  const ids = sessions.map((s) => s.groundBooking).filter(Boolean);
  const direct = await GroundBooking.find({
    _id: { $in: ids },
    status: { $in: ['held', 'confirmed'] },
  })
    .populate('ground')
    .lean();
  res.json({ success: true, data: direct });
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

const listPayments = asyncHandler(async (req, res) => {
  const received = await Payment.find({ payee: req.user.id, status: 'completed' }).sort({ createdAt: -1 }).lean();
  const balance = received.reduce((s, p) => s + p.amount, 0);
  res.json({ success: true, data: { transactions: received, totalReceived: balance } });
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
  listFeedback,
  replyFeedback,
  listPayments,
  listNotifications,
  uploadDocumentMeta,
  listDocuments,
};
