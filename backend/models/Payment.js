const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      // SRS UC-C12 — coach withdrawal to bank (prototype: recorded as platform payout)
      enum: ['coach_fee', 'ground_booking', 'product', 'subscription', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    externalRef: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ payer: 1, type: 1 });
paymentSchema.index({ payee: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
