const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiry time (5 minutes from now)
 * @returns {Date} Expiry date
 */
const generateOTPExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain OTP
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP
 * @param {string} plainOTP - Plain OTP from user
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {boolean} True if OTP matches
 */
const verifyOTP = (plainOTP, hashedOTP) => {
  const hashedInput = crypto.createHash('sha256').update(plainOTP).digest('hex');
  return hashedInput === hashedOTP;
};

/**
 * Mock SMS service (replace with real SMS service like Twilio, AWS SNS, etc.)
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} Success status
 */
const sendSMS = async (phone, otp) => {
  try {
    // TODO: Replace with actual SMS service
    console.log(`📱 SMS sent to ${phone}: Your OTP is ${otp}`);
    console.log(`📱 OTP expires in 5 minutes`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always return success
    // In production, handle SMS service responses
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

/**
 * Format phone number for consistency
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove spaces, dashes, and other non-digit characters except +
  let formatted = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it's an Indian number and add +91
  if (!formatted.startsWith('+')) {
    if (formatted.length === 10) {
      formatted = '+91' + formatted;
    }
  }
  
  return formatted;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  generateOTP,
  generateOTPExpiry,
  hashOTP,
  verifyOTP,
  sendSMS,
  formatPhoneNumber,
  isValidPhoneNumber
};