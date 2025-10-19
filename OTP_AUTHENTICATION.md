# 📱 OTP Authentication Testing Guide

Your Meat Delivery API now supports **OTP-based mobile authentication**! Here's how to test it in Postman:

## 🆕 New Authentication Endpoints

### 1. Request OTP
**POST** `http://localhost:5000/api/auth/request-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
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

**Console Output (for demo):**
```
📱 SMS sent to +1234567890: Your OTP is 123456
📱 OTP expires in 5 minutes
```

### 2. Verify OTP & Login
**POST** `http://localhost:5000/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
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
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "phoneVerified": true,
    "role": "customer"
  }
}
```

## 🧪 Complete Testing Workflow

### Step 1: Register a User
**POST** `http://localhost:5000/api/auth/register`
```json
{
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
}
```

### Step 2: Request OTP for Mobile Login
**POST** `http://localhost:5000/api/auth/request-otp`
```json
{
  "phone": "+1234567890"
}
```

### Step 3: Check Console for OTP
Look at the server console output - you'll see the OTP printed:
```
📱 SMS sent to +1234567890: Your OTP is 123456
```

### Step 4: Verify OTP and Login
**POST** `http://localhost:5000/api/auth/verify-otp`
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Step 5: Use the Token
Save the token from Step 4 and use it in subsequent requests:
```
Authorization: Bearer your_token_here
```

## 🔐 Authentication Methods Available

| Method | Endpoint | Required Fields |
|--------|----------|----------------|
| Email/Password | `/auth/login` | email, password |
| Mobile OTP | `/auth/request-otp` → `/auth/verify-otp` | phone → phone, otp |

## 📱 Phone Number Formats Supported

The system automatically formats phone numbers:
- `1234567890` → `+911234567890` (assumes Indian number)
- `+1234567890` → `+1234567890` (keeps international format)
- `+91 12345 67890` → `+911234567890` (removes spaces)

## 🛡️ Security Features

- **OTP Expiry:** 5 minutes
- **Attempt Limiting:** Max 5 OTP requests per phone
- **Secure Storage:** OTPs are hashed before storage
- **Phone Verification:** Tracks phone verification status

## 🧪 Postman Collection Update

Here are the new requests to add to your Postman collection:

### Request OTP
```
Method: POST
URL: http://localhost:5000/api/auth/request-otp
Headers: Content-Type: application/json
Body: {"phone": "+1234567890"}
```

### Verify OTP
```
Method: POST
URL: http://localhost:5000/api/auth/verify-otp
Headers: Content-Type: application/json
Body: {"phone": "+1234567890", "otp": "123456"}
Test Script: 
if (responseCode.code === 200) {
    var jsonData = JSON.parse(responseBody);
    pm.collectionVariables.set('token', jsonData.token);
}
```

## ⚠️ Important Notes

1. **Demo Mode:** Currently uses console output for OTP (no real SMS)
2. **Production Setup:** Replace with real SMS service (Twilio, AWS SNS, etc.)
3. **Rate Limiting:** Max 5 OTP attempts per phone number
4. **Token Usage:** Use the JWT token for authenticated requests
5. **Phone Verification:** Users must verify phone to use OTP login

## 🔧 Real SMS Integration

To integrate with a real SMS service, update `/utils/otp.js`:

```javascript
// Example with Twilio
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

const sendSMS = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      from: '+1234567890', // Your Twilio number
      to: phone
    });
    return true;
  } catch (error) {
    console.error('SMS Error:', error);
    return false;
  }
};
```

## 🎯 Test Cases to Try

1. ✅ Request OTP with valid phone
2. ✅ Verify OTP with correct code
3. ❌ Verify with expired OTP
4. ❌ Verify with wrong OTP
5. ❌ Request OTP for non-existent phone
6. ❌ Exceed OTP attempt limit
7. ✅ Login with email/password (still works)
8. ✅ Use token for authenticated requests

Your API now supports both traditional email/password and modern OTP-based authentication! 🚀