/**
 * context/BookingContext.jsx — Booking Flow Context
 *
 * Holds the in-progress booking state as a guest navigates
 * from room search → room detail → checkout.
 * Cleared on booking confirmation.
 */

import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

const initialBookingState = {
  roomId: null,
  room: null,          // Full room object for display
  checkInDate: null,
  checkOutDate: null,
  guestCount: 1,
  numberOfNights: 0,
  totalPrice: 0,
  specialRequests: '',
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(initialBookingState);

  /**
   * Sets the active room and search params for the booking flow.
   * Called from the Room Detail page when user clicks "Book Now".
   */
  const initBooking = (room, checkIn, checkOut, guestCount) => {
    // Calculate nights: ceil((checkOut - checkIn) / ms-per-day)
    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const total = nights * guestCount * room.pricePerNight;

    setBooking({
      roomId: room._id,
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount,
      numberOfNights: nights,
      totalPrice: total,
      specialRequests: '',
    });
  };

  const updateSpecialRequests = (text) => {
    setBooking((prev) => ({ ...prev, specialRequests: text }));
  };

  const clearBooking = () => setBooking(initialBookingState);

  return (
    <BookingContext.Provider value={{ booking, initBooking, updateSpecialRequests, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};
