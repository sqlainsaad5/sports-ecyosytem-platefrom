const mongoose = require('mongoose');

const verificationDocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleContext: { type: String, enum: ['coach', 'business_owner'], required: true },
    filePath: { type: String, required: true },
    originalName: String,
    docType: String,
    issueDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

verificationDocumentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('VerificationDocument', verificationDocumentSchema);
