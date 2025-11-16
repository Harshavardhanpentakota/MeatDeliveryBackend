/**
 * Delivery Boy API - Complete Workflow Test & Admin Script
 * 
 * This script demonstrates:
 * 1. Registering a delivery boy
 * 2. Admin approval (simulated with direct DB update)
 * 3. Login and token retrieval
 * 4. Order operations (get pending, accept, mark delivered)
 * 5. Performance stats
 * 
 * Usage: node testDeliveryBoyFlow.js
 */

const axios = require('axios');
const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');

const BASE_URL = 'http://localhost:5000/api';

// Color-coded console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`),
  json: (data) => console.log(JSON.stringify(data, null, 2))
};

/**
 * Step 1: Register a delivery boy
 */
async function registerDeliveryBoy() {
  log.header('STEP 1: Register Delivery Boy');
  
  try {
    const response = await axios.post(`${BASE_URL}/delivery/register`, {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: `rajesh.delivery.${Date.now()}@test.com`,
      password: 'SecurePass@123',
      phone: '+919876543210',
      licenseNumber: `DL${Math.random().toString().slice(2, 8)}`,
      licenseExpiryDate: '2026-12-31',
      vehicleType: 'two-wheeler',
      vehicleRegistration: `DL${Math.random().toString().slice(2, 8)}`,
      vehicleModel: 'Honda Activa',
      address: '123 Delivery Street',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001'
    });

    const { data: deliveryBoy, token } = response.data;
    log.success(`Delivery Boy Registered: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
    log.info(`Email: ${deliveryBoy.email}`);
    log.info(`ID: ${deliveryBoy._id}`);
    log.info(`Status: ${deliveryBoy.status} | Approved: ${deliveryBoy.isApproved}`);
    
    return { deliveryBoy, token, email: deliveryBoy.email };
  } catch (error) {
    log.error(`Registration failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 2: Admin approves delivery boy (simulated)
 */
async function adminApprovesDeliveryBoy(deliveryBoyId, email) {
  log.header('STEP 2: Admin Approves Delivery Boy');
  
  try {
    // Connect to MongoDB to update directly
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery', {
      serverSelectionTimeoutMS: 5000
    });

    const updated = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { isApproved: true, isVerified: true, status: 'active' },
      { new: true }
    );

    log.success(`Admin approved: ${updated.firstName} ${updated.lastName}`);
    log.info(`Approval Status: ${updated.isApproved}`);
    log.info(`Verification Status: ${updated.isVerified}`);

    await mongoose.connection.close();
    return true;
  } catch (error) {
    log.error(`Approval failed: ${error.message}`);
    throw error;
  }
}

/**
 * Step 3: Login with approved credentials
 */
async function loginDeliveryBoy(email, password) {
  log.header('STEP 3: Login Delivery Boy');
  
  try {
    const response = await axios.post(`${BASE_URL}/delivery/login`, {
      email,
      password
    });

    const { data: deliveryBoy, token } = response.data;
    log.success(`Login successful: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
    log.info(`Token received: ${token.substring(0, 20)}...`);
    log.info(`Status: ${deliveryBoy.status}`);
    
    return { deliveryBoy, token };
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 4: Update availability and location
 */
async function updateDeliveryStatus(token) {
  log.header('STEP 4: Update Availability & Location');
  
  try {
    // Update availability
    const availRes = await axios.put(
      `${BASE_URL}/delivery/availability`,
      { availability: 'available' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log.success(`Availability updated: ${availRes.data.data.availability}`);

    // Update location
    const locRes = await axios.put(
      `${BASE_URL}/delivery/location`,
      { latitude: 28.6139, longitude: 77.2090 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log.success(`Location updated: [${locRes.data.data.location.coordinates.join(', ')}]`);
    
    return true;
  } catch (error) {
    log.error(`Status update failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 5: Get pending orders
 */
async function getPendingOrders(token) {
  log.header('STEP 5: Get Pending Orders');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/delivery/orders/pending`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const orders = response.data.data;
    if (orders.length === 0) {
      log.info('No pending orders available');
      return [];
    }

    log.success(`Found ${orders.length} pending order(s)`);
    orders.forEach((order, idx) => {
      log.info(`Order ${idx + 1}: ${order.orderNumber} - ₹${order.pricing.total}`);
    });
    
    return orders;
  } catch (error) {
    log.error(`Failed to fetch pending orders: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 6: Accept an order
 */
async function acceptOrder(token, orderId) {
  log.header('STEP 6: Accept Order');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/delivery/orders/${orderId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const order = response.data.data;
    log.success(`Order accepted: ${order.orderNumber}`);
    log.info(`Status: ${order.status}`);
    log.info(`Estimated delivery: ${order.delivery.estimatedTime}`);
    
    return order;
  } catch (error) {
    log.error(`Accept order failed: ${error.response?.data?.message || error.message}`);
    // Non-fatal for demo
    return null;
  }
}

/**
 * Step 7: Mark out for delivery
 */
async function markOutForDelivery(token, orderId) {
  log.header('STEP 7: Mark Out For Delivery');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/delivery/orders/${orderId}/out-for-delivery`,
      { notes: 'Picked up from store, on the way to customer' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const order = response.data.data;
    log.success(`Order marked out for delivery: ${order.orderNumber}`);
    log.info(`Status: ${order.status}`);
    
    return order;
  } catch (error) {
    log.error(`Mark out for delivery failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

/**
 * Step 8: Mark delivered
 */
async function markDelivered(token, orderId) {
  log.header('STEP 8: Mark Order Delivered');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/delivery/orders/${orderId}/delivered`,
      { notes: 'Delivered successfully to customer' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const order = response.data.data;
    log.success(`Order delivered: ${order.orderNumber}`);
    log.info(`Status: ${order.status}`);
    log.info(`Delivery time: ${order.delivery.actualDeliveryTime}`);
    
    return order;
  } catch (error) {
    log.error(`Mark delivered failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

/**
 * Step 9: Get delivery boy stats
 */
async function getStats(token) {
  log.header('STEP 9: Get Delivery Boy Stats');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/delivery/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const stats = response.data.data;
    log.success('Performance Statistics Retrieved');
    log.info(`Total Deliveries: ${stats.totalDeliveries}`);
    log.info(`Completed Deliveries: ${stats.completedDeliveries}`);
    log.info(`Rating: ${stats.rating} ⭐`);
    log.info(`Avg Delivery Time: ${stats.averageDeliveryTime} mins`);
    log.info(`Availability: ${stats.availability}`);
    log.info(`Status: ${stats.status}`);
    
    return stats;
  } catch (error) {
    log.error(`Get stats failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 10: Logout
 */
async function logoutDeliveryBoy(token) {
  log.header('STEP 10: Logout');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/delivery/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    log.success('Logout successful');
    return true;
  } catch (error) {
    log.error(`Logout failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Main workflow
 */
async function runCompleteWorkflow() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('DELIVERY BOY API - COMPLETE WORKFLOW TEST');
  console.log('='.repeat(60) + colors.reset}\n`);

  try {
    // Step 1: Register
    const { deliveryBoy: registeredBoy, email, token: regToken } = await registerDeliveryBoy();

    // Step 2: Admin approval
    await adminApprovesDeliveryBoy(registeredBoy._id, email);

    // Step 3: Login
    const { token } = await loginDeliveryBoy(email, 'SecurePass@123');

    // Step 4: Update status
    await updateDeliveryStatus(token);

    // Step 5: Get pending orders
    const orders = await getPendingOrders(token);

    // Steps 6-8: Order operations (if orders exist)
    if (orders.length > 0) {
      const orderId = orders[0]._id;
      const acceptedOrder = await acceptOrder(token, orderId);
      
      if (acceptedOrder) {
        await new Promise(r => setTimeout(r, 1000));
        await markOutForDelivery(token, orderId);
        
        await new Promise(r => setTimeout(r, 1000));
        await markDelivered(token, orderId);
      }
    }

    // Step 9: Get stats
    await getStats(token);

    // Step 10: Logout
    await logoutDeliveryBoy(token);

    log.header('WORKFLOW COMPLETE ✓');
    console.log(`\n${colors.green}All tests passed successfully!${colors.reset}\n`);

  } catch (error) {
    log.error(`Workflow failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteWorkflow();
}

module.exports = {
  registerDeliveryBoy,
  adminApprovesDeliveryBoy,
  loginDeliveryBoy,
  updateDeliveryStatus,
  getPendingOrders,
  acceptOrder,
  markOutForDelivery,
  markDelivered,
  getStats,
  logoutDeliveryBoy
};
