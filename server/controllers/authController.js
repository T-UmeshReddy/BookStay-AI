/**
 * controllers/authController.js — Authentication Controller
 *
 * Handles user registration, login, and profile retrieval.
 * Uses bcryptjs for password hashing (via User model pre-save hook)
 * and JWT for stateless session management.
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── @route   POST /api/auth/register ────────────────────────
// ─── @desc    Register a new user (Guest by default)
// ─── @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  // Check if email already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Store plain password — the model's pre-save hook will hash it
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    phone: phone || '',
    role: 'Guest',
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id, user.role),
    },
  });
});

// ─── @route   POST /api/auth/login ───────────────────────────
// ─── @desc    Authenticate user and return JWT
// ─── @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Explicitly select passwordHash (excluded by default via `select: false`)
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id, user.role),
    },
  });
});

// ─── @route   GET /api/auth/me ────────────────────────────────
// ─── @desc    Return the currently authenticated user's profile
// ─── @access  Private (any authenticated role)
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by requireAuth middleware
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// ─── @route   PUT /api/auth/me ────────────────────────────────
// ─── @desc    Update own profile (name, phone, avatar)
// ─── @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, getMe, updateMe };
