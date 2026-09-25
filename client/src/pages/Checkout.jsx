/**
 * pages/Checkout.jsx — Booking Checkout Page
 *
 * Shows booking summary and a Razorpay-styled payment mockup.
 * On "Pay Now", calls the booking API to create the booking,
 * then simulates payment confirmation before redirecting.
 */

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, CalendarDays, BedDouble, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

import { useBooking } from '../context/BookingContext';
import bookingService from '../services/bookingService';
import { formatDate } from '../utils/dateUtils';
import { formatINR, applyTax } from '../utils/priceCalc';

const Checkout = () => {
  const navigate = useNavigate();
  const { booking, updateSpecialRequests, clearBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [payStep, setPayStep] = useState('form'); // 'form' | 'processing' | 'done'

  // Guard: if no active booking in context, redirect to rooms
  if (!booking.roomId) return <Navigate to="/rooms" replace />;

  const { subtotal, tax, total } = applyTax(booking.totalPrice);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPayStep('processing');

    try {
      // 1. Create booking via API (atomic bed allocation happens server-side)
      const created = await bookingService.create({
        roomId: booking.roomId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guestCount: booking.guestCount,
        specialRequests: booking.specialRequests,
      });

      // 2. Simulate Razorpay payment (in production, open Razorpay modal here)
      await new Promise((r) => setTimeout(r, 1800)); // Simulated gateway delay

      // 3. Update payment status to Paid
      await bookingService.updatePayment(created._id, {
        paymentStatus: 'Paid',
        paymentId: `pay_MOCK_${Date.now()}`,
      });

      setPayStep('done');
      setTimeout(() => {
        clearBooking();
        navigate(`/booking/confirm/${created._id}`);
      }, 800);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      setPayStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-white mb-8"
        >
          Complete Your Booking
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Payment Form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Special Requests */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-5">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Special Requests</h2>
              <textarea
                id="special-requests"
                rows={3}
                placeholder="Any special requests? (early check-in, ground floor bed, etc.)"
                value={booking.specialRequests}
                onChange={(e) => updateSpecialRequests(e.target.value)}
                className="form-input resize-none"
              />
            </motion.div>

            {/* Payment Section — Razorpay-styled mockup */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-800 dark:text-white">Payment Details</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Lock className="w-3.5 h-3.5" /> Secured by Razorpay
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="form-label" htmlFor="card-number">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="card-number" type="text" placeholder="4242 4242 4242 4242"
                      className="form-input pl-9" defaultValue="4242 4242 4242 4242" readOnly />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Use any test card — this is a demo environment</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="card-expiry">Expiry</label>
                    <input id="card-expiry" type="text" placeholder="MM / YY"
                      className="form-input" defaultValue="12 / 27" readOnly />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="card-cvv">CVV</label>
                    <input id="card-cvv" type="password" placeholder="•••"
                      className="form-input" defaultValue="123" readOnly maxLength={3} />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="card-name">Cardholder Name</label>
                  <input id="card-name" type="text" placeholder="As on card"
                    className="form-input" defaultValue="Alex Traveller" />
                </div>

                {/* Payment button */}
                <button
                  id="pay-now-btn"
                  type="submit"
                  disabled={loading || payStep === 'processing'}
                  className="btn-primary w-full py-4 text-base mt-2 relative overflow-hidden"
                >
                  {payStep === 'processing' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : payStep === 'done' ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" /> Booking Confirmed!
                    </span>
                  ) : (
                    <span>Pay {formatINR(total)}</span>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400">
                  By paying you agree to our Terms of Service and Cancellation Policy.
                </p>
              </form>
            </motion.div>
          </div>

          {/* ── Booking Summary ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Booking Summary</h2>

              {/* Room thumbnail */}
              {booking.room?.images?.[0] && (
                <div className="rounded-xl overflow-hidden h-36 mb-4">
                  <img src={booking.room.images[0]} alt={booking.room.label}
                    className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{booking.room?.label}</h3>
              <p className="text-xs text-slate-400 mb-4">Room {booking.room?.roomNumber}</p>

              <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-brand-500" /> Check-in</span>
                  <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" /> Check-out</span>
                  <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-brand-500" /> Beds</span>
                  <span className="font-medium">{booking.guestCount} × {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-1.5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span><span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>GST (18%)</span><span>{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base pt-1">
                    <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-brand-500" /> Total</span>
                    <span className="text-brand-500">{formatINR(total)}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                {['Free Cancellation', 'Instant Confirmation', 'Secure Payment'].map((b) => (
                  <span key={b} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" /> {b}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
