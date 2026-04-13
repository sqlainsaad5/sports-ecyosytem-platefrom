const mongoose = require('mongoose');

const coachPartnershipRequestSchema = new mongoose.Schema(
  {
    businessOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

coachPartnershipRequestSchema.index({ coach: 1, businessOwner: 1 });

module.exports = mongoose.model('CoachPartnershipRequest', coachPartnershipRequestSchema);
