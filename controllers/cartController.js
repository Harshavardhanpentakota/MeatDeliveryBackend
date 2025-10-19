const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  sendSuccess(res, 'Cart retrieved successfully', cart);
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { productId, quantity } = req.body;

  // Check if product exists and is available
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 'Product not found', 404);
  }

  if (!product.availability.inStock) {
    return sendError(res, 'Product is out of stock', 400);
  }

  if (product.availability.quantity < quantity) {
    return sendError(res, `Only ${product.availability.quantity} items available`, 400);
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].priceAtTime = product.discountedPrice || product.price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      priceAtTime: product.discountedPrice || product.price
    });
  }

  await cart.save();
  
  // Populate product details
  await cart.populate('items.product');

  sendSuccess(res, 'Item added to cart successfully', cart);
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/update/:itemId
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { quantity } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return sendError(res, 'Item not found in cart', 404);
  }

  // Check product availability
  const product = await Product.findById(item.product);
  if (!product || !product.availability.inStock) {
    return sendError(res, 'Product is no longer available', 400);
  }

  if (product.availability.quantity < quantity) {
    return sendError(res, `Only ${product.availability.quantity} items available`, 400);
  }

  // Update quantity
  item.quantity = quantity;
  item.priceAtTime = product.discountedPrice || product.price;

  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 'Cart item updated successfully', cart);
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:itemId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  // Remove item
  cart.items.pull(itemId);
  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 'Item removed from cart successfully', cart);
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  cart.items = [];
  await cart.save();

  sendSuccess(res, 'Cart cleared successfully', cart);
});

/**
 * @desc    Get cart summary
 * @route   GET /api/cart/summary
 * @access  Private
 */
const getCartSummary = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product')
    .populate('appliedCoupon.coupon');

  if (!cart) {
    return sendSuccess(res, 'Cart summary retrieved successfully', {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      totalAmount: 0,
      items: [],
      appliedCoupon: null
    });
  }

  const summary = {
    itemCount: cart.totalItems,
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    totalAmount: cart.finalAmount,
    formattedSubtotal: cart.formattedSubtotal,
    formattedDiscount: cart.formattedDiscount,
    formattedTotal: cart.formattedTotal,
    appliedCoupon: cart.appliedCoupon ? {
      code: cart.appliedCoupon.code,
      discount: cart.appliedCoupon.discount,
      appliedAt: cart.appliedCoupon.appliedAt
    } : null,
    items: cart.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
      subtotal: item.quantity * item.priceAtTime
    }))
  };

  sendSuccess(res, 'Cart summary retrieved successfully', summary);
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/cart/apply-coupon
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

  // Find and validate coupon
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

  // Calculate applicable amount
  let applicableAmount = 0;
  for (const item of cart.items) {
    const product = item.product;
    
    // Skip if product is excluded
    if (coupon.excludedProducts.includes(product._id)) {
      continue;
    }
    
    // Skip if category is not applicable
    if (coupon.applicableCategories.length > 0 && 
        !coupon.applicableCategories.includes(product.category)) {
      continue;
    }
    
    applicableAmount += item.priceAtTime * item.quantity;
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
  await cart.populate('appliedCoupon.coupon');

  sendSuccess(res, 'Coupon applied successfully', {
    cart,
    savings: discount,
    originalAmount: cart.subtotal,
    finalAmount: cart.finalAmount
  });
});

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/cart/remove-coupon
 * @access  Private
 */
const removeCouponFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  if (!cart.appliedCoupon) {
    return sendError(res, 'No coupon applied to cart', 400);
  }

  cart.appliedCoupon = undefined;
  await cart.save();

  sendSuccess(res, 'Coupon removed successfully', cart);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  applyCouponToCart,
  removeCouponFromCart
};