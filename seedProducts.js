require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Import product data
const productData = JSON.parse(fs.readFileSync(path.join(__dirname, 'product_sample.json'), 'utf8'));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery';
    console.log('🔗 Connecting to MongoDB...');
    console.log(`Connection URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Clear existing products
const clearProducts = async () => {
  try {
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing products`);
  } catch (error) {
    console.error('❌ Error clearing products:', error.message);
    throw error;
  }
};

// Seed products
const seedProducts = async () => {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Process each product to ensure proper ObjectId conversion
    const processedProducts = productData.map(product => {
      const { _id, ...productWithoutId } = product;
      return {
        ...productWithoutId,
        _id: new mongoose.Types.ObjectId(_id),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Insert all products
    const insertedProducts = await Product.insertMany(processedProducts);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);
    
    // Display summary
    const categories = [...new Set(insertedProducts.map(p => p.category))];
    console.log(`📊 Categories seeded: ${categories.join(', ')}`);
    console.log(`💰 Price range: ₹${Math.min(...insertedProducts.map(p => p.price))} - ₹${Math.max(...insertedProducts.map(p => p.price))}`);
    
    return insertedProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    throw error;
  }
};

// Main seeding function
const runSeed = async () => {
  try {
    console.log('🚀 Starting Meat Delivery Product Seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Ask user for confirmation before clearing
    console.log('⚠️  This will clear ALL existing products and seed new ones.');
    console.log('📁 File to seed:', path.join(__dirname, 'product_sample.json'));
    console.log(`📦 Products to seed: ${productData.length}`);
    
    // Clear existing products
    await clearProducts();
    
    // Seed new products
    await seedProducts();
    
    console.log('\n🎉 Product seeding completed successfully!');
    console.log('🔗 You can now test the API endpoints:');
    console.log('   - GET /api/products');
    console.log('   - GET /api/products/suggested?limit=4');
    console.log('   - GET /api/products/category/beef');
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
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

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Seeding terminated');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the seeding
runSeed();