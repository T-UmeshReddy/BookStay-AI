/**
 * routes/bookingRoutes.js — Booking Routes
 */

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
  updatePaymentStatus,
  getAnalytics,
} = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Analytics (Staff/Admin)
router.get('/admin/analytics', requireAuth, requireRole('Staff', 'Admin'), getAnalytics);

// All bookings (Staff/Admin)
router.get('/', requireAuth, requireRole('Staff', 'Admin'), getAllBookings);

// Guest bookings
router.get('/my', requireAuth, getMyBookings);
router.post('/', requireAuth, requireRole('Guest'), createBooking);
router.get('/:id', requireAuth, getBookingById);
router.put('/:id/cancel', requireAuth, cancelBooking);
router.put('/:id/payment', requireAuth, updatePaymentStatus);

// Staff/Admin actions
router.put('/:id/checkin', requireAuth, requireRole('Staff', 'Admin'), checkInGuest);
router.put('/:id/checkout', requireAuth, requireRole('Staff', 'Admin'), checkOutGuest);

module.exports = router;
