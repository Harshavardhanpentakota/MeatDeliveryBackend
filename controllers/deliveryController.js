const { validationResult } = require('express-validator');
const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');
const { sendTokenResponse } = require('../utils/auth');
const { asyncHandler, AppError, sendSuccess, sendError } = require('../utils/helpers');

/**
 * @desc    Register delivery boy
 * @route   POST /api/delivery/register
 * @access  Public (should be restricted to admin in production)
 */
const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    licenseNumber,
    licenseExpiryDate,
    vehicleType,
    vehicleRegistration,
    vehicleModel,
    address,
    city,
    state,
    zipCode
  } = req.body;

  // Check if delivery boy already exists with email
  const existingEmail = await DeliveryBoy.findOne({ email });
  if (existingEmail) {
    return sendError(res, 'Delivery boy already exists with this email', 400);
  }

  // Check if delivery boy already exists with phone
  const existingPhone = await DeliveryBoy.findOne({ phone });
  if (existingPhone) {
    return sendError(res, 'Delivery boy already exists with this phone number', 400);
  }

  // Check if license number already exists
  const existingLicense = await DeliveryBoy.findOne({ 'license.number': licenseNumber });
  if (existingLicense) {
    return sendError(res, 'License number already registered', 400);
  }

  // Create new delivery boy
  const deliveryBoy = new DeliveryBoy({
    firstName,
    lastName,
    email,
    password,
    phone,
    license: {
      number: licenseNumber,
      expiryDate: new Date(licenseExpiryDate)
    },
    vehicle: {
      type: vehicleType,
      registrationNumber: vehicleRegistration,
      model: vehicleModel
    },
    address: {
      street: address,
      city,
      state,
      zipCode,
      country: 'India'
    }
  });

  await deliveryBoy.save();

  // Send token response
  sendTokenResponse(deliveryBoy, 201, res, 'Delivery boy registered successfully');
});

/**
 * @desc    Login delivery boy
 * @route   POST /api/delivery/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return sendError(res, 'Please provide email and password', 400);
  }

  // Check for delivery boy
  const deliveryBoy = await DeliveryBoy.findOne({ email }).select('+password');

  if (!deliveryBoy) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if delivery boy is approved
  if (!deliveryBoy.isApproved) {
    return sendError(res, 'Your account is not yet approved by admin', 403);
  }

  // Check if delivery boy is not suspended
  if (deliveryBoy.status === 'suspended') {
    return sendError(res, 'Your account has been suspended', 403);
  }

  // Check password
  const isMatch = await deliveryBoy.comparePassword(password);

  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Update last active time
  deliveryBoy.lastActive = new Date();
  await deliveryBoy.save();

  // Send token response
  sendTokenResponse(deliveryBoy, 200, res, 'Logged in successfully');
});

/**
 * @desc    Get delivery boy profile
 * @route   GET /api/delivery/me
 * @access  Private (Delivery Boy only)
 */
const getMe = asyncHandler(async (req, res, next) => {
  const deliveryBoy = await DeliveryBoy.findById(req.user._id);

  if (!deliveryBoy) {
    return sendError(res, 'Delivery boy not found', 404);
  }

  // Calculate total earnings from delivered orders
  const deliveredOrders = await Order.find({
    'delivery.assignedTo': req.user._id,
    status: 'delivered'
  }).select('pricing.total');

  const totalEarnings = deliveredOrders.reduce((sum, order) => {
    // Assuming delivery boy gets 10% of order total as commission
    return sum + (order.pricing.total * 0.10);
  }, 0);

  // Calculate completion rate
  const totalAssigned = deliveryBoy.totalDeliveries || 0;
  const completed = deliveryBoy.completedDeliveries || 0;
  const completionRate = totalAssigned > 0 ? ((completed / totalAssigned) * 100).toFixed(1) : 100;

  // Format response with all profile data
  const profileData = {
    _id: deliveryBoy._id,
    name: `${deliveryBoy.firstName} ${deliveryBoy.lastName}`,
    firstName: deliveryBoy.firstName,
    lastName: deliveryBoy.lastName,
    email: deliveryBoy.email,
    phone: deliveryBoy.phone,
    address: deliveryBoy.address.street || '',
    city: deliveryBoy.address.city || '',
    state: deliveryBoy.address.state || '',
    zipCode: deliveryBoy.address.zipCode || '',
    fullAddress: `${deliveryBoy.address.street || ''}, ${deliveryBoy.address.city || ''}, ${deliveryBoy.address.state || ''} ${deliveryBoy.address.zipCode || ''}`.trim(),
    joinDate: deliveryBoy.joinDate,
    vehicleType: deliveryBoy.vehicle.type,
    vehicleNumber: deliveryBoy.vehicle.registrationNumber,
    vehicleModel: deliveryBoy.vehicle.model,
    licenseNumber: deliveryBoy.license.number,
    licenseExpiry: deliveryBoy.license.expiryDate,
    bankAccount: deliveryBoy.bankDetails.accountNumber ? `****${deliveryBoy.bankDetails.accountNumber.slice(-4)}` : null,
    bankName: deliveryBoy.bankDetails.bankName,
    ifscCode: deliveryBoy.bankDetails.ifscCode,
    accountHolder: deliveryBoy.bankDetails.accountHolder,
    totalDeliveries: deliveryBoy.totalDeliveries || 0,
    completedDeliveries: deliveryBoy.completedDeliveries || 0,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    averageRating: deliveryBoy.rating || 4.5,
    averageDeliveryTime: deliveryBoy.averageDeliveryTime || 0,
    completionRate: parseFloat(completionRate),
    status: deliveryBoy.status,
    availability: deliveryBoy.availability,
    isVerified: deliveryBoy.isVerified,
    isApproved: deliveryBoy.isApproved,
    lastActive: deliveryBoy.lastActive,
    profilePhoto: deliveryBoy.documents.profilePhoto,
    location: deliveryBoy.location
  };

  sendSuccess(res, 'Profile retrieved successfully', profileData);
});

/**
 * @desc    Update delivery boy availability
 * @route   PUT /api/delivery/availability
 * @access  Private (Delivery Boy only)
 */
const updateAvailability = asyncHandler(async (req, res, next) => {
  const { availability } = req.body;

  if (!['available', 'busy', 'offline'].includes(availability)) {
    return sendError(res, 'Invalid availability status', 400);
  }

  const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
    req.user._id,
    { availability },
    { new: true, runValidators: true }
  );

  if (!deliveryBoy) {
    return sendError(res, 'Delivery boy not found', 404);
  }

  sendSuccess(res, 'Availability updated successfully', deliveryBoy);
});

/**
 * @desc    Update delivery boy location
 * @route   PUT /api/delivery/location
 * @access  Private (Delivery Boy only)
 */
const updateLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return sendError(res, 'Latitude and longitude are required', 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return sendError(res, 'Invalid coordinates', 400);
  }

  const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      lastActive: new Date()
    },
    { new: true, runValidators: true }
  );

  if (!deliveryBoy) {
    return sendError(res, 'Delivery boy not found', 404);
  }

  sendSuccess(res, 'Location updated successfully', deliveryBoy);
});

/**
 * @desc    Get pending orders for delivery boy
 * @route   GET /api/delivery/orders/pending
 * @access  Private (Delivery Boy only)
 */
const getPendingOrders = asyncHandler(async (req, res, next) => {
  // Get start of yesterday (00:00:00)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Get end of today (23:59:59)
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    status: 'pending',
    'delivery.assignedTo': { $exists: false },
    createdAt: {
      $gte: yesterday,
      $lte: endOfToday
    }
  })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name category price')
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return sendSuccess(res, 'No pending orders available', []);
  }

  sendSuccess(res, 'Pending orders retrieved successfully', orders);
});

/**
 * @desc    Accept order
 * @route   POST /api/delivery/orders/:orderId/accept
 * @access  Private (Delivery Boy only)
 */
const acceptOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check if order is pending and not already assigned
  if (order.status !== 'pending') {
    return sendError(res, 'Order is not available for assignment', 400);
  }

  if (order.delivery.assignedTo) {
    return sendError(res, 'Order is already assigned to another delivery boy', 400);
  }

  // Check if delivery boy is already on another active delivery
  const activeDelivery = await Order.findOne({
    'delivery.assignedTo': req.user._id,
    status: { $in: ['confirmed', 'preparing', 'out-for-delivery'] }
  });

  if (activeDelivery) {
    return sendError(res, 'You already have an active delivery', 400);
  }

  // Update order with delivery boy assignment
  order.delivery.assignedTo = req.user._id;
  order.delivery.estimatedTime = new Date(Date.now() + 45 * 60000); // 45 minutes estimated
  order.status = 'confirmed';

  // Add to status history
  order.statusHistory.push({
    status: 'confirmed',
    updatedBy: req.user._id,
    notes: 'Order assigned to delivery boy'
  });

  await order.save();

  // Update delivery boy availability
  await DeliveryBoy.findByIdAndUpdate(req.user._id, { availability: 'busy' });

  const populatedOrder = await Order.findById(orderId)
    .populate('customer', 'firstName lastName email phone')
    .populate('delivery.assignedTo', 'firstName lastName phone')
    .populate('items.product', 'name category price');

  sendSuccess(res, 'Order assigned successfully', populatedOrder);
});

/**
 * @desc    Get assigned orders for delivery boy
 * @route   GET /api/delivery/orders/assigned
 * @access  Private (Delivery Boy only)
 */
const getAssignedOrders = asyncHandler(async (req, res, next) => {
  // Only return active orders (not delivered or cancelled)
  const orders = await Order.find({
    'delivery.assignedTo': req.user._id,
    status: { $in: ['confirmed', 'preparing', 'out-for-delivery'] }
  })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name category price')
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return sendSuccess(res, 'No assigned orders', []);
  }

  sendSuccess(res, 'Assigned orders retrieved successfully', orders);
});

/**
 * @desc    Mark order as out for delivery
 * @route   PUT /api/delivery/orders/:orderId/out-for-delivery
 * @access  Private (Delivery Boy only)
 */
const markOutForDelivery = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { notes } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  if (!order.delivery.assignedTo || order.delivery.assignedTo.toString() !== req.user._id.toString()) {
    return sendError(res, 'You are not assigned to this order', 403);
  }

  // Order should be confirmed or preparing to be marked as out-for-delivery
  if (!['confirmed', 'preparing'].includes(order.status)) {
    return sendError(res, `Order cannot be marked as out-for-delivery from ${order.status} status`, 400);
  }

  // Update order status
  order.status = 'out-for-delivery';

  // Add status history entry
  order.statusHistory.push({
    status: 'out-for-delivery',
    updatedBy: req.user._id,
    notes: notes || 'Started delivery'
  });

  await order.save();

  const populatedOrder = await Order.findById(orderId)
    .populate('customer', 'firstName lastName email phone')
    .populate('delivery.assignedTo', 'firstName lastName phone')
    .populate('items.product', 'name category price');

  sendSuccess(res, 'Order marked as out for delivery', populatedOrder);
});

/**
 * @desc    Mark order as delivered
 * @route   PUT /api/delivery/orders/:orderId/delivered
 * @access  Private (Delivery Boy only)
 */
const markDelivered = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { notes, otp } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  if (!order.delivery.assignedTo || order.delivery.assignedTo.toString() !== req.user._id.toString()) {
    return sendError(res, 'You are not assigned to this order', 403);
  }

  // Allow marking as delivered from confirmed, preparing, or out-for-delivery status
  if (!['confirmed', 'preparing', 'out-for-delivery'].includes(order.status)) {
    return sendError(res, `Order cannot be marked as delivered from ${order.status} status`, 400);
  }

  // If not already out-for-delivery, add that status to history first
  if (order.status !== 'out-for-delivery') {
    order.statusHistory.push({
      status: 'out-for-delivery',
      updatedBy: req.user._id,
      notes: 'Auto-transitioned to out-for-delivery',
      timestamp: new Date()
    });
  }

  // Mark as delivered
  order.status = 'delivered';
  order.delivery.actualDeliveryTime = new Date();

  // Add status history entry
  order.statusHistory.push({
    status: 'delivered',
    updatedBy: req.user._id,
    notes: notes || 'Delivered successfully'
  });

  await order.save();

  // Update delivery boy stats
  const deliveryBoy = await DeliveryBoy.findById(req.user._id);
  deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
  deliveryBoy.completedDeliveries = (deliveryBoy.completedDeliveries || 0) + 1;

  // Calculate average delivery time
  const recentOrders = await Order.find({
    'delivery.assignedTo': req.user._id,
    status: 'delivered'
  }).sort({ createdAt: -1 }).limit(10);

  if (recentOrders.length > 0) {
    const totalTime = recentOrders.reduce((acc, o) => {
      if (o.delivery.actualDeliveryTime && o.delivery.assignedTo) {
        const assignmentTime = o.statusHistory.find(h => h.status === 'out-for-delivery')?.timestamp;
        if (assignmentTime) {
          return acc + (new Date(o.delivery.actualDeliveryTime) - new Date(assignmentTime)) / 60000;
        }
      }
      return acc;
    }, 0);
    deliveryBoy.averageDeliveryTime = Math.round(totalTime / recentOrders.length);
  }

  deliveryBoy.availability = 'available';
  deliveryBoy.lastActive = new Date();
  await deliveryBoy.save();

  const populatedOrder = await Order.findById(orderId)
    .populate('customer', 'firstName lastName email phone')
    .populate('delivery.assignedTo', 'firstName lastName phone');

  sendSuccess(res, 'Order marked as delivered successfully', populatedOrder);
});

/**
 * @desc    Get delivery boy stats
 * @route   GET /api/delivery/stats
 * @access  Private (Delivery Boy only)
 */
const getStats = asyncHandler(async (req, res, next) => {
  const deliveryBoy = await DeliveryBoy.findById(req.user._id);

  if (!deliveryBoy) {
    return sendError(res, 'Delivery boy not found', 404);
  }

  const stats = {
    totalDeliveries: deliveryBoy.totalDeliveries || 0,
    completedDeliveries: deliveryBoy.completedDeliveries || 0,
    rating: deliveryBoy.rating || 0,
    averageDeliveryTime: deliveryBoy.averageDeliveryTime || 0,
    availability: deliveryBoy.availability,
    status: deliveryBoy.status
  };

  sendSuccess(res, 'Stats retrieved successfully', stats);
});

/**
 * @desc    Logout delivery boy
 * @route   POST /api/delivery/logout
 * @access  Private (Delivery Boy only)
 */
const logout = asyncHandler(async (req, res, next) => {
  // Update availability to offline
  await DeliveryBoy.findByIdAndUpdate(
    req.user._id,
    { availability: 'offline' }
  );

  sendSuccess(res, 'Logged out successfully', null);
});

module.exports = {
  register,
  login,
  getMe,
  updateAvailability,
  updateLocation,
  getPendingOrders,
  acceptOrder,
  getAssignedOrders,
  markOutForDelivery,
  markDelivered,
  getStats,
  logout
};
