const mongoose = require('mongoose');

const playerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: String,
    sportPreference: { type: String, enum: ['cricket', 'badminton'], required: true },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    city: String,
    address: String,
  },
  { timestamps: true }
);

playerProfileSchema.index({ sportPreference: 1, city: 1 });

module.exports = mongoose.model('PlayerProfile', playerProfileSchema);
