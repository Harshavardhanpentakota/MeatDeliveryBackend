const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const { asyncHandler, sendSuccess, sendError, paginate } = require('../utils/helpers');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res, next) => {
  let query = Product.find({ isActive: true });

  // Filtering
  const { category, subcategory, search, minPrice, maxPrice, inStock } = req.query;

  if (category) {
    query = query.where('category').equals(category);
  }

  if (subcategory) {
    query = query.where('subcategory').regex(new RegExp(subcategory, 'i'));
  }

  if (search) {
    query = query.where({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    query = query.where('price', priceFilter);
  }

  if (inStock === 'true') {
    query = query.where('availability.inStock').equals(true);
  }

  // Sorting
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  query = query.sort({ [sortBy]: sortOrder });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, 'Products retrieved successfully', results);
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    return sendError(res, 'Product not found', 404);
  }

  sendSuccess(res, 'Product retrieved successfully', product);
});

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
const createProduct = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const product = await Product.create(req.body);

  sendSuccess(res, 'Product created successfully', product, 201);
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  sendSuccess(res, 'Product updated successfully', product);
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Soft delete - mark as inactive
  product.isActive = false;
  await product.save();

  sendSuccess(res, 'Product deleted successfully');
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  let query = Product.find({ 
    category: category.toLowerCase(), 
    isActive: true 
  });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, `${category} products retrieved successfully`, results);
});

/**
 * @desc    Search products
 * @route   GET /api/products/search/:searchTerm
 * @access  Public
 */
const searchProducts = asyncHandler(async (req, res, next) => {
  const { searchTerm } = req.params;

  let query = Product.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, 'Search results retrieved successfully', results);
});

/**
 * @desc    Get suggested products
 * @route   GET /api/products/suggested
 * @access  Public
 */
const getSuggestedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;

  // Get products with high ratings or popular products
  let query = Product.find({ 
    isActive: true,
    'availability.inStock': true
  });

  // Sort by ratings (highest first) and creation date (newest first)
  query = query.sort({ 
    'ratings.average': -1,
    'ratings.count': -1,
    createdAt: -1 
  });

  // Limit the results
  query = query.limit(limit);

  const products = await query.exec();

  sendSuccess(res, 'Suggested products retrieved successfully', {
    data: products,
    total: products.length,
    limit: limit
  });
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Admin only)
 */
const updateProductStock = asyncHandler(async (req, res, next) => {
  const { quantity, inStock } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      'availability.quantity': quantity,
      'availability.inStock': inStock
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  sendSuccess(res, 'Product stock updated successfully', product);
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getSuggestedProducts,
  updateProductStock
};