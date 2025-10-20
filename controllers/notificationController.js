const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { asyncHandler, sendSuccess, sendError, paginate } = require('../utils/helpers');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user notifications with pagination
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { category, isRead, type } = req.query;
  
  // Build query
  let query = { recipient: req.user._id, isActive: true };
  
  if (category) query.category = category;
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (type) query.type = type;

  // Create mongoose query
  const mongoQuery = Notification.find(query)
    .populate('metadata.orderId', 'orderNumber status')
    .populate('metadata.productId', 'name price')
    .populate('metadata.couponId', 'code discount')
    .sort({ createdAt: -1 });

  // Paginate results
  const results = await paginate(mongoQuery, req);

  sendSuccess(res, 'Notifications retrieved successfully', results);
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  })
  .populate('metadata.orderId', 'orderNumber status pricing')
  .populate('metadata.productId', 'name price images')
  .populate('metadata.couponId', 'code discount expiresAt');

  if (!notification) {
    return sendError(res, 'Notification not found', 404);
  }

  // Auto-mark as read when viewed
  if (!notification.isRead) {
    await notification.markAsRead();
  }

  sendSuccess(res, 'Notification retrieved successfully', notification);
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return sendError(res, 'Notification not found', 404);
  }

  await notification.markAsRead();

  sendSuccess(res, 'Notification marked as read', notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.user._id);

  sendSuccess(res, 'All notifications marked as read', {
    modifiedCount: result.modifiedCount
  });
});

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);

  sendSuccess(res, 'Unread count retrieved successfully', { 
    unreadCount: count 
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return sendError(res, 'Notification not found', 404);
  }

  // Soft delete by setting isActive to false
  notification.isActive = false;
  await notification.save();

  sendSuccess(res, 'Notification deleted successfully');
});

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications/clear-all
 * @access  Private
 */
const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isActive: true },
    { isActive: false }
  );

  sendSuccess(res, 'All notifications cleared successfully', {
    modifiedCount: result.modifiedCount
  });
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getPreferences = asyncHandler(async (req, res) => {
  // This could be stored in User model or separate NotificationPreferences model
  const preferences = {
    categories: {
      order: { push: true, email: true, sms: false },
      payment: { push: true, email: true, sms: true },
      promotion: { push: true, email: false, sms: false },
      delivery: { push: true, email: false, sms: true },
      system: { push: true, email: false, sms: false }
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: {
      promotional: 'weekly', // daily, weekly, never
      updates: 'immediate'
    }
  };

  sendSuccess(res, 'Notification preferences retrieved successfully', preferences);
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  // TODO: Implement preferences update logic
  // This would typically update the User model or NotificationPreferences model

  sendSuccess(res, 'Notification preferences updated successfully', req.body);
});

/**
 * @desc    Send test notification (Admin only)
 * @route   POST /api/notifications/test
 * @access  Private (Admin)
 */
const sendTestNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, customTitle, customMessage, data } = req.body;

  const notification = await notificationService.createNotification({
    recipientId: recipientId || req.user._id,
    type: type || 'system_announcement',
    customTitle: customTitle || 'Test Notification',
    customMessage: customMessage || 'This is a test notification from the admin panel.',
    data: data || {},
    channels: { inApp: true, push: true }
  });

  sendSuccess(res, 'Test notification sent successfully', notification, 201);
});

/**
 * @desc    Send bulk notification (Admin only)
 * @route   POST /api/notifications/bulk
 * @access  Private (Admin)
 */
const sendBulkNotification = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { userIds, type, customTitle, customMessage, data, channels } = req.body;

  let targetUserIds = userIds;

  // If no specific users, send to all active users
  if (!userIds || userIds.length === 0) {
    const result = await notificationService.sendToAllUsers({
      type,
      customTitle,
      customMessage,
      data,
      channels
    });
    
    return sendSuccess(res, 'Bulk notification sent to all users', {
      totalSent: result.length,
      successful: result.filter(r => r.status === 'fulfilled').length,
      failed: result.filter(r => r.status === 'rejected').length
    });
  }

  // Send to specific users
  const result = await notificationService.sendBulkNotifications(targetUserIds, {
    type,
    customTitle,
    customMessage,
    data,
    channels
  });

  sendSuccess(res, 'Bulk notification sent successfully', {
    totalSent: result.length,
    successful: result.filter(r => r.status === 'fulfilled').length,
    failed: result.filter(r => r.status === 'rejected').length
  });
});

/**
 * @desc    Get notification statistics (Admin only)
 * @route   GET /api/notifications/stats
 * @access  Private (Admin)
 */
const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        readCount: {
          $sum: { $cond: ['$isRead', 1, 0] }
        },
        unreadCount: {
          $sum: { $cond: ['$isRead', 0, 1] }
        }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        readCount: 1,
        unreadCount: 1,
        readRate: {
          $multiply: [
            { $divide: ['$readCount', '$count'] },
            100
          ]
        }
      }
    }
  ]);

  const totalStats = await Notification.aggregate([
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        totalRead: { $sum: { $cond: ['$isRead', 1, 0] } },
        totalUnread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }
    }
  ]);

  sendSuccess(res, 'Notification statistics retrieved successfully', {
    byType: stats,
    overall: totalStats[0] || { totalNotifications: 0, totalRead: 0, totalUnread: 0 }
  });
});

module.exports = {
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
};