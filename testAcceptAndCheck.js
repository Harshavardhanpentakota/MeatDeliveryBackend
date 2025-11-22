const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const deliveryBoyEmail = 'testdelivery@example.com';
const deliveryBoyPassword = 'test123456';

async function testFlow() {
  try {
    console.log('\n🔑 Step 1: Login as delivery boy...');
    const loginRes = await axios.post(`${API_URL}/delivery/login`, {
      email: deliveryBoyEmail,
      password: deliveryBoyPassword
    });
    
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully');

    // Headers with auth
    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n📋 Step 2: Check assigned orders (should be empty)...');
    const assignedBefore = await axios.get(`${API_URL}/delivery/orders/assigned`, { headers });
    console.log('Response structure:', JSON.stringify(assignedBefore.data, null, 2));
    console.log(`Found ${assignedBefore.data.data ? assignedBefore.data.data.length : 0} assigned orders`);

    console.log('\n📦 Step 3: Get pending orders...');
    const pendingRes = await axios.get(`${API_URL}/delivery/orders/pending`, { headers });
    console.log(`Found ${pendingRes.data.data.length} pending orders`);
    
    if (pendingRes.data.data.length === 0) {
      console.log('❌ No pending orders to accept. Run seedOrders.js first.');
      return;
    }

    const firstOrder = pendingRes.data.data[0];
    console.log(`\n✅ Step 4: Accepting order ${firstOrder.orderNumber}...`);
    
    const acceptRes = await axios.post(
      `${API_URL}/delivery/orders/${firstOrder._id}/accept`,
      {},
      { headers }
    );
    
    console.log('Accept response:', JSON.stringify(acceptRes.data, null, 2));

    console.log('\n📋 Step 5: Check assigned orders (should have 1 order)...');
    const assignedAfter = await axios.get(`${API_URL}/delivery/orders/assigned`, { headers });
    console.log('Response structure:', JSON.stringify(assignedAfter.data, null, 2));
    console.log(`\n✅ Found ${assignedAfter.data.data.length} assigned order(s)`);
    
    if (assignedAfter.data.data.length > 0) {
      console.log('\n📦 Assigned Order Details:');
      assignedAfter.data.data.forEach(order => {
        console.log(`   Order: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: ₹${order.total}`);
        console.log(`   Customer: ${order.user ? order.user.name : 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testFlow();
