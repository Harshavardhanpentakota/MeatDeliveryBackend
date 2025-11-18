require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const DeliveryBoy = require('./models/DeliveryBoy');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const testDeliveryFlow = async () => {
  try {
    await connectDB();
    console.log('\n🔍 Testing Delivery Boy Flow...\n');

    // 1. Check for delivery boys
    const deliveryBoys = await DeliveryBoy.find({ isApproved: true });
    if (deliveryBoys.length === 0) {
      console.log('❌ No approved delivery boys found');
      console.log('💡 Tip: Create a delivery boy first using POST /api/delivery/register');
      process.exit(1);
    }
    
    const deliveryBoy = deliveryBoys[0];
    console.log(`✅ Found delivery boy: ${deliveryBoy.firstName} ${deliveryBoy.lastName} (ID: ${deliveryBoy._id})`);

    // 2. Get pending orders (yesterday + today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const pendingOrders = await Order.find({
      status: 'pending',
      'delivery.assignedTo': { $exists: false },
      createdAt: {
        $gte: yesterday,
        $lte: endOfToday
      }
    }).populate('customer', 'firstName lastName');

    console.log(`\n📋 Pending Orders (Available for Assignment): ${pendingOrders.length}`);
    if (pendingOrders.length === 0) {
      console.log('❌ No pending orders available');
      console.log('💡 Tip: Run "node seedOrders.js" to create sample orders');
      process.exit(1);
    }

    pendingOrders.forEach(order => {
      console.log(`   - ${order.orderNumber}: ₹${order.pricing.total.toFixed(2)} (${order.status})`);
    });

    // 3. Simulate accepting an order
    const orderToAccept = pendingOrders[0];
    console.log(`\n🎯 Simulating acceptance of order: ${orderToAccept.orderNumber}`);
    
    orderToAccept.delivery.assignedTo = deliveryBoy._id;
    orderToAccept.delivery.estimatedTime = new Date(Date.now() + 45 * 60000);
    orderToAccept.status = 'confirmed';
    orderToAccept.statusHistory.push({
      status: 'confirmed',
      updatedBy: deliveryBoy._id,
      notes: 'Order assigned to delivery boy (test)'
    });
    
    await orderToAccept.save();
    console.log('✅ Order accepted and assigned');

    // 4. Get assigned orders for this delivery boy
    const assignedOrders = await Order.find({
      'delivery.assignedTo': deliveryBoy._id,
      status: { $in: ['confirmed', 'preparing', 'out-for-delivery', 'delivered'] }
    })
      .populate('customer', 'firstName lastName')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    console.log(`\n✅ Assigned Orders for ${deliveryBoy.firstName}: ${assignedOrders.length}`);
    assignedOrders.forEach(order => {
      console.log(`   - ${order.orderNumber}: ₹${order.pricing.total.toFixed(2)} (${order.status})`);
      console.log(`     Customer: ${order.customer.firstName} ${order.customer.lastName}`);
      console.log(`     Items: ${order.items.length} item(s)`);
      console.log(`     Assigned: ${order.delivery.assignedTo ? 'Yes' : 'No'}`);
    });

    // 5. Test getting order by ID
    console.log(`\n🔍 Testing order retrieval by ID: ${orderToAccept._id}`);
    const retrievedOrder = await Order.findById(orderToAccept._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('delivery.assignedTo', 'firstName lastName phone')
      .populate('items.product', 'name price');

    if (!retrievedOrder) {
      console.log('❌ Order not found');
    } else {
      console.log('✅ Order retrieved successfully:');
      console.log(`   Order Number: ${retrievedOrder.orderNumber}`);
      console.log(`   Status: ${retrievedOrder.status}`);
      console.log(`   Customer: ${retrievedOrder.customer.firstName} ${retrievedOrder.customer.lastName}`);
      console.log(`   Assigned To: ${retrievedOrder.delivery.assignedTo ? `${retrievedOrder.delivery.assignedTo.firstName} ${retrievedOrder.delivery.assignedTo.lastName}` : 'Not assigned'}`);
      console.log(`   Assigned To ID: ${retrievedOrder.delivery.assignedTo ? retrievedOrder.delivery.assignedTo._id : 'None'}`);
      console.log(`   Total: ₹${retrievedOrder.pricing.total.toFixed(2)}`);
    }

    // 6. Verify authorization logic
    console.log(`\n🔐 Authorization Check:`);
    if (retrievedOrder.delivery.assignedTo) {
      const isAssignedToDeliveryBoy = retrievedOrder.delivery.assignedTo._id.toString() === deliveryBoy._id.toString();
      console.log(`   Delivery Boy ID: ${deliveryBoy._id}`);
      console.log(`   Assigned To ID: ${retrievedOrder.delivery.assignedTo._id}`);
      console.log(`   Match: ${isAssignedToDeliveryBoy ? '✅ Yes' : '❌ No'}`);
      
      if (isAssignedToDeliveryBoy) {
        console.log('   ✅ Delivery boy CAN access this order');
      } else {
        console.log('   ❌ Delivery boy CANNOT access this order');
      }
    } else {
      console.log('   ❌ Order has no assigned delivery boy');
    }

    // 7. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Total Pending Orders: ${pendingOrders.length}`);
    console.log(`Orders Assigned to ${deliveryBoy.firstName}: ${assignedOrders.length}`);
    console.log(`Test Order ID: ${orderToAccept._id}`);
    console.log(`Test Order Number: ${orderToAccept.orderNumber}`);
    console.log('\n✨ Test completed successfully!');
    console.log('\n📝 You can now test these endpoints:');
    console.log(`   GET /api/delivery/orders/pending - Should show ${pendingOrders.length - 1} order(s)`);
    console.log(`   GET /api/delivery/orders/assigned - Should show ${assignedOrders.length} order(s)`);
    console.log(`   GET /api/orders/${orderToAccept._id} - Should return order details`);
    console.log(`   PUT /api/delivery/orders/${orderToAccept._id}/out-for-delivery - Mark as out for delivery`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testDeliveryFlow();
