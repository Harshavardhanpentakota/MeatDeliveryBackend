# PIN-Based Registration System

## Overview

The Meat Delivery Backend now uses **6-digit PIN authentication** instead of traditional passwords for user registration and login.

## 🔄 **Key Changes Made:**

### **1. Registration API Updated**
- **Removed**: `password` field requirement
- **Added**: `pin` field requirement (exactly 6 digits)
- **Enhanced**: Phone number validation and formatting
- **Improved**: Duplicate email/phone checking

### **2. User Model Changes**
- **Password**: Now optional (for backward compatibility)
- **PIN**: Required, exactly 6 digits, encrypted with bcrypt
- **Validation**: Strict 6-digit numeric validation

### **3. Authentication Flow**
- **Registration**: Uses 6-digit PIN
- **Login**: Email/Phone + PIN authentication
- **Security**: PIN lockout after 5 failed attempts

## 📱 **New Registration API**

### **POST** `/api/auth/register`

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
  }
}
```

**Required Fields:**
- ✅ `firstName` (2-50 characters)
- ✅ `lastName` (2-50 characters)  
- ✅ `email` (valid email format)
- ✅ `pin` (exactly 6 digits)
- ✅ `phone` (valid phone number)

**Optional Fields:**
- 📍 `address` (complete address object)
- 👤 `role` (defaults to 'customer')

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully with PIN",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com", 
      "phone": "+1234567890",
      "role": "customer",
      "savedAddresses": [...],
      "emailVerified": false,
      "phoneVerified": false
    }
  }
}
```

**Error Responses:**
```json
// Invalid PIN
{
  "success": false,
  "message": "PIN must be exactly 6 digits"
}

// Duplicate email
{
  "success": false, 
  "message": "User already exists with this email"
}

// Duplicate phone
{
  "success": false,
  "message": "User already exists with this phone number"
}
```

## 🔐 **Authentication Methods**

### **1. PIN Login**
**POST** `/api/auth/login-pin`
```json
{
  "identifier": "john@example.com", // or "+1234567890"
  "pin": "123456"
}
```

### **2. OTP Login**  
**POST** `/api/auth/request-otp` → **POST** `/api/auth/verify-otp`
```json
// Request OTP
{
  "identifier": "john@example.com" // or phone
}

// Verify OTP
{
  "identifier": "john@example.com",
  "otp": "123456"
}
```

### **3. PIN Reset**
**POST** `/api/auth/forgot-pin` → **POST** `/api/auth/reset-pin`
```json
// Request reset OTP
{
  "identifier": "john@example.com"
}

// Reset PIN
{
  "identifier": "john@example.com", 
  "otp": "123456",
  "newPin": "654321",
  "confirmPin": "654321"
}
```

## 🛡️ **Security Features**

### **PIN Security**
- ✅ **6-digit requirement**: Exactly 6 numeric digits
- ✅ **Bcrypt encryption**: Secure hash storage
- ✅ **Attempt limiting**: 5 attempts before 30-min lockout
- ✅ **No plain text**: PINs never stored in plain text

### **Phone/Email Validation**
- ✅ **Unique constraints**: No duplicate emails or phones
- ✅ **Format validation**: Proper email and phone formats
- ✅ **Auto-formatting**: Phone numbers standardized

### **Registration Security**
- ✅ **Input validation**: All fields validated
- ✅ **SQL injection protection**: Mongoose schema validation
- ✅ **XSS protection**: Input sanitization

## 📧 **Welcome Flow**

Upon successful registration:
1. ✅ **User created** with encrypted PIN
2. ✅ **JWT token** issued for immediate login
3. ✅ **Welcome notification** sent via app
4. ✅ **Welcome email** sent with features overview
5. ✅ **WELCOME10 coupon** mentioned in email

## 🔄 **Migration from Password**

### **Existing Users**
- Password field remains for backward compatibility
- Can set PIN via `/api/auth/set-pin` endpoint
- Can use either password login or PIN login

### **New Users** 
- Must register with 6-digit PIN
- No password required
- Immediate PIN-based authentication

## 🧪 **Testing Examples**

### **Register New User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "pin": "123456",
    "phone": "+1234567890"
  }'
```

### **Login with PIN**
```bash
curl -X POST http://localhost:5000/api/auth/login-pin \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "pin": "123456"
  }'
```

### **Set New PIN** (Authenticated)
```bash
curl -X POST http://localhost:5000/api/auth/set-pin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "pin": "654321",
    "confirmPin": "654321"
  }'
```

## 📱 **Mobile App Integration**

### **Registration Flow**
1. **Collect user info**: Name, email, phone, address
2. **PIN setup**: 6-digit PIN entry with confirmation
3. **Submit registration**: Single API call
4. **Auto-login**: Use returned JWT token
5. **Welcome screen**: Show features and offers

### **Login Flow**
1. **Identifier input**: Email or phone number
2. **PIN entry**: 6-digit secure input
3. **Biometric option**: Can store PIN securely
4. **Fallback**: OTP option if PIN forgotten

### **Security Best Practices**
- 🔐 **Secure storage**: Use device keychain for PIN
- 📱 **Biometric auth**: TouchID/FaceID for PIN access
- 🔄 **Auto-logout**: After inactivity period
- 🚫 **PIN hiding**: Mask PIN input with dots

## 🎯 **Benefits**

### **User Experience**
- ⚡ **Faster login**: 6 digits vs complex password
- 📱 **Mobile-friendly**: Easy numeric input
- 🧠 **Memorable**: Simpler than passwords
- 🔄 **Quick recovery**: OTP-based PIN reset

### **Security** 
- 🔒 **Strong encryption**: Bcrypt hashing
- 🚫 **No password reuse**: Unique PIN per app
- ⏰ **Auto-lockout**: Failed attempt protection
- 📧 **Multi-channel**: Email + SMS verification

### **Development**
- 🎯 **Simplified**: Single authentication method
- 📱 **Mobile-first**: Designed for mobile apps
- 🔧 **Maintainable**: Clean API design
- 📈 **Scalable**: Efficient validation and storage

---

## ✅ **Summary**

Your Meat Delivery Backend now features:

- ✅ **6-digit PIN registration** instead of passwords
- ✅ **Dual-identifier login** (email or phone)
- ✅ **Secure PIN storage** with bcrypt encryption
- ✅ **Email welcome flow** with professional templates
- ✅ **PIN reset system** via OTP verification
- ✅ **Mobile-optimized** authentication flow
- ✅ **Backward compatibility** with existing password system

The system is ready for mobile app integration with a modern, secure, and user-friendly authentication experience! 🎉📱