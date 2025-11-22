const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');
require('dotenv').config();

async function createTestDeliveryBoy() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test delivery boy exists
    let deliveryBoy = await DeliveryBoy.findOne({ phone: '+919999777777' });
    
    if (deliveryBoy) {
      console.log('\n📦 Test delivery boy already exists:');
      console.log(`   Phone: ${deliveryBoy.phone}`);
      console.log(`   Email: ${deliveryBoy.email}`);
      console.log(`   Status: ${deliveryBoy.status}`);
      console.log(`   Approved: ${deliveryBoy.isApproved}`);
      console.log(`   Verified: ${deliveryBoy.isVerified}`);
      
      // Update to approved if not already
      if (!deliveryBoy.isApproved) {
        deliveryBoy.isApproved = true;
        deliveryBoy.isVerified = true;
        await deliveryBoy.save();
        console.log('\n✅ Updated to approved status');
      }
    } else {
      // Create new test delivery boy
      deliveryBoy = new DeliveryBoy({
        firstName: 'Test',
        lastName: 'Delivery',
        email: 'testdelivery@example.com',
        password: 'test123456',
        phone: '+919999777777',
        license: {
          number: 'DL123456TEST',
          expiryDate: new Date('2026-12-31')
        },
        vehicle: {
          type: 'two-wheeler',
          registrationNumber: 'DL01TEST1234',
          model: 'Honda Activa'
        },
        address: {
          street: 'Test Address',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001'
        },
        isApproved: true,
        isVerified: true
      });

      await deliveryBoy.save();
      console.log('\n✅ Created test delivery boy:');
      console.log(`   Phone: ${deliveryBoy.phone}`);
      console.log(`   Email: ${deliveryBoy.email}`);
      console.log(`   Password: test123456`);
    }

    console.log('\n🔑 Login credentials:');
    console.log(`   Phone: +919999777777`);
    console.log(`   Password: test123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestDeliveryBoy();
