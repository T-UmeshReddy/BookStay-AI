/**
 * pages/NotFound.jsx — 404 Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-navy-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-3xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-6"
        >
          <Compass className="w-12 h-12 text-brand-500" />
        </motion.div>

        <h1 className="font-display font-extrabold text-8xl text-brand-500 mb-2">404</h1>
        <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white mb-3">
          Lost in the wilderness?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you're looking for has wandered off. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/rooms" className="btn-secondary">
            Browse Rooms
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
