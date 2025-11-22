require('dotenv').config();
const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const testProfile = async () => {
  try {
    await connectDB();
    console.log('\n🔍 Testing Delivery Boy Profile API...\n');

    // Get a delivery boy
    const deliveryBoy = await DeliveryBoy.findOne({ isApproved: true });
    if (!deliveryBoy) {
      console.log('❌ No approved delivery boy found');
      process.exit(1);
    }

    console.log(`✅ Testing profile for: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
    console.log(`   ID: ${deliveryBoy._id}`);

    // Simulate the getMe controller logic
    const deliveredOrders = await Order.find({
      'delivery.assignedTo': deliveryBoy._id,
      status: 'delivered'
    }).select('pricing.total');

    const totalEarnings = deliveredOrders.reduce((sum, order) => {
      return sum + (order.pricing.total * 0.10);
    }, 0);

    const totalAssigned = deliveryBoy.totalDeliveries || 0;
    const completed = deliveryBoy.completedDeliveries || 0;
    const completionRate = totalAssigned > 0 ? ((completed / totalAssigned) * 100).toFixed(1) : 100;

    const profileData = {
      _id: deliveryBoy._id,
      name: `${deliveryBoy.firstName} ${deliveryBoy.lastName}`,
      firstName: deliveryBoy.firstName,
      lastName: deliveryBoy.lastName,
      email: deliveryBoy.email,
      phone: deliveryBoy.phone,
      address: deliveryBoy.address.street || '',
      city: deliveryBoy.address.city || '',
      state: deliveryBoy.address.state || '',
      zipCode: deliveryBoy.address.zipCode || '',
      fullAddress: `${deliveryBoy.address.street || ''}, ${deliveryBoy.address.city || ''}, ${deliveryBoy.address.state || ''} ${deliveryBoy.address.zipCode || ''}`.trim(),
      joinDate: deliveryBoy.joinDate,
      vehicleType: deliveryBoy.vehicle.type,
      vehicleNumber: deliveryBoy.vehicle.registrationNumber,
      vehicleModel: deliveryBoy.vehicle.model,
      licenseNumber: deliveryBoy.license.number,
      licenseExpiry: deliveryBoy.license.expiryDate,
      bankAccount: deliveryBoy.bankDetails.accountNumber ? `****${deliveryBoy.bankDetails.accountNumber.slice(-4)}` : null,
      bankName: deliveryBoy.bankDetails.bankName,
      ifscCode: deliveryBoy.bankDetails.ifscCode,
      accountHolder: deliveryBoy.bankDetails.accountHolder,
      totalDeliveries: deliveryBoy.totalDeliveries || 0,
      completedDeliveries: deliveryBoy.completedDeliveries || 0,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      averageRating: deliveryBoy.rating || 4.5,
      averageDeliveryTime: deliveryBoy.averageDeliveryTime || 0,
      completionRate: parseFloat(completionRate),
      status: deliveryBoy.status,
      availability: deliveryBoy.availability,
      isVerified: deliveryBoy.isVerified,
      isApproved: deliveryBoy.isApproved,
      lastActive: deliveryBoy.lastActive
    };

    console.log('\n📊 Profile Data:');
    console.log(JSON.stringify(profileData, null, 2));

    console.log('\n✨ Stats Summary:');
    console.log(`   📦 Total Deliveries: ${profileData.totalDeliveries}`);
    console.log(`   ✅ Completed: ${profileData.completedDeliveries}`);
    console.log(`   💰 Total Earnings: ₹${profileData.totalEarnings}`);
    console.log(`   ⭐ Rating: ${profileData.averageRating}/5`);
    console.log(`   📈 Completion Rate: ${profileData.completionRate}%`);
    console.log(`   ⏱️  Average Delivery Time: ${profileData.averageDeliveryTime} mins`);

    console.log('\n🚗 Vehicle Details:');
    console.log(`   Type: ${profileData.vehicleType}`);
    console.log(`   Number: ${profileData.vehicleNumber}`);
    console.log(`   Model: ${profileData.vehicleModel || 'N/A'}`);

    console.log('\n📄 Documents:');
    console.log(`   License: ${profileData.licenseNumber}`);
    console.log(`   Expiry: ${new Date(profileData.licenseExpiry).toLocaleDateString()}`);

    if (profileData.bankName) {
      console.log('\n🏦 Bank Details:');
      console.log(`   Account: ${profileData.bankAccount || 'N/A'}`);
      console.log(`   Bank: ${profileData.bankName || 'N/A'}`);
      console.log(`   IFSC: ${profileData.ifscCode || 'N/A'}`);
    }

    console.log('\n✅ Profile API test completed successfully!');
    console.log('\n📝 Test this endpoint:');
    console.log('   GET /api/delivery/me');
    console.log('   Authorization: Bearer <token>');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testProfile();
