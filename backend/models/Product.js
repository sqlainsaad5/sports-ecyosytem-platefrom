const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    businessOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, trim: true },
    sportType: { type: String, enum: ['cricket', 'badminton', 'general'], default: 'general' },
    price: { type: Number, required: true, min: 0 },
    /** Optional sale window */
    salePrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    saleStart: Date,
    saleEnd: Date,
    stock: { type: Number, default: 0, min: 0 },
    /** Low-stock threshold */
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    images: [String],
    primaryImageIndex: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    /** Lightweight audit trail */
    changeLog: [changeLogSchema],
  },
  { timestamps: true }
);

productSchema.index({ businessOwner: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
