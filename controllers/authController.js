const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/auth');
const { asyncHandler, AppError, sendSuccess, sendError } = require('../utils/helpers');
const { 
  generateOTP, 
  generateOTPExpiry, 
  hashOTP, 
  verifyOTP, 
  sendSMS, 
  formatPhoneNumber,
  isValidPhoneNumber 
} = require('../utils/otp');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { firstName, lastName, email, password, phone, address, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    address,
    role: role || 'customer'
  });

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Request OTP for phone login
 * @route   POST /api/auth/request-otp
 * @access  Public
 */
const requestOTP = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  let { phone } = req.body;

  // Format and validate phone number
  phone = formatPhoneNumber(phone);
  
  if (!isValidPhoneNumber(phone)) {
    return sendError(res, 'Please provide a valid phone number', 400);
  }

  // Find user by phone number
  const user = await User.findOne({ phone });

  if (!user) {
    return sendError(res, 'No account found with this phone number', 404);
  }

  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Check if too many attempts
  if ((user.otpAttempts || 0) >= 5) {
    return sendError(res, 'Too many OTP requests. Please try again later.', 429);
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);
  const expiresAt = generateOTPExpiry();

  // Save OTP to user
  user.otpCode = hashedOTP;
  user.otpExpiresAt = expiresAt;
  user.otpIsVerified = false;
  user.otpAttempts = (user.otpAttempts || 0) + 1;

  await user.save();

  // Send OTP via SMS
  const smsSent = await sendSMS(phone, otp);

  if (!smsSent) {
    return sendError(res, 'Failed to send OTP. Please try again.', 500);
  }

  sendSuccess(res, 'OTP sent successfully to your phone', {
    phone: phone.replace(/(\+\d{2})(\d+)(\d{4})/, '$1****$3'), // Mask phone number
    expiresIn: '5 minutes'
  });
});

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPLogin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  let { phone, otp } = req.body;

  // Format phone number
  phone = formatPhoneNumber(phone);

  // Find user with OTP data
  const user = await User.findOne({ phone }).select('+otpCode +otpExpiresAt +otpAttempts');

  if (!user) {
    return sendError(res, 'Invalid phone number or OTP', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Check if OTP exists and not expired
  if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return sendError(res, 'OTP has expired. Please request a new one.', 401);
  }

  // Verify OTP
  const isOTPValid = verifyOTP(otp, user.otpCode);

  if (!isOTPValid) {
    return sendError(res, 'Invalid OTP', 401);
  }

  // Mark OTP as verified and clear it
  user.otpIsVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;
  user.phoneVerified = true;
  user.lastLogin = new Date();

  await user.save();

  sendTokenResponse(user, 200, res, 'OTP verified successfully. Login successful.');
});

/**
 * @desc    Login user with email/password (existing method)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;
  
  sendSuccess(res, 'User profile retrieved successfully', user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { firstName, lastName, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName,
      lastName,
      phone,
      address
    },
    {
      new: true,
      runValidators: true
    }
  );

  sendSuccess(res, 'Profile updated successfully', user);
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordMatch = await user.comparePassword(currentPassword);

  if (!isPasswordMatch) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, 'Password changed successfully');
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  sendSuccess(res, 'Logout successful');
});

module.exports = {
  register,
  login,
  requestOTP,
  verifyOTPLogin,
  getMe,
  updateProfile,
  changePassword,
  logout
};