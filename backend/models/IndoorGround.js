const mongoose = require('mongoose');

const indoorGroundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sportType: { type: String, enum: ['cricket', 'badminton'], required: true },
    address: String,
    city: String,
    description: String,
    isActive: { type: Boolean, default: true },
    slotDurationMinutes: { type: Number, default: 60 },
    openTime: { type: String, default: '08:00' },
    closeTime: { type: String, default: '22:00' },
  },
  { timestamps: true }
);

indoorGroundSchema.index({ sportType: 1, isActive: 1 });

module.exports = mongoose.model('IndoorGround', indoorGroundSchema);
