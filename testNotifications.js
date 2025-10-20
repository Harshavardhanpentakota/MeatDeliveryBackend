const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');
require('dotenv').config();

const testNotificationSystem = async () => {
  try {
    console.log('🔔 Testing Notification System...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery');
    console.log('✅ Database connected');

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@notification.com' });
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@notification.com',
        password: 'Test@123',
        phone: '+911234567890'
      });
      console.log('👤 Test user created');
    } else {
      console.log('👤 Using existing test user');
    }

    // Clean up existing test notifications
    await Notification.deleteMany({ recipient: testUser._id });
    console.log('🧹 Cleaned up existing test notifications');

    // Test 1: Welcome notification
    console.log('\n📝 Test 1: Welcome Notification');
    const welcomeNotification = await notificationService.sendWelcomeNotification(testUser._id);
    console.log(`✅ Welcome notification created: ${welcomeNotification.title}`);

    // Test 2: Order placed notification
    console.log('\n📝 Test 2: Order Placed Notification');
    const orderNotification = await notificationService.notifyOrderPlaced(testUser._id, {
      orderNumber: 'TEST001',
      orderId: new mongoose.Types.ObjectId(),
      amount: 999
    });
    console.log(`✅ Order notification created: ${orderNotification.title}`);

    // Test 3: Order status change notifications
    console.log('\n📝 Test 3: Order Status Change Notifications');
    const orderData = {
      orderNumber: 'TEST002',
      orderId: new mongoose.Types.ObjectId()
    };

    const statuses = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
    for (const status of statuses) {
      const statusNotification = await notificationService.notifyOrderStatusChange(
        testUser._id, 
        orderData, 
        status
      );
      console.log(`✅ ${status} notification: ${statusNotification.title}`);
    }

    // Test 4: Payment notification
    console.log('\n📝 Test 4: Payment Notifications');
    const paymentSuccessNotification = await notificationService.notifyPaymentStatus(testUser._id, {
      orderNumber: 'TEST003',
      orderId: new mongoose.Types.ObjectId(),
      amount: 750
    }, true);
    console.log(`✅ Payment success: ${paymentSuccessNotification.title}`);

    // Test 5: Promotion notification
    console.log('\n📝 Test 5: Promotion Notification');
    const promoNotification = await notificationService.notifyPromotion(testUser._id, {
      discount: 20,
      couponCode: 'TEST20'
    });
    console.log(`✅ Promotion notification: ${promoNotification.title}`);

    // Test 6: Custom notification
    console.log('\n📝 Test 6: Custom Notification');
    const customNotification = await notificationService.createNotification({
      recipientId: testUser._id,
      type: 'system_announcement',
      customTitle: 'System Maintenance Notice',
      customMessage: 'Our app will be under maintenance tonight from 2 AM to 4 AM. Sorry for any inconvenience.',
      data: { maintenanceStart: '2:00 AM', maintenanceEnd: '4:00 AM' },
      channels: { inApp: true, push: true, email: true },
      priority: 'high',
      category: 'system'
    });
    console.log(`✅ Custom notification: ${customNotification.title}`);

    // Verify notifications were created
    console.log('\n📊 Verification:');
    const totalNotifications = await Notification.countDocuments({ recipient: testUser._id });
    const unreadCount = await Notification.getUnreadCount(testUser._id);
    
    console.log(`   Total notifications created: ${totalNotifications}`);
    console.log(`   Unread notifications: ${unreadCount}`);
    console.log(`   Read notifications: ${totalNotifications - unreadCount}`);

    // Test notification queries
    console.log('\n📋 Testing Queries:');
    
    // Get notifications by category
    const orderNotifications = await Notification.find({ 
      recipient: testUser._id, 
      category: 'order' 
    });
    console.log(`   Order notifications: ${orderNotifications.length}`);
    
    const promotionNotifications = await Notification.find({ 
      recipient: testUser._id, 
      category: 'promotion' 
    });
    console.log(`   Promotion notifications: ${promotionNotifications.length}`);

    // Test mark as read functionality
    console.log('\n✅ Testing Mark as Read:');
    const firstNotification = await Notification.findOne({ recipient: testUser._id });
    await firstNotification.markAsRead();
    console.log(`   Marked notification as read: ${firstNotification.title}`);
    
    const newUnreadCount = await Notification.getUnreadCount(testUser._id);
    console.log(`   New unread count: ${newUnreadCount}`);

    // Display all notifications
    console.log('\n📋 All Test Notifications:');
    const allNotifications = await Notification.find({ recipient: testUser._id })
      .sort({ createdAt: -1 });
    
    allNotifications.forEach((notif, index) => {
      const readStatus = notif.isRead ? '✅' : '🔴';
      const priority = notif.priority.toUpperCase().padEnd(6);
      console.log(`   ${index + 1}. ${readStatus} [${priority}] ${notif.title}`);
      console.log(`      ${notif.message.substring(0, 60)}${notif.message.length > 60 ? '...' : ''}`);
      console.log(`      Category: ${notif.category} | Type: ${notif.type}`);
      console.log('');
    });

    console.log('🎉 All notification tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Integrate with your React Native app');
    console.log('   2. Set up push notification service (Firebase/OneSignal)');
    console.log('   3. Configure email service (SendGrid/SES)');
    console.log('   4. Add WebSocket for real-time notifications');
    console.log('   5. Test with your frontend components');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Notification.deleteMany({ recipient: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('\n❌ Notification test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testNotificationSystem();