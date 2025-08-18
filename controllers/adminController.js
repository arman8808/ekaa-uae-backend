// controllers/adminController.js
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Private (Superadmin only)
exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    password,
    role
  });

  // Create token
  const token = admin.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token
  });
});

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for admin
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if admin is active
  if (!admin.isActive) {
    return next(new ErrorResponse('Account is deactivated', 401));
  }

  // Check if password matches
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  admin.lastLogin = Date.now();
  await admin.save();

  // Create token
  const token = admin.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});

// @desc    Get current logged in admin
// @route   GET /api/admin/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);

  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Update admin details
// @route   PUT /api/admin/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const admin = await Admin.findByIdAndUpdate(req.admin.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Update password
// @route   PUT /api/admin/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id).select('+password');

  // Check current password
  if (!(await admin.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  admin.password = req.body.newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});