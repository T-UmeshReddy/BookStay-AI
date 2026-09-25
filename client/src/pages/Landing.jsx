/**
 * pages/Landing.jsx — Home / Hero Page
 *
 * Sections:
 *  1. Hero with animated headline + SearchBar
 *  2. Features strip (Why NomadNest?)
 *  3. Featured rooms grid
 *  4. Testimonials
 *  5. CTA banner
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Star, ArrowRight, MapPin } from 'lucide-react';

import SearchBar from '../components/booking/SearchBar';
import RoomCard from '../components/booking/RoomCard';
import Loader from '../components/common/Loader';
import roomService from '../services/roomService';

// ── Animation variants ───────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const FEATURES = [
  { icon: Shield,  title: 'Safe & Secure',       desc: '24/7 security, CCTV, and personal lockers in every dorm.' },
  { icon: Zap,     title: 'Instant Booking',      desc: 'Real-time availability. Book a bed in under 2 minutes.' },
  { icon: Globe,   title: 'Global Community',     desc: 'Meet travellers from 80+ countries at our hostel.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',    location: 'Mumbai',    rating: 5, text: 'Best hostel experience I\'ve had. The dorm was spotless and the staff were incredible!' },
  { name: 'Marco L.',   location: 'Italy',      rating: 5, text: 'Super easy booking and the private room was cosy. Will definitely be back.' },
  { name: 'Aisha K.',   location: 'Nairobi',    rating: 4, text: 'Great value for money. The community vibe is unmatched. Met lifelong friends here.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    document.title = 'NomadNest — Where Nomads Find Home';
    roomService.getAll({ status: 'Available' })
      .then((rooms) => setFeaturedRooms(rooms.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, []);

  const handleSearch = (params) => {
    const qs = new URLSearchParams({
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guestCount: params.guestCount,
      roomType: params.roomType,
    }).toString();
    navigate(`/rooms?${qs}`);
  };

  return (
    <div className="page-enter">

      {/* ══════ 1. HERO ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl"
          />
        </div>

        <div className="relative container-custom text-center pt-28 pb-16 z-10">
          {/* Pill badge */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-brand-400" />
            Now in Bengaluru · Mumbai · Goa
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Where Every{' '}
            <span className="gradient-text">Nomad</span>
            <br />
            Finds Home
          </motion.h1>

          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Discover affordable dorm beds, cosy private rooms, and a vibrant backpacker community.
            Real-time availability. Instant confirmation.
          </motion.p>

          {/* Search bar */}
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-12">
            {[['500+', 'Happy Guests'], ['6', 'Room Types'], ['4.8★', 'Average Rating']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <p className="font-display font-bold text-2xl text-white">{val}</p>
                <p className="text-sm text-white/50">{lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 800 0 500 40C250 70 100 20 0 40L0 80Z"
              className="fill-slate-50 dark:fill-navy-900" />
          </svg>
        </div>
      </section>

      {/* ══════ 2. FEATURES ════════════════════════════════════ */}
      <section className="section bg-slate-50 dark:bg-navy-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-3">
              Why Choose <span className="gradient-text">NomadNest?</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              We've redesigned the hostel experience from the ground up — for modern backpackers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 3. FEATURED ROOMS ══════════════════════════════ */}
      <section className="section bg-white dark:bg-navy-950" id="about">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white">
                Featured Rooms
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Hand-picked for comfort and value</p>
            </motion.div>
            <Link to="/rooms" className="btn-ghost hidden sm:flex items-center gap-1 text-brand-500">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingRooms ? (
            <Loader />
          ) : featuredRooms.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <p>No rooms available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room, i) => (
                <RoomCard key={room._id} room={room} delay={i * 0.1} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/rooms" className="btn-primary">
              Browse All Rooms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ 4. TESTIMONIALS ════════════════════════════════ */}
      <section className="section bg-slate-50 dark:bg-navy-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-2">
              Loved by Wanderers
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Real stories from our guests</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, rating, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className="card p-6"
              >
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 5. CTA BANNER ══════════════════════════════════ */}
      <section className="section bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full border border-white/10"
          />
        </div>
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-white/70 mb-8 text-lg max-w-xl mx-auto">
              Book your bed today. Join thousands of nomads who call NomadNest home.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/rooms" className="btn-primary text-base px-8 py-4">
                Find a Room <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-8 py-4 border-white/30 text-black hover:border-white">
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
