# Quick Setup Guide

## Prerequisites Setup

### 1. MongoDB Installation
You need to have MongoDB running locally or use MongoDB Atlas (cloud).

**Option A: Local MongoDB**
1. Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: `net start MongoDB` or use MongoDB Compass
   - macOS: `brew services start mongodb/brew/mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update your .env file with the connection string

### 2. Environment Configuration
Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://192.168.1.4:27017/meat-delivery
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important**: Change the JWT_SECRET to a strong, unique key in production!

### 3. Start the Server
```bash
npm run dev
```

The server will start on http://192.168.1.4:5000

### 4. Test the API
Visit http://192.168.1.4:5000/api/health to check if the server is running.

## Quick API Testing

You can use these curl commands or import them into Postman:

### 1. Register a new user
```bash
curl -X POST http://192.168.1.4:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

### 2. Login
```bash
curl -X POST http://192.168.1.4:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Get products (no auth required)
```bash
curl http://192.168.1.4:5000/api/products
```

### 4. Create an admin user (register with role)
```bash
curl -X POST http://192.168.1.4:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "phone": "+1234567891",
    "role": "admin"
  }'
```

## Common Issues

### MongoDB Connection Error
If you see "Database connection error":
1. Make sure MongoDB is running on your system
2. Check if the connection string in .env is correct
3. For local setup, the default URI is: `mongodb://192.168.1.4:27017/meat-delivery`

### Port Already in Use
If port 5000 is already in use:
1. Change the PORT in your .env file to another port (e.g., 3000, 8000)
2. Or stop the process using port 5000

### JWT Secret Missing
If you see JWT-related errors:
1. Make sure you have a JWT_SECRET in your .env file
2. Use a strong, random string for the secret

## Next Steps

1. **Frontend Integration**: This is just the backend API. You'll need a frontend (React, Vue, Angular, or mobile app) to create a complete application.

2. **Database Seeding**: Consider adding sample products to test the full functionality.

3. **Payment Integration**: Implement Stripe or other payment gateways for real transactions.

4. **File Upload**: Add multer configuration for product image uploads.

5. **Email Service**: Add email notifications for order confirmations and updates.

## API Documentation

The complete API documentation is available in the README.md file. Key endpoints:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/orders/*`
- **Users**: `/api/users/*`

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify all prerequisites are installed and running
3. Ensure all environment variables are set correctly
4. Check the README.md for detailed API documentation