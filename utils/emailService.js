const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('📧 Email service ready');
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      console.error('💡 Please check your email credentials in .env file');
    }
  }

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - OTP code
   * @param {string} purpose - Purpose of OTP (login, reset, etc.)
   */
  async sendOTP(email, otp, purpose = 'verification') {
    try {
      const subject = this.getOTPSubject(purpose);
      const html = this.getOTPTemplate(otp, purpose);

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Meat Delivery" <noreply@meatdelivery.com>',
        to: email,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 OTP email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      return false;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} firstName - User's first name
   */
  async sendWelcomeEmail(email, firstName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Meat Delivery" <noreply@meatdelivery.com>',
        to: email,
        subject: 'Welcome to Meat Delivery! 🥩',
        html: this.getWelcomeTemplate(firstName)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return false;
    }
  }

  /**
   * Send order confirmation email
   * @param {string} email - Recipient email
   * @param {object} orderData - Order information
   */
  async sendOrderConfirmation(email, orderData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Meat Delivery" <noreply@meatdelivery.com>',
        to: email,
        subject: `Order Confirmation - #${orderData.orderNumber}`,
        html: this.getOrderConfirmationTemplate(orderData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Order confirmation sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error.message);
      return false;
    }
  }

  /**
   * Get OTP email subject based on purpose
   */
  getOTPSubject(purpose) {
    const subjects = {
      'login': 'Your Login OTP - Meat Delivery',
      'reset': 'Reset Your PIN - Meat Delivery',
      'verification': 'Verify Your Account - Meat Delivery',
      'forgot-pin': 'Reset Your PIN - Meat Delivery'
    };
    return subjects[purpose] || 'Your OTP - Meat Delivery';
  }

  /**
   * Generate OTP email template
   */
  getOTPTemplate(otp, purpose) {
    const purposeTexts = {
      'login': 'login to your account',
      'reset': 'reset your PIN',
      'verification': 'verify your account',
      'forgot-pin': 'reset your PIN'
    };

    const purposeText = purposeTexts[purpose] || 'complete your request';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 10px; }
          .otp-box { background: #f8f9fa; border: 2px dashed #e74c3c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🥩 Meat Delivery</div>
            <h2>Your OTP Code</h2>
          </div>
          
          <p>Hello,</p>
          <p>You requested an OTP to ${purposeText}. Please use the following code:</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 12px; color: #666;">This code expires in 5 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
          </div>
          
          <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
          
          <div class="footer">
            <p>This is an automated email from Meat Delivery. Please do not reply to this email.</p>
            <p>&copy; 2025 Meat Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email template
   */
  getWelcomeTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Meat Delivery</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 10px; }
          .welcome-banner { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .feature-box { background: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0; }
          .cta-button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🥩 Meat Delivery</div>
          </div>
          
          <div class="welcome-banner">
            <h1 style="margin: 0;">Welcome, ${firstName}! 🎉</h1>
            <p style="margin: 10px 0 0 0;">You're now part of the Meat Delivery family!</p>
          </div>
          
          <p>Thank you for joining Meat Delivery! We're excited to help you get fresh, high-quality meat delivered right to your doorstep.</p>
          
          <div class="feature-box">
            <h3 style="margin-top: 0;">🚚 What you can expect:</h3>
            <ul>
              <li>Premium quality meat from trusted suppliers</li>
              <li>Fast and reliable delivery</li>
              <li>Easy ordering through our mobile app</li>
              <li>Secure PIN-based authentication</li>
              <li>Special offers and discounts</li>
            </ul>
          </div>
          
          <div class="feature-box">
            <h3 style="margin-top: 0;">🎁 Welcome Offer</h3>
            <p>Get <strong>10% OFF</strong> on your first order with code: <strong>WELCOME10</strong></p>
          </div>
          
          <div style="text-align: center;">
            <a href="#" class="cta-button">Start Shopping Now</a>
          </div>
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <div class="footer">
            <p>This email was sent to you because you registered for a Meat Delivery account.</p>
            <p>&copy; 2025 Meat Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order confirmation template
   */
  getOrderConfirmationTemplate(orderData) {
    const itemsHtml = orderData.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('') || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 10px; }
          .order-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .order-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .order-table th { background: #e74c3c; color: white; padding: 10px; text-align: left; }
          .total-row { font-weight: bold; background: #f8f9fa; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🥩 Meat Delivery</div>
            <h2>Order Confirmation</h2>
          </div>
          
          <p>Thank you for your order! We've received your order and will start preparing it soon.</p>
          
          <div class="order-box">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery || 'Within 2 hours'}</p>
          </div>
          
          <table class="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
                <td style="padding: 15px; text-align: right;">₹${orderData.total}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="order-box">
            <h3 style="margin-top: 0;">Delivery Address</h3>
            <p>${orderData.address || 'Address will be confirmed separately'}</p>
          </div>
          
          <p>We'll send you updates about your order status. Thank you for choosing Meat Delivery!</p>
          
          <div class="footer">
            <p>Questions about your order? Contact our support team.</p>
            <p>&copy; 2025 Meat Delivery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();