/**
 * routes/bedRoutes.js — Bed Routes
 */

const express = require('express');
const router = express.Router();
const { getBedsByRoom, createBed, updateBed, deleteBed } = require('../controllers/bedController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', getBedsByRoom);  // ?roomId=...
router.post('/', requireAuth, requireRole('Admin'), createBed);
router.put('/:id', requireAuth, requireRole('Staff'), updateBed);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteBed);

module.exports = router;
