require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Product = require('./models/Product');
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

// Add items to cart for specific user
const addCartItems = async () => {
  try {
    const userId = "68f21710149d81ce22269450";
    
    console.log('🔍 Checking if user exists...');
    
    // Check if user exists
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('❌ Invalid user ID format, creating a test user...');
      
      // Create a test user with the specified ID
      user = new User({
        _id: new mongoose.Types.ObjectId(userId),
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
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
      });
      
      await user.save();
      console.log('✅ Test user created successfully');
    }
    
    if (!user) {
      console.log('❌ User not found, creating test user...');
      user = new User({
        _id: new mongoose.Types.ObjectId(userId),
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer'
      });
      await user.save();
      console.log('✅ Test user created');
    } else {
      console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    }

    console.log('🔍 Getting available products...');
    
    // Get some products to add to cart
    const products = await Product.find({ isActive: true }).limit(3);
    
    if (products.length === 0) {
      console.log('❌ No products found. Please run the seed script first.');
      return;
    }
    
    console.log(`📦 Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price}`);
    });

    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      console.log('🛒 Existing cart found, clearing it...');
      cart.items = [];
    } else {
      console.log('🛒 Creating new cart...');
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // Add first two products to cart
    const itemsToAdd = [
      {
        product: products[0]._id,
        quantity: 2,
        priceAtTime: products[0].discountedPrice || products[0].price
      },
      {
        product: products[1]._id,
        quantity: 1,
        priceAtTime: products[1].discountedPrice || products[1].price
      }
    ];

    cart.items = itemsToAdd;
    await cart.save();

    // Populate and display result
    await cart.populate('items.product');
    
    console.log('\n✅ Cart items added successfully!');
    console.log('🛒 Cart contents:');
    cart.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.product.name} x${item.quantity} - ₹${item.priceAtTime} each`);
      console.log(`      Item ID: ${item._id}`);
    });
    
    console.log(`\n💰 Total Amount: ₹${cart.totalAmount}`);
    console.log(`📊 Total Items: ${cart.totalItems}`);
    
    console.log('\n🔗 You can now test these endpoints:');
    console.log(`   GET /api/cart (with user auth)`);
    console.log(`   PUT /api/cart/update/${cart.items[0]._id} (to update first item)`);
    console.log(`   PUT /api/cart/update/${cart.items[1]._id} (to update second item)`);
    
    return cart;
    
  } catch (error) {
    console.error('❌ Error adding cart items:', error.message);
    throw error;
  }
};

// Main function
const runScript = async () => {
  try {
    console.log('🚀 Adding cart items for user: 68f21710149d81ce22269450\n');
    
    await connectDB();
    await addCartItems();
    
    console.log('\n🎉 Cart setup completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
runScript();