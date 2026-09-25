/**
 * models/Bed.js — Bed Schema
 *
 * Represents an individual bed within a room.
 * Bed-level tracking allows multiple guests to share a dorm room
 * without double-booking the same physical bed.
 */

const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required'],
      trim: true,
      // e.g. "A1", "B2", "Top-3"
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    // Reference to the active booking occupying this bed (null if vacant)
    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    // Physical bed type
    bedType: {
      type: String,
      enum: ['Bunk-Top', 'Bunk-Bottom', 'Single', 'Double'],
      default: 'Bunk-Bottom',
    },
    // 'Dirty' means it needs housekeeping before next guest
    cleaningStatus: {
      type: String,
      enum: ['Clean', 'Dirty', 'In-Progress', 'Maintenance'],
      default: 'Clean',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: each bed number must be unique within a room
bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
