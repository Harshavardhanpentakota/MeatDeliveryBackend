const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed'],
    lowercase: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  weight: {
    value: {
      type: Number,
      required: [true, 'Product weight is required'],
      min: [0, 'Weight cannot be negative']
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'piece'],
      default: 'kg'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Product image'
    }
  }],
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    }
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number
  },
  preparationMethod: {
    type: String,
    enum: ['fresh', 'frozen', 'marinated', 'cooked'],
    default: 'fresh'
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    validUntil: Date
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0 && this.discount.validUntil > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);