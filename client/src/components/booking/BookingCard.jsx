/**
 * components/booking/BookingCard.jsx — Booking Summary Card
 *
 * Displays a booking record in the Guest Dashboard.
 * Shows status badges, dates, bed count, and cancel action.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, BedDouble, Tag, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { formatINR } from '../../utils/priceCalc';

const statusConfig = {
  Confirmed:  { className: 'badge-blue',   label: 'Confirmed' },
  CheckedIn:  { className: 'badge-green',  label: 'Checked In' },
  CheckedOut: { className: 'badge-gray',   label: 'Checked Out' },
  Cancelled:  { className: 'badge-red',    label: 'Cancelled' },
  NoShow:     { className: 'badge-yellow', label: 'No Show' },
};

const paymentConfig = {
  Paid:    { className: 'badge-green',  label: 'Paid' },
  Pending: { className: 'badge-yellow', label: 'Payment Pending' },
  Refunded:{ className: 'badge-blue',   label: 'Refunded' },
  Failed:  { className: 'badge-red',    label: 'Failed' },
};

const BookingCard = ({ booking, onCancel, delay = 0 }) => {
  const { room } = booking.roomId || {};
  const roomLabel = booking.roomId?.label || booking.roomId?.roomNumber || 'Room';
  const roomImage = booking.roomId?.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400';

  const status = statusConfig[booking.bookingStatus] || statusConfig.Confirmed;
  const payment = paymentConfig[booking.paymentStatus] || paymentConfig.Pending;

  const canCancel = ['Confirmed'].includes(booking.bookingStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card overflow-hidden flex flex-col sm:flex-row"
    >
      {/* Room thumbnail */}
      <div className="sm:w-40 h-36 sm:h-auto overflow-hidden shrink-0">
        <img src={roomImage} alt={roomLabel}
          className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{roomLabel}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ref: <span className="font-mono font-medium">{booking.bookingReference}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={status.className}>{status.label}</span>
            <span className={payment.className}>{payment.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CalendarCheck className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-400">Check-in</p>
              <p className="font-medium">{formatDate(booking.checkInDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CalendarCheck className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Check-out</p>
              <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-400">Duration</p>
              <p className="font-medium">{booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <BedDouble className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-400">Beds</p>
              <p className="font-medium">{booking.guestCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Tag className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="font-semibold text-brand-500">{formatINR(booking.totalPrice)}</p>
            </div>
          </div>
        </div>

        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="btn-danger text-xs py-2 px-4"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BookingCard;
