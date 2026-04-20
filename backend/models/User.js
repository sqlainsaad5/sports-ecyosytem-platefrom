const mongoose = require('mongoose');

const verificationAuditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['player', 'coach', 'business_owner', 'admin'],
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending_review', 'verified', 'rejected', 'more_info'],
      default: 'pending_review',
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: String,
    emailVerificationExpiresAt: Date,
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
    verificationNotes: String,
    isSuspended: { type: Boolean, default: false },
    verificationAudit: [verificationAuditSchema],
    playerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile' },
    coachProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachProfile' },
    businessProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

/* email index comes from unique: true — do not add userSchema.index({ email }) */
userSchema.index({ role: 1, verificationStatus: 1 });

module.exports = mongoose.model('User', userSchema);
