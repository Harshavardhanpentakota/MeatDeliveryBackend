const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  getUserStats
} = require('../controllers/userController');
const { authenticate, authorize, ownerOrAdmin } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const updateUserValidation = [
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
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['customer', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
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

// All user routes require authentication
router.use(authenticate);

// Routes
router.get('/', authorize('admin'), getUsers);
router.get('/stats', authorize('admin'), getUserStats);
router.get('/:id', ownerOrAdmin, getUser);
router.put('/:id', ownerOrAdmin, updateUserValidation, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/activate', authorize('admin'), activateUser);

module.exports = router;