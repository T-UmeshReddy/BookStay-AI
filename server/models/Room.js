/**
 * models/Room.js — Room Schema
 *
 * Defines a physical room in the hostel. Rooms contain multiple beds (see Bed model).
 * Supports both dormitory-style (shared) and private room types.
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Dorm', 'Private'],
    },
    // Sub-type label e.g. "4-Bed Female Dorm", "6-Bed Mixed Dorm", "Deluxe Private"
    label: {
      type: String,
      required: [true, 'Room label is required'],
      trim: true,
    },
    totalBeds: {
      type: Number,
      required: [true, 'Total beds count is required'],
      min: [1, 'Room must have at least 1 bed'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
      // e.g. ['AC', 'En-suite Bathroom', 'Locker', 'WiFi', 'Reading Light']
    },
    images: {
      type: [String],
      default: [],  // Array of Cloudinary URLs
    },
    status: {
      type: String,
      enum: ['Available', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    floor: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    // Virtual to populate bed documents without permanently storing in schema
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: populate beds linked to this room
roomSchema.virtual('beds', {
  ref: 'Bed',
  localField: '_id',
  foreignField: 'roomId',
});

module.exports = mongoose.model('Room', roomSchema);
