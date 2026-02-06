const express = require('express');
const router = express.Router();
const flightAccessController = require('../controllers/flightAccessController');
const { authenticate } = require('../middleware/auth');

// All flight access routes require authentication
router.use(authenticate);

// Dashboard - shows current tier and permissions
router.get('/dashboard', flightAccessController.getDashboard);

// Elevate tier (subscriber self-upgrade or admin assignment)
router.post('/elevate/:target', flightAccessController.elevateTier);

// Toggle service (for subscribers only)
router.post('/service/:service', flightAccessController.toggleService);
const { authenticate, requireOverseer } = require('../middleware/auth');
const { apiLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');

/**
 * Flight Access Routes
 * All routes require authentication and rate limiting
 */

// Get dashboard for current user (general rate limiting)
router.get('/', apiLimiter, authenticate, flightAccessController.getDashboard);

// Elevate user tier (sensitive operation - stricter rate limiting)
router.post('/elevate/:target', sensitiveLimiter, authenticate, flightAccessController.elevateTier);

// Toggle service for Tier 1 subscribers (sensitive operation)
router.post('/service/:service', sensitiveLimiter, authenticate, flightAccessController.toggleService);

// Get all users (admin only, general rate limiting)
router.get('/users', apiLimiter, authenticate, requireOverseer, flightAccessController.listUsers);

module.exports = router;
