/**
 * components/booking/SearchBar.jsx — Room Availability Search Form
 *
 * Accepts check-in/check-out dates, guest count, and room type.
 * Calls onSearch with the selected parameters.
 * Used on the Landing page (hero) and Rooms listing page.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CalendarDays, Users, BedDouble } from 'lucide-react';
import { todayInputDate, toInputDate } from '../../utils/dateUtils';

const SearchBar = ({ onSearch, initialValues = {}, compact = false }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [checkIn, setCheckIn]   = useState(initialValues.checkIn  || todayInputDate());
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || toInputDate(tomorrow));
  const [guests, setGuests]     = useState(initialValues.guests   || 1);
  const [roomType, setRoomType] = useState(initialValues.roomType || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch({ checkIn, checkOut, guestCount: guests, roomType });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`glass p-4 ${compact ? 'rounded-xl' : 'rounded-2xl p-6'} w-full`}
    >
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3`}>

        {/* Check-in */}
        <div className="relative">
          <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">Check-in</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              id="search-checkin"
              type="date"
              min={todayInputDate()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg
                         pl-9 pr-3 py-3 text-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400
                         focus:outline-none transition-all [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="relative">
          <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">Check-out</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              id="search-checkout"
              type="date"
              min={checkIn || todayInputDate()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg
                         pl-9 pr-3 py-3 text-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400
                         focus:outline-none transition-all [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <select
              id="search-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg
                         pl-9 pr-3 py-3 text-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400
                         focus:outline-none transition-all appearance-none"
            >
              {[1,2,3,4,5,6,7,8].map((n) => (
                <option key={n} value={n} className="text-slate-800">{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Room type */}
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">Room Type</label>
          <div className="relative">
            <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <select
              id="search-roomtype"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg
                         pl-9 pr-3 py-3 text-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400
                         focus:outline-none transition-all appearance-none"
            >
              <option value="" className="text-slate-800">Any Type</option>
              <option value="Dorm" className="text-slate-800">Dorm</option>
              <option value="Private" className="text-slate-800">Private</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className={`flex items-end ${compact ? '' : 'lg:col-span-4 lg:col-start-1 lg:flex-col lg:items-stretch'}`}>
          {compact && <div className="mb-0" />}
          <button
            id="search-submit"
            type="submit"
            className="btn-primary w-full py-3 text-base"
          >
            <Search className="w-5 h-5" />
            {compact ? 'Search' : 'Find Available Rooms'}
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default SearchBar;
