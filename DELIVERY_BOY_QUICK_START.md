# Delivery Boy API - Quick Reference Guide

## Quick Start

### 1. Register a Delivery Boy
```bash
curl -X POST http://localhost:5000/api/delivery/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "+919876543210",
    "licenseNumber": "DL123456",
    "licenseExpiryDate": "2026-12-31",
    "vehicleType": "two-wheeler",
    "vehicleRegistration": "DL01AB1234",
    "vehicleModel": "Honda Activa",
    "address": "123 Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/delivery/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Save the token from response!**

### 3. Set Availability to Available
```bash
curl -X PUT http://localhost:5000/api/delivery/availability \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability": "available"}'
```

### 4. View Pending Orders
```bash
curl -X GET http://localhost:5000/api/delivery/orders/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Accept an Order
```bash
curl -X POST http://localhost:5000/api/delivery/orders/ORDER_ID/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Update Location (Real-time)
```bash
curl -X PUT http://localhost:5000/api/delivery/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

### 7. Mark Order as Out for Delivery
```bash
curl -X PUT http://localhost:5000/api/delivery/orders/ORDER_ID/out-for-delivery \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Picked up order"}'
```

### 8. Mark Order as Delivered
```bash
curl -X PUT http://localhost:5000/api/delivery/orders/ORDER_ID/delivered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Delivered successfully"}'
```

### 9. Get Performance Stats
```bash
curl -X GET http://localhost:5000/api/delivery/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Logout
```bash
curl -X POST http://localhost:5000/api/delivery/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/delivery/register` | Register new delivery boy |
| POST | `/api/delivery/login` | Login delivery boy |

### Protected Endpoints (require Bearer token)

#### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/me` | Get profile |
| GET | `/api/delivery/stats` | Get stats |
| PUT | `/api/delivery/availability` | Update availability |
| PUT | `/api/delivery/location` | Update location |
| POST | `/api/delivery/logout` | Logout |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/orders/pending` | Get pending orders |
| GET | `/api/delivery/orders/assigned` | Get assigned orders |
| POST | `/api/delivery/orders/:id/accept` | Accept order |
| PUT | `/api/delivery/orders/:id/out-for-delivery` | Mark out for delivery |
| PUT | `/api/delivery/orders/:id/delivered` | Mark delivered |

---

## Field Requirements

### Register Endpoint
- **firstName** (string, 2-50 chars) ✓ Required
- **lastName** (string, 2-50 chars) ✓ Required
- **email** (string, valid email) ✓ Required
- **password** (string, min 6 chars) ✓ Required
- **phone** (string, valid phone) ✓ Required
- **licenseNumber** (string) ✓ Required
- **licenseExpiryDate** (ISO date) ✓ Required
- **vehicleType** (string: 'two-wheeler'/'three-wheeler'/'car') ✓ Required
- **vehicleRegistration** (string) ✓ Required
- **vehicleModel** (string) ✗ Optional
- **address** (string) ✓ Required
- **city** (string) ✓ Required
- **state** (string) ✓ Required
- **zipCode** (string) ✓ Required

### Login Endpoint
- **email** (string) ✓ Required
- **password** (string) ✓ Required

### Update Availability
- **availability** (string: 'available'/'busy'/'offline') ✓ Required

### Update Location
- **latitude** (number, -90 to 90) ✓ Required
- **longitude** (number, -180 to 180) ✓ Required

### Mark Out For Delivery / Delivered
- **notes** (string) ✗ Optional

---

## Response Format

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Delivery Boy Status Values

### Status Field
- `active` - Approved and can work
- `inactive` - Not currently working
- `on-leave` - On leave
- `suspended` - Account suspended

### Availability Field
- `available` - Ready to accept orders
- `busy` - Currently on delivery
- `offline` - Not available

---

## Order Status Flow

```
pending
    ↓
confirmed → preparing
    ↓
out-for-delivery
    ↓
delivered

(or cancelled anytime)
```

---

## Important Notes

1. **Authentication:** All protected endpoints require valid JWT token in Authorization header
2. **Admin Approval:** Delivery boy must be approved (isApproved=true) by admin to login
3. **Single Delivery:** Delivery boy can only have one active (out-for-delivery) order at a time
4. **Location Tracking:** Location is geospatially indexed, enable real-time tracking in frontend
5. **Stats Auto-Update:** Stats are automatically updated when order is marked delivered
6. **Average Time:** Calculated from last 10 completed deliveries
7. **Timestamps:** All timestamps are ISO 8601 format (UTC)
8. **Phone Format:** Must include country code (e.g., +91 for India)

---

## Common Errors

| Status | Message | Solution |
|--------|---------|----------|
| 400 | Invalid credentials | Check email/password format |
| 401 | Invalid credentials | Wrong email or password |
| 403 | Not approved by admin | Wait for admin approval |
| 403 | Account suspended | Contact admin |
| 404 | Order not found | Verify order ID |
| 400 | Order status not acceptable | Order already assigned to someone |
| 400 | Already has active delivery | Complete current delivery first |

---

## Postman Collection

Import `DELIVERY_BOY_POSTMAN.json` into Postman for pre-built requests.

Set these environment variables in Postman:
- `delivery_token` - JWT token (auto-populated after login)
- `delivery_boy_id` - Delivery boy ID (auto-populated after login)
- `order_id` - Order ID to be set manually

---

## Full Workflow Example

1. **Register**
   ```
   POST /register
   ```

2. **Admin approves** (backend/database)

3. **Login**
   ```
   POST /login
   ```

4. **Set Available**
   ```
   PUT /availability
   { "availability": "available" }
   ```

5. **Get Pending Orders**
   ```
   GET /orders/pending
   ```

6. **Accept Order** (repeat 5-8 for each order)
   ```
   POST /orders/{id}/accept
   ```

7. **Update Location**
   ```
   PUT /location
   { "latitude": 28.6139, "longitude": 77.2090 }
   ```

8. **Mark Out for Delivery**
   ```
   PUT /orders/{id}/out-for-delivery
   ```

9. **Deliver Order**
   ```
   PUT /orders/{id}/delivered
   ```

10. **Repeat** for next order

11. **Check Stats**
    ```
    GET /stats
    ```

12. **Logout**
    ```
    POST /logout
    ```

---

## Model Schema Overview

### DeliveryBoy
```javascript
{
  firstName, lastName, email, password (hashed),
  phone, license {number, expiryDate},
  vehicle {type, registrationNumber, model},
  address {street, city, state, zipCode, country},
  status (active/inactive/on-leave/suspended),
  availability (available/busy/offline),
  location {type: Point, coordinates: [lng, lat]},
  totalDeliveries, completedDeliveries,
  rating, averageDeliveryTime,
  bankDetails {...},
  documents {...},
  isVerified, isApproved,
  joinDate, lastActive,
  pushToken, pushPlatform
}
```

---

## Related Endpoints

### Create Test Order (as Admin/Customer)
```
POST /api/orders
```

### Update Order Status (Internal - if needed)
```
PUT /api/orders/{orderId}
```

### Customer View Order Status
```
GET /api/orders/{orderId}
```

---

## Support & Debugging

Check logs in `/api/health` endpoint for system status:
```bash
curl http://localhost:5000/api/health
```

---

**Last Updated:** November 16, 2025
**API Version:** 1.0.0
