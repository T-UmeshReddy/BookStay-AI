/**
 * controllers/bookingController.js — Booking Controller
 *
 * Core booking logic including:
 *  - Atomic bed allocation to prevent double-booking
 *  - Price calculation based on nights × beds × rate
 *  - Guest check-in and check-out workflows
 *  - Admin financial analytics aggregations
 */

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Bed = require('../models/Bed');
const Room = require('../models/Room');

/**
 * Generates a human-readable booking reference.
 * Format: NN-YYYY-XXXX (e.g. NN-2026-A3F7)
 */
const generateBookingRef = () => {
  const year = new Date().getFullYear();
  const suffix = uuidv4().split('-')[0].toUpperCase().slice(0, 4);
  return `NN-${year}-${suffix}`;
};

/**
 * Calculates the number of nights between two dates.
 * Uses Math.ceil to round up partial days.
 *
 * @param {Date} checkIn
 * @param {Date} checkOut
 * @returns {number} number of nights
 */
const calcNights = (checkIn, checkOut) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay);
};

const paidRevenueExpression = () => ({
  $ifNull: [
    '$paidAmount',
    { $round: [{ $multiply: ['$totalPrice', 1.18] }, 0] },
  ],
});

// ─── @route   POST /api/bookings ─────────────────────────────
// ─── @desc    Create a new booking with atomic bed allocation
// ─── @access  Private (Guest)
const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkInDate, checkOutDate, guestCount, specialRequests } = req.body;

  if (!roomId || !checkInDate || !checkOutDate || !guestCount) {
    res.status(400);
    throw new Error('roomId, checkInDate, checkOutDate, and guestCount are required');
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    res.status(400);
    throw new Error('Check-out must be after check-in');
  }

  if (checkIn < new Date()) {
    res.status(400);
    throw new Error('Check-in date cannot be in the past');
  }

  const numberOfNights = calcNights(checkIn, checkOut);

  // ── Atomic Bed Allocation (using Mongoose session + transaction) ──────
  // This prevents two simultaneous requests from booking the same bed.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify the room exists and is available
    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'Available') throw new Error(`Room is currently ${room.status}`);

    const activeCheckIn = await Booking.exists({
      roomId,
      bookingStatus: 'CheckedIn',
    }).session(session);
    if (activeCheckIn) {
      throw new Error('Room is currently booked until the guest checks out');
    }

    // 2. Find beds in this room that are NOT occupied by overlapping bookings
    const overlappingBookings = await Booking.find({
      roomId,
      bookingStatus: { $in: ['Confirmed', 'CheckedIn'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select('assignedBeds').session(session);

    const alreadyBookedBedIds = overlappingBookings.flatMap((b) =>
      b.assignedBeds.map((id) => id.toString())
    );

    // 3. Find available beds — not in the booked-bed list
    const availableBeds = await Bed.find({
      roomId,
      _id: { $nin: alreadyBookedBedIds },
    })
      .limit(Number(guestCount))
      .session(session);

    if (availableBeds.length < Number(guestCount)) {
      throw new Error(
        `Not enough available beds. Only ${availableBeds.length} bed(s) free for these dates.`
      );
    }

    // 4. Calculate total price: nights × beds × price-per-night
    const totalPrice = numberOfNights * Number(guestCount) * room.pricePerNight;
    const assignedBedIds = availableBeds.map((b) => b._id);

    // 5. Create the booking document
    const booking = await Booking.create(
      [
        {
          guestId: req.user._id,
          roomId,
          assignedBeds: assignedBedIds,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights,
          guestCount: Number(guestCount),
          totalPrice,
          paymentStatus: 'Pending',
          bookingStatus: 'Confirmed',
          bookingReference: generateBookingRef(),
          specialRequests: specialRequests || '',
        },
      ],
      { session }
    );

    // 6. Mark selected beds as occupied
    await Bed.updateMany(
      { _id: { $in: assignedBedIds } },
      { isOccupied: true, currentBookingId: booking[0]._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('roomId', 'roomNumber label roomType')
      .populate('assignedBeds', 'bedNumber bedType');

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(error.message);
  }
});

// ─── @route   GET /api/bookings/my ───────────────────────────
// ─── @desc    Get all bookings for the logged-in guest
// ─── @access  Private (Guest)
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guestId: req.user._id })
    .populate('roomId', 'roomNumber label roomType images pricePerNight')
    .populate('assignedBeds', 'bedNumber bedType')
    .sort({ checkInDate: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// ─── @route   GET /api/bookings ───────────────────────────────
// ─── @desc    Get all bookings (with optional filters)
// ─── @access  Staff, Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { bookingStatus, paymentStatus, date } = req.query;
  const filter = {};
  if (bookingStatus) filter.bookingStatus = bookingStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (date) {
    // Bookings active on a specific date
    const d = new Date(date);
    filter.checkInDate = { $lte: d };
    filter.checkOutDate = { $gte: d };
  }

  const bookings = await Booking.find(filter)
    .populate('guestId', 'name email phone')
    .populate('roomId', 'roomNumber label roomType')
    .populate('assignedBeds', 'bedNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// ─── @route   GET /api/bookings/:id ──────────────────────────
// ─── @desc    Get a single booking by ID
// ─── @access  Private (owner or Staff/Admin)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('guestId', 'name email phone')
    .populate('roomId', 'roomNumber label roomType pricePerNight amenities images')
    .populate('assignedBeds', 'bedNumber bedType');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only the booking owner or staff/admin can view
  const isOwner = booking.guestId._id.toString() === req.user._id.toString();
  const isStaff = ['Staff', 'Admin'].includes(req.user.role);
  if (!isOwner && !isStaff) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.status(200).json({ success: true, data: booking });
});

// ─── @route   PUT /api/bookings/:id/checkin ──────────────────
// ─── @desc    Check a guest in (Staff/Admin action)
// ─── @access  Staff, Admin
const checkInGuest = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.bookingStatus !== 'Confirmed') {
    res.status(400);
    throw new Error(`Cannot check in — booking status is "${booking.bookingStatus}"`);
  }

  booking.bookingStatus = 'CheckedIn';
  booking.checkedInAt = new Date();
  await booking.save();

  res.status(200).json({ success: true, data: booking, message: 'Guest checked in successfully' });
});

// ─── @route   PUT /api/bookings/:id/checkout ─────────────────
// ─── @desc    Check a guest out and free their beds
// ─── @access  Staff, Admin
const checkOutGuest = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.bookingStatus !== 'CheckedIn') {
    res.status(400);
    throw new Error(`Cannot check out — booking status is "${booking.bookingStatus}"`);
  }

  // Free the assigned beds and mark them as dirty (needs housekeeping)
  await Bed.updateMany(
    { _id: { $in: booking.assignedBeds } },
    { isOccupied: false, currentBookingId: null, cleaningStatus: 'Dirty' }
  );

  booking.bookingStatus = 'CheckedOut';
  booking.checkedOutAt = new Date();
  await booking.save();

  res.status(200).json({ success: true, data: booking, message: 'Guest checked out successfully' });
});

// ─── @route   PUT /api/bookings/:id/cancel ───────────────────
// ─── @desc    Cancel a booking and free beds
// ─── @access  Private (owner or Admin)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOwner = booking.guestId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'Admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (['CheckedIn', 'CheckedOut', 'Cancelled'].includes(booking.bookingStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel a booking with status "${booking.bookingStatus}"`);
  }

  // Free beds
  await Bed.updateMany(
    { _id: { $in: booking.assignedBeds } },
    { isOccupied: false, currentBookingId: null }
  );

  booking.bookingStatus = 'Cancelled';
  booking.paymentStatus = 'Refunded';
  await booking.save();

  res.status(200).json({ success: true, data: booking, message: 'Booking cancelled' });
});

// ─── @route   PUT /api/bookings/:id/payment ──────────────────
// ─── @desc    Update payment status (after gateway webhook)
// ─── @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentId } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.paymentStatus = paymentStatus;
  booking.paymentId = paymentId;
  if (paymentStatus === 'Paid') {
    booking.paidAmount = Math.round(booking.totalPrice * 1.18);
  }
  await booking.save();
  res.status(200).json({ success: true, data: booking });
});

// ─── @route   GET /api/bookings/admin/analytics ──────────────
// ─── @desc    Revenue, occupancy and guest metrics for dashboard
// ─── @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's revenue (paid bookings that start today)
  const todayRevenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        checkInDate: { $gte: today, $lt: tomorrow },
      },
    },
    { $group: { _id: null, total: { $sum: paidRevenueExpression() } } },
  ]);

  // Revenue from guests currently checked in. This changes immediately when
  // Staff or Admin checks in a paid booking, regardless of its scheduled date.
  const checkedInRevenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        bookingStatus: 'CheckedIn',
      },
    },
    { $group: { _id: null, total: { $sum: paidRevenueExpression() } } },
  ]);

  // Total revenue from all paid bookings, regardless of stay status.
  const totalRevenue = await Booking.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $group: { _id: null, total: { $sum: paidRevenueExpression() } } },
  ]);

  // Active guests (currently checked in)
  const activeGuests = await Booking.countDocuments({ bookingStatus: 'CheckedIn' });

  // Total occupied beds
  const occupiedBeds = await Booking.aggregate([
    { $match: { bookingStatus: 'CheckedIn' } },
    { $project: { bedCount: { $size: '$assignedBeds' } } },
    { $group: { _id: null, total: { $sum: '$bedCount' } } },
  ]);

  // Monthly revenue for the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: paidRevenueExpression() },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      todayRevenue: todayRevenue[0]?.total || 0,
      checkedInRevenue: checkedInRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeGuests,
      occupiedBeds: occupiedBeds[0]?.total || 0,
      monthlyRevenue,
    },
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
  updatePaymentStatus,
  getAnalytics,
};
