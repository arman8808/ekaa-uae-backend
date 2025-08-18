// middleware/auth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ErrorResponse = require('../utils/errorResponse');
// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.admin.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};