/**
 * App.jsx — Root Router
 *
 * Defines all client-side routes and wraps each page in a
 * layout (Navbar + Footer). Protected routes redirect to /login.
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import { useAuth } from './context/AuthContext';

// Lazy-load pages for code splitting
const Landing         = lazy(() => import('./pages/Landing'));
const Rooms           = lazy(() => import('./pages/Rooms'));
const RoomDetail      = lazy(() => import('./pages/RoomDetail'));
const Checkout        = lazy(() => import('./pages/Checkout'));
const BookingConfirm  = lazy(() => import('./pages/BookingConfirmation'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard  = lazy(() => import('./pages/StaffDashboard'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const NotFound        = lazy(() => import('./pages/NotFound'));

// ── Route Guards ────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestBookingRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Guest') return <Navigate to={user?.role === 'Admin' ? '/admin' : '/staff'} replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
};

const StaffRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Staff') return <Navigate to="/" replace />;
  return children;
};

const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ── App Component ───────────────────────────────────────────────
const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loader fullScreen />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route path="/"              element={<Landing />} />
              <Route path="/rooms"         element={<Rooms />} />
              <Route path="/rooms/:id"     element={<RoomDetail />} />

              {/* Auth */}
              <Route path="/login"    element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
              <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />

              {/* Guest Protected */}
              <Route path="/checkout"      element={<GuestBookingRoute><Checkout /></GuestBookingRoute>} />
              <Route path="/booking/confirm/:id" element={<GuestBookingRoute><BookingConfirm /></GuestBookingRoute>} />
              <Route path="/dashboard"     element={<GuestBookingRoute><Dashboard /></GuestBookingRoute>} />

              {/* Admin / Staff */}
              <Route path="/admin"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/staff"         element={<StaffRoute><StaffDashboard /></StaffRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
