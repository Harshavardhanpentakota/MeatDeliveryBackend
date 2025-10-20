const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testRegistrationWithAddress = async () => {
  try {
    console.log('🧪 Testing Registration with Address...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery');
    console.log('✅ Database connected');

    // Test data matching your payload
    const testUserData = {
      firstName: "TestUser",
      lastName: "Registration",
      email: "testregistration@example.com",
      password: "TestPass@123",
      phone: "+911234567890",
      savedAddresses: [{
        label: 'Home',
        street: "123 Test Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
        landmark: "Near Test Mall",
        isDefault: true
      }]
    };

    // Delete existing test user if exists
    await User.deleteOne({ email: testUserData.email });
    console.log('🗑️  Cleaned up existing test data');

    // Create user with saved address
    const user = await User.create(testUserData);
    console.log('✅ User created successfully');

    // Fetch the created user to verify address was saved
    const createdUser = await User.findById(user._id);
    
    console.log('\n📊 Test Results:');
    console.log(`   User ID: ${createdUser._id}`);
    console.log(`   Name: ${createdUser.firstName} ${createdUser.lastName}`);
    console.log(`   Email: ${createdUser.email}`);
    console.log(`   Phone: ${createdUser.phone}`);
    console.log(`   Saved Addresses: ${createdUser.savedAddresses.length}`);
    
    if (createdUser.savedAddresses.length > 0) {
      const address = createdUser.savedAddresses[0];
      console.log('\n🏠 Saved Address Details:');
      console.log(`   Label: ${address.label}`);
      console.log(`   Street: ${address.street}`);
      console.log(`   City: ${address.city}`);
      console.log(`   State: ${address.state}`);
      console.log(`   ZIP Code: ${address.zipCode}`);
      console.log(`   Is Default: ${address.isDefault}`);
      console.log('\n🎉 SUCCESS: Address saved correctly to savedAddresses array!');
    } else {
      console.log('\n❌ FAILED: No addresses found in savedAddresses array');
    }

    // Clean up test data
    await User.deleteOne({ email: testUserData.email });
    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testRegistrationWithAddress();