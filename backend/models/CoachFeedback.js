const mongoose = require('mongoose');

const coachFeedbackSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    anonymous: { type: Boolean, default: false },
    coachReply: String,
  },
  { timestamps: true }
);

coachFeedbackSchema.index({ coach: 1, createdAt: -1 });

module.exports = mongoose.model('CoachFeedback', coachFeedbackSchema);
