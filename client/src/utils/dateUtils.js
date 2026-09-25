/**
 * utils/dateUtils.js — Date Formatting Helpers
 */

import { format, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';

/**
 * Format a date to "DD MMM YYYY" (e.g. "04 Sep 2026")
 */
export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');

/**
 * Format a date to "EEE, DD MMM" (e.g. "Thu, 04 Sep")
 */
export const formatDateShort = (date) => format(new Date(date), 'EEE, dd MMM');

/**
 * Format for HTML date input value (YYYY-MM-DD)
 */
export const toInputDate = (date) => format(new Date(date), 'yyyy-MM-dd');

/**
 * Today's date formatted for min= on date inputs
 */
export const todayInputDate = () => toInputDate(new Date());

/**
 * Number of nights between two dates
 * @returns {number}
 */
export const calcNights = (checkIn, checkOut) =>
  Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)));

/**
 * Returns true if the date is in the past
 */
export const isPast = (date) => isBefore(new Date(date), new Date());

/**
 * Returns true if checkIn < checkOut
 */
export const isValidRange = (checkIn, checkOut) =>
  isAfter(new Date(checkOut), new Date(checkIn));
