const express = require('express');
const router = express.Router();
const flightAccessController = require('../controllers/flightAccessController');
const { authenticate, requireOverseer } = require('../middleware/auth');

/**
 * Flight Access Routes
 * All routes require authentication
 */

// Get dashboard for current user
router.get('/', authenticate, flightAccessController.getDashboard);

// Elevate user tier
router.post('/elevate/:target', authenticate, flightAccessController.elevateTier);

// Toggle service for Tier 1 subscribers
router.post('/service/:service', authenticate, flightAccessController.toggleService);

// Get all users (admin only)
router.get('/users', authenticate, requireOverseer, flightAccessController.listUsers);

module.exports = router;
