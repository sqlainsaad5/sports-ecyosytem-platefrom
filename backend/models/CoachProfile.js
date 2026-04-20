const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6 },
    start: String,
    end: String,
  },
  { _id: false }
);

const coachProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: String,
    specialties: [{ type: String, enum: ['cricket', 'badminton'] }],
    academyLocation: String,
    city: String,
    bio: String,
    yearsExperience: { type: Number, default: 0 },
    availability: [availabilitySlotSchema],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    bankAccountLabel: String,
    /** SRS UC-A3 / UC-C1 — map link for academy location verification */
    locationMapUrl: { type: String, required: true, trim: true },
    /** SRS UC-C5 — max concurrent students (soft cap) */
    maxStudents: { type: Number, default: 40, min: 1 },
  },
  { timestamps: true }
);

coachProfileSchema.index({ specialties: 1, city: 1 });

module.exports = mongoose.model('CoachProfile', coachProfileSchema);
