const express = require('express');
const mongoose = require('mongoose');
const { body } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  assignDelivery,
  getOrderStats
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  // Support both saved address ID and new address
  body('deliveryAddress')
    .custom((value, { req }) => {
      // If savedAddressId is provided, skip manual address validation
      if (req.body.savedAddressId) {
        if (!mongoose.Types.ObjectId.isValid(req.body.savedAddressId)) {
          throw new Error('Invalid saved address ID');
        }
        return true;
      }
      
      // Otherwise, validate manual address
      if (!value || typeof value !== 'object') {
        throw new Error('Delivery address is required');
      }
      
      const requiredFields = ['street', 'city', 'state', 'zipCode'];
      for (const field of requiredFields) {
        if (!value[field] || value[field].trim().length === 0) {
          throw new Error(`${field} is required in delivery address`);
        }
      }
      
      if (value.street.trim().length < 5) {
        throw new Error('Street address must be at least 5 characters');
      }
      
      if (value.zipCode && !/^\d{6}$/.test(value.zipCode.trim())) {
        throw new Error('Please provide a valid 6-digit PIN code');
      }
      
      return true;
    }),
    
  body('savedAddressId')
    .optional()
    .isMongoId()
    .withMessage('Invalid saved address ID'),
    
  body('contactInfo.phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('paymentMethod')
    .isIn(['cash-on-delivery', 'online', 'card'])
    .withMessage('Invalid payment method')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const assignDeliveryValidation = [
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('estimatedTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid estimated time format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// All order routes require authentication
router.use(authenticate);

// Routes
router.post('/', createOrderValidation, createOrder);
router.get('/', getOrders);
router.get('/stats', authorize('admin'), getOrderStats);
router.get('/:id', getOrder);
router.patch('/:id/status', authorize('admin'), updateOrderStatusValidation, updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/assign', authorize('admin'), assignDeliveryValidation, assignDelivery);

module.exports = router;