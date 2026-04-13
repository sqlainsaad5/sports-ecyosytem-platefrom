const User = require('../models/User');

/** Business owners approved by admin — required for marketplace listings (SRS/SDD). */
async function verifiedBusinessOwnerIds() {
  const owners = await User.find({
    role: 'business_owner',
    verificationStatus: 'verified',
    isSuspended: false,
  })
    .select('_id')
    .lean();
  return owners.map((o) => o._id);
}

module.exports = { verifiedBusinessOwnerIds };
