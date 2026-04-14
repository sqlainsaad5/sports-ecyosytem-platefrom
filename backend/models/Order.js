const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    unitPrice: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    line1: String,
    city: String,
    phone: String,
    postalCode: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    /** SRS UC-P8 / UC-B12 — checkout & fulfillment */
    shippingAddress: addressSchema,
    trackingNumber: String,
    customerNote: String,
  },
  { timestamps: true }
);

orderSchema.index({ player: 1 });
orderSchema.index({ businessOwner: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
