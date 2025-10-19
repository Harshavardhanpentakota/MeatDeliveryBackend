const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getSuggestedProducts,
  updateProductStock
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('weight.value')
    .isFloat({ min: 0 })
    .withMessage('Weight value must be a positive number'),
  body('weight.unit')
    .optional()
    .isIn(['kg', 'g', 'lb', 'piece'])
    .withMessage('Invalid weight unit'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  body('images.*.url')
    .isURL()
    .withMessage('Invalid image URL'),
  body('availability.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('preparationMethod')
    .optional()
    .isIn(['fresh', 'frozen', 'marinated', 'cooked'])
    .withMessage('Invalid preparation method')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'processed'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('weight.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight value must be a positive number'),
  body('weight.unit')
    .optional()
    .isIn(['kg', 'g', 'lb', 'piece'])
    .withMessage('Invalid weight unit'),
  body('availability.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('preparationMethod')
    .optional()
    .isIn(['fresh', 'frozen', 'marinated', 'cooked'])
    .withMessage('Invalid preparation method')
];

const stockUpdateValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inStock')
    .isBoolean()
    .withMessage('inStock must be a boolean value')
];

// Public routes - IMPORTANT: Specific routes must come before parameterized routes
router.get('/', getProducts);
router.get('/suggested', getSuggestedProducts);
router.get('/search/:searchTerm', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), productValidation, createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProductValidation, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), stockUpdateValidation, updateProductStock);

module.exports = router;