/**
 * components/admin/OccupancyGrid.jsx — Live Bed Status Grid
 *
 * Renders a visual grid of all rooms and their beds.
 * Each cell is color-coded by status:
 *   Green  = Vacant (clean, available)
 *   Red    = Occupied (currently booked)
 *   Amber  = Dirty (needs housekeeping post-checkout)
 *   Gray   = Under Maintenance
 *
 * Clicking a bed cell shows a tooltip with guest info or action options.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Wrench, Sparkles } from 'lucide-react';

const BedCell = ({ bed, onUpdateBed }) => {
  const [showTip, setShowTip] = useState(false);

  const getCellClass = () => {
    if (bed.cleaningStatus === 'Maintenance') return 'grid-cell-maintenance';
    if (bed.cleaningStatus === 'Dirty')         return 'grid-cell-dirty';
    if (bed.cleaningStatus === 'In-Progress')   return 'grid-cell-dirty opacity-70';
    if (bed.isOccupied)                         return 'grid-cell-occupied';
    return 'grid-cell-vacant';
  };

  const getLabel = () => {
    if (bed.isOccupied)                         return 'Occupied';
    if (bed.cleaningStatus === 'Maintenance') return 'Maintenance';
    if (bed.cleaningStatus === 'Dirty')         return 'Dirty';
    if (bed.cleaningStatus === 'In-Progress')   return 'Cleaning';
    return 'Vacant';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTip((v) => !v)}
        className={`w-full border rounded-lg p-2 text-center text-xs font-semibold transition-all
                    duration-150 hover:scale-105 cursor-pointer ${getCellClass()}`}
      >
        <div className="font-mono font-bold">{bed.bedNumber}</div>
        <div className="text-[10px] mt-0.5 opacity-80">{getLabel()}</div>
      </button>

      {/* Tooltip */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20
                     bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-600
                     rounded-xl shadow-xl p-3 w-44 text-xs text-left"
        >
          <p className="font-semibold text-slate-800 dark:text-white mb-1">Bed {bed.bedNumber}</p>
          <p className="text-slate-500 dark:text-slate-400">Type: {bed.bedType}</p>
          <p className="text-slate-500 dark:text-slate-400">Status: {getLabel()}</p>
          {!bed.isOccupied && onUpdateBed && (
            <div className="mt-2 space-y-1">
              {[
                { status: 'Clean', label: 'Mark Clean', icon: Sparkles, className: 'text-emerald-600' },
                { status: 'Dirty', label: 'Mark Dirty', icon: Sparkles, className: 'text-amber-600' },
                { status: 'In-Progress', label: 'Cleaning', icon: Sparkles, className: 'text-blue-600' },
                { status: 'Maintenance', label: 'Maintenance', icon: Wrench, className: 'text-slate-600' },
              ].map(({ status, label, icon: Icon, className }) => (
                <button
                  key={status}
                  onClick={(e) => { e.stopPropagation(); onUpdateBed(bed._id, { cleaningStatus: status }); setShowTip(false); }}
                  className={`flex items-center gap-1 font-semibold hover:underline ${className}`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowTip(false)}
            className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-600 text-base leading-none"
          >×</button>
        </motion.div>
      )}
    </div>
  );
};

const OccupancyGrid = ({ rooms, onUpdateBed }) => {
  if (!rooms?.length) {
    return (
      <div className="card p-10 text-center text-slate-500 dark:text-slate-400">
        <BedDouble className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No rooms loaded. Run the seeder to populate data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium">
        {[
          { label: 'Vacant',      cls: 'grid-cell-vacant',      sample: true },
          { label: 'Occupied',    cls: 'grid-cell-occupied',    sample: true },
          { label: 'Dirty',       cls: 'grid-cell-dirty',       sample: true },
          { label: 'Maintenance', cls: 'grid-cell-maintenance', sample: true },
        ].map(({ label, cls }) => (
          <span key={label} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded border ${cls} inline-block`} />
            {label}
          </span>
        ))}
      </div>

      {/* Room rows */}
      <div className="space-y-3">
        {rooms.map((room, ri) => (
          <motion.div
            key={room._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ri * 0.05, duration: 0.3 }}
            className="card p-4"
          >
            {/* Room header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-slate-800 dark:text-white text-sm">{room.label}</span>
                <span className="ml-2 text-xs text-slate-400">#{room.roomNumber}</span>
              </div>
              <span className={`badge ${room.displayStatus === 'Booked' ? 'badge-red' : room.status === 'Available' ? 'badge-green' : room.status === 'Cleaning' ? 'badge-yellow' : 'badge-gray'}`}>
                {room.displayStatus || room.status}
              </span>
            </div>
            {room.activeBooking && (
              <p className="mb-3 text-xs text-red-600 dark:text-red-400">
                Guest: {room.activeBooking.guestName} · Checkout: {new Date(room.activeBooking.checkOutDate).toLocaleDateString('en-IN')}
              </p>
            )}

            {/* Bed grid */}
            {room.beds?.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {room.beds.map((bed) => (
                  <BedCell key={bed._id} bed={bed} onUpdateBed={onUpdateBed} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No beds configured for this room.</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyGrid;
