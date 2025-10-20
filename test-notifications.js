// Test script to demonstrate proper notification API usage
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test function to register, login, and fetch notifications
async function testNotificationAPI() {
  try {
    console.log('🧪 Testing Notification API...\n');

    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'customer',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      }
    }).catch(err => {
      if (err.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  User already exists, proceeding to login...');
        return null;
      }
      throw err;
    });

    if (registerResponse) {
      console.log('   ✅ User registered successfully');
    }

    // Step 2: Login to get token
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('   ✅ Login successful, token obtained');

    // Step 3: Set up headers with token
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 4: Test notifications endpoints
    console.log('3️⃣ Testing notification endpoints...\n');

    // Get notifications with pagination
    console.log('   📄 GET /api/notifications?page=1&limit=20');
    const notificationsResponse = await axios.get(
      `${BASE_URL}/notifications?page=1&limit=20`,
      { headers: authHeaders }
    );
    console.log('   ✅ Response:', {
      success: notificationsResponse.data.success,
      message: notificationsResponse.data.message,
      count: notificationsResponse.data.data?.notifications?.length || 0,
      pagination: notificationsResponse.data.data?.pagination
    });

    // Get unread count
    console.log('\n   🔔 GET /api/notifications/unread-count');
    const unreadResponse = await axios.get(
      `${BASE_URL}/notifications/unread-count`,
      { headers: authHeaders }
    );
    console.log('   ✅ Response:', unreadResponse.data);

    // Get preferences
    console.log('\n   ⚙️  GET /api/notifications/preferences');
    const preferencesResponse = await axios.get(
      `${BASE_URL}/notifications/preferences`,
      { headers: authHeaders }
    );
    console.log('   ✅ Response:', {
      success: preferencesResponse.data.success,
      message: preferencesResponse.data.message
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 To use the API from your React Native app:');
    console.log('   1. Login to get token');
    console.log('   2. Include token in Authorization header');
    console.log('   3. Use the same endpoints with proper headers');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This is likely an authentication issue. Make sure to:');
      console.log('   - Include Authorization header: "Bearer <token>"');
      console.log('   - Use a valid JWT token from login response');
    }
  }
}

// Example of proper API call with authentication
function showProperAPIUsage() {
  console.log('\n📖 Proper API Usage Example:\n');
  console.log('// 1. Login first');
  console.log('const loginResponse = await fetch("http://localhost:5000/api/auth/login", {');
  console.log('  method: "POST",');
  console.log('  headers: { "Content-Type": "application/json" },');
  console.log('  body: JSON.stringify({ email: "user@example.com", password: "password123" })');
  console.log('});');
  console.log('const { token } = (await loginResponse.json()).data;');
  console.log('');
  console.log('// 2. Use token in notifications request');
  console.log('const notificationsResponse = await fetch("http://localhost:5000/api/notifications?page=1&limit=20", {');
  console.log('  headers: { "Authorization": `Bearer ${token}` }');
  console.log('});');
  console.log('const notifications = await notificationsResponse.json();');
  console.log('');
}

if (require.main === module) {
  showProperAPIUsage();
  testNotificationAPI();
}

module.exports = { testNotificationAPI };