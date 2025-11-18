require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const DeliveryBoy = require('./models/DeliveryBoy');
const connectDB = require('./config/database');

const listPendingOrders = async () => {
  try {
    await connectDB();
    
    // Get start of yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Get end of today
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
      .sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('\n❌ No pending orders available for assignment');
      console.log('\nTip: Run "node seedOrders.js" to create sample orders');
    } else {
      console.log(`\n✅ Found ${orders.length} pending order(s) available for assignment:\n`);
      orders.forEach(order => {
        console.log(`📦 Order ID: ${order._id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log(`   Customer: ${order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A'}`);
        console.log(`   Total: ₹${order.pricing.total.toFixed(2)}`);
        console.log(`   Assigned: ${order.delivery.assignedTo ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listPendingOrders();
