const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/auth');
const { asyncHandler, AppError, sendSuccess, sendError } = require('../utils/helpers');
const notificationService = require('../services/notificationService');
const emailService = require('../utils/emailService');
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

  const { firstName, lastName, email, pin, phone, address, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists with this email', 400);
  }

  // Check if phone number already exists
  const existingPhone = await User.findOne({ phone: formatPhoneNumber(phone) });
  if (existingPhone) {
    return sendError(res, 'User already exists with this phone number', 400);
  }

  // Prepare user data
  const userData = {
    firstName,
    lastName,
    email,
    pin, // Use PIN instead of password
    phone: formatPhoneNumber(phone),
    role: role || 'customer',
    savedAddresses: []
  };

  // If address is provided during registration, add it to savedAddresses
  if (address && address.street && address.city && address.state && address.zipCode) {
    userData.savedAddresses = [{
      label: 'Home', // Default label for registration address
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      landmark: address.landmark || '',
      isDefault: true // First address is always default
    }];
  }

  // Create user
  const user = await User.create(userData);

  // Send welcome notification and email
  try {
    await notificationService.sendWelcomeNotification(user._id);
    await emailService.sendWelcomeEmail(user.email, user.firstName);
  } catch (notificationError) {
    console.error('Failed to send welcome notification:', notificationError);
    // Don't fail registration if notification fails
  }

  sendTokenResponse(user, 201, res, 'User registered successfully with PIN');
});

/**
 * @desc    Request OTP for phone/email login
 * @route   POST /api/auth/request-otp
 * @access  Public
 */
const requestOTP = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  let { identifier } = req.body; // can be phone or email

  // Check if identifier is email or phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(identifier);
  
  let user;
  if (isEmail) {
    user = await User.findOne({ email: identifier.toLowerCase() });
  } else {
    // Format and validate phone number
    identifier = formatPhoneNumber(identifier);
    
    if (!isValidPhoneNumber(identifier)) {
      return sendError(res, 'Please provide a valid phone number or email', 400);
    }

    user = await User.findOne({ phone: identifier });
  }

  if (!user) {
    return sendError(res, 'No account found with this email or phone number', 404);
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

  // Send OTP via appropriate method
  let otpSent = false;
  let contactMethod = '';
  let deliveryMethod = '';

  if (isEmail) {
    // Send via email
    otpSent = await emailService.sendOTP(user.email, otp, 'login');
    contactMethod = user.email.replace(/(.{2}).*@/, '$1***@');
    deliveryMethod = 'email';
  } else {
    // Send via SMS
    otpSent = await sendSMS(identifier, otp);
    contactMethod = identifier.replace(/(\+\d{2})(\d+)(\d{4})/, '$1****$3');
    deliveryMethod = 'SMS';
  }

  if (!otpSent) {
    return sendError(res, `Failed to send OTP via ${deliveryMethod}. Please try again.`, 500);
  }

  sendSuccess(res, `OTP sent successfully to your ${deliveryMethod}`, {
    sentTo: contactMethod,
    method: deliveryMethod,
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

  let { identifier, otp } = req.body; // identifier can be email or phone

  // Check if identifier is email or phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(identifier);
  
  let user;
  if (isEmail) {
    user = await User.findOne({ email: identifier.toLowerCase() }).select('+otpCode +otpExpiresAt +otpAttempts');
  } else {
    // Format phone number
    identifier = formatPhoneNumber(identifier);
    user = await User.findOne({ phone: identifier }).select('+otpCode +otpExpiresAt +otpAttempts');
  }

  if (!user) {
    return sendError(res, 'Invalid credentials or OTP', 401);
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
  
  // Mark appropriate field as verified
  if (isEmail) {
    user.emailVerified = true;
  } else {
    user.phoneVerified = true;
  }
  
  user.lastLogin = new Date();

  await user.save();

  sendTokenResponse(user, 200, res, 'OTP verified successfully. Login successful.');
});

/**
 * @desc    Login user with email/phone and PIN
 * @route   POST /api/auth/login-pin
 * @access  Public
 */
const loginWithPin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { identifier, pin } = req.body; // identifier can be email or phone

  // Find user by email or phone
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: formatPhoneNumber(identifier) }
    ]
  }).select('+pin +pinAttempts +pinLockedUntil');

  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Check if PIN is required
  if (!user.pin) {
    return sendError(res, 'PIN not set. Please set up your PIN first.', 400);
  }

  // Check if PIN is locked
  if (user.isPinLocked()) {
    const lockTimeLeft = Math.ceil((user.pinLockedUntil - Date.now()) / (1000 * 60));
    return sendError(res, `PIN is locked. Try again in ${lockTimeLeft} minutes.`, 423);
  }

  // Verify PIN
  const isPinMatch = await user.comparePin(pin);

  if (!isPinMatch) {
    user.pinAttempts = (user.pinAttempts || 0) + 1;
    
    if (user.pinAttempts >= 5) {
      user.lockPin();
      await user.save();
      return sendError(res, 'Too many failed PIN attempts. PIN is locked for 30 minutes.', 423);
    }
    
    await user.save();
    const attemptsLeft = 5 - user.pinAttempts;
    return sendError(res, `Invalid PIN. ${attemptsLeft} attempts remaining.`, 401);
  }

  // Reset PIN attempts on successful login
  user.resetPinAttempts();
  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Set PIN for user
 * @route   POST /api/auth/set-pin
 * @access  Private
 */
const setPin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { pin, confirmPin } = req.body;

  if (pin !== confirmPin) {
    return sendError(res, 'PIN and confirm PIN do not match', 400);
  }

  const user = await User.findById(req.user._id);
  user.pin = pin;
  user.resetPinAttempts();
  await user.save();

  sendSuccess(res, 'PIN set successfully');
});

/**
 * @desc    Request OTP for PIN reset
 * @route   POST /api/auth/forgot-pin
 * @access  Public
 */
const forgotPin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { identifier } = req.body; // email or phone

  // Find user by email or phone
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: formatPhoneNumber(identifier) }
    ]
  }).select('+pinResetOTPAttempts');

  if (!user) {
    return sendError(res, 'No account found with this email or phone number', 404);
  }

  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Check if too many reset attempts
  if ((user.pinResetOTPAttempts || 0) >= 5) {
    return sendError(res, 'Too many PIN reset requests. Please try again later.', 429);
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);
  const expiresAt = generateOTPExpiry();

  // Save OTP to user
  user.pinResetOTP = hashedOTP;
  user.pinResetOTPExpires = expiresAt;
  user.pinResetOTPAttempts = (user.pinResetOTPAttempts || 0) + 1;

  await user.save();

  // Send OTP via email or SMS based on identifier type
  let otpSent = false;
  let contactMethod = '';
  let deliveryMethod = '';

  // Check if identifier is an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(identifier);

  if (isEmail) {
    // Send via email
    otpSent = await emailService.sendOTP(user.email, otp, 'forgot-pin');
    contactMethod = user.email.replace(/(.{2}).*@/, '$1***@');
    deliveryMethod = 'email';
  } else if (user.phone) {
    // Send via SMS
    otpSent = await sendSMS(user.phone, otp);
    contactMethod = user.phone.replace(/(\+\d{2})(\d+)(\d{4})/, '$1****$3');
    deliveryMethod = 'SMS';
  }

  if (!otpSent) {
    return sendError(res, `Failed to send OTP via ${deliveryMethod}. Please try again.`, 500);
  }

  sendSuccess(res, 'PIN reset OTP sent successfully', {
    sentTo: contactMethod,
    method: deliveryMethod,
    expiresIn: '5 minutes'
  });
});

/**
 * @desc    Verify OTP and reset PIN
 * @route   POST /api/auth/reset-pin
 * @access  Public
 */
const resetPin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { identifier, otp, newPin, confirmPin } = req.body;

  if (newPin !== confirmPin) {
    return sendError(res, 'New PIN and confirm PIN do not match', 400);
  }

  // Find user by email or phone
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: formatPhoneNumber(identifier) }
    ]
  }).select('+pinResetOTP +pinResetOTPExpires');

  if (!user) {
    return sendError(res, 'Invalid request', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 401);
  }

  // Check if OTP exists and not expired
  if (!user.pinResetOTP || !user.pinResetOTPExpires || user.pinResetOTPExpires < new Date()) {
    return sendError(res, 'OTP has expired. Please request a new one.', 401);
  }

  // Verify OTP
  const isOTPValid = verifyOTP(otp, user.pinResetOTP);

  if (!isOTPValid) {
    return sendError(res, 'Invalid OTP', 401);
  }

  // Reset PIN
  user.pin = newPin;
  user.pinResetOTP = undefined;
  user.pinResetOTPExpires = undefined;
  user.pinResetOTPAttempts = 0;
  user.resetPinAttempts();

  await user.save();

  sendSuccess(res, 'PIN reset successfully');
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
  loginWithPin,
  setPin,
  forgotPin,
  resetPin,
  requestOTP,
  verifyOTPLogin,
  getMe,
  updateProfile,
  changePassword,
  logout
};