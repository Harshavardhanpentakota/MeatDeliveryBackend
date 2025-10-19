const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user's saved addresses
// @route   GET /api/addresses
// @access  Private
exports.getSavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedAddresses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      addresses: user.savedAddresses,
      count: user.savedAddresses.length
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { label, street, city, state, zipCode, landmark, isDefault, coordinates } = req.body;

    // Check if address with same label already exists
    const existingAddress = user.savedAddresses.find(addr => 
      addr.label.toLowerCase() === label.toLowerCase()
    );

    if (existingAddress) {
      return res.status(400).json({
        success: false,
        message: 'An address with this label already exists'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.savedAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      landmark,
      isDefault: isDefault || user.savedAddresses.length === 0, // First address is default
      coordinates
    };

    user.savedAddresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      addresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding address'
    });
  }
};

// @desc    Update existing address
// @route   PUT /api/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.savedAddresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { label, street, city, state, zipCode, landmark, isDefault, coordinates } = req.body;

    // Check if another address with same label exists (excluding current one)
    const existingAddress = user.savedAddresses.find((addr, index) => 
      index !== addressIndex && addr.label.toLowerCase() === label.toLowerCase()
    );

    if (existingAddress) {
      return res.status(400).json({
        success: false,
        message: 'An address with this label already exists'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.savedAddresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }

    // Update the address
    const updatedAddress = user.savedAddresses[addressIndex];
    updatedAddress.label = label;
    updatedAddress.street = street;
    updatedAddress.city = city;
    updatedAddress.state = state;
    updatedAddress.zipCode = zipCode;
    updatedAddress.landmark = landmark;
    updatedAddress.isDefault = isDefault;
    if (coordinates) {
      updatedAddress.coordinates = coordinates;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress,
      addresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating address'
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.savedAddresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = user.savedAddresses[addressIndex].isDefault;
    user.savedAddresses.splice(addressIndex, 1);

    // If deleted address was default and there are remaining addresses, make the first one default
    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
};

// @desc    Set default address
// @route   PATCH /api/addresses/:addressId/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.savedAddresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all defaults and set the selected one
    user.savedAddresses.forEach((addr, index) => {
      addr.isDefault = index === addressIndex;
    });

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      addresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting default address'
    });
  }
};

// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
exports.getDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedAddresses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const defaultAddress = user.savedAddresses.find(addr => addr.isDefault);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.json({
      success: true,
      address: defaultAddress
    });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching default address'
    });
  }
};