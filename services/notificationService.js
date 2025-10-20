const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.templates = {
      order_placed: {
        title: 'Order Placed Successfully! 🛒',
        message: 'Your order #{orderNumber} has been placed successfully. We\'ll notify you when it\'s confirmed.',
        category: 'order',
        priority: 'medium'
      },
      order_confirmed: {
        title: 'Order Confirmed ✅',
        message: 'Great news! Your order #{orderNumber} has been confirmed and is being prepared.',
        category: 'order', 
        priority: 'high'
      },
      order_preparing: {
        title: 'Order Being Prepared 👨‍🍳',
        message: 'Your delicious order #{orderNumber} is now being prepared by our chefs.',
        category: 'order',
        priority: 'medium'
      },
      order_out_for_delivery: {
        title: 'Order Out for Delivery 🚚',
        message: 'Your order #{orderNumber} is on its way! Expected delivery in 30-45 minutes.',
        category: 'delivery',
        priority: 'high'
      },
      order_delivered: {
        title: 'Order Delivered! 🎉',
        message: 'Your order #{orderNumber} has been delivered successfully. Enjoy your meal!',
        category: 'order',
        priority: 'high'
      },
      order_cancelled: {
        title: 'Order Cancelled ❌',
        message: 'Your order #{orderNumber} has been cancelled. Any payment will be refunded within 2-3 business days.',
        category: 'order',
        priority: 'high'
      },
      payment_successful: {
        title: 'Payment Successful 💳',
        message: 'Payment of ₹{amount} for order #{orderNumber} was processed successfully.',
        category: 'payment',
        priority: 'medium'
      },
      payment_failed: {
        title: 'Payment Failed ⚠️',
        message: 'Payment for order #{orderNumber} failed. Please try again or choose a different payment method.',
        category: 'payment',
        priority: 'urgent'
      },
      promotion: {
        title: 'Special Offer Just for You! 🎁',
        message: 'Get {discount}% off on your next order. Use code {couponCode}. Limited time offer!',
        category: 'promotion',
        priority: 'low'
      },
      coupon_expiring: {
        title: 'Coupon Expiring Soon! ⏰',
        message: 'Your coupon {couponCode} expires in 24 hours. Don\'t miss out on great savings!',
        category: 'promotion',
        priority: 'medium'
      },
      new_product: {
        title: 'New Product Available! 🥩',
        message: 'Check out our new {productName}. Fresh, premium quality meat delivered to your door.',
        category: 'promotion',
        priority: 'low'
      },
      delivery_delay: {
        title: 'Delivery Delay Notice 🕐',
        message: 'Your order #{orderNumber} is running slightly late. New estimated delivery: {estimatedTime}.',
        category: 'delivery',
        priority: 'high'
      },
      welcome: {
        title: 'Welcome to Meat Delivery! 🎉',
        message: 'Thanks for joining us! Get 10% off your first order with code WELCOME10.',
        category: 'system',
        priority: 'medium'
      }
    };
  }

  /**
   * Create a notification
   */
  async createNotification(data) {
    try {
      const {
        recipientId,
        type,
        customTitle,
        customMessage,
        data: notificationData = {},
        channels = { inApp: true, push: true },
        priority,
        category,
        metadata = {}
      } = data;

      // Get template or use custom content
      const template = this.templates[type];
      let title = customTitle;
      let message = customMessage;
      let notificationCategory = category;
      let notificationPriority = priority;

      if (template) {
        title = title || this.processTemplate(template.title, notificationData);
        message = message || this.processTemplate(template.message, notificationData);
        notificationCategory = notificationCategory || template.category;
        notificationPriority = notificationPriority || template.priority;
      }

      // Create notification document
      const notification = new Notification({
        recipient: recipientId,
        type,
        title,
        message,
        data: notificationData,
        priority: notificationPriority,
        category: notificationCategory,
        metadata,
        channels: {
          inApp: { sent: true, sentAt: new Date() },
          push: { sent: false },
          email: { sent: false },
          sms: { sent: false }
        }
      });

      await notification.save();

      // Send via different channels
      await this.sendViaChannels(notification, channels);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Process template with dynamic data
   */
  processTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Send notification via different channels
   */
  async sendViaChannels(notification, channels) {
    const promises = [];

    if (channels.push) {
      promises.push(this.sendPushNotification(notification));
    }

    if (channels.email) {
      promises.push(this.sendEmailNotification(notification));
    }

    if (channels.sms) {
      promises.push(this.sendSMSNotification(notification));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification) {
    try {
      // TODO: Implement push notification service (Firebase, OneSignal, etc.)
      console.log(`📱 Push notification sent: ${notification.title}`);
      
      // Use findByIdAndUpdate to avoid parallel save conflicts
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.push.sent': true,
        'channels.push.sentAt': new Date()
      });
    } catch (error) {
      console.error('Push notification failed:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.push.error': error.message
      });
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    try {
      // TODO: Implement email service (SendGrid, SES, etc.)
      console.log(`📧 Email notification sent: ${notification.title}`);
      
      // Use findByIdAndUpdate to avoid parallel save conflicts
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.email.sent': true,
        'channels.email.sentAt': new Date()
      });
    } catch (error) {
      console.error('Email notification failed:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.email.error': error.message
      });
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(notification) {
    try {
      // TODO: Implement SMS service (Twilio, etc.)
      console.log(`📱 SMS notification sent: ${notification.title}`);
      
      // Use findByIdAndUpdate to avoid parallel save conflicts
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.sms.sent': true,
        'channels.sms.sentAt': new Date()
      });
    } catch (error) {
      console.error('SMS notification failed:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'channels.sms.error': error.message
      });
    }
  }

  /**
   * Quick methods for common notifications
   */
  async notifyOrderPlaced(userId, orderData) {
    return this.createNotification({
      recipientId: userId,
      type: 'order_placed',
      data: orderData,
      channels: { inApp: true, push: true, email: true },
      metadata: { orderId: orderData.orderId }
    });
  }

  async notifyOrderStatusChange(userId, orderData, status) {
    const statusTypes = {
      confirmed: 'order_confirmed',
      preparing: 'order_preparing', 
      'out-for-delivery': 'order_out_for_delivery',
      delivered: 'order_delivered',
      cancelled: 'order_cancelled'
    };

    return this.createNotification({
      recipientId: userId,
      type: statusTypes[status] || 'order_confirmed',
      data: orderData,
      channels: { inApp: true, push: true },
      metadata: { orderId: orderData.orderId }
    });
  }

  async notifyPaymentStatus(userId, paymentData, success = true) {
    return this.createNotification({
      recipientId: userId,
      type: success ? 'payment_successful' : 'payment_failed',
      data: paymentData,
      channels: { inApp: true, push: true, email: success },
      metadata: { orderId: paymentData.orderId }
    });
  }

  async notifyPromotion(userId, promotionData) {
    return this.createNotification({
      recipientId: userId,
      type: 'promotion',
      data: promotionData,
      channels: { inApp: true, push: true },
      priority: 'low'
    });
  }

  async sendWelcomeNotification(userId) {
    return this.createNotification({
      recipientId: userId,
      type: 'welcome',
      data: {},
      channels: { inApp: true, push: true, email: true }
    });
  }

  /**
   * Bulk notification to multiple users
   */
  async sendBulkNotifications(userIds, notificationData) {
    const promises = userIds.map(userId => 
      this.createNotification({
        recipientId: userId,
        ...notificationData
      })
    );

    return Promise.allSettled(promises);
  }

  /**
   * Send notification to all users
   */
  async sendToAllUsers(notificationData) {
    const users = await User.find({ isActive: true }).select('_id');
    const userIds = users.map(user => user._id);
    
    return this.sendBulkNotifications(userIds, notificationData);
  }
}

module.exports = new NotificationService();