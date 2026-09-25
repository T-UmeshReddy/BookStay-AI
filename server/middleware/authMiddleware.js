/**
 * middleware/authMiddleware.js — JWT Authentication & Role-Based Access Control
 *
 * requireAuth   — Verifies the JWT and attaches req.user.
 * requireRole   — Guards routes to specific roles (Guest, Staff, Admin).
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Extracts and verifies the Bearer token from Authorization header.
 * Attaches the decoded user document to req.user on success.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  // Verify token signature and expiry
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fetch the user (excluding password hash) to ensure they still exist
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Role guard middleware factory.
 * Usage: requireRole('Admin') or requireRole('Staff', 'Admin')
 *
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied — requires role: ${roles.join(' or ')}`);
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
