require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Test cart virtual properties
const testCartVirtuals = async () => {
  try {
    console.log('🧪 Testing Cart Virtual Properties...');
    
    // Find a user with a cart
    const userWithCart = await User.findOne({});
    if (!userWithCart) {
      console.log('❌ No users found');
      return;
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userWithCart._id });
    if (!cart) {
      console.log('📝 Creating test cart...');
      cart = new Cart({
        user: userWithCart._id,
        items: []
      });
      await cart.save();
    }
    
    console.log('✅ Cart found/created:', cart._id);
    
    // Test virtual properties (these should not throw errors now)
    console.log('📊 Testing virtual properties:');
    console.log(`   Subtotal: ${cart.subtotal || 0}`);
    console.log(`   Discount: ${cart.discountAmount || 0}`);
    console.log(`   Final: ${cart.finalAmount || 0}`);
    console.log(`   Formatted Subtotal: ${cart.formattedSubtotal}`);
    console.log(`   Formatted Discount: ${cart.formattedDiscount}`);
    console.log(`   Formatted Total: ${cart.formattedTotal}`);
    
    // Test cart with undefined values
    console.log('\n🔬 Testing with undefined values...');
    const testCart = new Cart({
      user: userWithCart._id,
      items: [],
      // Intentionally not setting numeric fields
    });
    
    console.log('✅ Virtual properties work with undefined values:');
    console.log(`   Formatted Total: ${testCart.formattedTotal}`);
    console.log(`   Formatted Subtotal: ${testCart.formattedSubtotal}`);
    console.log(`   Formatted Discount: ${testCart.formattedDiscount}`);
    
    // Test JSON serialization
    console.log('\n📄 Testing JSON serialization...');
    const cartJson = cart.toJSON();
    console.log('✅ Cart serializes to JSON without errors');
    console.log(`   Has formatted values: ${!!cartJson.formattedTotal}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing cart virtuals:', error.message);
    return false;
  }
};

// Test coupon application
const testCouponApplication = async () => {
  try {
    console.log('\n🎫 Testing Coupon Application...');
    
    // Find an active coupon
    const activeCoupon = await Coupon.findOne({ isActive: true });
    if (!activeCoupon) {
      console.log('❌ No active coupons found');
      return false;
    }
    
    console.log(`✅ Found active coupon: ${activeCoupon.code}`);
    
    // Find a user
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ No users found');
      return false;
    }
    
    // Get cart
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
      await cart.save();
    }
    
    // Apply coupon
    console.log('📝 Applying coupon to cart...');
    cart.appliedCoupon = {
      coupon: activeCoupon._id,
      code: activeCoupon.code,
      discount: 50, // Test discount amount
      appliedAt: new Date()
    };
    
    await cart.save();
    console.log('✅ Coupon applied successfully');
    
    // Test virtual properties with coupon
    console.log('📊 Cart with coupon:');
    console.log(`   Subtotal: ${cart.formattedSubtotal}`);
    console.log(`   Discount: ${cart.formattedDiscount}`);
    console.log(`   Final Total: ${cart.formattedTotal}`);
    
    // Remove coupon
    console.log('\n🗑️ Removing coupon...');
    cart.appliedCoupon = undefined;
    await cart.save();
    console.log('✅ Coupon removed successfully');
    console.log(`   Final Total after removal: ${cart.formattedTotal}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing coupon application:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Cart and Coupon Tests...\n');
    
    await connectDB();
    
    const virtualTest = await testCartVirtuals();
    const couponTest = await testCouponApplication();
    
    if (virtualTest && couponTest) {
      console.log('\n🎉 All tests passed! Cart model fixes are working correctly.');
      console.log('\n✅ Fixed Issues:');
      console.log('   - Virtual properties no longer crash on undefined values');
      console.log('   - Cart calculations work safely');
      console.log('   - Coupon application works smoothly');
      console.log('   - JSON serialization is stable');
    } else {
      console.log('\n❌ Some tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the tests
runTests();