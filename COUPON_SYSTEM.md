# 🎫 Coupon System Documentation

## 🎯 Overview
The coupon system allows your meat delivery app to offer discounts to customers through promotional codes. It includes percentage and fixed amount discounts with advanced features like usage limits, category restrictions, and user eligibility rules.

## ✨ Features

### 🔹 Coupon Types
- **Percentage Discount**: e.g., 20% OFF
- **Fixed Amount Discount**: e.g., ₹100 OFF

### 🔹 Advanced Options
- **Minimum Order Value**: Required cart amount to use coupon
- **Maximum Discount**: Cap on discount amount for percentage coupons
- **Usage Limits**: Total and per-user usage restrictions
- **Category Restrictions**: Apply to specific product categories
- **Product Exclusions**: Exclude specific products
- **User Eligibility**: All users, new users, or premium users
- **Validity Period**: Start and end dates

## 📚 API Endpoints

### 🔓 Public Endpoints

#### Get Active Coupons
```http
GET /api/coupons/active
```

**Response:**
```json
{
  "success": true,
  "message": "Active coupons retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "coupon_id",
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
    ],
    "pagination": { "current": 1, "pages": 1, "total": 5 }
  }
}
```

### 🔐 Authenticated User Endpoints

#### Validate Coupon
```http
POST /api/coupons/validate
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "code": "WELCOME10",
  "orderAmount": 800
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon": {
      "_id": "coupon_id",
      "code": "WELCOME10",
      "description": "Welcome offer - 10% off on your first order",
      "type": "percentage",
      "value": 10,
      "minimumOrderValue": 500,
      "maximumDiscount": 200,
      "formattedDiscount": "10% OFF"
    },
    "discount": 80,
    "applicableAmount": 800
  }
}
```

#### Apply Coupon to Cart
```http
POST /api/cart/apply-coupon
Authorization: Bearer TOKEN
Content-Type: application/json

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
      "_id": "cart_id",
      "subtotal": 1200,
      "discountAmount": 240,
      "finalAmount": 960,
      "appliedCoupon": {
        "code": "BEEF20",
        "discount": 240,
        "appliedAt": "2024-10-19T10:30:00.000Z"
      }
    },
    "savings": 240,
    "originalAmount": 1200,
    "finalAmount": 960
  }
}
```

#### Remove Coupon from Cart
```http
DELETE /api/cart/remove-coupon
Authorization: Bearer TOKEN
```

#### Get Cart with Coupon Info
```http
GET /api/cart/summary
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Cart summary retrieved successfully",
  "data": {
    "itemCount": 3,
    "subtotal": 1200,
    "discountAmount": 240,
    "totalAmount": 960,
    "formattedSubtotal": "₹1200.00",
    "formattedDiscount": "₹240.00",
    "formattedTotal": "₹960.00",
    "appliedCoupon": {
      "code": "BEEF20",
      "discount": 240,
      "appliedAt": "2024-10-19T10:30:00.000Z"
    },
    "items": [...]
  }
}
```

### 👑 Admin Only Endpoints

#### Get All Coupons
```http
GET /api/coupons?page=1&limit=10&isActive=true
Authorization: Bearer ADMIN_TOKEN
```

#### Create Coupon
```http
POST /api/coupons
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

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

#### Update Coupon
```http
PUT /api/coupons/:id
Authorization: Bearer ADMIN_TOKEN
```

#### Delete Coupon (Soft Delete)
```http
DELETE /api/coupons/:id
Authorization: Bearer ADMIN_TOKEN
```

#### Get Coupon Statistics
```http
GET /api/coupons/:id/stats
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon statistics retrieved successfully",
  "data": {
    "totalUsage": 25,
    "usageLimit": 100,
    "remainingUsage": 75,
    "uniqueUsers": 23,
    "isActive": true,
    "isCurrentlyValid": true,
    "validFrom": "2024-10-19T00:00:00.000Z",
    "validTo": "2024-11-19T23:59:59.000Z",
    "daysRemaining": 31
  }
}
```

## 🧪 Sample Coupons (Seeded)

| Code | Type | Value | Min Order | Max Discount | Categories | Description |
|------|------|-------|-----------|--------------|------------|-------------|
| `WELCOME10` | Percentage | 10% | ₹500 | ₹200 | All | Welcome offer for new users |
| `BEEF20` | Percentage | 20% | ₹300 | ₹500 | Beef | 20% off on beef products |
| `FLAT100` | Fixed | ₹100 | ₹1000 | - | All | Flat discount on large orders |
| `WEEKEND25` | Percentage | 25% | ₹750 | ₹300 | All | Weekend special offer |
| `SEAFOOD15` | Percentage | 15% | ₹400 | ₹250 | Fish, Seafood | Seafood promotion |

## 🔄 Integration with Orders

When creating an order, the coupon information from the cart should be transferred:

```javascript
// In order creation
const orderData = {
  // ... other order fields
  appliedCoupon: cart.appliedCoupon ? {
    coupon: cart.appliedCoupon.coupon,
    code: cart.appliedCoupon.code,
    discount: cart.appliedCoupon.discount
  } : null,
  pricing: {
    subtotal: cart.subtotal,
    discount: cart.discountAmount,
    total: cart.finalAmount,
    // ... other pricing fields
  }
};

// Apply coupon usage when order is confirmed
if (cart.appliedCoupon) {
  const coupon = await Coupon.findById(cart.appliedCoupon.coupon);
  await coupon.applyCouponUsage(req.user._id);
}
```

## 🛡️ Business Rules

### Validation Rules:
1. Coupon code must be 3-20 characters, uppercase letters and numbers only
2. Percentage coupons cannot exceed 100%
3. Valid to date must be after valid from date
4. Minimum order value must be positive
5. Usage limits must be at least 1

### Application Rules:
1. User cannot exceed per-user usage limit
2. Total usage cannot exceed global usage limit
3. Cart amount must meet minimum order value
4. Coupon must be currently valid (within date range)
5. Category restrictions apply if specified
6. Excluded products are not eligible for discount

### Security Features:
1. Coupon codes are stored in uppercase
2. Usage tracking prevents fraud
3. Soft delete preserves historical data
4. Admin-only creation and management

## 🚀 Quick Start

1. **Seed sample coupons:**
   ```bash
   npm run seed:coupons
   ```

2. **Test coupon validation:**
   ```bash
   POST /api/coupons/validate
   { "code": "WELCOME10", "orderAmount": 800 }
   ```

3. **Apply coupon to cart:**
   ```bash
   POST /api/cart/apply-coupon
   { "code": "BEEF20" }
   ```

4. **Create new coupon (Admin):**
   ```bash
   POST /api/coupons
   { "code": "SPECIAL50", "type": "percentage", "value": 50, ... }
   ```

## 📱 Frontend Integration

The coupon system is fully integrated with your cart system. When a user applies a coupon:

1. Cart totals automatically update
2. Discount is clearly shown
3. Savings are highlighted
4. Final amount reflects the discount

This provides a seamless checkout experience with immediate feedback on savings! 🎯