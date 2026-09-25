/**
 * components/admin/StaffActions.jsx — Quick Check-in/Check-out Panel
 *
 * Lists recent/active bookings with quick action buttons for
 * checking guests in and out. Used in the Admin Dashboard.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Search, User } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const StaffActions = ({ bookings = [], onRefresh }) => {
  const [searchRef, setSearchRef] = useState('');
  const [loading, setLoading] = useState(null); // booking ID being actioned

  const filtered = bookings.filter((b) =>
    !searchRef ||
    b.bookingReference?.toLowerCase().includes(searchRef.toLowerCase()) ||
    b.guestId?.name?.toLowerCase().includes(searchRef.toLowerCase())
  );

  const handleCheckIn = async (id) => {
    setLoading(id);
    try {
      await bookingService.checkIn(id);
      toast.success('Guest checked in ✅');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(null);
    }
  };

  const handleCheckOut = async (id) => {
    setLoading(id);
    try {
      await bookingService.checkOut(id);
      toast.success('Guest checked out 👋');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">Check-in / Check-out</h3>
        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking or name…"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="form-input pl-8 py-2 text-xs w-52"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">No bookings found</p>
        )}
        {filtered.map((booking, i) => (
          <motion.div
            key={booking._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {booking.guestId?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {booking.guestId?.name || 'Guest'}
              </p>
              <p className="text-xs text-slate-400">
                {booking.bookingReference} · {booking.roomId?.roomNumber} · {formatDate(booking.checkInDate)}
              </p>
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {booking.bookingStatus === 'Confirmed' && (
                <button
                  id={`checkin-${booking._id}`}
                  onClick={() => handleCheckIn(booking._id)}
                  disabled={loading === booking._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30
                             dark:text-emerald-400 transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {loading === booking._id ? '…' : 'Check In'}
                </button>
              )}
              {booking.bookingStatus === 'CheckedIn' && (
                <button
                  id={`checkout-${booking._id}`}
                  onClick={() => handleCheckOut(booking._id)}
                  disabled={loading === booking._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30
                             dark:text-blue-400 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {loading === booking._id ? '…' : 'Check Out'}
                </button>
              )}
              {!['Confirmed', 'CheckedIn'].includes(booking.bookingStatus) && (
                <span className="text-xs text-slate-400 font-medium capitalize">{booking.bookingStatus}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StaffActions;
