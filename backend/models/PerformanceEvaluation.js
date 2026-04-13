const mongoose = require('mongoose');

const performanceEvaluationSchema = new mongoose.Schema(
  {
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true },
    technique: { type: Number, min: 0, max: 100 },
    fitness: { type: Number, min: 0, max: 100 },
    attitude: { type: Number, min: 0, max: 100 },
    comments: String,
  },
  { timestamps: true }
);

performanceEvaluationSchema.index({ player: 1, weekStartDate: -1 });

module.exports = mongoose.model('PerformanceEvaluation', performanceEvaluationSchema);
