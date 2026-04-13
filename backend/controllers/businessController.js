const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const VerificationDocument = require('../models/VerificationDocument');
const CoachPartnershipRequest = require('../models/CoachPartnershipRequest');
const { asyncHandler } = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('businessProfile');
  if (!user.businessProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: user.businessProfile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const bp = await BusinessProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true });
  res.json({ success: true, data: bp });
});

const subscribe = asyncHandler(async (req, res) => {
  const { package: pkg } = req.body;
  const limit = BusinessProfile.packageLimit(pkg);
  const payment = await Payment.create({
    payer: req.user.id,
    type: 'subscription',
    amount: pkg === 'premium' ? 99 : pkg === 'pro' ? 49 : 19,
    status: 'completed',
    externalRef: 'mock-gateway',
    meta: { package: pkg },
  });
  const renew = new Date();
  renew.setMonth(renew.getMonth() + 1);
  const bp = await BusinessProfile.findOneAndUpdate(
    { user: req.user.id },
    {
      subscriptionPackage: pkg,
      listingSlotsRemaining: limit,
      subscriptionRenewsAt: renew,
    },
    { new: true }
  );
  await notifyUser(req.user.id, {
    title: 'Subscription active',
    body: `Package ${pkg} — ${limit} listing slots`,
    category: 'subscription',
  });
  res.json({ success: true, data: { profile: bp, payment } });
});

const renewSubscription = asyncHandler(async (req, res) => {
  const bp = await BusinessProfile.findOne({ user: req.user.id });
  if (!bp) return res.status(404).json({ success: false, message: 'Profile not found' });
  const limit = BusinessProfile.packageLimit(bp.subscriptionPackage);
  const payment = await Payment.create({
    payer: req.user.id,
    type: 'subscription',
    amount: 19,
    status: 'completed',
    externalRef: 'mock-gateway-renewal',
  });
  const renew = new Date();
  renew.setMonth(renew.getMonth() + 1);
  bp.listingSlotsRemaining = limit;
  bp.subscriptionRenewsAt = renew;
  await bp.save();
  res.json({ success: true, data: { profile: bp, payment } });
});

const updateStore = asyncHandler(async (req, res) => {
  const { storeName, storeDescription } = req.body;
  const bp = await BusinessProfile.findOneAndUpdate(
    { user: req.user.id },
    { storeName, storeDescription },
    { new: true }
  );
  res.json({ success: true, data: bp });
});

const assertVerifiedAndQuota = async (userId) => {
  const u = await User.findById(userId);
  if (u.verificationStatus !== 'verified') {
    const err = new Error('Business account must be verified to list products');
    err.statusCode = 403;
    throw err;
  }
  const bp = await BusinessProfile.findOne({ user: userId });
  if (bp.listingSlotsRemaining <= 0) {
    const err = new Error('Listing quota exceeded — upgrade subscription');
    err.statusCode = 403;
    throw err;
  }
  return bp;
};

const listMyProducts = asyncHandler(async (req, res) => {
  const list = await Product.find({ businessOwner: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

const addProduct = asyncHandler(async (req, res) => {
  await assertVerifiedAndQuota(req.user.id);
  const bp = await BusinessProfile.findOne({ user: req.user.id });
  const product = await Product.create({ ...req.body, businessOwner: req.user.id });
  bp.listingSlotsRemaining -= 1;
  await bp.save();
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, businessOwner: req.user.id },
    req.body,
    { new: true }
  );
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: p });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, businessOwner: req.user.id });
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  await p.deleteOne();
  const bp = await BusinessProfile.findOne({ user: req.user.id });
  bp.listingSlotsRemaining += 1;
  await bp.save();
  res.json({ success: true, message: 'Deleted' });
});

const patchPricing = asyncHandler(async (req, res) => {
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, businessOwner: req.user.id },
    { price: req.body.price },
    { new: true }
  );
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: p });
});

const patchStock = asyncHandler(async (req, res) => {
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, businessOwner: req.user.id },
    { stock: req.body.stock },
    { new: true }
  );
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  if (p.stock <= (req.body.lowStockThreshold ?? 3)) {
    await notifyUser(req.user.id, {
      title: 'Low stock alert',
      body: `${p.name} is running low`,
      category: 'inventory',
    });
  }
  res.json({ success: true, data: p });
});

const addProductImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
  const url = `/uploads/${req.file.filename}`;
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, businessOwner: req.user.id },
    { $push: { images: url } },
    { new: true }
  );
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: p });
});

const listOrders = asyncHandler(async (req, res) => {
  const list = await Order.find({ businessOwner: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const o = await Order.findOneAndUpdate(
    { _id: req.params.id, businessOwner: req.user.id },
    { status: req.body.status },
    { new: true }
  );
  if (!o) return res.status(404).json({ success: false, message: 'Not found' });
  await notifyUser(o.player, {
    title: 'Order update',
    body: `Your order is now: ${o.status}`,
    category: 'order',
  });
  res.json({ success: true, data: o });
});

const salesReport = asyncHandler(async (req, res) => {
  const orders = await Order.find({ businessOwner: req.user.id, status: { $ne: 'cancelled' } }).lean();
  const total = orders.reduce((s, o) => s + o.totalAmount, 0);
  res.json({
    success: true,
    data: {
      orderCount: orders.length,
      revenue: total,
      orders,
    },
  });
});

const listCoachesDirectory = asyncHandler(async (req, res) => {
  const coaches = await User.find({ role: 'coach', verificationStatus: 'verified', isSuspended: false })
    .populate('coachProfile')
    .lean();
  res.json({ success: true, data: coaches });
});

const sendPartnership = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const coachId = req.params.coachId;
  const coach = await User.findOne({ _id: coachId, role: 'coach' });
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
  const pr = await CoachPartnershipRequest.create({
    businessOwner: req.user.id,
    coach: coachId,
    message,
  });
  await notifyUser(coachId, {
    title: 'Partnership request',
    body: message,
    category: 'partnership',
  });
  res.status(201).json({ success: true, data: pr });
});

const listNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: list });
});

const uploadBusinessDoc = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
  const doc = await VerificationDocument.create({
    user: req.user.id,
    roleContext: 'business_owner',
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

const listBusinessDocs = asyncHandler(async (req, res) => {
  const list = await VerificationDocument.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
});

module.exports = {
  getProfile,
  updateProfile,
  subscribe,
  renewSubscription,
  updateStore,
  listMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  patchPricing,
  patchStock,
  addProductImage,
  listOrders,
  updateOrderStatus,
  salesReport,
  listCoachesDirectory,
  sendPartnership,
  listNotifications,
  uploadBusinessDoc,
  listBusinessDocs,
};
