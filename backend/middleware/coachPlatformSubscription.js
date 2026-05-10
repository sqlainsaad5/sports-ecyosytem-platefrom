const CoachProfile = require('../models/CoachProfile');
const {
  coachPlatformSubscriptionActive,
  getCoachPlatformSubscriptionPriceUsd,
} = require('../utils/coachPlatformSubscription');

/** Blocks coach API when platform fee applies and subscription period has ended. */
async function requireCoachPlatformSubscription(req, res, next) {
  try {
    const priceUsd = await getCoachPlatformSubscriptionPriceUsd();
    if (priceUsd <= 0) return next();

    const cp = await CoachProfile.findOne({ user: req.user.id }).lean();
    if (!cp) return res.status(404).json({ success: false, message: 'Coach profile not found' });
    if (coachPlatformSubscriptionActive(cp)) return next();

    return res.status(403).json({
      success: false,
      code: 'COACH_SUBSCRIPTION_REQUIRED',
      message: 'Monthly platform subscription required. Open Subscription in the sidebar to pay.',
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { requireCoachPlatformSubscription };
