# 🏠 Address Management System

## Overview
The address management system allows users to save multiple delivery addresses for convenience during checkout. Users can manage their addresses, set defaults, and use them for quick order placement.

## 📍 Where User Addresses Are Saved

### User Model Enhancement
User addresses are saved in the **User model** as an array called `savedAddresses`:

```javascript
// In models/User.js
savedAddresses: [{
  label: String,           // e.g., "Home", "Office", "Mom's Place"
  street: String,          // Full street address
  city: String,           
  state: String,
  zipCode: String,        // 6-digit PIN code
  country: String,        // Default: "India"
  landmark: String,       // Optional landmark
  isDefault: Boolean,     // Only one can be true
  coordinates: {          // Optional GPS coordinates
    latitude: Number,
    longitude: Number
  }
}]
```

## 🛡️ Address Validation & Business Logic

### Automatic Default Management
- First address added automatically becomes default
- Only one address can be default at a time
- When setting new default, previous default is automatically unset
- If default address is deleted, first remaining address becomes default

### Data Validation
- **Label**: 1-50 characters, alphanumeric + spaces/hyphens/underscores
- **Street**: 5-200 characters minimum
- **City/State**: 2-50 characters, letters only
- **PIN Code**: Exactly 6 digits (Indian format)
- **Coordinates**: Valid latitude (-90 to 90), longitude (-180 to 180)

## 🔗 API Endpoints

### Address Management
```
GET    /api/addresses           # Get all saved addresses
GET    /api/addresses/default   # Get default address
POST   /api/addresses           # Add new address
PUT    /api/addresses/:id       # Update existing address
DELETE /api/addresses/:id       # Delete address
PATCH  /api/addresses/:id/default # Set as default address
```

### Order Integration
```
POST   /api/orders              # Create order with saved or new address
```

## 📝 Usage Examples

### 1. Add New Address
```javascript
POST /api/addresses
{
  "label": "Home",
  "street": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra", 
  "zipCode": "400001",
  "landmark": "Near City Mall",
  "isDefault": true,
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

### 2. Create Order with Saved Address
```javascript
POST /api/orders
{
  "items": [...],
  "savedAddressId": "64a7b8c9d1234567890abcde",
  "contactInfo": { "phone": "+919876543210" },
  "paymentMethod": "cash-on-delivery"
}
```

### 3. Create Order with New Address
```javascript
POST /api/orders
{
  "items": [...],
  "deliveryAddress": {
    "street": "456 New Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001"
  },
  "contactInfo": { "phone": "+919876543210" },
  "paymentMethod": "online"
}
```

## 🎯 Benefits of This Approach

### ✅ User Experience
- **Quick Checkout**: Select from saved addresses
- **Multiple Locations**: Save home, office, family addresses
- **Default Convenience**: Automatic default selection
- **Address Labels**: Easy identification ("Home", "Office")

### ✅ Data Management
- **Single Source**: All addresses in User model
- **Consistency**: Validated address format
- **Flexibility**: Support both saved and one-time addresses
- **GPS Ready**: Optional coordinate storage for delivery optimization

### ✅ Business Logic
- **Automatic Defaults**: No manual default management needed
- **Validation**: Consistent address format across orders
- **Order History**: Clear delivery address records
- **Scalability**: Easy to add features like address verification

## 🔄 Order Flow Integration

### With Saved Address
1. User selects saved address during checkout
2. Frontend sends `savedAddressId` in order request
3. Backend retrieves address from user's `savedAddresses`
4. Order created with populated address details

### With New Address
1. User enters new address during checkout
2. Frontend sends full `deliveryAddress` object
3. Backend validates address format
4. Order created with provided address
5. *Optional*: Prompt user to save address for future

## 🏗️ Database Structure

### User Document Example
```javascript
{
  "_id": "64a7b8c9d1234567890abcde",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "savedAddresses": [
    {
      "_id": "64a7b8c9d1234567890abcdf",
      "label": "Home",
      "street": "123 Main Street, Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "landmark": "Near City Mall", 
      "isDefault": true,
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    },
    {
      "_id": "64a7b8c9d1234567890abce0", 
      "label": "Office",
      "street": "456 Business District",
      "city": "Mumbai",
      "state": "Maharashtra", 
      "zipCode": "400013",
      "isDefault": false
    }
  ]
}
```

### Order Document Reference
```javascript
{
  "_id": "64a7b8c9d1234567890abce1",
  "customer": "64a7b8c9d1234567890abcde",
  "deliveryAddress": {
    "street": "123 Main Street, Apt 4B",
    "city": "Mumbai", 
    "state": "Maharashtra",
    "zipCode": "400001",
    "landmark": "Near City Mall"
  }
  // ... other order fields
}
```

## 🚀 Frontend Integration

### React Native Example
```javascript
// Get saved addresses
const addresses = await api.get('/addresses');

// Add new address
const newAddress = await api.post('/addresses', {
  label: 'Home',
  street: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  zipCode: '400001',
  isDefault: true
});

// Create order with saved address
const order = await api.post('/orders', {
  items: cartItems,
  savedAddressId: selectedAddress._id,
  contactInfo: { phone: user.phone },
  paymentMethod: 'cash-on-delivery'
});
```

## 🔒 Security Considerations

- **Authentication Required**: All address operations require valid JWT
- **User Isolation**: Users can only access their own addresses
- **Input Validation**: Server-side validation for all address fields
- **MongoDB Injection**: Using Mongoose with proper validation
- **Rate Limiting**: Prevent address spam (recommended for production)

This address management system provides a complete, scalable solution for saving and managing user delivery addresses in your meat delivery application!