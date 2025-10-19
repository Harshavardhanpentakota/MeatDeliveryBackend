require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample coupon data
const sampleCoupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome offer - 10% off on your first order',
    type: 'percentage',
    value: 10,
    minimumOrderValue: 500,
    maximumDiscount: 200,
    usageLimit: 100,
    userUsageLimit: 1,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userEligibility: 'new',
    applicableCategories: [],
    isActive: true
  },
  {
    code: 'BEEF20',
    description: '20% off on all beef products',
    type: 'percentage',
    value: 20,
    minimumOrderValue: 300,
    maximumDiscount: 500,
    usageLimit: null,
    userUsageLimit: 3,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    userEligibility: 'all',
    applicableCategories: ['beef'],
    isActive: true
  },
  {
    code: 'FLAT100',
    description: 'Flat ₹100 off on orders above ₹1000',
    type: 'fixed',
    value: 100,
    minimumOrderValue: 1000,
    maximumDiscount: null,
    usageLimit: 50,
    userUsageLimit: 2,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    userEligibility: 'all',
    applicableCategories: [],
    isActive: true
  },
  {
    code: 'WEEKEND25',
    description: '25% off - Weekend Special',
    type: 'percentage',
    value: 25,
    minimumOrderValue: 750,
    maximumDiscount: 300,
    usageLimit: 200,
    userUsageLimit: 1,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    userEligibility: 'all',
    applicableCategories: [],
    isActive: true
  },
  {
    code: 'SEAFOOD15',
    description: '15% off on seafood and fish products',
    type: 'percentage',
    value: 15,
    minimumOrderValue: 400,
    maximumDiscount: 250,
    usageLimit: null,
    userUsageLimit: 5,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    userEligibility: 'all',
    applicableCategories: ['fish', 'seafood'],
    isActive: true
  },
  {
    code: 'EXPIRED10',
    description: 'Expired coupon for testing',
    type: 'percentage',
    value: 10,
    minimumOrderValue: 200,
    maximumDiscount: 100,
    usageLimit: 10,
    userUsageLimit: 1,
    validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    validTo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    userEligibility: 'all',
    applicableCategories: [],
    isActive: true
  }
];

// Seed coupons
const seedCoupons = async () => {
  try {
    console.log('🔍 Finding admin user...');
    
    // Find an admin user or create one
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('📝 Creating admin user for coupons...');
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@meatdelivery.com',
        password: 'admin123',
        phone: '+1234567890',
        role: 'admin',
        address: {
          street: '123 Admin St',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '12345',
          country: 'Admin Country'
        }
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log(`✅ Admin user found: ${adminUser.firstName} ${adminUser.lastName}`);
    }

    console.log('🗑️  Clearing existing coupons...');
    const deleteResult = await Coupon.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing coupons`);

    console.log('🌱 Seeding coupons...');
    
    // Add admin user ID to all coupons
    const couponsWithAdmin = sampleCoupons.map(coupon => ({
      ...coupon,
      createdBy: adminUser._id
    }));

    const insertedCoupons = await Coupon.insertMany(couponsWithAdmin);
    
    console.log(`✅ Successfully seeded ${insertedCoupons.length} coupons!`);
    
    // Display summary
    console.log('\n📊 Coupon Summary:');
    insertedCoupons.forEach((coupon, index) => {
      console.log(`   ${index + 1}. ${coupon.code} - ${coupon.formattedDiscount}`);
      console.log(`      ${coupon.description}`);
      console.log(`      Valid until: ${coupon.validTo.toDateString()}`);
      console.log(`      Min order: ₹${coupon.minimumOrderValue}`);
      console.log('');
    });
    
    console.log('🔗 You can now test these coupon codes:');
    insertedCoupons.filter(c => c.isCurrentlyValid).forEach(coupon => {
      console.log(`   - ${coupon.code}`);
    });
    
    return insertedCoupons;
    
  } catch (error) {
    console.error('❌ Error seeding coupons:', error.message);
    throw error;
  }
};

// Main function
const runSeed = async () => {
  try {
    console.log('🚀 Starting Coupon Seeding...\n');
    
    await connectDB();
    await seedCoupons();
    
    console.log('\n🎉 Coupon seeding completed successfully!');
    console.log('\n📝 Available API endpoints:');
    console.log('   - GET /api/coupons/active (Public)');
    console.log('   - POST /api/coupons/validate (Authenticated)');
    console.log('   - POST /api/cart/apply-coupon (Authenticated)');
    console.log('   - GET /api/coupons (Admin only)');
    console.log('   - POST /api/coupons (Admin only)');
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the seeding
runSeed();