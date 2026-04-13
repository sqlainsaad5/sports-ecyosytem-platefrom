const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    businessOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    sportType: { type: String, enum: ['cricket', 'badminton', 'general'], default: 'general' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ businessOwner: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
