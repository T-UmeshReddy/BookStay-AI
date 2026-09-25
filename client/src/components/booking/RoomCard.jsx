/**
 * components/booking/RoomCard.jsx — Room Listing Card
 *
 * Displays room thumbnail, type badge, amenities, price per night,
 * and an availability badge. Used on the Rooms listing page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, Star, Users, BedDouble, ChevronRight } from 'lucide-react';
import { formatINR } from '../../utils/priceCalc';
import { useAuth } from '../../context/AuthContext';

const AMENITY_ICONS = {
  WiFi: <Wifi className="w-3.5 h-3.5" />,
};

const statusBadge = (status) => {
  if (status === 'Available') return <span className="badge-green">Available</span>;
  if (status === 'Booked')    return <span className="badge-red">Booked</span>;
  if (status === 'Cleaning')  return <span className="badge-yellow">Cleaning</span>;
  return                              <span className="badge-gray">Maintenance</span>;
};

const RoomCard = ({ room, freeBedCount, delay = 0 }) => {
  const { user } = useAuth();
  const canBook = !user || user.role === 'Guest';
  const imageUrl = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600';
  const displayStatus = room.displayStatus || room.status;
  const checkoutDate = room.activeBooking?.checkOutDate;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-hover group overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imageUrl}
          alt={room.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          {statusBadge(displayStatus)}
        </div>
        {/* Room type pill */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${room.roomType === 'Private' ? 'badge-blue' : 'badge-gray'}`}>
            {room.roomType}
          </span>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white text-xl font-bold font-display">
                {formatINR(room.pricePerNight)}
              </p>
              <p className="text-white/70 text-xs">per bed / night</p>
            </div>
            {freeBedCount !== undefined && (
              <span className="text-xs bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full">
                {freeBedCount} bed{freeBedCount !== 1 ? 's' : ''} free
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display font-semibold text-slate-800 dark:text-white text-base leading-tight">
              {room.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Room {room.roomNumber} · Floor {room.floor}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{room.rating}</span>
          </div>
        </div>

        {room.activeBooking && (
          <p className="mb-3 text-xs text-red-600 dark:text-red-400">
            Booked by {room.activeBooking.guestName} until {formatDate(checkoutDate)}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" /> {room.totalBeds} beds
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Max {room.maxGuests}
          </span>
        </div>

        {/* Amenities chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60
                         text-slate-600 dark:text-slate-300 flex items-center gap-1">
              {AMENITY_ICONS[amenity] || null}
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        <Link
          to={`/rooms/${room._id}`}
          id={`book-room-${room._id}`}
          className="btn-primary w-full justify-center"
        >
          {canBook ? 'View & Book' : 'View Room'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default RoomCard;
