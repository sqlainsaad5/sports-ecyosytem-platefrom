const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingSession', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    present: { type: Boolean, required: true },
    notes: String,
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ session: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
