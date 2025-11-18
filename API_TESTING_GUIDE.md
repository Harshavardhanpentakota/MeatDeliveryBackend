# Meat Delivery App - Complete API Testing Guide

## Base URL
```
http://10.0.2.2:5000  (For Android Emulator)
http://localhost:5000  (For local testing)
```

---

## 📱 DELIVERY BOY APP APIs

### 1. Register Delivery Boy
**Endpoint:** `POST /api/delivery/register`  
**Access:** Public  
**Description:** Register a new delivery boy

**Request Body:**
```json
{
  "firstName": "Ravi",
  "lastName": "Kumar",
  "email": "ravi.kumar@example.com",
  "password": "password123",
  "phone": "9123456789",
  "licenseNumber": "DL123456789",
  "licenseExpiryDate": "2026-12-31",
  "vehicleType": "two-wheeler",
  "vehicleRegistration": "KA01AB1234",
  "vehicleModel": "Honda Activa",
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "zipCode": "560001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Delivery boy registered successfully",
  "data": {
    "deliveryBoy": {
      "_id": "691929a6958818120f6e0a61",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "email": "ravi.kumar@example.com",
      "phone": "9123456789",
      "isApproved": false,
      "status": "inactive",
      "availability": "offline"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login Delivery Boy
**Endpoint:** `POST /api/delivery/login`  
**Access:** Public  
**Description:** Login existing delivery boy

**Request Body:**
```json
{
  "email": "ravi.kumar@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "deliveryBoy": {
      "_id": "691929a6958818120f6e0a61",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "email": "ravi.kumar@example.com",
      "phone": "9123456789",
      "availability": "offline"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Your account is not yet approved by admin"
}
```

---

### 3. Get Delivery Boy Profile
**Endpoint:** `GET /api/delivery/me`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "691929a6958818120f6e0a61",
    "firstName": "Ravi",
    "lastName": "Kumar",
    "email": "ravi.kumar@example.com",
    "phone": "9123456789",
    "license": {
      "number": "DL123456789",
      "expiryDate": "2026-12-31T00:00:00.000Z"
    },
    "vehicle": {
      "type": "two-wheeler",
      "registrationNumber": "KA01AB1234",
      "model": "Honda Activa"
    },
    "availability": "available",
    "totalDeliveries": 15,
    "rating": 4.5
  }
}
```

---

### 4. Update Availability
**Endpoint:** `PUT /api/delivery/availability`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Request Body:**
```json
{
  "availability": "available"
}
```
*Options: `available`, `busy`, `offline`*

**Response (200):**
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "_id": "691929a6958818120f6e0a61",
    "availability": "available"
  }
}
```

---

### 5. Update Location
**Endpoint:** `PUT /api/delivery/location`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "_id": "691929a6958818120f6e0a61",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "lastActive": "2025-11-18T10:30:00.000Z"
  }
}
```

---

### 6. Get Pending Orders
**Endpoint:** `GET /api/delivery/orders/pending`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```
**Description:** Get unassigned pending orders from yesterday and today

**Response (200):**
```json
{
  "success": true,
  "message": "Pending orders retrieved successfully",
  "data": [
    {
      "_id": "691ba755c3d306cd55108a1e",
      "orderNumber": "MD17634199894060004",
      "status": "pending",
      "customer": {
        "_id": "691929a6958818120f6e0a60",
        "firstName": "Seja",
        "lastName": "Seja",
        "phone": "9876543210"
      },
      "items": [
        {
          "product": {
            "_id": "6918cee44fb1b2e9b84a4321",
            "name": "Chicken Breast",
            "price": 299,
            "category": "chicken"
          },
          "quantity": 1,
          "subtotal": 299
        }
      ],
      "deliveryAddress": {
        "street": "123 Main Street, Apartment 4B",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "landmark": "Near Central Mall"
      },
      "pricing": {
        "subtotal": 389.95,
        "deliveryFee": 50,
        "total": 439.95
      },
      "createdAt": "2025-11-18T09:15:00.000Z"
    }
  ]
}
```

---

### 7. Accept/Assign Order
**Endpoint:** `POST /api/delivery/orders/:orderId/accept`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```
**Description:** Assign a pending order to yourself

**Example:**
```
POST /api/delivery/orders/691ba755c3d306cd55108a1e/accept
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order assigned successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a1e",
    "orderNumber": "MD17634199894060004",
    "status": "confirmed",
    "customer": {
      "firstName": "Seja",
      "lastName": "Seja",
      "phone": "9876543210"
    },
    "delivery": {
      "assignedTo": {
        "_id": "691929a6958818120f6e0a61",
        "firstName": "Ravi",
        "lastName": "Kumar",
        "phone": "9123456789"
      },
      "estimatedTime": "2025-11-18T11:15:00.000Z"
    },
    "pricing": {
      "total": 439.95
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Order is not available for assignment"
}
```

```json
{
  "success": false,
  "message": "You already have an active delivery"
}
```

---

### 8. Get Assigned Orders
**Endpoint:** `GET /api/delivery/orders/assigned`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```
**Description:** Get all orders assigned to you

**Response (200):**
```json
{
  "success": true,
  "message": "Assigned orders retrieved successfully",
  "data": [
    {
      "_id": "691ba755c3d306cd55108a11",
      "orderNumber": "MD17634199892810002",
      "status": "confirmed",
      "customer": {
        "firstName": "Seja",
        "lastName": "Seja",
        "phone": "9876543210"
      },
      "items": [
        {
          "product": {
            "name": "Mutton Curry Cut",
            "price": 599
          },
          "quantity": 2,
          "subtotal": 1198
        }
      ],
      "deliveryAddress": {
        "street": "456 Park Avenue",
        "city": "Delhi",
        "landmark": "Opposite Metro Station"
      },
      "pricing": {
        "total": 6337.40
      },
      "createdAt": "2025-11-17T15:20:00.000Z"
    }
  ]
}
```

---

### 9. Get Order Details
**Endpoint:** `GET /api/orders/:orderId`  
**Access:** Private (Delivery Boy can only view assigned orders)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Example:**
```
GET /api/orders/691ba755c3d306cd55108a11
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a11",
    "orderNumber": "MD17634199892810002",
    "status": "confirmed",
    "customer": {
      "_id": "691929a6958818120f6e0a60",
      "firstName": "Seja",
      "lastName": "Seja",
      "email": "seja@example.com",
      "phone": "9876543210"
    },
    "items": [
      {
        "_id": "691ba755c3d306cd55108a12",
        "product": {
          "_id": "6918cee44fb1b2e9b84a4321",
          "name": "Mutton Curry Cut",
          "price": 599,
          "category": "mutton",
          "image": "http://10.0.2.2:5000/uploads/mutton-curry.jpg"
        },
        "quantity": 3,
        "priceAtTime": 599,
        "subtotal": 1797
      }
    ],
    "deliveryAddress": {
      "street": "456 Park Avenue",
      "city": "Delhi",
      "state": "Delhi",
      "zipCode": "110001",
      "country": "India",
      "landmark": "Opposite Metro Station",
      "instructions": "Ring doorbell twice"
    },
    "contactInfo": {
      "phone": "9876543210",
      "alternatePhone": "9876543211"
    },
    "pricing": {
      "subtotal": 6035,
      "deliveryFee": 50,
      "tax": 301.75,
      "discount": 0,
      "total": 6337.40
    },
    "delivery": {
      "assignedTo": {
        "_id": "691929a6958818120f6e0a61",
        "firstName": "Ravi",
        "lastName": "Kumar",
        "phone": "9123456789"
      },
      "estimatedTime": "2025-11-18T10:30:00.000Z"
    },
    "paymentInfo": {
      "method": "cash-on-delivery",
      "status": "pending"
    },
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2025-11-17T15:20:00.000Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-11-18T09:45:00.000Z",
        "notes": "Order assigned to delivery boy"
      }
    ],
    "specialInstructions": "Handle with care",
    "createdAt": "2025-11-17T15:20:00.000Z",
    "updatedAt": "2025-11-18T09:45:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 10. Mark Order as Out for Delivery
**Endpoint:** `PUT /api/delivery/orders/:orderId/out-for-delivery`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Request Body (Optional):**
```json
{
  "notes": "Started delivery at 10:30 AM"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order marked as out for delivery",
  "data": {
    "_id": "691ba755c3d306cd55108a11",
    "orderNumber": "MD17634199892810002",
    "status": "out-for-delivery",
    "customer": {
      "firstName": "Seja",
      "lastName": "Seja",
      "phone": "9876543210"
    },
    "delivery": {
      "assignedTo": {
        "firstName": "Ravi",
        "lastName": "Kumar",
        "phone": "9123456789"
      }
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "You are not assigned to this order"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Order cannot be marked as out-for-delivery from delivered status"
}
```

---

### 11. Mark Order as Delivered
**Endpoint:** `PUT /api/delivery/orders/:orderId/delivered`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Request Body (Optional):**
```json
{
  "notes": "Delivered successfully to customer",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a11",
    "orderNumber": "MD17634199892810002",
    "status": "delivered",
    "delivery": {
      "assignedTo": {
        "firstName": "Ravi",
        "lastName": "Kumar"
      },
      "actualDeliveryTime": "2025-11-18T11:00:00.000Z"
    },
    "paymentInfo": {
      "status": "completed",
      "paidAt": "2025-11-18T11:00:00.000Z"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Order is not out for delivery"
}
```

---

### 12. Get Delivery Boy Stats
**Endpoint:** `GET /api/delivery/stats`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "totalDeliveries": 15,
    "completedDeliveries": 15,
    "rating": 4.5,
    "averageDeliveryTime": 35,
    "availability": "available",
    "status": "active"
  }
}
```

---

### 13. Logout Delivery Boy
**Endpoint:** `POST /api/delivery/logout`  
**Access:** Private (Delivery Boy)  
**Headers:**
```
Authorization: Bearer <delivery_boy_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## 🛒 CUSTOMER APP APIs

### 1. Register with OTP
**Endpoint:** `POST /api/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "phone": "9876543210",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "data": {
    "phone": "9876543210",
    "otpSent": true
  }
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Access:** Public

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "_id": "691929a6958818120f6e0a60",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "9876543210",
      "email": "john.doe@example.com",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login with Phone
**Endpoint:** `POST /api/auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "data": {
    "phone": "9876543210",
    "otpSent": true
  }
}
```

---

### 4. Get User Profile
**Endpoint:** `GET /api/users/me`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "691929a6958818120f6e0a60",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "savedAddresses": [],
    "createdAt": "2025-11-18T10:00:00.000Z"
  }
}
```

---

### 5. Add Address
**Endpoint:** `POST /api/addresses`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "street": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "country": "India",
  "landmark": "Near Central Mall",
  "addressType": "home",
  "isDefault": true
}
```
*addressType options: `home`, `work`, `other`*

**Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a20",
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "landmark": "Near Central Mall",
    "addressType": "home",
    "isDefault": true
  }
}
```

---

### 6. Get All Addresses
**Endpoint:** `GET /api/addresses`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "_id": "691ba755c3d306cd55108a20",
      "street": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "landmark": "Near Central Mall",
      "addressType": "home",
      "isDefault": true
    }
  ]
}
```

---

### 7. Get Products
**Endpoint:** `GET /api/products`  
**Access:** Public  
**Query Parameters:**
- `category` - Filter by category (chicken, mutton, fish, seafood)
- `search` - Search by name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Examples:**
```
GET /api/products
GET /api/products?category=chicken
GET /api/products?search=breast
GET /api/products?category=mutton&page=2&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "6918cee44fb1b2e9b84a4321",
        "name": "Chicken Breast",
        "description": "Fresh boneless chicken breast",
        "category": "chicken",
        "price": 299,
        "discountedPrice": 279,
        "unit": "kg",
        "image": "http://10.0.2.2:5000/uploads/chicken-breast.jpg",
        "availability": {
          "inStock": true,
          "quantity": 50
        },
        "rating": 4.5,
        "reviewCount": 120
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### 8. Get Product by ID
**Endpoint:** `GET /api/products/:id`  
**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "6918cee44fb1b2e9b84a4321",
    "name": "Chicken Breast",
    "description": "Fresh boneless chicken breast",
    "category": "chicken",
    "price": 299,
    "discountedPrice": 279,
    "unit": "kg",
    "image": "http://10.0.2.2:5000/uploads/chicken-breast.jpg",
    "nutritionalInfo": {
      "protein": "31g",
      "fat": "3.6g",
      "calories": "165"
    },
    "availability": {
      "inStock": true,
      "quantity": 50
    }
  }
}
```

---

### 9. Add to Cart
**Endpoint:** `POST /api/cart/add`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "productId": "6918cee44fb1b2e9b84a4321",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "_id": "691ba755c3d306cd55108a25",
    "user": "691929a6958818120f6e0a60",
    "items": [
      {
        "product": {
          "_id": "6918cee44fb1b2e9b84a4321",
          "name": "Chicken Breast",
          "price": 299,
          "image": "http://10.0.2.2:5000/uploads/chicken-breast.jpg"
        },
        "quantity": 2,
        "price": 299,
        "subtotal": 598
      }
    ],
    "totalAmount": 598
  }
}
```

---

### 10. Get Cart
**Endpoint:** `GET /api/cart`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a25",
    "items": [
      {
        "product": {
          "_id": "6918cee44fb1b2e9b84a4321",
          "name": "Chicken Breast",
          "price": 299,
          "discountedPrice": 279,
          "image": "http://10.0.2.2:5000/uploads/chicken-breast.jpg"
        },
        "quantity": 2,
        "price": 279,
        "subtotal": 558
      }
    ],
    "totalAmount": 558
  }
}
```

---

### 11. Update Cart Item
**Endpoint:** `PUT /api/cart/update`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "productId": "6918cee44fb1b2e9b84a4321",
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "items": [...],
    "totalAmount": 837
  }
}
```

---

### 12. Remove from Cart
**Endpoint:** `DELETE /api/cart/remove/:productId`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "items": [],
    "totalAmount": 0
  }
}
```

---

### 13. Clear Cart
**Endpoint:** `DELETE /api/cart/clear`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "items": [],
    "totalAmount": 0
  }
}
```

---

### 14. Create Order
**Endpoint:** `POST /api/orders`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "items": [
    {
      "product": "6918cee44fb1b2e9b84a4321",
      "quantity": 2
    }
  ],
  "savedAddressId": "691ba755c3d306cd55108a20",
  "contactInfo": {
    "phone": "9876543210",
    "alternatePhone": "9876543211"
  },
  "paymentMethod": "cash-on-delivery",
  "specialInstructions": "Please call before delivery"
}
```

**OR provide address directly:**
```json
{
  "items": [
    {
      "product": "6918cee44fb1b2e9b84a4321",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "landmark": "Near Mall"
  },
  "contactInfo": {
    "phone": "9876543210"
  },
  "paymentMethod": "online"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a30",
    "orderNumber": "MD17634199894060005",
    "status": "pending",
    "items": [...],
    "pricing": {
      "subtotal": 558,
      "deliveryFee": 50,
      "total": 608
    },
    "paymentInfo": {
      "method": "cash-on-delivery",
      "status": "pending"
    }
  }
}
```

---

### 15. Get My Orders
**Endpoint:** `GET /api/orders`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "691ba755c3d306cd55108a30",
        "orderNumber": "MD17634199894060005",
        "status": "confirmed",
        "items": [
          {
            "product": {
              "name": "Chicken Breast",
              "image": "..."
            },
            "quantity": 2,
            "subtotal": 558
          }
        ],
        "pricing": {
          "total": 608
        },
        "createdAt": "2025-11-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15
    }
  }
}
```

---

### 16. Get Order by ID
**Endpoint:** `GET /api/orders/:id`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "691ba755c3d306cd55108a30",
    "orderNumber": "MD17634199894060005",
    "status": "out-for-delivery",
    "items": [...],
    "deliveryAddress": {...},
    "pricing": {...},
    "delivery": {
      "assignedTo": {
        "firstName": "Ravi",
        "lastName": "Kumar",
        "phone": "9123456789"
      },
      "estimatedTime": "2025-11-18T11:30:00.000Z"
    },
    "statusHistory": [...]
  }
}
```

---

### 17. Apply Coupon
**Endpoint:** `POST /api/coupons/apply`  
**Access:** Private  
**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "code": "WELCOME50",
  "orderAmount": 1000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "code": "WELCOME50",
    "discount": 50,
    "finalAmount": 950
  }
}
```

---

## 🔧 Testing Order IDs

Use these order IDs for testing (generated from seed script):

```
691ba755c3d306cd55108a1e
691ba755c3d306cd55108a17
691ba755c3d306cd55108a11
691ba755c3d306cd55108a0a
```

---

## 🔑 Common Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Testing Flow

### Delivery Boy Flow:
1. Register → `POST /api/delivery/register`
2. Login → `POST /api/delivery/login`
3. Update availability → `PUT /api/delivery/availability`
4. Get pending orders → `GET /api/delivery/orders/pending`
5. Accept order → `POST /api/delivery/orders/:id/accept`
6. Get order details → `GET /api/orders/:id`
7. Mark out for delivery → `PUT /api/delivery/orders/:id/out-for-delivery`
8. Mark delivered → `PUT /api/delivery/orders/:id/delivered`

### Customer Flow:
1. Register → `POST /api/auth/register`
2. Verify OTP → `POST /api/auth/verify-otp`
3. Browse products → `GET /api/products`
4. Add to cart → `POST /api/cart/add`
5. View cart → `GET /api/cart`
6. Add address → `POST /api/addresses`
7. Create order → `POST /api/orders`
8. Track order → `GET /api/orders/:id`

---

## 💡 Tips

1. **Save tokens** after login for subsequent requests
2. **Use saved addressId** instead of providing full address each time
3. **Check order status** before attempting status transitions
4. **Update location** periodically for delivery boys
5. **Clear cart** after successful order placement

---

## 🚀 Quick Test Commands

### Using cURL:

**Login Delivery Boy:**
```bash
curl -X POST http://localhost:5000/api/delivery/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi.kumar@example.com","password":"password123"}'
```

**Get Pending Orders:**
```bash
curl -X GET http://localhost:5000/api/delivery/orders/pending \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Accept Order:**
```bash
curl -X POST http://localhost:5000/api/delivery/orders/ORDER_ID_HERE/accept \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Last Updated:** November 18, 2025  
**API Version:** 1.0.0
