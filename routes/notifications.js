const express = require('express');
const { body } = require('express-validator');
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences,
  sendTestNotification,
  sendBulkNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const preferencesValidation = [
  body('categories')
    .optional()
    .isObject()
    .withMessage('Categories must be an object'),
  body('quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),
  body('quietHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('quietHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

const testNotificationValidation = [
  body('recipientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('type')
    .optional()
    .isIn([
      'order_placed', 'order_confirmed', 'order_preparing', 'order_out_for_delivery',
      'order_delivered', 'order_cancelled', 'payment_successful', 'payment_failed',
      'promotion', 'coupon_expiring', 'new_product', 'delivery_delay', 'system_announcement'
    ])
    .withMessage('Invalid notification type'),
  body('customTitle')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('customMessage')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
];

const bulkNotificationValidation = [
  body('type')
    .isIn([
      'order_placed', 'order_confirmed', 'order_preparing', 'order_out_for_delivery',
      'order_delivered', 'order_cancelled', 'payment_successful', 'payment_failed',
      'promotion', 'coupon_expiring', 'new_product', 'delivery_delay', 'system_announcement'
    ])
    .withMessage('Invalid notification type'),
  body('customTitle')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('customMessage')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('userIds')
    .optional()
    .isArray()
    .withMessage('User IDs must be an array'),
  body('userIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID in array')
];

// All notification routes require authentication
router.use(authenticate);

// User notification routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', preferencesValidation, updatePreferences);
router.patch('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.get('/:id', getNotification);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin notification routes
router.post('/test', authorize('admin'), testNotificationValidation, sendTestNotification);
router.post('/bulk', authorize('admin'), bulkNotificationValidation, sendBulkNotification);
router.get('/admin/stats', authorize('admin'), getNotificationStats);

module.exports = router;