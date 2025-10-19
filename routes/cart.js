const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  applyCouponToCart,
  removeCouponFromCart
} = require('../controllers/cartController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const applyCouponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
];

// All cart routes require authentication
router.use(authenticate);

// Routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', addToCartValidation, addToCart);
router.put('/update/:itemId', updateCartItemValidation, updateCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);

// Coupon routes
router.post('/apply-coupon', applyCouponValidation, applyCouponToCart);
router.delete('/remove-coupon', removeCouponFromCart);

module.exports = router;