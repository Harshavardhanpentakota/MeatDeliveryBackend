const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const couponRoutes = require('./routes/coupons');
const addressRoutes = require('./routes/addresses');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - Allow all origins for React Native development
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      success: true,
      message: 'Meat Delivery API is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        connection: dbState === 1 ? 'healthy' : 'unhealthy'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Meat Delivery API',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://192.168.1.4:27017/meat-delivery';
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
  
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Ensure MongoDB is installed and running on your system');
    console.error('2. For Windows: Run "net start MongoDB" in an admin PowerShell');
    console.error('3. Check if port 27017 is available: netstat -an | findstr :27017');
    console.error('4. Consider using MongoDB Atlas for cloud database');
    console.error('5. Update your .env file with the correct connection string');
    console.error('\n💡 Quick setup: https://www.mongodb.com/try/download/community');
    console.error('\n⚠️  Server will start without database connection for route testing...');
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection for testing purposes...');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      if (!dbConnected) {
        console.log('⚠️  Note: Database not connected - some routes may not work properly');
      }
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Handle process termination gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

