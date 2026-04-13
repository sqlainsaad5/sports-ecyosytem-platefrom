const IndoorGround = require('../models/IndoorGround');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { verifiedBusinessOwnerIds } = require('../utils/verifiedSellers');

const listGrounds = asyncHandler(async (req, res) => {
  const list = await IndoorGround.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json({ success: true, data: list });
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

module.exports = { listGrounds, listProducts };
