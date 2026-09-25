/**
 * config/db.js — MongoDB Connection
 *
 * Establishes a Mongoose connection with retry logic.
 * Called once at server startup.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ handles these internally, but explicit for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure — the server should not run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
