const mongoose = require('mongoose');

const groundBookingSchema = new mongoose.Schema(
  {
    ground: { type: mongoose.Schema.Types.ObjectId, ref: 'IndoorGround', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['held', 'confirmed', 'cancelled'],
      default: 'held',
    },
    holdExpiresAt: Date,
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

groundBookingSchema.index({ ground: 1, startTime: 1, endTime: 1 });
groundBookingSchema.index({ player: 1, status: 1 });
groundBookingSchema.index({ holdExpiresAt: 1 });

module.exports = mongoose.model('GroundBooking', groundBookingSchema);
