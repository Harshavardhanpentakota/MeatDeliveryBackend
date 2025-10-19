const { validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, sendSuccess, sendError, paginate } = require('../utils/helpers');

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private (Admin only)
 */
const getCoupons = asyncHandler(async (req, res, next) => {
  let query = Coupon.find().populate('createdBy', 'firstName lastName email');

  // Filtering
  const { isActive, type, category } = req.query;

  if (isActive !== undefined) {
    query = query.where('isActive').equals(isActive === 'true');
  }

  if (type) {
    query = query.where('type').equals(type);
  }

  if (category) {
    query = query.where('applicableCategories').in([category]);
  }

  // Sorting
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  query = query.sort({ [sortBy]: sortOrder });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, 'Coupons retrieved successfully', results);
});

/**
 * @desc    Get active coupons for users
 * @route   GET /api/coupons/active
 * @access  Public
 */
const getActiveCoupons = asyncHandler(async (req, res, next) => {
  const now = new Date();
  
  let query = Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
    ]
  }).select('-usedBy -createdBy');

  // Filter by user eligibility if user is authenticated
  if (req.user) {
    // Add user-specific filtering logic here if needed
    // For now, show all active coupons
  }

  const results = await paginate(query, req);
  sendSuccess(res, 'Active coupons retrieved successfully', results);
});

/**
 * @desc    Get single coupon
 * @route   GET /api/coupons/:id
 * @access  Private (Admin only)
 */
const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('excludedProducts', 'name price');

  if (!coupon) {
    return sendError(res, 'Coupon not found', 404);
  }

  sendSuccess(res, 'Coupon retrieved successfully', coupon);
});

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private (Admin only)
 */
const createCoupon = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const couponData = {
    ...req.body,
    createdBy: req.user._id
  };

  const coupon = await Coupon.create(couponData);
  await coupon.populate('createdBy', 'firstName lastName email');

  sendSuccess(res, 'Coupon created successfully', coupon, 201);
});

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private (Admin only)
 */
const updateCoupon = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('createdBy', 'firstName lastName email');

  if (!coupon) {
    return sendError(res, 'Coupon not found', 404);
  }

  sendSuccess(res, 'Coupon updated successfully', coupon);
});

/**
 * @desc    Delete coupon (soft delete)
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin only)
 */
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return sendError(res, 'Coupon not found', 404);
  }

  // Soft delete - mark as inactive
  coupon.isActive = false;
  await coupon.save();

  sendSuccess(res, 'Coupon deleted successfully');
});

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return sendError(res, 'Coupon code is required', 400);
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });

  if (!coupon) {
    return sendError(res, 'Invalid coupon code', 400);
  }

  // Check if coupon is currently valid
  if (!coupon.isCurrentlyValid) {
    if (coupon.validFrom > new Date()) {
      return sendError(res, 'Coupon is not yet active', 400);
    }
    if (coupon.validTo < new Date()) {
      return sendError(res, 'Coupon has expired', 400);
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return sendError(res, 'Coupon usage limit reached', 400);
    }
  }

  // Check user usage limit
  if (!coupon.canUserUseCoupon(req.user._id)) {
    return sendError(res, 'You have already used this coupon the maximum number of times', 400);
  }

  // Check minimum order value
  if (orderAmount && orderAmount < coupon.minimumOrderValue) {
    return sendError(res, `Minimum order value of ₹${coupon.minimumOrderValue} required`, 400);
  }

  // Calculate discount
  const discount = orderAmount ? coupon.calculateDiscount(orderAmount) : 0;

  sendSuccess(res, 'Coupon is valid', {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderValue: coupon.minimumOrderValue,
      maximumDiscount: coupon.maximumDiscount,
      formattedDiscount: coupon.formattedDiscount
    },
    discount,
    applicableAmount: orderAmount || 0
  });
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/coupons/apply
 * @access  Private
 */
const applyCouponToCart = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return sendError(res, 'Coupon code is required', 400);
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return sendError(res, 'Cart is empty', 400);
  }

  // Validate coupon
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });

  if (!coupon) {
    return sendError(res, 'Invalid coupon code', 400);
  }

  if (!coupon.isCurrentlyValid) {
    return sendError(res, 'Coupon is not valid or has expired', 400);
  }

  if (!coupon.canUserUseCoupon(req.user._id)) {
    return sendError(res, 'You have already used this coupon the maximum number of times', 400);
  }

  // Calculate applicable amount based on categories and excluded products
  let applicableAmount = 0;
  
  for (const item of cart.items) {
    const product = item.product;
    
    // Skip if product is excluded
    if (coupon.excludedProducts && coupon.excludedProducts.includes(product._id)) {
      continue;
    }
    
    // Skip if category is not applicable (if categories are specified)
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && 
        !coupon.applicableCategories.includes(product.category)) {
      continue;
    }
    
    applicableAmount += (item.priceAtTime || 0) * (item.quantity || 0);
  }

  // Use total cart amount if no category restrictions
  if (applicableAmount === 0 && (!coupon.applicableCategories || coupon.applicableCategories.length === 0)) {
    applicableAmount = cart.subtotal || 0;
  }

  // Check minimum order value
  if (applicableAmount < coupon.minimumOrderValue) {
    return sendError(res, `Minimum order value of ₹${coupon.minimumOrderValue} required for this coupon`, 400);
  }

  // Calculate discount
  const discount = coupon.calculateDiscount(applicableAmount);

  // Apply coupon to cart
  cart.appliedCoupon = {
    coupon: coupon._id,
    code: coupon.code,
    discount: discount,
    appliedAt: new Date()
  };

  await cart.save();
  
  // Re-populate after save
  await cart.populate('items.product');
  await cart.populate('appliedCoupon.coupon');

  sendSuccess(res, 'Coupon applied successfully', {
    cart,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      formattedDiscount: coupon.formattedDiscount
    },
    originalAmount: cart.subtotal,
    applicableAmount,
    discount,
    finalAmount: cart.finalAmount,
    savings: discount
  });
});

/**
 * @desc    Get coupon usage statistics
 * @route   GET /api/coupons/:id/stats
 * @access  Private (Admin only)
 */
const getCouponStats = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return sendError(res, 'Coupon not found', 404);
  }

  const stats = {
    totalUsage: coupon.usageCount,
    usageLimit: coupon.usageLimit,
    remainingUsage: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : 'Unlimited',
    uniqueUsers: coupon.usedBy.length,
    isActive: coupon.isActive,
    isCurrentlyValid: coupon.isCurrentlyValid,
    validFrom: coupon.validFrom,
    validTo: coupon.validTo,
    daysRemaining: Math.max(0, Math.ceil((coupon.validTo - new Date()) / (1000 * 60 * 60 * 24)))
  };

  sendSuccess(res, 'Coupon statistics retrieved successfully', stats);
});

module.exports = {
  getCoupons,
  getActiveCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToCart,
  getCouponStats
};