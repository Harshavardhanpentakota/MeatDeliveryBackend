require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const DeliveryBoy = require('./models/DeliveryBoy');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const testAssignedOrders = async () => {
  try {
    await connectDB();
    
    const deliveryBoy = await DeliveryBoy.findOne({ isApproved: true });
    
    console.log('\n📦 Testing Assigned Orders API...\n');
    console.log(`Delivery Boy: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
    
    const activeOrders = await Order.find({
      'delivery.assignedTo': deliveryBoy._id,
      status: { $in: ['confirmed', 'preparing', 'out-for-delivery'] }
    }).populate('customer', 'firstName lastName');
    
    console.log(`\n✅ Active Orders: ${activeOrders.length}`);
    activeOrders.forEach(o => {
      console.log(`   - ${o.orderNumber}: ${o.status} (${o.customer.firstName})`);
    });
    
    const deliveredOrders = await Order.find({
      'delivery.assignedTo': deliveryBoy._id,
      status: 'delivered'
    });
    
    console.log(`\n📋 Delivered Orders (excluded): ${deliveredOrders.length}`);
    deliveredOrders.forEach(o => {
      console.log(`   - ${o.orderNumber}: ${o.status}`);
    });
    
    console.log('\n✨ GET /api/delivery/orders/assigned will return:', activeOrders.length, 'orders');
    console.log('   (Delivered orders are now excluded)');
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testAssignedOrders();
