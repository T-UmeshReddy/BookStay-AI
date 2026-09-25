/**
 * models/User.js — User Schema
 *
 * Represents all system users: Guests (public), Staff (hostel employees),
 * and Admins (full system access).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,  // Excluded from queries by default for security
    },
    role: {
      type: String,
      enum: ['Guest', 'Staff', 'Admin'],
      default: 'Guest',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number'],
    },
    avatar: {
      type: String,
      default: '',  // Cloudinary URL or empty
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt automatically
  }
);

/**
 * Pre-save hook: Hash the password before storing.
 * Only re-hashes if the passwordHash field was modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

/**
 * Instance method: Compare a plain-text password with the stored hash.
 * @param {string} enteredPassword - Plain text password from login form
 * @returns {boolean} - True if match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
