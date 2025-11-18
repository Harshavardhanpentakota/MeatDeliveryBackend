require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const DeliveryBoy = require('./models/DeliveryBoy');
const connectDB = require('./config/database');

const checkOrder = async () => {
  try {
    await connectDB();
    
    const orderId = process.argv[2];
    if (!orderId) {
      console.log('Usage: node checkOrder.js <orderId>');
      process.exit(1);
    }
    
    const order = await Order.findById(orderId)
      .populate('customer', 'firstName lastName email phone')
      .populate('delivery.assignedTo', 'firstName lastName phone');
    
    if (!order) {
      console.log('Order not found');
      process.exit(1);
    }
    
    console.log('\n📦 Order Details:');
    console.log('Order Number:', order.orderNumber);
    console.log('Status:', order.status);
    console.log('Created At:', order.createdAt);
    console.log('Customer:', order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A');
    console.log('Assigned To (ID):', order.delivery.assignedTo ? order.delivery.assignedTo._id || order.delivery.assignedTo : 'Not assigned');
    console.log('Assigned To (Name):', order.delivery.assignedTo ? `${order.delivery.assignedTo.firstName} ${order.delivery.assignedTo.lastName}` : 'Not assigned');
    console.log('Total:', `₹${order.pricing.total.toFixed(2)}`);
    console.log('\nStatus History:');
    order.statusHistory.forEach(h => {
      console.log(`  - ${h.status} at ${h.timestamp} ${h.notes ? `(${h.notes})` : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkOrder();
