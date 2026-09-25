/**
 * services/authService.js — Authentication API Calls
 */

import api from './api';

const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/me', profileData);
    return data.data;
  },
};

export default authService;
