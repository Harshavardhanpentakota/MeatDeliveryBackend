const express = require('express');
const { body } = require('express-validator');
const {
  getCoupons,
  getActiveCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToCart,
  getCouponStats
} = require('../controllers/couponController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const couponValidation = [
  body('code')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code must contain only uppercase letters and numbers'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Type must be either percentage or fixed'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('minimumOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),
  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be at least 1'),
  body('validFrom')
    .isISO8601()
    .withMessage('Valid from must be a valid date'),
  body('validTo')
    .isISO8601()
    .withMessage('Valid to must be a valid date'),
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  body('applicableCategories.*')
    .optional()
    .isIn(['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed'])
    .withMessage('Invalid category'),
  body('excludedProducts')
    .optional()
    .isArray()
    .withMessage('Excluded products must be an array'),
  body('userEligibility')
    .optional()
    .isIn(['all', 'new', 'premium'])
    .withMessage('User eligibility must be all, new, or premium')
];

const updateCouponValidation = [
  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code must contain only uppercase letters and numbers'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  body('type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Type must be either percentage or fixed'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('minimumOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),
  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be at least 1'),
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from must be a valid date'),
  body('validTo')
    .optional()
    .isISO8601()
    .withMessage('Valid to must be a valid date'),
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  body('applicableCategories.*')
    .optional()
    .isIn(['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed'])
    .withMessage('Invalid category'),
  body('excludedProducts')
    .optional()
    .isArray()
    .withMessage('Excluded products must be an array'),
  body('userEligibility')
    .optional()
    .isIn(['all', 'new', 'premium'])
    .withMessage('User eligibility must be all, new, or premium')
];

const validateCouponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
  body('orderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number')
];

const applyCouponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
];

// Public routes
router.get('/active', getActiveCoupons);

// Protected routes (Authenticated users)
router.post('/validate', authenticate, validateCouponValidation, validateCoupon);
router.post('/apply', authenticate, applyCouponValidation, applyCouponToCart);

// Protected routes (Admin only)
router.get('/', authenticate, authorize('admin'), getCoupons);
router.get('/:id', authenticate, authorize('admin'), getCoupon);
router.get('/:id/stats', authenticate, authorize('admin'), getCouponStats);
router.post('/', authenticate, authorize('admin'), couponValidation, createCoupon);
router.put('/:id', authenticate, authorize('admin'), updateCouponValidation, updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

module.exports = router;