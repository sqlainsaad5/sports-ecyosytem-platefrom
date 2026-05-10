const IndoorGround = require('../models/IndoorGround');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { verifiedBusinessOwnerIds } = require('../utils/verifiedSellers');
const { hasOverlap } = require('../utils/groundBookings');

const listGrounds = asyncHandler(async (req, res) => {
  const list = await IndoorGround.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json({ success: true, data: list });
});

/** Query: startTime, endTime (ISO). Returns whether interval is free of held/confirmed bookings. */
const checkGroundSlotAvailability = asyncHandler(async (req, res) => {
  const ground = await IndoorGround.findOne({ _id: req.params.groundId, isActive: true }).lean();
  if (!ground) return res.status(404).json({ success: false, message: 'Ground not found' });
  const start = new Date(req.query.startTime);
  const end = new Date(req.query.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({
      success: false,
      message: 'Query params startTime and endTime (ISO strings) are required',
    });
  }
  const overlap = await hasOverlap(ground._id, start, end);
  res.json({
    success: true,
    data: {
      available: !overlap,
      slotDurationMinutes: ground.slotDurationMinutes,
      openTime: ground.openTime,
      closeTime: ground.closeTime,
    },
  });
});

const listProducts = asyncHandler(async (req, res) => {
  const ownerIds = await verifiedBusinessOwnerIds();
  const list = await Product.find({
    isActive: true,
    businessOwner: { $in: ownerIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
});

module.exports = { listGrounds, checkGroundSlotAvailability, listProducts };
