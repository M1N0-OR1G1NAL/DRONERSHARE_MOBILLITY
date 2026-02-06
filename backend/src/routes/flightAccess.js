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

module.exports = router;
