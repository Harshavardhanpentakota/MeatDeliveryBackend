# Meat Delivery Backend

A comprehensive RESTful backend for a meat delivery application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/Customer)
  - Secure password hashing with bcrypt
  - User registration, login, and profile management

- **Product Management**
  - CRUD operations for meat products
  - Category-based product organization
  - Image management and product search
  - Stock management and availability tracking

- **Order Management**
  - Complete order lifecycle management
  - Order status tracking and updates
  - Delivery assignment and tracking
  - Order statistics and reporting

- **Cart Functionality**
  - Add/remove items from cart
  - Update quantities and calculate totals
  - Cart persistence for logged-in users

- **Advanced Features**
  - Input validation and error handling
  - Pagination for large datasets
  - Search and filtering capabilities
  - Comprehensive API documentation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration

## Project Structure

```
MeatDeliveryBackend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── cartController.js    # Cart management
│   ├── orderController.js   # Order management
│   ├── productController.js # Product operations
│   └── userController.js    # User management
├── middlewares/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── Cart.js             # Cart data model
│   ├── Order.js            # Order data model
│   ├── Product.js          # Product data model
│   └── User.js             # User data model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── cart.js             # Cart routes
│   ├── orders.js           # Order routes
│   ├── products.js         # Product routes
│   └── users.js            # User routes
├── utils/
│   ├── auth.js             # Auth utilities
│   └── helpers.js          # Helper functions
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── server.js               # Application entry point
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MeatDeliveryBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/meat-delivery
   JWT_SECRET=your-super-secret-jwt-key-here-please-change-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Ensure your connection string is correct

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - User logout

### Product Routes (`/api/products`)
- `GET /` - Get all products (with filtering & pagination)
- `GET /:id` - Get product by ID
- `GET /category/:category` - Get products by category
- `GET /search/:searchTerm` - Search products
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)
- `PATCH /:id/stock` - Update product stock (Admin only)

### Cart Routes (`/api/cart`)
- `GET /` - Get user's cart
- `GET /summary` - Get cart summary
- `POST /add` - Add item to cart
- `PUT /update/:itemId` - Update cart item quantity
- `DELETE /remove/:itemId` - Remove item from cart
- `DELETE /clear` - Clear entire cart

### Order Routes (`/api/orders`)
- `POST /` - Create new order
- `GET /` - Get orders (user's own or all for admin)
- `GET /:id` - Get specific order
- `GET /stats` - Get order statistics (Admin only)
- `PATCH /:id/status` - Update order status (Admin only)
- `PATCH /:id/cancel` - Cancel order
- `PATCH /:id/assign` - Assign delivery person (Admin only)

### User Routes (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /stats` - Get user statistics (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)
- `PATCH /:id/activate` - Activate user (Admin only)

## Data Models

### User Model
- Personal information (name, email, phone)
- Address details
- Role-based permissions
- Account status and activity tracking

### Product Model
- Product details (name, description, category)
- Pricing and weight information
- Images and nutritional data
- Stock availability and ratings

### Order Model
- Customer and item details
- Delivery address and contact info
- Pricing breakdown and payment status
- Order status and tracking history

### Cart Model
- User-specific cart items
- Quantity and pricing at time of addition
- Automatic total calculations

## Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for request validation
- **Error Handling**: Comprehensive error management
- **Role-based Access**: Admin and customer role separation

## Development Guidelines

### Code Organization
- **Controllers**: Business logic and request handling
- **Models**: Data structure and database schema
- **Routes**: API endpoint definitions
- **Middlewares**: Cross-cutting concerns (auth, validation, error handling)
- **Utils**: Reusable utility functions

### Error Handling
- Global error handling middleware
- Custom error classes for different scenarios
- Validation error responses
- Database error handling

### Validation Rules
- Input sanitization and validation
- Custom validation messages
- Role-based validation rules

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Security Considerations
- Use strong JWT secrets
- Enable HTTPS in production
- Set up proper CORS policies
- Use environment variables for sensitive data
- Implement rate limiting
- Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a backend API application. You'll need a frontend application (web or mobile) to interact with these endpoints. Consider using tools like Postman or Insomnia for API testing during development.