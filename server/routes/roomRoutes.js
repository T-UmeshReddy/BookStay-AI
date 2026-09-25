/**
 * routes/roomRoutes.js — Room Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
  getAdminGrid,
} = require('../controllers/roomController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/availability', checkAvailability);
router.get('/', getAllRooms);

router.get('/admin/grid', requireAuth, requireRole('Staff', 'Admin'), getAdminGrid);

// Admin-only routes
router.post('/', requireAuth, requireRole('Admin'), createRoom);
router.put('/:id', requireAuth, requireRole('Admin'), updateRoom);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteRoom);

router.get('/:id', getRoomById);

module.exports = router;
