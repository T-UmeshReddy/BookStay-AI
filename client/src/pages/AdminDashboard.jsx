/**
 * pages/AdminDashboard.jsx — Admin / Staff Control Center
 *
 * Sections:
 *  1. KPI Metric Cards (Revenue, Occupancy, Active Guests)
 *  2. Monthly Revenue Chart (Recharts BarChart)
 *  3. Live Occupancy Grid (OccupancyGrid component)
 *  4. Guest Management (StaffActions component)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  IndianRupee, Users, BedDouble, TrendingUp, RefreshCw, LayoutGrid, UserCheck, LogIn, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

import MetricCard from '../components/admin/MetricCard';
import OccupancyGrid from '../components/admin/OccupancyGrid';
import StaffActions from '../components/admin/StaffActions';
import RoomManagement from '../components/admin/RoomManagement';
import Loader from '../components/common/Loader';

import bookingService from '../services/bookingService';
import roomService from '../services/roomService';
import api from '../services/api';
import { formatINR } from '../utils/priceCalc';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDashboard = ({ staffMode = false }) => {
  const { user } = useAuth();
  const isAdmin = !staffMode && user?.role === 'Admin';
  const dashboardTitle = isAdmin ? 'Admin Dashboard' : 'Staff Dashboard';
  const [analytics, setAnalytics]     = useState(null);
  const [rooms, setRooms]             = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');

  useEffect(() => {
    document.title = `${dashboardTitle} — NomadNest`;
  }, [dashboardTitle]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, roomsData, bookingsData] = await Promise.all([
        bookingService.getAnalytics(),
        roomService.getAdminGrid(),
        bookingService.getAllBookings(),
      ]);
      setAnalytics(analyticsData);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateBed = async (bedId, updates) => {
    try {
      await api.put(`/beds/${bedId}`, updates);
      toast.success('Bed status updated');
      fetchData();
    } catch {
      toast.error('Failed to update bed');
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkIn(bookingId);
      toast.success('Guest checked in');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await bookingService.checkOut(bookingId);
      toast.success('Guest checked out');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  // Prepare chart data from analytics
  const chartData = analytics?.monthlyRevenue?.map((m) => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    bookings: m.bookings,
  })) || [];

  // Calculate occupancy %
  const totalBeds = rooms.reduce((s, r) => s + (r.beds?.length || 0), 0);
  const occupancyRate = totalBeds > 0
    ? Math.round((analytics?.occupiedBeds / totalBeds) * 100)
    : 0;
  const totalRevenue = analytics?.totalRevenue ?? bookings
    .filter((booking) => booking.paymentStatus === 'Paid')
    .reduce((sum, booking) => sum + (booking.paidAmount ?? Math.round(booking.totalPrice * 1.18)), 0);

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: TrendingUp },
    { id: 'grid',      label: 'Bed Grid',  icon: LayoutGrid },
    { id: 'operations', label: 'Check-in / Check-out', icon: UserCheck },
    ...(isAdmin ? [{ id: 'rooms', label: 'Rooms', icon: BedDouble }] : []),
  ];

  return (
    <div className="page-enter pt-24 pb-16 bg-slate-50 dark:bg-navy-950 min-h-screen">
      <div className="container-custom">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">
              {dashboardTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={fetchData}
            className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {loading ? <Loader /> : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total Revenue"
                value={formatINR(totalRevenue)}
                subtitle="All paid bookings"
                icon={IndianRupee}
                color="brand"
                delay={0}
              />
              <MetricCard
                title="Active Guests"
                value={analytics?.activeGuests || 0}
                subtitle="Currently checked in"
                icon={Users}
                color="green"
                delay={0.05}
              />
              <MetricCard
                title="Occupancy Rate"
                value={`${occupancyRate}%`}
                subtitle={`${analytics?.occupiedBeds || 0} of ${totalBeds} beds occupied`}
                icon={BedDouble}
                color="blue"
                delay={0.1}
              />
              <MetricCard
                title="Total Bookings"
                value={bookings.length}
                subtitle="All time"
                icon={TrendingUp}
                color="purple"
                delay={0.15}
              />
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px
                    ${activeTab === id
                      ? 'border-brand-500 text-brand-500'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="card p-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-6">
                    Monthly Revenue (Last 6 Months)
                  </h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: '#f1f5f9',
                            fontSize: '12px',
                          }}
                          formatter={(v) => [formatINR(v), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#ff7412" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400">
                      No revenue data yet. Start taking bookings!
                    </div>
                  )}
                </motion.div>

                {/* Recent bookings table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="card p-5">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Bookings</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          {['Reference', 'Guest', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 8).map((b) => (
                          <tr key={b._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-brand-500">{b.bookingReference}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-200">{b.guestId?.name || '—'}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{b.roomId?.roomNumber || '—'}</td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                              {new Date(b.checkInDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                              {new Date(b.checkOutDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200">{formatINR(b.totalPrice)}</td>
                            <td className="py-3 px-3">
                              <span className={`badge text-xs ${
                                b.bookingStatus === 'Confirmed'  ? 'badge-blue' :
                                b.bookingStatus === 'CheckedIn'  ? 'badge-green' :
                                b.bookingStatus === 'CheckedOut' ? 'badge-gray' :
                                'badge-red'
                              }`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {b.bookingStatus === 'Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckIn(b._id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                                >
                                  <LogIn className="w-3.5 h-3.5" /> Check In
                                </button>
                              )}
                              {b.bookingStatus === 'CheckedIn' && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckOut(b._id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                                >
                                  <LogOut className="w-3.5 h-3.5" /> Check Out
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr><td colSpan={8} className="py-8 text-center text-slate-400">No bookings yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── Bed Grid Tab ── */}
            {activeTab === 'grid' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 dark:text-white">
                    Live Bed Occupancy Grid
                  </h2>
                  <p className="text-xs text-slate-400">Click any bed cell for actions</p>
                </div>
                <OccupancyGrid rooms={rooms} onUpdateBed={staffMode ? handleUpdateBed : undefined} />
              </motion.div>
            )}

            {/* ── Check-in / Check-out Tab ── */}
            {activeTab === 'operations' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <StaffActions bookings={bookings} onRefresh={fetchData} />
              </motion.div>
            )}

            {activeTab === 'rooms' && isAdmin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <RoomManagement rooms={rooms} onRefresh={fetchData} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
