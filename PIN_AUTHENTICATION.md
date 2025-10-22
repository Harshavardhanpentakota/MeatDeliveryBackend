# PIN-Based Authentication API

This document describes the PIN-based authentication system for the Meat Delivery Backend.

## Overview

The PIN-based authentication system allows users to:
- Login using email/phone + PIN instead of password
- Set a 4-6 digit PIN for quick access
- Reset forgotten PINs via OTP verification
- Secure PIN management with attempt limits and lockout

## API Endpoints

### 1. Login with PIN
**POST** `/api/auth/login-pin`

Login using email or phone number with a PIN.

**Request Body:**
```json
{
  "identifier": "user@example.com", // or "+1234567890"
  "pin": "1234"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "customer"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid PIN. 3 attempts remaining."
}
```

### 2. Set PIN
**POST** `/api/auth/set-pin`
🔒 *Requires Authentication*

Set or update user's PIN.

**Request Body:**
```json
{
  "pin": "1234",
  "confirmPin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN set successfully"
}
```

### 3. Forgot PIN
**POST** `/api/auth/forgot-pin`

Request OTP to reset PIN.

**Request Body:**
```json
{
  "identifier": "user@example.com" // or phone number
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN reset OTP sent successfully",
  "data": {
    "sentTo": "+91****7890",
    "expiresIn": "5 minutes"
  }
}
```

### 4. Reset PIN
**POST** `/api/auth/reset-pin`

Reset PIN using OTP verification.

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "newPin": "5678",
  "confirmPin": "5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

## Security Features

### 1. PIN Lockout System
- Maximum 5 failed PIN attempts
- Account locked for 30 minutes after 5 failures
- Automatic reset on successful login

### 2. PIN Requirements
- 4-6 digits only
- Numeric characters only
- Encrypted storage using bcrypt

### 3. OTP Protection
- 5-minute expiry for reset OTPs
- Maximum 5 OTP requests per session
- Secure OTP generation and verification

## Usage Examples

### Mobile App Integration

```javascript
// Login with PIN
const loginWithPin = async (identifier, pin) => {
  try {
    const response = await fetch('/api/auth/login-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, pin })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', data.data.token);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Set PIN for first-time users
const setUserPin = async (pin, confirmPin, token) => {
  try {
    const response = await fetch('/api/auth/set-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pin, confirmPin })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Set PIN failed:', error.message);
    throw error;
  }
};

// Forgot PIN flow
const forgotPin = async (identifier) => {
  try {
    const response = await fetch('/api/auth/forgot-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forgot PIN failed:', error.message);
    throw error;
  }
};
```

## Error Handling

### Common Error Responses

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | PIN must be 4-6 digits | Invalid PIN format |
| 401 | Invalid PIN. X attempts remaining | Wrong PIN entered |
| 401 | PIN not set. Please set up your PIN first | User hasn't set a PIN |
| 423 | PIN is locked. Try again in X minutes | Too many failed attempts |
| 404 | No account found with this email or phone | User not found |
| 429 | Too many PIN reset requests | Rate limiting |

## Migration Guide

### For Existing Users
1. Users can continue using email/password login
2. Optionally set a PIN via `/api/auth/set-pin`
3. Once PIN is set, can use either login method

### For New Users
1. Register normally with email/password
2. Set PIN for convenience via `/api/auth/set-pin`
3. Use PIN for quick mobile access

## Testing

### Test Credentials
```json
{
  "email": "test@example.com",
  "phone": "+1234567890",
  "pin": "1234"
}
```

### Test Sequence
1. **Set PIN**: POST `/api/auth/set-pin`
2. **Login with PIN**: POST `/api/auth/login-pin`
3. **Forgot PIN**: POST `/api/auth/forgot-pin`
4. **Reset PIN**: POST `/api/auth/reset-pin`

## Notes
- PIN authentication is designed for mobile apps where quick access is important
- Traditional email/password authentication remains available
- PINs are hashed and stored securely
- OTP delivery currently supports SMS only (email integration pending)