/**
 * models/Booking.js — Booking Schema
 *
 * Records a guest's reservation including which beds are assigned,
 * payment state, and the lifecycle status of the stay.
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest reference is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    // Array of Bed ObjectIds assigned to this booking
    assignedBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bed',
      },
    ],
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    // Number of nights (calculated at booking creation time)
    numberOfNights: {
      type: Number,
      required: true,
      min: [1, 'Booking must be at least 1 night'],
    },
    // Number of guests (beds) requested
    guestCount: {
      type: Number,
      required: true,
      min: [1, 'At least 1 guest required'],
    },
    // totalPrice = pricePerNight × numberOfNights × guestCount
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // Final amount paid, including GST charged at checkout.
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    // Payment gateway transaction ID (Razorpay/Stripe)
    paymentId: {
      type: String,
      default: null,
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow'],
      default: 'Confirmed',
    },
    // Unique human-readable booking reference (e.g. NN-2026-ABCD)
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },
    specialRequests: {
      type: String,
      maxlength: [300, 'Special requests cannot exceed 300 characters'],
    },
    checkedInAt: Date,
    checkedOutAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for fast guest booking lookup
bookingSchema.index({ guestId: 1, checkInDate: -1 });
// Index for date-range availability queries
bookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
