const express = require('express');
const { body } = require('express-validator');
const {
  getSavedAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} = require('../controllers/addressController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for address
const addressValidation = [
  body('label')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Address label must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Address label can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('State can only contain letters, spaces, hyphens, and apostrophes'),
  body('zipCode')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit PIN code'),
  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Landmark cannot exceed 100 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// All address routes require authentication
router.use(authenticate);

// Routes
router.get('/', getSavedAddresses);
router.get('/default', getDefaultAddress);
router.post('/', addressValidation, addAddress);
router.put('/:addressId', addressValidation, updateAddress);
router.delete('/:addressId', deleteAddress);
router.patch('/:addressId/default', setDefaultAddress);

module.exports = router;