const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  priceAtTime: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  appliedCoupon: {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    code: String,
    discount: {
      type: Number,
      default: 0
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving - Ensure no undefined values
cartSchema.pre('save', function(next) {
  // Ensure items array exists
  if (!this.items) {
    this.items = [];
  }
  
  // Calculate totals safely
  this.totalItems = this.items.reduce((total, item) => total + (item.quantity || 0), 0);
  this.subtotal = this.items.reduce((total, item) => {
    const price = item.priceAtTime || 0;
    const qty = item.quantity || 0;
    return total + (price * qty);
  }, 0);
  
  // Handle coupon discount safely
  this.discountAmount = (this.appliedCoupon && this.appliedCoupon.discount) ? this.appliedCoupon.discount : 0;
  this.finalAmount = (this.subtotal || 0) - (this.discountAmount || 0);
  this.totalAmount = this.finalAmount; // Keep for backward compatibility
  
  next();
});

// Virtual for formatted amounts - Safe from undefined values
cartSchema.virtual('formattedSubtotal').get(function() {
  return `₹${(this.subtotal || 0).toFixed(2)}`;
});

cartSchema.virtual('formattedDiscount').get(function() {
  return `₹${(this.discountAmount || 0).toFixed(2)}`;
});

cartSchema.virtual('formattedTotal').get(function() {
  return `₹${(this.finalAmount || 0).toFixed(2)}`;
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Cart', cartSchema);