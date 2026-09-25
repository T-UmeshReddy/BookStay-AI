/**
 * controllers/roomController.js — Room Management Controller
 *
 * CRUD for rooms + real-time availability checking.
 * Availability logic queries existing bookings to find which beds
 * are already reserved for the requested date range.
 */

const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Booking = require('../models/Booking');

const buildBed = (roomId, index, roomType) => {
  const bedNumber = index + 1;
  const letter = String.fromCharCode(65 + Math.floor(index / 2));
  const position = bedNumber % 2 === 0 ? 'Top' : 'Bottom';
  return {
    roomId,
    bedNumber: `${letter}-${position}`,
    bedType: roomType === 'Private'
      ? 'Double'
      : (bedNumber % 2 === 0 ? 'Bunk-Top' : 'Bunk-Bottom'),
  };
};

const getActiveStays = async () => {
  const bookings = await Booking.find({ bookingStatus: 'CheckedIn' })
    .select('roomId guestId checkInDate checkOutDate')
    .populate('guestId', 'name');

  return new Map(bookings.map((booking) => [
    booking.roomId.toString(),
    {
      guestName: booking.guestId?.name || 'Current guest',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    },
  ]));
};

const addLiveStatus = (room, activeStays) => {
  const data = room.toObject ? room.toObject() : room;
  const activeBooking = activeStays.get(data._id.toString());
  return {
    ...data,
    displayStatus: activeBooking ? 'Booked' : data.status,
    activeBooking: activeBooking || null,
  };
};

// ─── @route   GET /api/rooms ──────────────────────────────────
// ─── @desc    Get all rooms with optional filters
// ─── @access  Public
const getAllRooms = asyncHandler(async (req, res) => {
  const { roomType, minPrice, maxPrice, status } = req.query;

  const filter = {};
  if (roomType) filter.roomType = roomType;
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
  }

  const [rooms, activeStays] = await Promise.all([
    Room.find(filter).sort({ pricePerNight: 1 }),
    getActiveStays(),
  ]);
  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms.map((room) => addLiveStatus(room, activeStays)),
  });
});

// ─── @route   GET /api/rooms/:id ─────────────────────────────
// ─── @desc    Get single room with its beds
// ─── @access  Public
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('beds');
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
  const activeStays = await getActiveStays();
  res.status(200).json({ success: true, data: addLiveStatus(room, activeStays) });
});

// ─── @route   POST /api/rooms ─────────────────────────────────
// ─── @desc    Create a new room
// ─── @access  Admin only
const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  const beds = Array.from({ length: room.totalBeds }, (_, index) => buildBed(room._id, index, room.roomType));
  await Bed.insertMany(beds);
  res.status(201).json({ success: true, data: room });
});

// ─── @route   PUT /api/rooms/:id ─────────────────────────────
// ─── @desc    Update room details
// ─── @access  Admin only
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const requestedBeds = Number(req.body.totalBeds);
  if (!Number.isInteger(requestedBeds) || requestedBeds < 1) {
    res.status(400);
    throw new Error('Total beds must be a positive whole number');
  }

  const currentBeds = await Bed.find({ roomId: room._id }).sort({ bedNumber: 1 });
  if (requestedBeds < currentBeds.length) {
    const bedsToRemove = currentBeds.slice(requestedBeds);
    if (bedsToRemove.some((bed) => bed.isOccupied)) {
      res.status(400);
      throw new Error('Cannot reduce beds while selected beds are occupied');
    }
    await Bed.deleteMany({ _id: { $in: bedsToRemove.map((bed) => bed._id) } });
  } else if (requestedBeds > currentBeds.length) {
    const newBeds = Array.from(
      { length: requestedBeds - currentBeds.length },
      (_, index) => buildBed(room._id, currentBeds.length + index, req.body.roomType || room.roomType)
    );
    await Bed.insertMany(newBeds);
  }

  Object.assign(room, req.body);
  room.totalBeds = requestedBeds;
  await room.save();
  res.status(200).json({ success: true, data: room });
});

// ─── @route   DELETE /api/rooms/:id ──────────────────────────
// ─── @desc    Delete a room and its beds
// ─── @access  Admin only
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
  const occupiedBeds = await Bed.countDocuments({ roomId: room._id, isOccupied: true });
  if (occupiedBeds > 0) {
    res.status(400);
    throw new Error('Cannot delete a room with occupied beds');
  }
  await Bed.deleteMany({ roomId: req.params.id });
  await room.deleteOne();
  res.status(200).json({ success: true, message: 'Room and its beds deleted' });
});

// ─── @route   GET /api/rooms/availability ────────────────────
// ─── @desc    Check available rooms for a given date range & guest count
// ─── @access  Public
// ─── @query   checkIn, checkOut, guestCount, roomType
const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, guestCount = 1, roomType } = req.query;

  if (!checkIn || !checkOut) {
    res.status(400);
    throw new Error('checkIn and checkOut dates are required');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    res.status(400);
    throw new Error('Check-out date must be after check-in date');
  }

  // ── Step 1: Find all bookings that OVERLAP the requested date range ──
  // Overlap condition: booking.checkIn < requested.checkOut AND booking.checkOut > requested.checkIn
  const overlappingBookings = await Booking.find({
    bookingStatus: { $in: ['Confirmed', 'CheckedIn'] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  }).select('assignedBeds roomId bookingStatus');

  // Flatten the array of occupied bed IDs
  const occupiedBedIds = overlappingBookings.flatMap((b) =>
    b.assignedBeds.map((id) => id.toString())
  );
  const activeStays = await getActiveStays();
  const checkedInRoomIds = new Set(activeStays.keys());

  // ── Step 2: Build room filter ─────────────────────────────────────────
  const roomFilter = {
    status: 'Available',
    _id: { $nin: [...checkedInRoomIds] },
  };
  if (roomType) roomFilter.roomType = roomType;

  const allRooms = await Room.find(roomFilter).populate('beds');

  // ── Step 3: For each room, count free beds after excluding occupied ones ─
  const availableRooms = allRooms
    .map((room) => {
      const freeBeds = room.beds.filter(
        (bed) => !occupiedBedIds.includes(bed._id.toString())
      );
      return {
        ...addLiveStatus(room, activeStays),
        availableBeds: freeBeds,
        freeBedCount: freeBeds.length,
      };
    })
    .filter((room) => room.freeBedCount >= Number(guestCount));

  res.status(200).json({
    success: true,
    count: availableRooms.length,
    data: availableRooms,
    meta: { checkIn, checkOut, guestCount, roomType },
  });
});

// ─── @route   GET /api/rooms/admin/grid ──────────────────────
// ─── @desc    Get all rooms with bed statuses for admin grid view
// ─── @access  Staff, Admin
const getAdminGrid = asyncHandler(async (req, res) => {
  const [rooms, activeStays] = await Promise.all([
    Room.find().populate('beds'),
    getActiveStays(),
  ]);
  res.status(200).json({
    success: true,
    data: rooms.map((room) => addLiveStatus(room, activeStays)),
  });
});

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
  getAdminGrid,
};
