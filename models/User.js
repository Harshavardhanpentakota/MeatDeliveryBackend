const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  // Multiple saved addresses for convenience
  savedAddresses: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Address label cannot exceed 50 characters']
    },
    street: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, 'Street address must be at least 5 characters']
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'City must be at least 2 characters']
    },
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'State must be at least 2 characters']
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit PIN code']
    },
    country: {
      type: String,
      default: 'India'
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, 'Landmark cannot exceed 100 characters']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // OTP fields for mobile authentication
  otpCode: {
    type: String,
    select: false // Don't include OTP in queries by default
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  otpIsVerified: {
    type: Boolean,
    default: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure only one default address
userSchema.pre('save', function(next) {
  if (this.isModified('savedAddresses')) {
    const defaultAddresses = this.savedAddresses.filter(addr => addr.isDefault);
    
    if (defaultAddresses.length > 1) {
      // Keep only the last one as default
      this.savedAddresses.forEach((addr, index) => {
        addr.isDefault = index === this.savedAddresses.length - 1 && addr.isDefault;
      });
    }
    
    // If no default address and there are addresses, make the first one default
    if (defaultAddresses.length === 0 && this.savedAddresses.length > 0) {
      this.savedAddresses[0].isDefault = true;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);