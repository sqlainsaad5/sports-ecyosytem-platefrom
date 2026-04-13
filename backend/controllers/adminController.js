const User = require('../models/User');
const SportCategory = require('../models/SportCategory');
const IndoorGround = require('../models/IndoorGround');
const GroundBooking = require('../models/GroundBooking');
const TrainingSession = require('../models/TrainingSession');
const PerformanceEvaluation = require('../models/PerformanceEvaluation');
const AttendanceRecord = require('../models/AttendanceRecord');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const SystemSettings = require('../models/SystemSettings');
const VerificationDocument = require('../models/VerificationDocument');
const { asyncHandler } = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

const dashboard = asyncHandler(async (req, res) => {
  const [players, coaches, businesses, admins] = await Promise.all([
    User.countDocuments({ role: 'player' }),
    User.countDocuments({ role: 'coach' }),
    User.countDocuments({ role: 'business_owner' }),
    User.countDocuments({ role: 'admin' }),
  ]);
  const bookings = await GroundBooking.countDocuments({ status: 'confirmed' });
  const sessions = await TrainingSession.countDocuments();
  const revenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  res.json({
    success: true,
    data: {
      users: { players, coaches, businesses, admins },
      bookingsConfirmed: bookings,
      trainingSessions: sessions,
      revenueTotal: revenue[0]?.total || 0,
    },
  });
});

const verificationCoaches = asyncHandler(async (req, res) => {
  const list = await User.find({ role: 'coach', verificationStatus: { $in: ['pending_review', 'more_info'] } })
    .populate('coachProfile')
    .lean();
  res.json({ success: true, data: list });
});

const patchCoachVerification = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const user = await User.findOne({ _id: req.params.userId, role: 'coach' });
  if (!user) return res.status(404).json({ success: false, message: 'Not found' });
  const audit = { action, adminId: req.user.id, reason, at: new Date() };
  user.verificationAudit.push(audit);
  if (action === 'approve') user.verificationStatus = 'verified';
  else if (action === 'reject') user.verificationStatus = 'rejected';
  else if (action === 'more_info') user.verificationStatus = 'more_info';
  user.verificationNotes = reason;
  await user.save();
  await VerificationDocument.updateMany({ user: user._id, roleContext: 'coach' }, { status: action === 'approve' ? 'approved' : 'pending' });
  await notifyUser(user._id, {
    title: 'Verification update',
    body: `Your coach application was ${action}d.`,
    category: 'verification',
  });
  res.json({ success: true, data: user });
});

const verificationBusiness = asyncHandler(async (req, res) => {
  const list = await User.find({
    role: 'business_owner',
    verificationStatus: { $in: ['pending_review', 'more_info'] },
  })
    .populate('businessProfile')
    .lean();
  res.json({ success: true, data: list });
});

const patchBusinessVerification = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const user = await User.findOne({ _id: req.params.userId, role: 'business_owner' });
  if (!user) return res.status(404).json({ success: false, message: 'Not found' });
  user.verificationAudit.push({ action, adminId: req.user.id, reason, at: new Date() });
  if (action === 'approve') user.verificationStatus = 'verified';
  else if (action === 'reject') user.verificationStatus = 'rejected';
  else if (action === 'more_info') user.verificationStatus = 'more_info';
  user.verificationNotes = reason;
  await user.save();
  await notifyUser(user._id, {
    title: 'Verification update',
    body: `Your business application was ${action}d.`,
    category: 'verification',
  });
  res.json({ success: true, data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.email = new RegExp(q, 'i');
  const list = await User.find(filter).select('-passwordHash').limit(200).lean();
  res.json({ success: true, data: list });
});

const patchUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u || u.role === 'admin') return res.status(404).json({ success: false, message: 'Not found' });
  if (req.body.isSuspended !== undefined) u.isSuspended = req.body.isSuspended;
  if (req.body.verificationStatus) u.verificationStatus = req.body.verificationStatus;
  await u.save();
  res.json({ success: true, data: u });
});

const deleteUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u || u.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete' });
  await u.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

const listCoachesAdmin = asyncHandler(async (req, res) => {
  const list = await User.find({ role: 'coach' }).populate('coachProfile').select('-passwordHash').lean();
  res.json({ success: true, data: list });
});

const listBusinessAdmin = asyncHandler(async (req, res) => {
  const list = await User.find({ role: 'business_owner' })
    .populate('businessProfile')
    .select('-passwordHash')
    .lean();
  res.json({ success: true, data: list });
});

const listSports = asyncHandler(async (req, res) => {
  const list = await SportCategory.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: list });
});

const createSport = asyncHandler(async (req, res) => {
  const slug = (req.body.slug || req.body.name).toLowerCase().replace(/\s+/g, '-');
  const c = await SportCategory.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: c });
});

const updateSport = asyncHandler(async (req, res) => {
  const c = await SportCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: c });
});

const deleteSport = asyncHandler(async (req, res) => {
  await SportCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

const listGrounds = asyncHandler(async (req, res) => {
  const list = await IndoorGround.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: list });
});

const createGround = asyncHandler(async (req, res) => {
  const g = await IndoorGround.create(req.body);
  res.status(201).json({ success: true, data: g });
});

const updateGround = asyncHandler(async (req, res) => {
  const g = await IndoorGround.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: g });
});

const deleteGround = asyncHandler(async (req, res) => {
  await IndoorGround.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

const monitorBookings = asyncHandler(async (req, res) => {
  const bookings = await GroundBooking.find().populate('ground').populate('player').sort({ startTime: -1 }).limit(200).lean();
  const sessions = await TrainingSession.find().sort({ scheduledAt: -1 }).limit(200).lean();
  res.json({ success: true, data: { bookings, sessions } });
});

const monitorPerformance = asyncHandler(async (req, res) => {
  const perf = await PerformanceEvaluation.find().sort({ weekStartDate: -1 }).limit(200).lean();
  const att = await AttendanceRecord.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: { performance: perf, attendance: att } });
});

const listComplaints = asyncHandler(async (req, res) => {
  const list = await Complaint.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: list });
});

const patchComplaint = asyncHandler(async (req, res) => {
  const c = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      handledBy: req.user.id,
    },
    { new: true }
  );
  if (c?.filedBy) {
    await notifyUser(c.filedBy, {
      title: 'Complaint updated',
      body: c.resolution || c.status,
      category: 'complaint',
    });
  }
  res.json({ success: true, data: c });
});

const reportsSummary = asyncHandler(async (req, res) => {
  const byType = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data: { paymentsByType: byType } });
});

const listSubscriptions = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ type: 'subscription', status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ success: true, data: payments });
});

const getSettings = asyncHandler(async (req, res) => {
  const list = await SystemSettings.find().lean();
  res.json({ success: true, data: list });
});

const putSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) {
    return res.status(400).json({ success: false, message: 'settings array required' });
  }
  const out = [];
  for (const s of settings) {
    const doc = await SystemSettings.findOneAndUpdate(
      { key: s.key },
      { value: s.value, updatedBy: req.user.id },
      { upsert: true, new: true }
    );
    out.push(doc);
  }
  res.json({ success: true, data: out });
});

module.exports = {
  dashboard,
  verificationCoaches,
  patchCoachVerification,
  verificationBusiness,
  patchBusinessVerification,
  listUsers,
  patchUser,
  deleteUser,
  listCoachesAdmin,
  listBusinessAdmin,
  listSports,
  createSport,
  updateSport,
  deleteSport,
  listGrounds,
  createGround,
  updateGround,
  deleteGround,
  monitorBookings,
  monitorPerformance,
  listComplaints,
  patchComplaint,
  reportsSummary,
  listSubscriptions,
  getSettings,
  putSettings,
};
