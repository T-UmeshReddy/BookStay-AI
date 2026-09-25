/**
 * pages/Rooms.jsx — Room Listing Page
 *
 * Reads search params from URL (set by Landing SearchBar),
 * calls the availability API, and renders filtered RoomCards.
 * Allows inline filter changes without navigating away.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

import SearchBar from '../components/booking/SearchBar';
import RoomCard from '../components/booking/RoomCard';
import Loader from '../components/common/Loader';
import roomService from '../services/roomService';
import { todayInputDate, toInputDate } from '../utils/dateUtils';

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Filter state
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [filters, setFilters] = useState({
    checkIn:   searchParams.get('checkIn')   || todayInputDate(),
    checkOut:  searchParams.get('checkOut')  || toInputDate(tomorrow),
    guestCount: Number(searchParams.get('guestCount')) || 1,
    roomType:  searchParams.get('roomType')  || '',
  });

  const fetchRooms = useCallback(async (params) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await roomService.checkAvailability(params);
      setRooms(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms. Is the server running?');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search on mount if URL params present
  useEffect(() => {
    document.title = 'Browse Rooms — NomadNest';
    if (searchParams.get('checkIn')) {
      fetchRooms(filters);
    } else {
      // Load all available rooms by default
      roomService.getAll({ status: 'Available' })
        .then(setRooms)
        .catch(() => setError('Failed to load rooms'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSearch = (params) => {
    setFilters(params);
    fetchRooms(params);
  };

  return (
    <div className="page-enter pt-20">
      {/* ── Header ── */}
      <div className="bg-hero-gradient py-12">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2">
            Find Your Perfect Room
          </motion.h1>
          <p className="text-white/70 mb-8">
            {rooms.length > 0 && searched
              ? `${rooms.length} room${rooms.length !== 1 ? 's' : ''} available for your dates`
              : 'Search by dates and preferences'}
          </p>
          <SearchBar onSearch={handleSearch} initialValues={filters} compact />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-custom py-10">
        {loading && <Loader />}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && rooms.length === 0 && searched && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No rooms available
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Try different dates or guest count.
            </p>
            <button onClick={() => fetchRooms({ ...filters, roomType: '' })} className="btn-secondary">
              Clear Filters
            </button>
          </motion.div>
        )}

        {!loading && rooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, i) => (
              <RoomCard
                key={room._id}
                room={room}
                freeBedCount={room.freeBedCount}
                delay={i * 0.06}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
