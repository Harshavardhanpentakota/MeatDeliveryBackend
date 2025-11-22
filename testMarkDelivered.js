require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const DeliveryBoy = require('./models/DeliveryBoy');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const testMarkDelivered = async () => {
  try {
    await connectDB();
    console.log('\n🧪 Testing Mark as Delivered Flow...\n');

    // Get the delivery boy
    const deliveryBoy = await DeliveryBoy.findOne({ isApproved: true });
    if (!deliveryBoy) {
      console.log('❌ No approved delivery boy found');
      process.exit(1);
    }
    console.log(`✅ Delivery Boy: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);

    // Get an assigned order in confirmed status
    const order = await Order.findOne({
      'delivery.assignedTo': deliveryBoy._id,
      status: 'confirmed'
    }).populate('customer', 'firstName lastName');

    if (!order) {
      console.log('❌ No confirmed assigned order found');
      console.log('💡 Make sure there is an order in confirmed status assigned to the delivery boy');
      process.exit(1);
    }

    console.log(`\n📦 Order: ${order.orderNumber}`);
    console.log(`   Current Status: ${order.status}`);
    console.log(`   Assigned To: ${order.delivery.assignedTo}`);
    console.log(`   Customer: ${order.customer.firstName} ${order.customer.lastName}`);

    // Simulate marking as delivered (same logic as controller)
    console.log('\n🚀 Simulating mark as delivered...');

    // Check if can be delivered
    if (!['confirmed', 'preparing', 'out-for-delivery'].includes(order.status)) {
      console.log(`❌ Cannot mark as delivered from ${order.status} status`);
      process.exit(1);
    }

    // Add out-for-delivery status if not already
    if (order.status !== 'out-for-delivery') {
      console.log('   ⏩ Auto-transitioning to out-for-delivery first');
      order.statusHistory.push({
        status: 'out-for-delivery',
        updatedBy: deliveryBoy._id,
        notes: 'Auto-transitioned to out-for-delivery',
        timestamp: new Date()
      });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.delivery.actualDeliveryTime = new Date();
    order.statusHistory.push({
      status: 'delivered',
      updatedBy: deliveryBoy._id,
      notes: 'Test delivery - marked as delivered',
      timestamp: new Date()
    });

    await order.save();

    console.log('\n✅ Order marked as delivered successfully!');
    console.log(`   New Status: ${order.status}`);
    console.log(`   Delivery Time: ${order.delivery.actualDeliveryTime}`);
    console.log('\n📋 Status History:');
    order.statusHistory.forEach(h => {
      console.log(`   - ${h.status} at ${h.timestamp} ${h.notes ? `(${h.notes})` : ''}`);
    });

    console.log('\n✨ Test completed successfully!');
    console.log(`\n📝 Order ${order.orderNumber} can now be marked as delivered directly from confirmed status`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testMarkDelivered();
