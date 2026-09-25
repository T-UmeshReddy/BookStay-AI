/**
 * controllers/bedController.js — Bed Management Controller
 *
 * Admin operations for creating beds and updating housekeeping status.
 */

const asyncHandler = require('express-async-handler');
const Bed = require('../models/Bed');
const Room = require('../models/Room');

// ─── @route   GET /api/beds?roomId=:id ───────────────────────
// ─── @desc    Get all beds for a specific room
// ─── @access  Public
const getBedsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.query;
  if (!roomId) {
    res.status(400);
    throw new Error('roomId query parameter is required');
  }
  const beds = await Bed.find({ roomId });
  res.status(200).json({ success: true, count: beds.length, data: beds });
});

// ─── @route   POST /api/beds ──────────────────────────────────
// ─── @desc    Create a new bed in a room
// ─── @access  Admin only
const createBed = asyncHandler(async (req, res) => {
  const { roomId, bedNumber, bedType } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const bed = await Bed.create({ roomId, bedNumber, bedType });
  res.status(201).json({ success: true, data: bed });
});

// ─── @route   PUT /api/beds/:id ───────────────────────────────
// ─── @desc    Update bed details or cleaning status
// ─── @access  Staff only
const updateBed = asyncHandler(async (req, res) => {
  const { cleaningStatus } = req.body;
  if (!cleaningStatus || !['Clean', 'Dirty', 'In-Progress', 'Maintenance'].includes(cleaningStatus)) {
    res.status(400);
    throw new Error('A valid cleaning status is required');
  }

  const bed = await Bed.findByIdAndUpdate(req.params.id, { cleaningStatus }, {
    new: true,
    runValidators: true,
  });
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }
  res.status(200).json({ success: true, data: bed });
});

// ─── @route   DELETE /api/beds/:id ───────────────────────────
// ─── @desc    Delete a bed
// ─── @access  Admin only
const deleteBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }
  if (bed.isOccupied) {
    res.status(400);
    throw new Error('Cannot delete an occupied bed');
  }
  await bed.deleteOne();
  res.status(200).json({ success: true, message: 'Bed deleted' });
});

module.exports = { getBedsByRoom, createBed, updateBed, deleteBed };
