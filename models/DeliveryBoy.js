const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
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
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  license: {
    number: {
      type: String,
      required: [true, 'License number is required'],
      unique: true
    },
    expiryDate: {
      type: Date,
      required: [true, 'License expiry date is required']
    }
  },
  vehicle: {
    type: {
      type: String,
      enum: ['two-wheeler', 'three-wheeler', 'car'],
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    model: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'suspended'],
    default: 'active'
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.5
  },
  averageDeliveryTime: {
    type: Number, // in minutes
    default: 0
  },
  bankDetails: {
    accountHolder: String,
    accountNumber: {
      type: String,
      select: false // Sensitive info
    },
    bankName: String,
    ifscCode: String,
    accountType: {
      type: String,
      enum: ['savings', 'current']
    }
  },
  documents: {
    licenseProof: String,
    vehicleProof: String,
    addressProof: String,
    profilePhoto: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: Date,
  pushToken: {
    type: String,
    default: null
  },
  pushPlatform: {
    type: String,
    enum: ['android', 'ios', 'web', null],
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
deliveryBoySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
deliveryBoySchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
deliveryBoySchema.methods.getPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.bankDetails;
  return obj;
};

// Create geospatial index for location
deliveryBoySchema.index({ 'location': '2dsphere' });
deliveryBoySchema.index({ email: 1 });
deliveryBoySchema.index({ phone: 1 });
deliveryBoySchema.index({ availability: 1 });
deliveryBoySchema.index({ status: 1 });

// Ensure virtual fields are serialized
deliveryBoySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
