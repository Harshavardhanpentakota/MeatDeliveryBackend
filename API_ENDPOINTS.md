# 📋 Complete API Endpoints Reference

## 🔗 Base URL
```
Local Development: http://192.168.1.4:5000/api
Android Emulator: http://10.0.2.2:5000/api
iOS Simulator: http://192.168.1.4:5000/api
Physical Device: http://YOUR_LOCAL_IP:5000/api
```

## 🔐 Authentication Endpoints

### 1. Register User (PIN-Based)
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "pin": "123456",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "role": "customer" // Optional: "customer" (default) or "admin"
}
```

**Required Fields:**
- `firstName` (2-50 characters)
- `lastName` (2-50 characters)
- `email` (valid email format)
- `pin` (exactly 6 digits)
- `phone` (valid phone number)

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully with PIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "isActive": true,
    "phoneVerified": false,
    "emailVerified": false,
    "fullName": "John Doe"
  }
}
```

### 2. Login (Email/Password)
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "lastLogin": "2024-10-13T10:30:00.000Z"
  }
}
```

### 3. Request OTP
**POST** `/auth/request-otp`

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone",
  "data": {
    "phone": "+12****7890",
    "expiresIn": "5 minutes"
  }
}
```

### 4. Verify OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "phoneVerified": true,
    "role": "customer"
  }
}
```

### 5. Get Profile
**GET** `/auth/me`
**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "role": "customer",
    "isActive": true,
    "phoneVerified": true
  }
}
```

### 6. Update Profile
**PUT** `/auth/me`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phone": "+1234567891",
  "address": {
    "street": "456 Oak St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

### 7. Change Password
**PUT** `/auth/change-password`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

### 8. Logout
**POST** `/auth/logout`
**Headers:** `Authorization: Bearer TOKEN`

### 9. Login with PIN
**POST** `/auth/login-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com", // Can be email or phone
  "pin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "lastLogin": "2024-10-13T10:30:00.000Z"
  }
}
```

### 10. Set PIN (First Time or Change)
**POST** `/auth/set-pin`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "pin": "123456",
  "confirmPin": "123456"
}
```

### 11. Forgot PIN (Request OTP)
**POST** `/auth/forgot-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com" // Can be email or phone
}
```

### 12. Reset PIN with OTP
**POST** `/auth/reset-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "otp": "123456",
  "newPin": "654321",
  "confirmPin": "654321"
}
```

## 🛍️ Products Endpoints

### 1. Get All Products
**GET** `/products`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `search` (string): Search in name/description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter by stock availability
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): asc/desc (default: desc)

**Example:** `/products?category=chicken&page=1&limit=10&inStock=true`

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "671234567890abcdef123456",
        "name": "Fresh Chicken Breast",
        "description": "Premium quality chicken breast",
        "category": "chicken",
        "price": 299,
        "discountedPrice": 299,
        "weight": {
          "value": 1,
          "unit": "kg"
        },
        "images": [
          {
            "url": "https://example.com/chicken.jpg",
            "alt": "Fresh Chicken Breast"
          }
        ],
        "availability": {
          "inStock": true,
          "quantity": 50
        },
        "preparationMethod": "fresh",
        "ratings": {
          "average": 4.5,
          "count": 120
        },
        "isActive": true,
        "createdAt": "2024-10-13T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10,
      "next": 2
    }
  }
}
```

### 2. Get Product by ID
**GET** `/products/:id`

### 3. Get Products by Category
**GET** `/products/category/:category`

**Categories:** chicken, mutton, beef, pork, fish, seafood, processed

### 4. Search Products
**GET** `/products/search/:searchTerm`

### 5. Create Product (Admin)
**POST** `/products`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "Fresh Chicken Breast",
  "description": "Premium quality chicken breast, perfect for grilling",
  "category": "chicken",
  "subcategory": "breast",
  "price": 299,
  "weight": {
    "value": 1,
    "unit": "kg"
  },
  "images": [
    {
      "url": "https://example.com/chicken-breast.jpg",
      "alt": "Fresh Chicken Breast"
    }
  ],
  "availability": {
    "inStock": true,
    "quantity": 50
  },
  "nutritionalInfo": {
    "calories": 165,
    "protein": 31,
    "fat": 3.6,
    "carbohydrates": 0
  },
  "preparationMethod": "fresh",
  "tags": ["protein", "lean", "healthy"],
  "discount": {
    "percentage": 10,
    "validUntil": "2024-12-31T23:59:59.000Z"
  }
}
```

## 🎫 Coupons Endpoints

### 1. Get Active Coupons
**GET** `/coupons/active`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Active coupons retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "671234567890abcdef123456",
        "code": "WELCOME10",
        "description": "Welcome offer - 10% off on your first order",
        "type": "percentage",
        "value": 10,
        "minimumOrderValue": 500,
        "maximumDiscount": 200,
        "formattedDiscount": "10% OFF",
        "validFrom": "2024-10-19T00:00:00.000Z",
        "validTo": "2024-11-18T23:59:59.000Z"
      }
    ]
  }
}
```

### 2. Validate Coupon
**POST** `/coupons/validate`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "code": "WELCOME10",
  "orderAmount": 800
}
```

### 3. Get All Coupons (Admin)
**GET** `/coupons`
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

### 4. Create Coupon (Admin)
**POST** `/coupons`
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Request Body:**
```json
{
  "code": "NEWDEAL30",
  "description": "30% off for new customers",
  "type": "percentage",
  "value": 30,
  "minimumOrderValue": 600,
  "maximumDiscount": 300,
  "usageLimit": 100,
  "userUsageLimit": 1,
  "validFrom": "2024-10-19T00:00:00.000Z",
  "validTo": "2024-11-19T23:59:59.000Z",
  "userEligibility": "new",
  "applicableCategories": ["beef", "chicken"],
  "isActive": true
}
```

### 5. Get Coupon Statistics (Admin)
**GET** `/coupons/:id/stats`
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

## 🛒 Cart Endpoints

### 1. Get Cart
**GET** `/cart`
**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "_id": "671234567890abcdef123456",
    "user": "671234567890abcdef123456",
    "items": [
      {
        "_id": "671234567890abcdef123457",
        "product": {
          "_id": "671234567890abcdef123458",
          "name": "Fresh Chicken Breast",
          "price": 299,
          "images": [{"url": "...", "alt": "..."}]
        },
        "quantity": 2,
        "priceAtTime": 299
      }
    ],
    "totalAmount": 598,
    "totalItems": 2,
    "formattedTotal": "₹598.00"
  }
}
```

### 2. Add to Cart
**POST** `/cart/add`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "productId": "671234567890abcdef123456",
  "quantity": 2
}
```

### 3. Update Cart Item
**PUT** `/cart/update/:itemId`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "quantity": 3
}
```

### 4. Remove from Cart
**DELETE** `/cart/remove/:itemId`
**Headers:** `Authorization: Bearer TOKEN`

### 5. Clear Cart
**DELETE** `/cart/clear`
**Headers:** `Authorization: Bearer TOKEN`

### 6. Get Cart Summary
**GET** `/cart/summary`
**Headers:** `Authorization: Bearer TOKEN`

### 7. Apply Coupon to Cart
**POST** `/cart/apply-coupon`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "code": "BEEF20"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "cart": {
      "subtotal": 1200,
      "discountAmount": 240,
      "finalAmount": 960,
      "appliedCoupon": {
        "code": "BEEF20",
        "discount": 240,
        "appliedAt": "2024-10-19T10:30:00.000Z"
      }
    },
    "savings": 240
  }
}
```

### 8. Remove Coupon from Cart
**DELETE** `/cart/remove-coupon`
**Headers:** `Authorization: Bearer TOKEN`

## 📦 Orders Endpoints

### 1. Create Order
**POST** `/orders`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "items": [
    {
      "product": "671234567890abcdef123456",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "landmark": "Near Central Park",
    "instructions": "Ring the doorbell twice"
  },
  "contactInfo": {
    "phone": "+1234567890",
    "alternatePhone": "+1234567891"
  },
  "paymentMethod": "cash-on-delivery",
  "specialInstructions": "Please deliver after 6 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "671234567890abcdef123456",
    "orderNumber": "MD170269530001",
    "customer": {
      "_id": "671234567890abcdef123457",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "product": {
          "_id": "671234567890abcdef123458",
          "name": "Fresh Chicken Breast",
          "price": 299
        },
        "quantity": 2,
        "priceAtTime": 299,
        "subtotal": 598
      }
    ],
    "pricing": {
      "subtotal": 598,
      "deliveryFee": 50,
      "tax": 29.9,
      "discount": 0,
      "total": 677.9
    },
    "status": "pending",
    "paymentInfo": {
      "method": "cash-on-delivery",
      "status": "pending"
    },
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "formattedTotal": "₹677.90",
    "createdAt": "2024-10-13T10:30:00.000Z"
  }
}
```

### 2. Get Orders
**GET** `/orders`
**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Order Status Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by admin
- `preparing` - Order being prepared
- `out-for-delivery` - Order assigned to delivery person
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

### 3. Get Order by ID
**GET** `/orders/:id`
**Headers:** `Authorization: Bearer TOKEN`

### 4. Cancel Order
**PATCH** `/orders/:id/cancel`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

## 👥 Users Endpoints (Admin Only)

### 1. Get All Users
**GET** `/users`
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

### 2. Get User by ID
**GET** `/users/:id`
**Headers:** `Authorization: Bearer TOKEN` (Admin or own profile)

### 3. Update User
**PUT** `/users/:id`
**Headers:** `Authorization: Bearer TOKEN` (Admin or own profile)

### 4. Get User Statistics
**GET** `/users/stats`
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

## 🏥 Health Check

### Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": "Meat Delivery API is running!",
  "timestamp": "2024-10-13T10:30:00.000Z"
}
```

## 📱 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 📍 Address Endpoints

### 1. Get All Saved Addresses
**GET** `/addresses`
**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "address_id_1",
      "label": "Home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "landmark": "Near Central Park",
      "isDefault": true,
      "coordinates": {
        "latitude": 40.7589,
        "longitude": -73.9851
      }
    },
    {
      "_id": "address_id_2",
      "label": "Office",
      "street": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002",
      "country": "USA",
      "landmark": "Next to Starbucks",
      "isDefault": false,
      "coordinates": {
        "latitude": 40.7505,
        "longitude": -73.9934
      }
    }
  ],
  "count": 2
}
```

### 2. Get Default Address
**GET** `/addresses/default`
**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "address": {
    "_id": "address_id_1",
    "label": "Home",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "landmark": "Near Central Park",
    "isDefault": true,
    "coordinates": {
      "latitude": 40.7589,
      "longitude": -73.9851
    }
  }
}
```

### 3. Add New Address
**POST** `/addresses`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "label": "Office",
  "street": "456 Business Ave",
  "city": "New York", 
  "state": "NY",
  "zipCode": "10002",
  "landmark": "Next to Starbucks",
  "isDefault": false,
  "coordinates": {
    "latitude": 40.7505,
    "longitude": -73.9934
  }
}
```

**Required Fields:**
- `label` (1-50 characters, alphanumeric + spaces/hyphens/underscores)
- `street` (5-200 characters)
- `city` (2-50 characters, letters only)
- `state` (2-50 characters, letters only)
- `zipCode` (6-digit PIN code)

**Optional Fields:**
- `landmark` (max 100 characters)
- `isDefault` (boolean, defaults to false)
- `coordinates.latitude` (-90 to 90)
- `coordinates.longitude` (-180 to 180)

### 4. Update Address
**PUT** `/addresses/:addressId`
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:** Same as Add New Address

### 5. Delete Address
**DELETE** `/addresses/:addressId`
**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "addresses": [...] // Updated list of remaining addresses
}
```

### 6. Set Address as Default ⭐
**PATCH** `/addresses/:addressId/default`
**Headers:** `Authorization: Bearer TOKEN`

**Description:** This is the "Make This Default" functionality for your mobile app!

**Response:**
```json
{
  "success": true,
  "message": "Default address updated successfully",
  "addresses": [
    {
      "_id": "address_id_2",
      "label": "Office",
      "street": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002", 
      "country": "USA",
      "landmark": "Next to Starbucks",
      "isDefault": true, // ✅ Now set as default
      "coordinates": {
        "latitude": 40.7505,
        "longitude": -73.9934
      }
    },
    {
      "_id": "address_id_1", 
      "label": "Home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "landmark": "Near Central Park",
      "isDefault": false, // ❌ No longer default
      "coordinates": {
        "latitude": 40.7589,
        "longitude": -73.9851
      }
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Too many requests (rate limited)
- `500` - Server error

## 🔒 Authentication Notes

1. **JWT Token:** Include in Authorization header as `Bearer TOKEN`
2. **Token Expiry:** Tokens expire after 7 days by default
3. **Admin Routes:** Require admin role for access
4. **OTP Expiry:** OTPs expire after 5 minutes
5. **Rate Limiting:** Max 5 OTP requests per phone number

This comprehensive API reference should provide everything needed for React Native integration! 🚀