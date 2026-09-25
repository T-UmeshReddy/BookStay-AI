/**
 * utils/generateToken.js — JWT Token Generator
 *
 * Creates a signed JWT containing the user's ID and role.
 * Used in authController after successful login/register.
 */

const jwt = require('jsonwebtoken');

/**
 * @param {string} id    - MongoDB ObjectId of the user
 * @param {string} role  - User role (Guest | Staff | Admin)
 * @returns {string}     - Signed JWT string
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
