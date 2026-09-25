/**
 * pages/RoomDetail.jsx — Individual Room Page
 *
 * Shows the full room details: photo gallery, amenities, bed count,
 * a mini booking widget, and a "Book Now" CTA that initializes
 * the booking context before navigating to checkout.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BedDouble, Users, Wifi, ChevronLeft, ChevronRight, CalendarDays, Minus, Plus } from 'lucide-react';

import Loader from '../components/common/Loader';
import roomService from '../services/roomService';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, calcTotal, applyTax } from '../utils/priceCalc';
import { todayInputDate, toInputDate, calcNights } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const canBook = !user || user.role === 'Guest';

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkIn, setCheckIn]   = useState(todayInputDate());
  const [checkOut, setCheckOut] = useState(toInputDate(tomorrow));
  const [guests, setGuests]     = useState(1);

  const nights = calcNights(checkIn, checkOut);
  const subtotal = calcTotal(room?.pricePerNight || 0, nights, guests);
  const { subtotal: sub, tax, total } = applyTax(subtotal);
  const displayStatus = room?.displayStatus || room?.status;
  const activeBooking = room?.activeBooking;
  const formatRoomDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '';

  useEffect(() => {
    roomService.getById(id)
      .then((data) => { setRoom(data); document.title = `${data.label} — NomadNest`; })
      .catch(() => toast.error('Room not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-20"><Loader /></div>;
  if (!room) return (
    <div className="pt-24 container-custom text-center">
      <p className="text-red-500">Room not found.</p>
    </div>
  );

  const images = room.images?.length ? room.images : [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  ];

  const handleBook = () => {
    if (!canBook) {
      toast.error('Staff and admins cannot book rooms');
      return;
    }
    if (nights < 1) { toast.error('Check-out must be after check-in'); return; }
    if (guests < 1) { toast.error('Select at least 1 guest'); return; }
    if (!isAuthenticated) {
      toast('Please log in to book', { icon: '🔑' });
      navigate('/login');
      return;
    }
    initBooking(room, checkIn, checkOut, guests);
    navigate('/checkout');
  };

  return (
    <div className="page-enter pt-20">
      <div className="container-custom py-8">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
          <ChevronLeft className="w-4 h-4" /> Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Room Info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Photo gallery */}
            <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 group">
              <img src={images[imgIndex]} alt={room.label}
                className="w-full h-full object-cover transition-all duration-500" />

              {/* Gallery nav */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, j) => (
                      <button key={j} onClick={() => setImgIndex(j)}
                        className={`w-2 h-2 rounded-full transition-all ${j === imgIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}

              {/* Badges overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`badge ${room.roomType === 'Private' ? 'badge-blue' : 'badge-gray'}`}>
                  {room.roomType}
                </span>
                <span className={`badge ${displayStatus === 'Available' ? 'badge-green' : displayStatus === 'Booked' ? 'badge-red' : 'badge-yellow'}`}>
                  {displayStatus}
                </span>
              </div>
            </div>

            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">{room.label}</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Room {room.roomNumber} · Floor {room.floor}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">{room.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-brand-500" /> {room.totalBeds} beds</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-500" /> Max {room.maxGuests} guests</span>
              </div>
              {activeBooking && (
                <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                  Booked by {activeBooking.guestName} until {formatRoomDate(activeBooking.checkOutDate)}.
                  The room becomes available after checkout.
                </p>
              )}
            </div>

            {/* Description */}
            {room.description && (
              <div className="card p-5">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-2">About this room</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{room.description}</p>
              </div>
            )}

            {/* Amenities */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-brand-500" />
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Booking Widget ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-3xl text-brand-500">{formatINR(room.pricePerNight)}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">/ bed / night</span>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Check-in
                    </label>
                    <input id="detail-checkin" type="date" min={todayInputDate()} value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="form-input text-sm" />
                  </div>
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Check-out
                    </label>
                    <input id="detail-checkout" type="date" min={checkIn} value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="form-input text-sm" />
                  </div>
                </div>

                {/* Guest count */}
                <div>
                  <label className="form-label">Guests / Beds</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center text-slate-800 dark:text-white">{guests}</span>
                    <button onClick={() => setGuests((g) => Math.min(room.totalBeds, g + 1))}
                      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              {nights > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{formatINR(room.pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''} × {guests} guest{guests !== 1 ? 's' : ''}</span>
                    <span>{formatINR(sub)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>GST (18%)</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-brand-500">{formatINR(total)}</span>
                  </div>
                </div>
              )}

              {canBook ? (
                <>
                  <button id="book-now-btn" onClick={handleBook} className="btn-primary w-full text-base py-4">
                    {isAuthenticated ? 'Book Now' : 'Login to Book'}
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-3">
                    Free cancellation before check-in · No hidden fees
                  </p>
                </>
              ) : (
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                  Staff and admin accounts cannot book rooms.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
