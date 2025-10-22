const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('pin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('PIN must be exactly 6 digits'),
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit PIN code'),
  body('role')
    .optional()
    .isIn(['customer', 'admin'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const requestOTPValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required')
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new Error('Please provide a valid email or phone number');
      }
      return true;
    })
];

const verifyOTPValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required')
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new Error('Please provide a valid email or phone number');
      }
      return true;
    }),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Zip code must be between 5 and 10 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// PIN-based authentication validations
const loginPinValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('pin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('PIN must be exactly 6 digits')
];

const setPinValidation = [
  body('pin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('PIN must be exactly 6 digits'),
  body('confirmPin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Confirm PIN must be exactly 6 digits')
];

const forgotPinValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required')
];

const resetPinValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  body('newPin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('New PIN must be exactly 6 digits'),
  body('confirmPin')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Confirm PIN must be exactly 6 digits')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// PIN-based authentication routes
router.post('/login-pin', loginPinValidation, loginWithPin);
router.post('/forgot-pin', forgotPinValidation, forgotPin);
router.post('/reset-pin', resetPinValidation, resetPin);

// OTP-based authentication routes
router.post('/request-otp', requestOTPValidation, requestOTP);
router.post('/verify-otp', verifyOTPValidation, verifyOTPLogin);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.post('/set-pin', authenticate, setPinValidation, setPin);
router.post('/logout', authenticate, logout);

module.exports = router;