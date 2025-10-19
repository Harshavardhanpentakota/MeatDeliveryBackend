const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code must not exceed 20 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description must not exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Coupon value must be positive']
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value must be positive']
  },
  maximumDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount must be positive']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String,
    enum: ['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed']
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  userEligibility: {
    type: String,
    enum: ['all', 'new', 'premium'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usageCount: {
      type: Number,
      default: 1
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });
couponSchema.index({ isActive: 1 });

// Validation: validTo must be after validFrom
couponSchema.pre('validate', function(next) {
  if (this.validTo <= this.validFrom) {
    next(new Error('Valid to date must be after valid from date'));
  }
  
  if (this.type === 'percentage' && this.value > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTo >= now &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
  const userUsage = this.usedBy.find(usage => usage.user.toString() === userId.toString());
  const userUsageCount = userUsage ? userUsage.usageCount : 0;
  
  return userUsageCount < this.userUsageLimit;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount, applicableAmount = null) {
  const baseAmount = applicableAmount || orderAmount;
  
  if (baseAmount < this.minimumOrderValue) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (baseAmount * this.value) / 100;
  } else if (this.type === 'fixed') {
    discount = Math.min(this.value, baseAmount);
  }
  
  // Apply maximum discount limit if set
  if (this.maximumDiscount !== null) {
    discount = Math.min(discount, this.maximumDiscount);
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon usage
couponSchema.methods.applyCouponUsage = async function(userId) {
  const userUsageIndex = this.usedBy.findIndex(usage => usage.user.toString() === userId.toString());
  
  if (userUsageIndex >= 0) {
    this.usedBy[userUsageIndex].usageCount += 1;
    this.usedBy[userUsageIndex].lastUsed = new Date();
  } else {
    this.usedBy.push({
      user: userId,
      usageCount: 1,
      lastUsed: new Date()
    });
  }
  
  this.usageCount += 1;
  await this.save();
};

// Virtual for formatted discount display
couponSchema.virtual('formattedDiscount').get(function() {
  if (this.type === 'percentage') {
    return `${this.value}% OFF`;
  } else {
    return `₹${this.value} OFF`;
  }
});

// Ensure virtual fields are serialized
couponSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.usedBy; // Don't expose usage data in API responses
    return ret;
  }
});

module.exports = mongoose.model('Coupon', couponSchema);