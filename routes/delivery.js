const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/deliveryController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('licenseExpiryDate')
    .isISO8601()
    .withMessage('Please enter a valid expiry date'),
  body('vehicleType')
    .isIn(['two-wheeler', 'three-wheeler', 'car'])
    .withMessage('Invalid vehicle type'),
  body('vehicleRegistration')
    .trim()
    .notEmpty()
    .withMessage('Vehicle registration number is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const locationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

const availabilityValidation = [
  body('availability')
    .isIn(['available', 'busy', 'offline'])
    .withMessage('Invalid availability status')
];

// Public routes
/**
 * @route   POST /api/delivery/register
 * @desc    Register new delivery boy
 * @access  Public (should be restricted to admin in production)
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/delivery/login
 * @desc    Login delivery boy
 * @access  Public
 */
router.post('/login', loginValidation, login);

// Protected routes (require authentication)
/**
 * @route   GET /api/delivery/me
 * @desc    Get current delivery boy profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/delivery/availability
 * @desc    Update delivery boy availability status
 * @access  Private
 */
router.put('/availability', authenticate, availabilityValidation, updateAvailability);

/**
 * @route   PUT /api/delivery/location
 * @desc    Update delivery boy current location
 * @access  Private
 */
router.put('/location', authenticate, locationValidation, updateLocation);

/**
 * @route   POST /api/delivery/logout
 * @desc    Logout delivery boy
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/delivery/stats
 * @desc    Get delivery boy statistics
 * @access  Private
 */
router.get('/stats', authenticate, getStats);

// Order management routes
/**
 * @route   GET /api/delivery/orders/pending
 * @desc    Get all pending orders available for pickup
 * @access  Private
 */
router.get('/orders/pending', authenticate, getPendingOrders);

/**
 * @route   GET /api/delivery/orders/assigned
 * @desc    Get orders assigned to delivery boy
 * @access  Private
 */
router.get('/orders/assigned', authenticate, getAssignedOrders);

/**
 * @route   POST /api/delivery/orders/:orderId/accept
 * @desc    Accept an order for delivery
 * @access  Private
 */
router.post('/orders/:orderId/accept', authenticate, acceptOrder);

/**
 * @route   PUT /api/delivery/orders/:orderId/out-for-delivery
 * @desc    Mark order as out for delivery
 * @access  Private
 */
router.put('/orders/:orderId/out-for-delivery', authenticate, markOutForDelivery);

/**
 * @route   PUT /api/delivery/orders/:orderId/delivered
 * @desc    Mark order as delivered
 * @access  Private
 */
router.put('/orders/:orderId/delivered', authenticate, markDelivered);

module.exports = router;
