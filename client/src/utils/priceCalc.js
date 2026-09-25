/**
 * utils/priceCalc.js — Pricing Utilities
 */

/**
 * Format a number as Indian Rupees (INR)
 * e.g. 2500 → "₹2,500"
 */
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/**
 * Calculate total booking price.
 * Formula: pricePerNight × numberOfNights × guestCount
 *
 * @param {number} pricePerNight
 * @param {number} nights
 * @param {number} guests
 * @returns {number}
 */
export const calcTotal = (pricePerNight, nights, guests) =>
  pricePerNight * nights * guests;

/**
 * Apply tax (e.g. 18% GST) and return breakdown.
 * @param {number} subtotal
 * @param {number} taxRate - e.g. 0.18 for 18%
 * @returns {{ subtotal, tax, total }}
 */
export const applyTax = (subtotal, taxRate = 0.18) => {
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
};
