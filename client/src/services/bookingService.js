/**
 * services/bookingService.js — Booking API Calls
 */

import api from './api';

const bookingService = {
  create: async (bookingData) => {
    const { data } = await api.post('/bookings', bookingData);
    return data.data;
  },

  getMyBookings: async () => {
    const { data } = await api.get('/bookings/my');
    return data.data;
  },

  getAllBookings: async (filters = {}) => {
    const { data } = await api.get('/bookings', { params: filters });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/bookings/${id}`);
    return data.data;
  },

  checkIn: async (id) => {
    const { data } = await api.put(`/bookings/${id}/checkin`);
    return data.data;
  },

  checkOut: async (id) => {
    const { data } = await api.put(`/bookings/${id}/checkout`);
    return data.data;
  },

  cancel: async (id) => {
    const { data } = await api.put(`/bookings/${id}/cancel`);
    return data.data;
  },

  updatePayment: async (id, paymentData) => {
    const { data } = await api.put(`/bookings/${id}/payment`, paymentData);
    return data.data;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/bookings/admin/analytics');
    return data.data;
  },
};

export default bookingService;
