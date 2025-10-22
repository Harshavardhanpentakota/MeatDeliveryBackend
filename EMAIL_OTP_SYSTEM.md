# Email OTP System Documentation

## Overview

The Meat Delivery Backend now supports **Email OTP functionality** using Nodemailer. Users can receive OTPs via email for authentication and PIN reset operations.

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Configure Environment Variables
Add the following to your `.env` file:

```bash
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Meat Delivery <your-email@gmail.com>
```

### 3. Gmail App Password Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password in `EMAIL_PASS` (not your regular password)

## 📧 Email Templates

### 1. OTP Email Template
- **Subject**: Varies by purpose (login, reset, verification)
- **Design**: Professional HTML template with branding
- **Features**: 
  - Large, clear OTP display
  - 5-minute expiry notice
  - Security warnings
  - Responsive design

### 2. Welcome Email Template
- **Subject**: "Welcome to Meat Delivery! 🥩"
- **Content**: Welcome message, features overview, welcome offer
- **CTA**: Start shopping button

### 3. Order Confirmation Template
- **Subject**: "Order Confirmation - #{orderNumber}"
- **Content**: Order details, items table, delivery info

## 🔌 API Endpoints Updated

### 1. Request OTP (Enhanced)
**POST** `/api/auth/request-otp`

**Request Body:**
```json
{
  "identifier": "user@example.com"  // or "+1234567890"
}
```

**Features:**
- ✅ Auto-detects email vs phone
- ✅ Sends OTP via appropriate channel
- ✅ Email regex validation
- ✅ Phone number formatting

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "sentTo": "us***@example.com",
    "method": "email",
    "expiresIn": "5 minutes"
  }
}
```

### 2. Verify OTP (Enhanced)
**POST** `/api/auth/verify-otp`

**Request Body:**
```json
{
  "identifier": "user@example.com",  // or phone
  "otp": "123456"
}
```

**Features:**
- ✅ Works with email or phone
- ✅ Sets emailVerified/phoneVerified flags
- ✅ Returns JWT token on success

### 3. Forgot PIN (Enhanced)
**POST** `/api/auth/forgot-pin`

**Request Body:**
```json
{
  "identifier": "user@example.com"  // or phone
}
```

**Features:**
- ✅ Sends PIN reset OTP via email
- ✅ Professional HTML template
- ✅ Rate limiting protection

## 🎨 Email Template Features

### Design Elements
- 🎨 **Branded Headers**: Logo and company colors
- 📱 **Responsive Design**: Works on mobile and desktop
- 🔒 **Security Notices**: Clear warnings about OTP safety
- 💼 **Professional Layout**: Clean, modern design

### Code Structure
```javascript
// Email service instance
const emailService = require('./utils/emailService');

// Send OTP
await emailService.sendOTP(email, otp, 'forgot-pin');

// Send welcome email
await emailService.sendWelcomeEmail(email, firstName);

// Send order confirmation
await emailService.sendOrderConfirmation(email, orderData);
```

## 🧪 Testing

### Test Email Functionality
1. **Configure credentials** in `.env`
2. **Test with your email** as identifier
3. **Check spam folder** if emails don't arrive
4. **Verify templates** render correctly

### Example Test Requests

```bash
# Request OTP via email
curl -X POST http://localhost:5000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your-email@gmail.com"}'

# Verify email OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your-email@gmail.com", "otp": "123456"}'

# Forgot PIN via email
curl -X POST http://localhost:5000/api/auth/forgot-pin \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your-email@gmail.com"}'
```

## 🔄 Backward Compatibility

### Existing Phone OTP
- ✅ **Still works**: Phone-based OTP unchanged
- ✅ **Auto-detection**: System detects phone vs email
- ✅ **Same endpoints**: No breaking changes

### Migration Path
1. **Existing users**: Continue using phone OTP
2. **New users**: Can use email or phone
3. **Gradual adoption**: Users can switch to email OTP

## 🛡️ Security Features

### Rate Limiting
- **5 OTP requests** maximum per session
- **5-minute expiry** for all OTPs
- **Attempt tracking** per user

### Email Security
- **TLS encryption** for SMTP connection
- **App passwords** instead of account passwords
- **Masked email display** in responses
- **No sensitive data** in email content

## 🚀 Production Deployment

### Email Service Providers
- **Gmail**: Works with app passwords
- **SendGrid**: Enterprise email service
- **AWS SES**: Scalable email service
- **Mailgun**: Developer-friendly service

### Vercel Environment Variables
Set in Vercel Dashboard:
```
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@domain.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Meat Delivery <noreply@yourdomain.com>
```

## 📊 Monitoring & Analytics

### Email Metrics
- **Delivery rates**: Track successful sends
- **Open rates**: Monitor email engagement
- **Bounce rates**: Identify invalid emails
- **Error logging**: Debug delivery issues

### Implementation
```javascript
// Log email metrics
console.log(`📧 OTP email sent to ${email}: ${info.messageId}`);
console.log(`📧 Welcome email sent to ${email}: ${info.messageId}`);
```

## 🎯 Next Steps

### Enhancements
1. **Email verification** during registration
2. **Password reset** via email
3. **Marketing emails** and newsletters
4. **Email templates** customization
5. **Bulk email** capabilities

### Integration
- ✅ **Mobile apps**: Use email as login identifier
- ✅ **Web dashboard**: Email notifications
- ✅ **Admin panel**: Email management
- ✅ **Analytics**: Email performance tracking

---

## 📝 Summary

Your Meat Delivery Backend now supports comprehensive **Email OTP functionality**:

- ✅ **Email OTP** for login and PIN reset
- ✅ **Professional HTML templates**
- ✅ **Dual-channel support** (email + SMS)
- ✅ **Auto-detection** of identifier type
- ✅ **Rate limiting and security**
- ✅ **Welcome emails** on registration
- ✅ **Backward compatibility**

The system is ready for production use with proper email credentials configured! 🎉