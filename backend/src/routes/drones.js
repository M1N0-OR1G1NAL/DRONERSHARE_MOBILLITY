const express = require('express');
const router = express.Router();
const droneController = require('../controllers/droneController');

// Middleware to check authentication (placeholder)
const authMiddleware = (req, res, next) => {
  req.user = { id: req.headers['user-id'] || 'test-user' };
  next();
};

/**
 * @route   GET /api/drones
 * @desc    Get available drones
 * @access  Public
 */
router.get('/', droneController.getAvailableDrones);

/**
 * @route   GET /api/drones/:id
 * @desc    Get drone by ID
 * @access  Public
 */
router.get('/:id', droneController.getDrone);

/**
 * @route   GET /api/drones/:id/status
 * @desc    Get drone real-time status
 * @access  Public
 */
router.get('/:id/status', droneController.getDroneStatus);

/**
 * @route   GET /api/drones/stations/nearby
 * @desc    Get nearby dock stations
 * @access  Public
 */
router.get('/stations/nearby', droneController.getNearbyDockStations);

/**
 * @route   GET /api/drones/fleet/statistics
 * @desc    Get fleet statistics
 * @access  Private (Admin)
 */
router.get('/fleet/statistics', authMiddleware, droneController.getFleetStatistics);

/**
 * @route   PUT /api/drones/:id/location
 * @desc    Update drone location (from IoT device)
 * @access  Private (IoT Device)
 */
router.put('/:id/location', droneController.updateDroneLocation);

module.exports = router;
