const mongoose = require('mongoose');

const PACKAGE_LIMITS = { basic: 20, pro: 40, premium: 60 };

const businessProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    phone: String,
    storeName: String,
    storeDescription: String,
    subscriptionPackage: { type: String, enum: ['basic', 'pro', 'premium'], default: 'basic' },
    listingSlotsRemaining: { type: Number, default: 0 },
    subscriptionRenewsAt: Date,
    legalDocumentNote: String,
    /** SRS UC-B5 — storefront branding & policies */
    storeLogoUrl: String,
    storeBannerUrl: String,
    shippingPolicyText: String,
    returnPolicyText: String,
  },
  { timestamps: true }
);

businessProfileSchema.statics.packageLimit = function (pkg) {
  return PACKAGE_LIMITS[pkg] ?? PACKAGE_LIMITS.basic;
};

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
module.exports.PACKAGE_LIMITS = PACKAGE_LIMITS;
