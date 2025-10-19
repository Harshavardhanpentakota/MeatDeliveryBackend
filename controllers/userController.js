const { validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, sendSuccess, sendError, paginate } = require('../utils/helpers');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getUsers = asyncHandler(async (req, res, next) => {
  let query = User.find();

  // Filtering
  const { role, isActive, search } = req.query;

  if (role) {
    query = query.where('role').equals(role);
  }

  if (isActive !== undefined) {
    query = query.where('isActive').equals(isActive === 'true');
  }

  if (search) {
    query = query.where({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Sorting
  query = query.sort({ createdAt: -1 });

  // Pagination
  const results = await paginate(query, req);

  sendSuccess(res, 'Users retrieved successfully', results);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin or own profile)
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Check if user can access this profile
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return sendError(res, 'Access denied', 403);
  }

  sendSuccess(res, 'User retrieved successfully', user);
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin or own profile)
 */
const updateUser = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { firstName, lastName, email, phone, address, role, isActive } = req.body;

  // Check if user can update this profile
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Regular users cannot change role or isActive status
  const updateData = { firstName, lastName, email, phone, address };
  
  if (req.user.role === 'admin') {
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, 'User updated successfully', user);
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Soft delete - deactivate user
  user.isActive = false;
  await user.save();

  sendSuccess(res, 'User deactivated successfully');
});

/**
 * @desc    Activate user
 * @route   PATCH /api/users/:id/activate
 * @access  Private (Admin only)
 */
const activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, 'User activated successfully', user);
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });

  const result = {
    totalUsers,
    activeUsers,
    inactiveUsers,
    roleBreakdown: stats
  };

  sendSuccess(res, 'User statistics retrieved successfully', result);
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  getUserStats
};