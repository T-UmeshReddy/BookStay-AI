/**
 * components/admin/MetricCard.jsx — Admin KPI Summary Card
 *
 * Displays a key metric (revenue, occupancy, guests) with an icon,
 * trend indicator, and animated number reveal.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'brand', delay = 0 }) => {
  const colorMap = {
    brand:   'bg-brand-50 text-brand-500 dark:bg-brand-900/20 dark:text-brand-400',
    green:   'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue:    'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
    purple:  'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400',
    amber:   'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-6 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
        <p className="text-2xl font-display font-bold text-slate-800 dark:text-white truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
