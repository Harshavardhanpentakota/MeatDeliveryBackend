# Delivery Boy API Documentation

## Overview
Complete API for delivery boy registration, login, and order management in the Meat Delivery System.

## Base URL
```
http://localhost:5000/api/delivery
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register Delivery Boy
**POST** `/register`

Register a new delivery boy in the system.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+919876543210",
  "licenseNumber": "DL1234567890",
  "licenseExpiryDate": "2026-12-31",
  "vehicleType": "two-wheeler",
  "vehicleRegistration": "DL01AB1234",
  "vehicleModel": "Honda Activa",
  "address": "123 Main Street",
  "city": "Delhi",
  "state": "Delhi",
  "zipCode": "110001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Delivery boy registered successfully",
  "data": {
    "_id": "delivery_boy_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "status": "active",
    "availability": "offline",
    "isApproved": false,
    "isVerified": false
  },
  "token": "jwt_token_here"
}
```

**Validation Rules:**
- First name: 2-50 characters
- Last name: 2-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Phone: Valid phone number
- License number: Required
- Vehicle type: Must be 'two-wheeler', 'three-wheeler', or 'car'
- All address fields required

---

### 2. Login Delivery Boy
**POST** `/login`

Login delivery boy with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "_id": "delivery_boy_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "status": "active",
    "availability": "offline",
    "totalDeliveries": 45,
    "completedDeliveries": 44,
    "rating": 4.8
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- 400: Invalid credentials (missing email or password)
- 401: Invalid credentials (wrong email or password)
- 403: Account not approved by admin / Account suspended

---

### 3. Logout Delivery Boy
**POST** `/logout`

Logout and set availability to offline.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Profile Endpoints

### 4. Get Current Profile
**GET** `/me`

Get the current logged-in delivery boy's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "delivery_boy_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "license": {
      "number": "DL1234567890",
      "expiryDate": "2026-12-31"
    },
    "vehicle": {
      "type": "two-wheeler",
      "registrationNumber": "DL01AB1234",
      "model": "Honda Activa"
    },
    "status": "active",
    "availability": "offline",
    "totalDeliveries": 45,
    "completedDeliveries": 44,
    "rating": 4.8,
    "averageDeliveryTime": 28,
    "lastActive": "2025-11-16T10:30:00Z"
  }
}
```

---

### 5. Update Availability
**PUT** `/availability`

Update delivery boy's availability status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "availability": "available"
}
```

**Availability Status Options:**
- `available`: Ready to accept orders
- `busy`: Currently on delivery
- `offline`: Not available

**Response (200):**
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "_id": "delivery_boy_id",
    "firstName": "John",
    "lastName": "Doe",
    "availability": "available",
    "lastActive": "2025-11-16T10:35:00Z"
  }
}
```

---

### 6. Update Location
**PUT** `/location`

Update delivery boy's current location (real-time tracking).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "_id": "delivery_boy_id",
    "firstName": "John",
    "lastName": "Doe",
    "location": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    },
    "lastActive": "2025-11-16T10:40:00Z"
  }
}
```

**Validation:**
- Latitude: -90 to 90
- Longitude: -180 to 180

---

### 7. Get Stats
**GET** `/stats`

Get delivery boy performance statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "totalDeliveries": 45,
    "completedDeliveries": 44,
    "rating": 4.8,
    "averageDeliveryTime": 28,
    "availability": "available",
    "status": "active"
  }
}
```

---

## Order Management Endpoints

### 8. Get Pending Orders
**GET** `/orders/pending`

Get all pending orders available for acceptance.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- None (returns all pending orders)

**Response (200):**
```json
{
  "success": true,
  "message": "Pending orders retrieved successfully",
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "MD1234567890001",
      "customer": {
        "_id": "customer_id",
        "firstName": "Ramesh",
        "lastName": "Kumar",
        "email": "ramesh@example.com",
        "phone": "+919876543210"
      },
      "items": [
        {
          "product": {
            "_id": "product_id",
            "name": "Chicken Breast",
            "category": "meat",
            "price": 450
          },
          "quantity": 2,
          "priceAtTime": 450,
          "subtotal": 900
        }
      ],
      "deliveryAddress": {
        "street": "456 Park Lane",
        "city": "Delhi",
        "state": "Delhi",
        "zipCode": "110002",
        "country": "India",
        "landmark": "Near Park",
        "instructions": "Ring bell twice"
      },
      "contactInfo": {
        "phone": "+919876543210",
        "alternatePhone": "+919876543211"
      },
      "pricing": {
        "subtotal": 900,
        "deliveryFee": 50,
        "tax": 100,
        "discount": 0,
        "total": 1050
      },
      "status": "confirmed",
      "paymentInfo": {
        "method": "cash-on-delivery",
        "status": "pending"
      }
    }
  ]
}
```

**Note:** Returns empty array if no pending orders exist.

---

### 9. Accept Order
**POST** `/orders/:orderId/accept`

Accept a pending order for delivery.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `:orderId` - MongoDB ID of the order

**Response (200):**
```json
{
  "success": true,
  "message": "Order accepted successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "MD1234567890001",
    "status": "out-for-delivery",
    "delivery": {
      "assignedTo": {
        "_id": "delivery_boy_id",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+919876543210"
      },
      "estimatedTime": "2025-11-16T11:15:00Z"
    },
    "customer": {
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "phone": "+919876543210"
    }
  }
}
```

**Error Responses:**
- 404: Order not found
- 400: Order status not acceptable for acceptance
- 400: Delivery boy already has active delivery

---

### 10. Get Assigned Orders
**GET** `/orders/assigned`

Get all orders assigned to current delivery boy (out for delivery or delivered).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Assigned orders retrieved successfully",
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "MD1234567890001",
      "customer": {
        "_id": "customer_id",
        "firstName": "Ramesh",
        "lastName": "Kumar",
        "phone": "+919876543210"
      },
      "items": [
        {
          "product": {
            "_id": "product_id",
            "name": "Chicken Breast",
            "category": "meat",
            "price": 450
          },
          "quantity": 2,
          "priceAtTime": 450,
          "subtotal": 900
        }
      ],
      "deliveryAddress": {
        "street": "456 Park Lane",
        "city": "Delhi",
        "state": "Delhi",
        "zipCode": "110002"
      },
      "status": "out-for-delivery",
      "pricing": {
        "subtotal": 900,
        "deliveryFee": 50,
        "tax": 100,
        "total": 1050
      },
      "delivery": {
        "assignedTo": "delivery_boy_id",
        "estimatedTime": "2025-11-16T11:15:00Z"
      }
    }
  ]
}
```

---

### 11. Mark Out For Delivery
**PUT** `/orders/:orderId/out-for-delivery`

Mark order status as "out for delivery" (delivery started).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `:orderId` - MongoDB ID of the order

**Request Body (Optional):**
```json
{
  "notes": "Picked up from store, heading to delivery location"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order marked as out for delivery",
  "data": {
    "_id": "order_id",
    "orderNumber": "MD1234567890001",
    "status": "out-for-delivery",
    "statusHistory": [
      {
        "status": "out-for-delivery",
        "timestamp": "2025-11-16T10:50:00Z",
        "updatedBy": "delivery_boy_id",
        "notes": "Picked up from store, heading to delivery location"
      }
    ],
    "delivery": {
      "assignedTo": "delivery_boy_id",
      "estimatedTime": "2025-11-16T11:15:00Z"
    }
  }
}
```

**Error Responses:**
- 404: Order not found
- 403: Delivery boy not assigned to this order
- 400: Order not in out-for-delivery status

---

### 12. Mark Delivered
**PUT** `/orders/:orderId/delivered`

Mark order as successfully delivered.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `:orderId` - MongoDB ID of the order

**Request Body:**
```json
{
  "notes": "Delivered in good condition",
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "MD1234567890001",
    "status": "delivered",
    "delivery": {
      "assignedTo": "delivery_boy_id",
      "estimatedTime": "2025-11-16T11:15:00Z",
      "actualDeliveryTime": "2025-11-16T11:08:00Z"
    },
    "statusHistory": [
      {
        "status": "delivered",
        "timestamp": "2025-11-16T11:08:00Z",
        "updatedBy": "delivery_boy_id",
        "notes": "Delivered in good condition"
      }
    ]
  }
}
```

**Effects:**
- Order status set to "delivered"
- Delivery boy stats updated (totalDeliveries, completedDeliveries)
- Delivery boy availability set to "available"
- Average delivery time calculated

**Error Responses:**
- 404: Order not found
- 403: Delivery boy not assigned to this order
- 400: Order not in out-for-delivery status

---

## Status Transitions

### Order Status Flow
```
pending → confirmed → preparing → out-for-delivery → delivered
                                  ↓
                                cancelled
```

### Delivery Boy Availability Flow
```
offline ↔ available ↔ busy
```

---

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (if available)"
}
```

### Common HTTP Status Codes
- **200**: Request successful
- **201**: Resource created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (invalid credentials)
- **403**: Forbidden (not approved, suspended, or unauthorized action)
- **404**: Resource not found
- **500**: Server error

---

## Example Workflow

### Complete Delivery Workflow:

1. **Delivery Boy Login**
   ```
   POST /login
   ```

2. **Update Availability to Available**
   ```
   PUT /availability
   { "availability": "available" }
   ```

3. **View Pending Orders**
   ```
   GET /orders/pending
   ```

4. **Accept an Order**
   ```
   POST /orders/{orderId}/accept
   ```

5. **Update Location (Real-time tracking)**
   ```
   PUT /location
   { "latitude": 28.6139, "longitude": 77.2090 }
   ```

6. **Mark Order as Out For Delivery**
   ```
   PUT /orders/{orderId}/out-for-delivery
   { "notes": "Picked up order" }
   ```

7. **Update Location Again (During delivery)**
   ```
   PUT /location
   { "latitude": 28.6200, "longitude": 77.2150 }
   ```

8. **Mark Order as Delivered**
   ```
   PUT /orders/{orderId}/delivered
   { "notes": "Delivered successfully" }
   ```

9. **Check Stats**
   ```
   GET /stats
   ```

10. **Logout**
    ```
    POST /logout
    ```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Phone numbers should include country code (e.g., +91 for India)
- Delivery boys must be approved by admin before they can login
- Location updates are tracked for real-time delivery monitoring
- Average delivery time is calculated based on last 10 completed deliveries
- Delivery boy status and availability are automatically managed based on delivery state
