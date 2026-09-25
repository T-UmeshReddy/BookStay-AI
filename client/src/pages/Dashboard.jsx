/**
 * pages/Dashboard.jsx — Guest Profile & Booking History
 *
 * Shows:
 *  - Profile card with edit option
 *  - Tabs: Upcoming / Past bookings
 *  - BookingCard list with cancel option
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit2, CalendarCheck, History } from 'lucide-react';
import toast from 'react-hot-toast';

import BookingCard from '../components/booking/BookingCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const TAB_UPCOMING = 'upcoming';
const TAB_PAST = 'past';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(TAB_UPCOMING);

  useEffect(() => {
    document.title = 'My Bookings — NomadNest';
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => ['Confirmed', 'CheckedIn'].includes(b.bookingStatus) && new Date(b.checkOutDate) >= now
  );
  const past = bookings.filter(
    (b) => ['CheckedOut', 'Cancelled', 'NoShow'].includes(b.bookingStatus) ||
           new Date(b.checkOutDate) < now
  );

  const activeList = tab === TAB_UPCOMING ? upcoming : past;

  return (
    <div className="page-enter pt-24 pb-16">
      <div className="container-custom max-w-4xl">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-display font-bold text-2xl shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-slate-800 dark:text-white">{user?.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {user?.phone}</span>}
              <span className="badge badge-blue capitalize">{user?.role}</span>
            </div>
          </div>
          <button className="btn-secondary text-sm">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'bg-brand-50 dark:bg-brand-900/20 text-brand-500' },
            { label: 'Upcoming',       value: upcoming.length,  icon: CalendarCheck, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
            { label: 'Past Stays',     value: past.length,      icon: History,       color: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-2xl text-slate-800 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          {[
            { id: TAB_UPCOMING, label: `Upcoming (${upcoming.length})` },
            { id: TAB_PAST,     label: `Past (${past.length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors duration-150 -mb-px
                ${tab === id
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {loading ? (
          <Loader />
        ) : activeList.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-5xl mb-4">{tab === TAB_UPCOMING ? '📅' : '🕰️'}</div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              {tab === TAB_UPCOMING ? 'No upcoming bookings' : 'No past stays'}
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              {tab === TAB_UPCOMING ? 'Ready to plan your next adventure?' : 'Your past stays will appear here.'}
            </p>
            {tab === TAB_UPCOMING && (
              <a href="/rooms" className="btn-primary">Find a Room</a>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {activeList.map((booking, i) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={tab === TAB_UPCOMING ? handleCancel : null}
                delay={i * 0.07}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
