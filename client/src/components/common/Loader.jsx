/**
 * components/common/Loader.jsx — Loading Spinner
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-brand-500" />
      </motion.div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading…</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-navy-900 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
};

export default Loader;
