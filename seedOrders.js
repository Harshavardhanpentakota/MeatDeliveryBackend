require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const seedOrders = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get a sample user (customer)
    let customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.log('No customer found, creating one...');
      customer = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'customer',
        isVerified: true
      });
    }

    // Get some products
    let products = await Product.find().limit(5);
    if (products.length === 0) {
      console.log('No products found. Please seed products first using: node seedProducts.js');
      process.exit(1);
    }

    // Clear existing orders (optional)
    console.log('Clearing existing orders...');
    await Order.deleteMany({});

    const sampleOrders = [];

    // Create orders from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 30, 0, 0);

    // Create orders from today
    const today = new Date();
    today.setHours(9, 15, 0, 0);

    const todayLater = new Date();
    todayLater.setHours(14, 45, 0, 0);

    // Sample addresses
    const addresses = [
      {
        street: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        landmark: 'Near Central Mall',
        instructions: 'Please call before arriving'
      },
      {
        street: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
        landmark: 'Opposite Metro Station',
        instructions: 'Ring doorbell twice'
      },
      {
        street: '789 Garden Road, Block C',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
        landmark: 'Behind Tech Park',
        instructions: 'Contact security at gate'
      },
      {
        street: '321 Lake View Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        country: 'India',
        landmark: 'Near Lake View Park',
        instructions: 'Deliver to reception'
      }
    ];

    // Order 1 - Yesterday, Pending
    const product1 = products[0];
    const product2 = products.length > 1 ? products[1] : products[0];
    
    const order1Items = [
      {
        product: product1._id,
        quantity: 2,
        priceAtTime: product1.price,
        subtotal: product1.price * 2
      },
      {
        product: product2._id,
        quantity: 1,
        priceAtTime: product2.price,
        subtotal: product2.price * 1
      }
    ];
    
    const order1Subtotal = order1Items.reduce((sum, item) => sum + item.subtotal, 0);
    const order1DeliveryFee = 50;
    const order1Tax = order1Subtotal * 0.05;
    const order1Total = order1Subtotal + order1DeliveryFee + order1Tax;

    sampleOrders.push({
      customer: customer._id,
      items: order1Items,
      deliveryAddress: addresses[0],
      contactInfo: {
        phone: customer.phone,
        alternatePhone: '9876543211'
      },
      pricing: {
        subtotal: order1Subtotal,
        deliveryFee: order1DeliveryFee,
        tax: order1Tax,
        discount: 0,
        total: order1Total
      },
      status: 'pending',
      paymentInfo: {
        method: 'cash-on-delivery',
        status: 'pending'
      },
      delivery: {},
      specialInstructions: 'Please pack items separately',
      createdAt: yesterday,
      updatedAt: yesterday
    });

    // Order 2 - Yesterday, Pending
    const product3 = products.length > 2 ? products[2] : products[0];
    
    const order2Items = [
      {
        product: product3._id,
        quantity: 3,
        priceAtTime: product3.price,
        subtotal: product3.price * 3
      }
    ];
    
    const order2Subtotal = order2Items.reduce((sum, item) => sum + item.subtotal, 0);
    const order2DeliveryFee = 50;
    const order2Tax = order2Subtotal * 0.05;
    const order2Total = order2Subtotal + order2DeliveryFee + order2Tax;

    const yesterdayAfternoon = new Date(yesterday);
    yesterdayAfternoon.setHours(15, 20, 0, 0);

    sampleOrders.push({
      customer: customer._id,
      items: order2Items,
      deliveryAddress: addresses[1],
      contactInfo: {
        phone: customer.phone
      },
      pricing: {
        subtotal: order2Subtotal,
        deliveryFee: order2DeliveryFee,
        tax: order2Tax,
        discount: 0,
        total: order2Total
      },
      status: 'pending',
      paymentInfo: {
        method: 'online',
        status: 'pending'
      },
      delivery: {},
      createdAt: yesterdayAfternoon,
      updatedAt: yesterdayAfternoon
    });

    // Order 3 - Today, Pending
    const product4 = products.length > 3 ? products[3] : products[0];
    const product5 = products.length > 4 ? products[4] : products[0];
    
    const order3Items = [
      {
        product: product4._id,
        quantity: 1,
        priceAtTime: product4.price,
        subtotal: product4.price * 1
      },
      {
        product: product5._id,
        quantity: 2,
        priceAtTime: product5.price,
        subtotal: product5.price * 2
      }
    ];
    
    const order3Subtotal = order3Items.reduce((sum, item) => sum + item.subtotal, 0);
    const order3DeliveryFee = 50;
    const order3Tax = order3Subtotal * 0.05;
    const order3Total = order3Subtotal + order3DeliveryFee + order3Tax;

    sampleOrders.push({
      customer: customer._id,
      items: order3Items,
      deliveryAddress: addresses[2],
      contactInfo: {
        phone: customer.phone,
        alternatePhone: '9876543212'
      },
      pricing: {
        subtotal: order3Subtotal,
        deliveryFee: order3DeliveryFee,
        tax: order3Tax,
        discount: 0,
        total: order3Total
      },
      status: 'pending',
      paymentInfo: {
        method: 'cash-on-delivery',
        status: 'pending'
      },
      delivery: {},
      specialInstructions: 'Handle with care - fresh meat',
      createdAt: today,
      updatedAt: today
    });

    // Order 4 - Today, Pending
    const order4Items = [
      {
        product: product1._id,
        quantity: 1,
        priceAtTime: product1.price,
        subtotal: product1.price * 1
      }
    ];
    
    const order4Subtotal = order4Items.reduce((sum, item) => sum + item.subtotal, 0);
    const order4DeliveryFee = 50;
    const order4Tax = order4Subtotal * 0.05;
    const order4Discount = 50;
    const order4Total = order4Subtotal + order4DeliveryFee + order4Tax - order4Discount;

    sampleOrders.push({
      customer: customer._id,
      items: order4Items,
      deliveryAddress: addresses[3],
      contactInfo: {
        phone: customer.phone
      },
      pricing: {
        subtotal: order4Subtotal,
        deliveryFee: order4DeliveryFee,
        tax: order4Tax,
        discount: order4Discount,
        total: order4Total
      },
      status: 'pending',
      paymentInfo: {
        method: 'online',
        status: 'completed',
        transactionId: 'TXN' + Date.now(),
        paidAt: todayLater
      },
      delivery: {},
      createdAt: todayLater,
      updatedAt: todayLater
    });

    // Order 5 - Two days ago (should NOT appear in pending list)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(11, 0, 0, 0);

    const order5Items = [
      {
        product: product2._id,
        quantity: 2,
        priceAtTime: product2.price,
        subtotal: product2.price * 2
      }
    ];
    
    const order5Subtotal = order5Items.reduce((sum, item) => sum + item.subtotal, 0);
    const order5DeliveryFee = 50;
    const order5Tax = order5Subtotal * 0.05;
    const order5Total = order5Subtotal + order5DeliveryFee + order5Tax;

    sampleOrders.push({
      customer: customer._id,
      items: order5Items,
      deliveryAddress: addresses[0],
      contactInfo: {
        phone: customer.phone
      },
      pricing: {
        subtotal: order5Subtotal,
        deliveryFee: order5DeliveryFee,
        tax: order5Tax,
        discount: 0,
        total: order5Total
      },
      status: 'pending',
      paymentInfo: {
        method: 'cash-on-delivery',
        status: 'pending'
      },
      delivery: {},
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo
    });

    // Insert orders
    const createdOrders = [];
    let orderCount = await Order.countDocuments();
    
    for (const orderData of sampleOrders) {
      orderCount++;
      orderData.orderNumber = `MD${Date.now()}${String(orderCount).padStart(4, '0')}`;
      orderData.statusHistory = [{
        status: orderData.status,
        timestamp: orderData.createdAt
      }];
      
      const order = await Order.create(orderData);
      createdOrders.push(order);
      
      // Small delay to ensure unique timestamps in order numbers
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`\n✅ Successfully created ${createdOrders.length} sample orders:`);
    console.log('\nOrders from YESTERDAY (should appear in pending):');
    createdOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return orderDate.toDateString() === y.toDateString();
    }).forEach(order => {
      console.log(`  - Order ${order.orderNumber}: ₹${order.pricing.total.toFixed(2)} (${order.status})`);
    });

    console.log('\nOrders from TODAY (should appear in pending):');
    createdOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const t = new Date();
      return orderDate.toDateString() === t.toDateString();
    }).forEach(order => {
      console.log(`  - Order ${order.orderNumber}: ₹${order.pricing.total.toFixed(2)} (${order.status})`);
    });

    console.log('\nOrders from BEFORE YESTERDAY (should NOT appear in pending):');
    createdOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const t = new Date();
      return orderDate < y && orderDate.toDateString() !== t.toDateString();
    }).forEach(order => {
      console.log(`  - Order ${order.orderNumber}: ₹${order.pricing.total.toFixed(2)} (${order.status})`);
    });

    console.log('\n✨ Sample orders seeded successfully!');
    console.log('\nYou can now test the delivery boy endpoints:');
    console.log('  GET /api/delivery/orders/pending - Should show 4 orders (yesterday + today)');
    console.log('  POST /api/delivery/orders/:orderId/accept - To assign an order');
    console.log('  GET /api/delivery/orders/assigned - To see assigned orders');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();
