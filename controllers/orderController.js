const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler, sendSuccess, sendError, paginate } = require('../utils/helpers');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { items, deliveryAddress, savedAddressId, contactInfo, paymentMethod, specialInstructions, orderNumber } = req.body;

  // Handle delivery address - either from saved addresses or provided directly
  let finalDeliveryAddress = deliveryAddress;
  
  if (savedAddressId) {
    const user = await User.findById(req.user._id).select('savedAddresses');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    
    const savedAddress = user.savedAddresses.find(addr => addr._id.toString() === savedAddressId);
    if (!savedAddress) {
      return sendError(res, 'Saved address not found', 404);
    }
    
    finalDeliveryAddress = {
      street: savedAddress.street,
      city: savedAddress.city,
      state: savedAddress.state,
      zipCode: savedAddress.zipCode,
      country: savedAddress.country,
      landmark: savedAddress.landmark
    };
  }

  // Validate items and calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      return sendError(res, `Product ${item.product} not found`, 404);
    }

    if (!product.availability.inStock) {
      return sendError(res, `Product ${product.name} is out of stock`, 400);
    }

    if (product.availability.quantity < item.quantity) {
      return sendError(res, `Only ${product.availability.quantity} items available for ${product.name}`, 400);
    }

    const priceAtTime = product.discountedPrice || product.price;
    const itemSubtotal = priceAtTime * item.quantity;

    orderItems.push({
      product: item.product,
      quantity: item.quantity,
      priceAtTime,
      subtotal: itemSubtotal
    });

    subtotal += itemSubtotal;
  }

  // Calculate delivery fee (no tax)
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
  const total = subtotal + deliveryFee;

  // Create order - use provided orderNumber or let pre-save middleware generate it
  const orderData = {
    customer: req.user._id,
    items: orderItems,
    deliveryAddress: finalDeliveryAddress,
    contactInfo,
    pricing: {
      subtotal,
      deliveryFee,
      total
    },
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === 'cash-on-delivery' ? 'pending' : 'pending'
    },
    specialInstructions
  };

  // Add orderNumber if provided by client
  if (orderNumber) {
    orderData.orderNumber = orderNumber;
  }

  // Create and save the order
  const order = new Order(orderData);
  await order.save();

  // Update product quantities
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { 'availability.quantity': -item.quantity } }
    );
  }

  // Clear user's cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] }
  );

  // Populate order details
  await order.populate('customer', 'firstName lastName email phone');
  await order.populate('items.product');

  // Send order placed notification
  try {
    await notificationService.notifyOrderPlaced(req.user._id, {
      orderNumber: order.orderNumber,
      orderId: order._id,
      amount: order.pricing.total
    });
  } catch (notificationError) {
    console.error('Failed to send order notification:', notificationError);
    // Don't fail the order creation if notification fails
  }

  sendSuccess(res, 'Order created successfully', order, 201);
});

/**
 * @desc    Get all orders (Admin) or user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'admin') {
    // Admin can see all orders
    query = Order.find();
  } else {
    // Regular users can only see their own orders
    query = Order.find({ customer: req.user._id });
  }

  // Filtering
  const { status, paymentStatus } = req.query;

  if (status) {
    query = query.where('status').equals(status);
  }

  if (paymentStatus) {
    query = query.where('paymentInfo.status').equals(paymentStatus);
  }

  // Populate customer and product details
  query = query.populate('customer', 'firstName lastName email phone')
               .populate('items.product');

  // Sorting by newest first
  query = query.sort({ createdAt: -1 });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, 'Orders retrieved successfully', results);
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = asyncHandler(async (req, res, next) => {
  let query = Order.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product')
    .populate('statusHistory.updatedBy', 'firstName lastName');

  // If not admin, ensure user can only access their own orders
  if (req.user.role !== 'admin') {
    query = query.where('customer').equals(req.user._id);
  }

  const order = await query;

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  sendSuccess(res, 'Order retrieved successfully', order);
});

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin only)
 */
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { status, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Update status
  order.status = status;

  // Add to status history
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user._id,
    notes
  });

  // Set delivery time for delivered orders
  if (status === 'delivered') {
    order.delivery.actualDeliveryTime = new Date();
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
  }

  await order.save();

  await order.populate('customer', 'firstName lastName email phone');
  await order.populate('items.product');

  // Send order status change notification
  try {
    await notificationService.notifyOrderStatusChange(order.customer._id, {
      orderNumber: order.orderNumber,
      orderId: order._id,
      status: status
    }, status);
  } catch (notificationError) {
    console.error('Failed to send status update notification:', notificationError);
  }

  sendSuccess(res, 'Order status updated successfully', order);
});

/**
 * @desc    Cancel order
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res, next) => {
  let query = Order.findById(req.params.id);

  // If not admin, ensure user can only cancel their own orders
  if (req.user.role !== 'admin') {
    query = query.where('customer').equals(req.user._id);
  }

  const order = await query;

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check if order can be cancelled
  if (['delivered', 'cancelled'].includes(order.status)) {
    return sendError(res, 'Order cannot be cancelled', 400);
  }

  // Update status
  order.status = 'cancelled';

  // Add to status history
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.user._id,
    notes: req.body.reason || 'Cancelled by user'
  });

  // Restore product quantities
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { 'availability.quantity': item.quantity } }
    );
  }

  await order.save();

  sendSuccess(res, 'Order cancelled successfully', order);
});

/**
 * @desc    Assign delivery person
 * @route   PATCH /api/orders/:id/assign
 * @access  Private (Admin only)
 */
const assignDelivery = asyncHandler(async (req, res, next) => {
  const { assignedTo, estimatedTime, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Update delivery info
  order.delivery.assignedTo = assignedTo;
  order.delivery.estimatedTime = estimatedTime;
  order.delivery.notes = notes;

  // Update status if not already in progress
  if (order.status === 'confirmed') {
    order.status = 'preparing';
    order.statusHistory.push({
      status: 'preparing',
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: 'Order assigned to delivery person'
    });
  }

  await order.save();

  await order.populate('customer', 'firstName lastName email phone');
  await order.populate('delivery.assignedTo', 'firstName lastName');

  sendSuccess(res, 'Delivery assigned successfully', order);
});

/**
 * @desc    Get order statistics (Admin only)
 * @route   GET /api/orders/stats
 * @access  Private (Admin only)
 */
const getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$pricing.total' }
      }
    }
  ]);

  const result = {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusBreakdown: stats
  };

  sendSuccess(res, 'Order statistics retrieved successfully', result);
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  assignDelivery,
  getOrderStats
};