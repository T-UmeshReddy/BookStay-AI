/**
 * seed/seedData.js — Database Seeder
 *
 * Run with: npm run seed
 * Clears existing data and inserts sample rooms, beds, users, and bookings
 * so the app is immediately usable in development.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Booking = require('../models/Booking');

const SAMPLE_ROOMS = [
  {
    roomNumber: 'D101',
    roomType: 'Dorm',
    label: '4-Bed Female Dorm',
    totalBeds: 4,
    pricePerNight: 650,
    amenities: ['WiFi', 'Locker', 'Reading Light', 'AC', 'Shared Bathroom'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800',
    ],
    status: 'Available',
    floor: 1,
    description: 'A cozy female-only dorm with personal lockers and reading lights for every bunk.',
    maxGuests: 4,
    rating: 4.7,
  },
  {
    roomNumber: 'D102',
    roomType: 'Dorm',
    label: '6-Bed Mixed Dorm',
    totalBeds: 6,
    pricePerNight: 550,
    amenities: ['WiFi', 'Locker', 'AC', 'Shared Bathroom', 'Power Outlets'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    ],
    status: 'Available',
    floor: 1,
    description: 'Our most popular mixed dorm — great for solo travellers and backpackers.',
    maxGuests: 6,
    rating: 4.5,
  },
  {
    roomNumber: 'D201',
    roomType: 'Dorm',
    label: '8-Bed Mixed Dorm',
    totalBeds: 8,
    pricePerNight: 450,
    amenities: ['WiFi', 'Locker', 'Fan', 'Shared Bathroom'],
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    ],
    status: 'Available',
    floor: 2,
    description: 'Budget-friendly large dorm, perfect for the cost-conscious backpacker.',
    maxGuests: 8,
    rating: 4.2,
  },
  {
    roomNumber: 'P301',
    roomType: 'Private',
    label: 'Standard Private Room',
    totalBeds: 1,
    pricePerNight: 2200,
    amenities: ['WiFi', 'En-suite Bathroom', 'AC', 'TV', 'Wardrobe', 'Double Bed'],
    images: [
      'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800',
    ],
    status: 'Available',
    floor: 3,
    description: 'A comfortable private room for couples or those seeking privacy.',
    maxGuests: 2,
    rating: 4.8,
  },
  {
    roomNumber: 'P302',
    roomType: 'Private',
    label: 'Deluxe Private Suite',
    totalBeds: 1,
    pricePerNight: 3500,
    amenities: ['WiFi', 'En-suite Bathroom', 'AC', 'TV', 'Mini Fridge', 'City View', 'Bathtub'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
    status: 'Available',
    floor: 3,
    description: 'Our premium suite with stunning city views and a luxury bathtub.',
    maxGuests: 2,
    rating: 4.9,
  },
  {
    roomNumber: 'D103',
    roomType: 'Dorm',
    label: '4-Bed Male Dorm',
    totalBeds: 4,
    pricePerNight: 600,
    amenities: ['WiFi', 'Locker', 'Reading Light', 'Fan', 'Shared Bathroom'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    ],
    status: 'Cleaning',
    floor: 1,
    description: 'Male-only dorm with personal lockers and a dedicated social corner.',
    maxGuests: 4,
    rating: 4.4,
  },
];

const BED_TYPES = ['Bunk-Bottom', 'Bunk-Top', 'Single'];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Room.deleteMany(),
      Bed.deleteMany(),
      Booking.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Users ──────────────────────────────────────────────
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@1234', salt);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@nomadnest.com',
        passwordHash: hashedPassword,
        role: 'Admin',
        phone: '+91 9000000001',
      },
      {
        name: 'Staff Member',
        email: 'staff@nomadnest.com',
        passwordHash: hashedPassword,
        role: 'Staff',
        phone: '+91 9000000002',
      },
      {
        name: 'Alex Traveller',
        email: 'guest@example.com',
        passwordHash: hashedPassword,
        role: 'Guest',
        phone: '+91 9000000003',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ── Create Rooms ──────────────────────────────────────────────
    const createdRooms = await Room.insertMany(SAMPLE_ROOMS);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // ── Create Beds for each room ─────────────────────────────────
    const beds = [];
    for (const room of createdRooms) {
      for (let i = 1; i <= room.totalBeds; i++) {
        const letter = String.fromCharCode(64 + Math.ceil(i / 2)); // A, B, C...
        const position = i % 2 === 0 ? 'Top' : 'Bottom';
        beds.push({
          roomId: room._id,
          bedNumber: `${letter}-${position}`,
          bedType: room.roomType === 'Private' ? 'Double' : (i % 2 === 0 ? 'Bunk-Top' : 'Bunk-Bottom'),
          isOccupied: false,
          cleaningStatus: 'Clean',
        });
      }
    }
    const createdBeds = await Bed.insertMany(beds);
    console.log(`✅ Created ${createdBeds.length} beds`);

    // ── Create sample booking ─────────────────────────────────────
    const guestUser = users.find((u) => u.role === 'Guest');
    const dormRoom = createdRooms.find((r) => r.roomType === 'Dorm');
    const dormBeds = createdBeds.filter((b) => b.roomId.toString() === dormRoom._id.toString());

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 2);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    await Booking.create({
      guestId: guestUser._id,
      roomId: dormRoom._id,
      assignedBeds: [dormBeds[0]._id],
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights: 3,
      guestCount: 1,
      totalPrice: dormRoom.pricePerNight * 3,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      bookingReference: 'NN-2026-SEED',
    });
    console.log('✅ Created sample booking');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Admin:  admin@nomadnest.com  / Admin@1234');
    console.log('  Staff:  staff@nomadnest.com  / Admin@1234');
    console.log('  Guest:  guest@example.com    / Admin@1234');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
