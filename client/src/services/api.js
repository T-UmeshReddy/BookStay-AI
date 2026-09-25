/**
 * services/api.js — Axios Instance
 *
 * Pre-configured with base URL and JWT injection interceptor.
 * All API calls across the app import from this module.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',       // Vite proxy forwards to http://localhost:5000
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor: Attach JWT to every request ─────────
api.interceptors.request.use(
  (config) => {
    const saved = localStorage.getItem('nomadnest-user');
    if (saved) {
      try {
        const { token } = JSON.parse(saved);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Corrupted storage — silently continue without token
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 token expiry globally ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      localStorage.removeItem('nomadnest-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
