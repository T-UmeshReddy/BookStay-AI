/**
 * pages/BookingConfirmation.jsx — Booking Success Screen
 *
 * Displays an animated success screen with:
 *  - Booking reference and QR code mockup
 *  - Stay summary
 *  - Download receipt button (prints the page)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, CalendarDays, BedDouble } from 'lucide-react';

import Loader from '../components/common/Loader';
import bookingService from '../services/bookingService';
import { formatDate } from '../utils/dateUtils';
import { formatINR } from '../utils/priceCalc';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Booking Confirmed — NomadNest';
    bookingService.getById(id)
      .then(setBooking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-24"><Loader /></div>;
  if (!booking) return (
    <div className="pt-24 container-custom text-center">
      <p className="text-red-500">Booking not found.</p>
    </div>
  );

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-navy-900">
      <div className="container-custom max-w-2xl">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-display font-extrabold text-3xl text-slate-800 dark:text-white mb-2">
            You're All Set! 🎉
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Your booking is confirmed. We can't wait to welcome you!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card overflow-hidden mb-6"
        >
          {/* Header bar */}
          <div className="bg-brand-500 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider">Booking Reference</p>
              <p className="text-white font-display font-bold text-xl tracking-widest">
                {booking.bookingReference}
              </p>
            </div>
            <span className="badge bg-white/20 text-white font-semibold">
              {booking.bookingStatus}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Stay details */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Room</p>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {booking.roomId?.label || 'Room'}
                </p>
                <p className="text-sm text-slate-500">#{booking.roomId?.roomNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Check-in
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Check-out
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BedDouble className="w-3 h-3" /> Beds
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{booking.guestCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nights</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{booking.numberOfNights}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total</p>
                  <p className="font-bold text-brand-500 text-sm">{formatINR(booking.totalPrice)}</p>
                </div>
              </div>
              <div className="pt-2">
                <span className={`badge ${booking.paymentStatus === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>
                  Payment: {booking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Right: QR Code mockup */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-32 h-32 bg-white dark:bg-white rounded-xl p-2 mb-3">
                {/* QR pattern mockup using CSS grid */}
                <div className="w-full h-full grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i}
                      className={`rounded-sm ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18].includes(i)
                        ? 'bg-slate-900' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">Show this QR at the hostel reception</p>
              <p className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 mt-1">
                {booking.bookingReference}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button onClick={() => window.print()}
            className="btn-secondary flex-1 justify-center">
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <Link to="/dashboard" className="btn-primary flex-1 justify-center">
            View My Bookings
          </Link>
          <Link to="/" className="btn-ghost flex-1 justify-center">
            <Home className="w-4 h-4" /> Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
