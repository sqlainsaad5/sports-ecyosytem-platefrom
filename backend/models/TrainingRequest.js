const mongoose = require('mongoose');

const trainingRequestSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: String,
    preferredStart: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

trainingRequestSchema.index({ coach: 1, status: 1 });
trainingRequestSchema.index({ player: 1 });

module.exports = mongoose.model('TrainingRequest', trainingRequestSchema);
