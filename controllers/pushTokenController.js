// Controller for handling push token updates
const User = require('../models/User');
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');

/**
 * @desc    Save or update Expo push token for the user
 * @route   POST /api/users/push-token
 * @access  Private (Authenticated user)
 */
const savePushToken = asyncHandler(async (req, res, next) => {
  const { pushToken, platform } = req.body;
  if (!pushToken || !platform) {
    return sendError(res, 'Push token and platform are required', 400);
  }

  // Save to user document
  req.user.pushToken = pushToken;
  req.user.pushPlatform = platform;
  await req.user.save();

  sendSuccess(res, 'Push token saved successfully');
});

module.exports = {
  savePushToken
};
