const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Middleware to check authentication (placeholder)
const authMiddleware = (req, res, next) => {
  // In production, verify JWT token
  req.user = { id: req.headers['user-id'] || 'test-user' };
  next();
};

/**
 * @route   POST /api/reservations
 * @desc    Create a new drone reservation
 * @access  Private
 */
router.post('/', authMiddleware, reservationController.createReservation);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, reservationController.getReservation);

/**
 * @route   GET /api/reservations
 * @desc    Get user's reservations
 * @access  Private
 */
router.get('/', authMiddleware, reservationController.getUserReservations);

/**
 * @route   POST /api/reservations/:id/pre-flight-photos
 * @desc    Upload pre-flight photos
 * @access  Private
 */
router.post('/:id/pre-flight-photos', authMiddleware, reservationController.uploadPreFlightPhotos);

/**
 * @route   POST /api/reservations/:id/post-flight-photos
 * @desc    Upload post-flight photos
 * @access  Private
 */
router.post('/:id/post-flight-photos', authMiddleware, reservationController.uploadPostFlightPhotos);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Cancel reservation
 * @access  Private
 */
router.delete('/:id', authMiddleware, reservationController.cancelReservation);

module.exports = router;
